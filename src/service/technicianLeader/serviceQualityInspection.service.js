const db = require("../../../models");
const Tasks = db.Task;
const Task_Assignments = db.Task_Assignment;
const Service_Order = db.Service_Orders;
const Appointment = db.Appointments;
const Customers = db.Customers;
const Users = db.User;
const Vehicles = db.Vehicles;
const Vehicle_Models = db.Vehicle_Models;
const Service_Catalog = db.Service_Catalog;

module.exports.getTasksPendingQC = async () => {
  const tasks = await Tasks.findAll({
    attributes: ["id", "status", "createdAt"],
    where: { status: "IN_PROGRESS" },
    include: [
      {
        model: Task_Assignments,
        as: "assignments",
        attributes: ["id", "status", "actual_end_time"],
        required: true,
        include: [
          { model: Users, as: "technician", attributes: ["id", "fullName"] },
        ],
      },
      {
        model: Service_Catalog,
        as: "catalog",
        attributes: ["id", "service_name"],
      },
      {
        model: Service_Order,
        as: "serviceOrder",
        attributes: ["id"],
        include: [
          {
            model: Vehicles,
            as: "vehicle",
            attributes: ["id", "license_plate", "color"],
            include: [
              { model: Vehicle_Models, as: "model", attributes: ["id", "model_name"] },
            ],
          },
        ],
      },
    ],
    order: [["createdAt", "ASC"]],
  });
  return tasks.filter((task) =>
    task.assignments.every((a) => a.status === "PENDING_QC"),
  );
};