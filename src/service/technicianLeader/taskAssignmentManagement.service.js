const { where } = require("sequelize");
const db = require("../../../models");
const { includes } = require("../../router/registry.routes");
const Task = db.Task;
const User = db.User;
const Role = db.Role;
const Vehicles = db.Vehicles;
const Vehicle_Models = db.Vehicle_Models;
const Vehicle_Makes = db.Vehicle_Makes;
const Service_Catalog = db.Service_Catalog;
const Quotation_Details = db.Quotation_Details;
const Vehicle_Issues = db.Vehicle_Issues;
const Vehicle_Components = db.Vehicle_Components;
const Task_Assignment = db.Task_Assignment;

module.exports.getAllTasks = async () => {
  const serviceOrders = await db.Service_Orders.findAll({
    attributes: ["id", "createdAt"],
    include: [
      {
        model: Vehicles,
        as: "vehicle",
        attributes: ["id", "license_plate","color"],
        include: [
          {
            model: Vehicle_Models,
            as: "model",
            attributes: ["id", "model_name"],
            include: [
              {
                model: Vehicle_Makes,
                as: "make",
                attributes: ["id", "make_name"],
              },
            ],
          },
            {
            model: db.Customers,
            as: "customer",
            attributes: ["id", "name", "phone"],
            include: [
              {
                model: db.User,
                as: "user",
                attributes: ["id", "fullName", "phoneNumber"],
              },
            ],
          },
        ],
      },
      {
        model: Task,
        as: "tasks",
        required: true,
        where: { status: ["PENDING", "IN_PROGRESS"] },
        attributes: ["id", "type", "status", "createdAt"],
        include: [
          {
            model: Service_Catalog,
            as: "catalog",
            attributes: ["id", "service_name", "estimated_duration"],
          },
          {
            model: Quotation_Details,
            as: "quotationItem",
            attributes: ["id", "quantity"],
            include: [
              {
                model: Vehicle_Issues,
                as: "issue",
                attributes: ["id", "error_description", "note"],
                include: [
                  {
                    model: Vehicle_Components,
                    as: "component",
                    attributes: ["id", "name"],
                  },
                ],
              },
            ],
          },
          {
            model: Task_Assignment,
            as: "assignments",
            attributes: ["id", "status"],
            include: [
              {
                model: User,
                as: "technician",
                attributes: ["id", "fullName"],
              },
            ],
          },
        ],
      },
    ],
    order: [["createdAt", "ASC"]],
  });
  return serviceOrders;
};

module.exports.getAllTechnician = async () => {
  const user = await User.findAll({
    attributes: ["id", "fullName"],
    where: { status: "ACTIVE" },
    include: [
      {
        model: Role,
        as: "role",
        attributes: [],
        where: { roleCode: "TECHNICIAN" },
      },
    ],
  });
  return user;
};

module.exports.assignTask = async (data) => {
  return await db.sequelize.transaction(async (t) => {
    const tasks = await db.Task.findAll({
      where: { id: data.task_ids },
      transaction: t,
    });
    if (tasks.length !== data.task_ids.length) {
      throw { status: 404, message: "Có công việc không tồn tại" };
    }
    const notPending = tasks.find((task) => task.status !== "PENDING");
    if (notPending) {
      throw {
        status: 400,
        message: `Công việc #${notPending.id} không ở trạng thái chờ phân công`,
      };
    }
    const assigned = await db.Task_Assignment.findOne({
      where: { task_id: data.task_ids },
      transaction: t,
    });
    if (assigned) {
      throw {
        status: 400,
        message: `Công việc #${assigned.task_id} đã được phân công`,
      };
    }
    const technician = await db.User.findOne({
      where: { id: data.technician_id, status: "ACTIVE" },
      include: [
        {
          model: db.Role,
          as: "role",
          attributes: [],
          where: { roleCode: "TECHNICIAN" },
        },
      ],
      transaction: t,
    });
    if (!technician) {
      throw {
        status: 400,
        message: "Kỹ thuật viên không hợp lệ hoặc đang không hoạt động",
      };
    }
    const assignments = await db.Task_Assignment.bulkCreate(
      data.task_ids.map((taskId) => ({
        task_id: taskId,
        technician_id: data.technician_id,
        role_in_task: "LEAD",
        contribution_percent: 100,
        status: "ASSIGNED",
      })),
      { transaction: t },
    );
    return assignments;
  });
};
