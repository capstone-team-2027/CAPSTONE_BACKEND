const db = require("../../../models");

module.exports.getWaitingTime = async (userId) => {
    const customer = await db.Customers.findOne({ where: { user_id: userId } });
    if (!customer) {
        throw { status: 404, message: "Hồ sơ khách hàng không tồn tại" };
    }

    // Tìm TẤT CẢ các Service Order đang hoạt động của khách hàng này
    const activeOrders = await db.Service_Orders.findAll({
        include: [
            {
                model: db.Vehicles,
                as: 'vehicle',
                where: { customer_id: customer.id },
                attributes: ['id', 'license_plate', 'vin_number']
            },
            {
                model: db.Task,
                as: 'tasks',
                include: [
                    {
                        model: db.Service_Catalog,
                        as: 'catalog',
                        attributes: ['service_name', 'estimated_duration']
                    }
                ]
            }
        ],
        where: {
            [db.Sequelize.Op.or]: [
                { status: { [db.Sequelize.Op.notIn]: ['COMPLETED', 'CANCELLED'] } },
                { 
                    status: 'COMPLETED',
                    updatedAt: {
                        [db.Sequelize.Op.gte]: new Date(new Date() - 48 * 60 * 60 * 1000) // Hoàn thành trong vòng 48h
                    }
                }
            ]
        },
        order: [['createdAt', 'DESC']]
    });

    if (!activeOrders || activeOrders.length === 0) {
        return {
            hasActiveOrder: false,
            activeOrders: [],
            message: "Không có xe nào đang được sửa chữa"
        };
    }

    const formattedOrders = activeOrders.map(order => {
        let totalRemainingTimeMinutes = 0;
        const taskDetails = [];

        if (order.tasks && order.tasks.length > 0) {
            for (const task of order.tasks) {
                const estimatedDuration = task.catalog?.estimated_duration || 0;
                
                if (task.status !== 'COMPLETED') {
                    totalRemainingTimeMinutes += estimatedDuration;
                }

                taskDetails.push({
                    taskId: task.id,
                    serviceName: task.catalog?.service_name,
                    status: task.status, // PENDING, IN_PROGRESS, COMPLETED
                    estimatedDuration: estimatedDuration
                });
            }
        }

        return {
            serviceOrderId: order.id,
            vehicle: order.vehicle,
            orderStatus: order.status,
            totalRemainingTimeMinutes: totalRemainingTimeMinutes,
            tasks: taskDetails
        };
    });

    return {
        hasActiveOrder: true,
        activeOrders: formattedOrders,
        message: "Lấy thời gian chờ và trạng thái sửa chữa thành công"
    };
};
