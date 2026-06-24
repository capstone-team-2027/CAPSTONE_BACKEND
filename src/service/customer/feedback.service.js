const db = require("../../../models");
const Feedback = db.Feedback;
const Service_Orders = db.Service_Orders;
const Customers = db.Customers;

module.exports.submitFeedback = async (customerId, serviceOrderId, rating, comment) => {
  const serviceOrder = await Service_Orders.findOne({
    where: { id: serviceOrderId },
    include: [
      {
        model: db.Appointments,
        as: 'appointment',
        attributes: ['id', 'customer_id']
      },
      {
        model: db.Vehicles,
        as: 'vehicle',
        attributes: ['id']
      }
    ]
  });

  if (!serviceOrder) {
    throw { status: 404, message: "Đơn hàng dịch vụ không tồn tại" };
  }

  if (serviceOrder.appointment && serviceOrder.appointment.customer_id !== customerId) {
    throw { status: 403, message: "Bạn không có quyền gửi phản hồi cho đơn hàng này" };
  }

  if (serviceOrder.status !== 'COMPLETED') {
    throw { status: 400, message: "Chỉ có thể gửi phản hồi khi dịch vụ đã hoàn thành" };
  }

  const existingFeedback = await Feedback.findOne({
    where: {
      customer_id: customerId,
      service_order_id: serviceOrderId
    }
  });

  if (existingFeedback) {
    throw { status: 400, message: "Bạn đã gửi phản hồi cho đơn hàng này rồi" };
  }

  const feedback = await Feedback.create({
    customer_id: customerId,
    service_order_id: serviceOrderId,
    rating,
    comment
  });

  const createdFeedback = await Feedback.findOne({
    where: { id: feedback.id },
    attributes: ['id', 'customer_id', 'service_order_id', 'rating', 'comment', 'createdAt', 'updatedAt'],
    include: [
      {
        model: Service_Orders,
        as: 'serviceOrder',
        attributes: ['id', 'appointment_id', 'vehicle_id', 'status', 'actual_finish_time']
      }
    ]
  });

  return createdFeedback;
};

module.exports.getCustomerFeedbacks = async (customerId) => {
  const feedbacks = await Feedback.findAll({
    where: { customer_id: customerId },
    attributes: ['id', 'customer_id', 'service_order_id', 'rating', 'comment', 'createdAt', 'updatedAt'],
    include: [
      {
        model: Service_Orders,
        as: 'serviceOrder',
        attributes: ['id', 'appointment_id', 'vehicle_id', 'status', 'actual_finish_time']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  return feedbacks;
};
