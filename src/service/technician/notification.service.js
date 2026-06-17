const db = require("../../../models");

module.exports.getNotifications = async (technicianId) => {
    const notifications = await db.Notification.findAll({
        where: { recipientId: technicianId },
        order: [['createdAt', 'DESC']]
    });
    return notifications;
};

module.exports.markAsRead = async (id, technicianId) => {
    const notification = await db.Notification.findOne({
        where: { id: id, recipientId: technicianId }
    });
    if (!notification) {
        throw { status: 404, message: "Thông báo không tồn tại hoặc không thuộc về bạn" };
    }
    
    notification.isRead = true;
    await notification.save();
    return notification;
};

module.exports.markAllAsRead = async (technicianId) => {
    await db.Notification.update(
        { isRead: true },
        { where: { recipientId: technicianId, isRead: false } }
    );
    return { success: true };
};

module.exports.getUnreadCount = async (technicianId) => {
    const count = await db.Notification.count({
        where: {
            recipientId: technicianId,
            isRead: false
        }
    });
    return count;
};
