const db = require("../../../models");

module.exports.getNotifications = async () => {
    const notifications = await db.Notification.findAll({
        include: [
            {
                model: db.User,
                as: 'recipient',
                attributes: ['id', 'fullName', 'phoneNumber']
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    return notifications;
};

module.exports.getNotificationById = async (id) => {
    const notification = await db.Notification.findByPk(id, {
        include: [
            {
                model: db.User,
                as: 'recipient',
                attributes: ['id', 'fullName', 'phoneNumber']
            }
        ]
    });

    if (!notification) {
        throw { status: 404, message: "Thông báo không tồn tại" };
    }

    return notification;
};

module.exports.markAsRead = async (id) => {
    const notification = await db.Notification.findByPk(id);
    if (!notification) {
        throw { status: 404, message: "Thông báo không tồn tại" };
    }
    
    notification.isRead = true;
    await notification.save();
    return notification;
};

module.exports.getUnreadCount = async () => {
    const count = await db.Notification.count({
        where: {
            isRead: false
        }
    });
    return count;
};
