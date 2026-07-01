const { email } = require("zod");
const db = require("../../../models");
const Quotation = db.Quotations;
const QuotationDetail = db.Quotation_Details;
const SparePart = db.Spare_Parts;
const Task = db.Task;
const transporter = require("../../config/mailer.config");
const {
  quotationEmailTemplate,
} = require("../../templates/quotation.template");

module.exports.sendQuotationEmail = async (email, quotation) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Báo giá sửa chữa xe của bạn",
    html: quotationEmailTemplate(quotation),
  });
};
module.exports.getSpareParts = async () => {
  const parts = await SparePart.findAll({
    attributes: ["id", "sku", "name", "brand", "retail_price"],
  });
  return parts;
};
module.exports.createQuotation = async (data, email) => {
  const quotation = await db.sequelize.transaction(async (t) => {
    let totalAmount = 0;
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
        repairPrice = item.repair_price || 0;
      }
      const amount = item.quantity * (unitPrice || repairPrice);
      totalAmount += amount;
      detailsData.push({
        spare_part_id: item.spare_part_id || null,
        quantity: item.quantity,
        unit_price: unitPrice || 0,
        repair_price: repairPrice || 0,
        amount,
      });
    }
    const quotation = await Quotation.create(
      {
        task_id: data.task_id || null,
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
    if (data.task_id) {
      await Task.update(
        { status: "COMPLETED" },
        { where: { id: data.task_id }, transaction: t },
      );
      await db.Task_Assignment.update(
        { status: "COMPLETED" },
        { where: { task_id: data.task_id }, transaction: t },
      );
    }
    return quotation;
  });
  if (email) {
    const fullQuotation = await Quotation.findByPk(quotation.id, {
      include: [
        {
          model: QuotationDetail,
          as: "items",
          include: [
            { model: SparePart, as: "sparePart", attributes: ["id", "name"] },
          ],
        },
      ],
    });
    await module.exports.sendQuotationEmail(email, fullQuotation);
  }
  return quotation;
};

module.exports.updateQuotation = async (id, data) => {
  return await db.sequelize.transaction(async (t) => {
    const quotation = await Quotation.findByPk(id, { transaction: t });
    if (!quotation) {
      throw { status: 404, message: "Không tìm thấy báo giá" };
    }
    if (quotation.status !== "PENDING") {
      throw {
        status: 400,
        message: "Chỉ có thể cập nhật báo giá đang ở trạng thái PENDING",
      };
    }
    await QuotationDetail.destroy({
      where: { quotation_id: id },
      transaction: t,
    });
    let totalAmount = 0;
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
        repairPrice = item.repair_price || 0;
      }
      const amount = item.quantity * (unitPrice || repairPrice);
      totalAmount += amount;
      detailsData.push({
        quotation_id: quotation.id,
        spare_part_id: item.spare_part_id || null,
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
      "total_amount",
      "status",
      "approved_at",
      "note",
      "createdAt",
    ],
    include: [
      {
        model: QuotationDetail,
        as: "items",
        attributes: ["id", "quantity", "unit_price", "repair_price", "amount"],
        include: [
          {
            model: SparePart,
            as: "sparePart",
            attributes: ["id", "name", "sku"],
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
  return result;
};
