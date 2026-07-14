const { email } = require("zod");
const db = require("../../../models");
const { Op } = require("sequelize");
const Quotation = db.Quotations;
const QuotationDetail = db.Quotation_Details;
const SparePart = db.Spare_Parts;
const Task = db.Task;
const Issues = db.Vehicle_Issues;
const Components = db.Vehicle_Components;
const Tasks = db.Task;
const Task_Assignments = db.Task_Assignment;
const Service_Order = db.Service_Orders;
const Appointment = db.Appointments;
const Customers = db.Customers;
const Users = db.User;
const Vehicles = db.Vehicles;
const Vehicle_Models = db.Vehicle_Models;
const Service_Catalog = db.Service_Catalog;

const transporter = require("../../config/mailer.config");
const {
  quotationEmailTemplate,
} = require("../../templates/quotation.template");
const { generateQuotationActionToken } = require("../../util/jwt.util");

module.exports.getIssuesReports = async () => {
  const issues = await Issues.findAll({
    attributes: ["id", "error_description", "note", "createdAt"],
    where: {
      id: {
        [Op.notIn]: db.sequelize.literal(`(
              SELECT qd.issue_id
              FROM "Quotation_Details" qd
              JOIN "Quotations" q ON q.id = qd.quotation_id
              WHERE qd.issue_id IS NOT NULL
                AND q.status != 'REJECTED'
            )`),
      },
    },
    include: [
      {
        model: Tasks,
        as: "task",
        attributes: ["id"],
        where: { status: "COMPLETED" },
        required: true,
        include: [
          {
            model: Service_Order,
            as: "serviceOrder",
            attributes: ["id"],
            include: [
              {
                model: Vehicles,
                as: "vehicle",
                attributes: ["id", "color", "license_plate"],
                include: [
                  {
                    model: Vehicle_Models,
                    as: "model",
                    attributes: ["id", "model_name"],
                  },
                  {
                    model: Customers,
                    as: "customer",
                    attributes: ["id", "name", "phone"],
                    include: [
                      {
                        model: Users,
                        as: "user",
                        attributes: ["id", "fullName", "phoneNumber"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        model: Components,
        as: "component",
        attributes: ["id", "name", "parent_id"],
        include: [
          {
            model: Components,
            as: "parent",
            attributes: ["id", "name"],
          },
          {
            model: Components,
            as: "children",
            attributes: ["id", "name"],
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
  return issues;
};

module.exports.getSpareParts = async () => {
  const parts = await SparePart.findAll({
    attributes: [
      "id",
      "sku",
      "name",
      "brand",
      "retail_price",
      "stock_quantity",
    ],
  });
  return parts;
};

module.exports.getAllService = async () => {
  const service = await Service_Catalog.findAll({
    attributes: ["id", "service_name", "labor_price"],
  });
  return service;
};

module.exports.createQuotation = async (data, receptionistId) => {
  const quotation = await db.sequelize.transaction(async (t) => {
    let totalAmount = 0;
    const task = await Task.findByPk(data.task_id, { transaction: t });
    if (!task) {
      throw { status: 404, message: `Công việc #${data.task_id} không tồn tại` };
    };
    const detailsData = [];
    for (const item of data.items) {
      let unitPrice = 0;
      let repairPrice = 0;
      if (item.spare_part_id) {
        const part = await SparePart.findByPk(item.spare_part_id, {
          transaction: t,
        });
        if (!part) {
          throw {
            status: 404,
            message: `Phụ tùng #${item.spare_part_id} không tồn tại`,
          };
        }
        unitPrice = part.retail_price;
      } else {
        const service = await Service_Catalog.findByPk(item.service_id, {
          transaction: t,
        });
        if (!service) {
          throw {
            status: 404,
            message: `Dịch vụ #${item.service_id} không tồn tại`,
          };
        }
        repairPrice = item.repair_price ?? service.labor_price;
      }
      const amount = item.quantity * (unitPrice || repairPrice);
      totalAmount += amount;
      detailsData.push({
        issue_id: item.issue_id,
        spare_part_id: item.spare_part_id || null,
        service_id: item.service_id || null, 
        quantity: item.quantity,
        unit_price: unitPrice || 0,
        repair_price: repairPrice || 0,
        amount,
      });
    }
    const quotation = await Quotation.create(
      {
        task_id: data.task_id,
        created_by: receptionistId,
        total_amount: totalAmount,
        status: "PENDING",
        note: data.note || null,
      },
      { transaction: t },
    );
    const details = detailsData.map((item) => ({
      ...item,
      quotation_id: quotation.id,
    }));
    await QuotationDetail.bulkCreate(details, { transaction: t });
    return quotation;
  });
  return quotation;
};

module.exports.updateQuotation = async (id, data, receptionistId) => {
  return await db.sequelize.transaction(async (t) => {
    const quotation = await Quotation.findByPk(id, { transaction: t });
    if (!quotation) {
      throw { status: 404, message: "Không tìm thấy báo giá" };
    }
    if (!["PENDING", "REJECTED"].includes(quotation.status)) {
      throw {
        status: 400,
        message: "Chỉ có thể cập nhật báo giá đang ở trạng thái PENDING hoặc REJECTED",
      };
    }
    await QuotationDetail.destroy({ where: { quotation_id: id }, transaction: t });
    let totalAmount = 0;
    const detailsData = [];
    for (const item of data.items) {
      let unitPrice = 0;
      let repairPrice = 0;
      if (item.spare_part_id) {
        const part = await SparePart.findByPk(item.spare_part_id, { transaction: t });
        if (!part) {
          throw { status: 404, message: `Phụ tùng #${item.spare_part_id} không tồn tại` };
        }
        unitPrice = part.retail_price;
      } else {
        const service = await Service_Catalog.findByPk(item.service_id, { transaction: t });
        if (!service) {
          throw { status: 404, message: `Dịch vụ #${item.service_id} không tồn tại` };
        }
        repairPrice = item.repair_price ?? service.labor_price;
      }
      const amount = item.quantity * (unitPrice || repairPrice);
      totalAmount += amount;
      detailsData.push({
        quotation_id: quotation.id,
        issue_id: item.issue_id || null,
        spare_part_id: item.spare_part_id || null,
        service_id: item.service_id || null,
        quantity: item.quantity,
        unit_price: unitPrice || 0,
        repair_price: repairPrice || 0,
        amount,
      });
    }
    await QuotationDetail.bulkCreate(detailsData, { transaction: t });
    await quotation.update(
      {
        total_amount: totalAmount,
        status: "PENDING",
        approved_at: null,
        updated_by: receptionistId,
        note: data.note !== undefined ? data.note : quotation.note,
      },
      { transaction: t },
    );
    return quotation;
  });
};

module.exports.getQuoteHistory = async () => {
  const result = await Quotation.findAll({
    attributes: [
      "id",
      "task_id",
      "created_by",
      "updated_by",
      "total_amount",
      "status",
      "note",
      "approved_at",
      "createdAt",
    ],
    include: [
      { model: Users, as: "creator", attributes: ["id", "fullName"] },
      { model: Users, as: "updater", attributes: ["id", "fullName"] },
      {
        model: Tasks,
        as: "task",
        attributes: ["id"],
        include: [
          {
            model: Service_Order,
            as: "serviceOrder",
            attributes: ["id"],
            include: [
              {
                model: Vehicles,
                as: "vehicle",
                attributes: ["id", "color", "license_plate"],
                include: [
                  {
                    model: Vehicle_Models,
                    as: "model",
                    attributes: ["id", "model_name"],
                  },
                  {
                    model: Customers,
                    as: "customer",
                    attributes: ["id", "name", "phone"],
                    include: [
                      {
                        model: Users,
                        as: "user",
                        attributes: ["id", "fullName", "phoneNumber"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        model: QuotationDetail,
        as: "items",
        attributes: ["id", "quantity", "unit_price", "repair_price", "amount"],
        include: [
          {
            model: Issues,
            as: "issue",
            attributes: ["id", "error_description", "note"],
            include: [
              {
                model: Components,
                as: "component",
                attributes: ["id", "name", "parent_id"],
                include: [
                  {
                    model: Components,
                    as: "parent",
                    attributes: ["id", "name"],
                  },
                  {
                    model: Components,
                    as: "children",
                    attributes: ["id", "name"],
                  },
                ],
              },
            ],
          },
          {
            model: SparePart,
            as: "sparePart",
            attributes: ["id", "name", "sku", "brand", "retail_price"],
          },
          {
            model: Service_Catalog,
            as: "service_catalog",
            attributes: ["id", "service_name", "labor_price"],
          },
        ],
      },
    ],
    order: [
      [
        db.sequelize.literal(`CASE "Quotations"."status"
      WHEN 'PENDING'  THEN 1
      WHEN 'APPROVED' THEN 2
      WHEN 'EXPORTED' THEN 3
      WHEN 'REJECTED' THEN 4
      ELSE 5
    END`),
      ],
      ["createdAt", "DESC"],
    ],
  });
  return result;
};
