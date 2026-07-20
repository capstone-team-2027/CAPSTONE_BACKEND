const db = require("../../../models");

const { Op } = require("sequelize");
const getGarageCapacity = require("../../util/getGarageCapacity.util");

module.exports.getConfigurations = async () => {
    return await db.Garage_Configurations.findAll({
        attributes: ['id', 'config_key', 'config_value', 'description', 'createdAt', 'updatedAt'],
        order: [['config_key', 'ASC']]
    });
};

module.exports.getAvailability = async (dateStr) => {
    const shifts = await db.Shift_Slots.findAll({
        where: { is_active: true },
        attributes: ['id', ['slot_name', 'shift_name'], 'start_time', 'end_time', 'is_active', 'createdAt', 'updatedAt'],
        order: [['start_time', 'ASC']]
    });

    const capacityData = await getGarageCapacity();
    const capacity = capacityData.maxCapacity;

    let bookedCounts = {};
    if (dateStr) {
        const startOfDay = new Date(`${dateStr}T00:00:00Z`);
        const endOfDay = new Date(`${dateStr}T23:59:59Z`);

        // 1. Check tương lai (Appointments)
        const appointments = await db.Appointments.findAll({
            where: {
                scheduled_time: {
                    [Op.between]: [startOfDay, endOfDay]
                },
                status: {
                    [Op.in]: ['PENDING', 'CONFIRMED']
                }
            },
            attributes: ['id', 'scheduled_time'],
            include: [
                {
                    model: db.Appointment_Details,
                    as: 'appointmentDetails',
                    attributes: ['catalog_id', 'combo_id']
                }
            ]
        });

        const { calculateAppointmentTime } = require("../../util/calculateAppointmentTime.util");

        await Promise.all(appointments.map(async (app) => {
            const { endTime } = await calculateAppointmentTime(app.appointmentDetails, app.scheduled_time);
            const startHour = app.scheduled_time.getUTCHours();
            let endHour = endTime.getUTCHours();

            // Xử lý cẩn thận trường hợp qua ngày (qua nửa đêm UTC)
            if (endHour < startHour) {
                endHour += 24;
            }

            if (endTime.getMinutes() === 0 && endHour > startHour) {
                endHour -= 1;
            }
            for (let h = startHour; h <= endHour; h++) {
                const hourKey = h % 24;
                bookedCounts[hourKey] = (bookedCounts[hourKey] || 0) + 1;
            }
        }));

        // 2. Check hiện tại (Service_Orders đang sửa chữa) nếu khách chọn xem lịch của ngày hôm nay!
        // Các xe đang nằm trên cầu nâng (IN_PROGRESS) sẽ tiếp tục chiếm dụng cầu nâng đến khi estimated_finish_time.
        const activeOrders = await db.Service_Orders.findAll({
            where: {
                status: {
                    [Op.in]: ['INSPECTING', 'IN_PROGRESS', 'WAITING_FOR_PARTS']
                },
                estimated_finish_time: {
                    [Op.ne]: null,
                    [Op.between]: [startOfDay, endOfDay]
                }
            },
            attributes: ['entry_time', 'estimated_finish_time']
        });

        activeOrders.forEach(order => {
            // Xe đã vào xưởng và đang sửa, nên startHour tính từ bây giờ hoặc entry_time
            const currentUTC = new Date().getUTCHours();
            const entryUTC = order.entry_time.getUTCHours();
            const startHour = Math.max(currentUTC, entryUTC);
            let endHour = order.estimated_finish_time.getUTCHours();

            if (endHour < startHour) {
                endHour += 24;
            }

            if (order.estimated_finish_time.getMinutes() === 0 && endHour > startHour) {
                endHour -= 1;
            }
            for (let h = startHour; h <= endHour; h++) {
                const hourKey = h % 24;
                bookedCounts[hourKey] = (bookedCounts[hourKey] || 0) + 1;
            }
        });
    }

    return {
        shifts,
        capacity,
        bookedCounts
    };
};

module.exports.getConfigurationByKey = async (key) => {
    const config = await db.Garage_Configurations.findOne({
        where: { config_key: key },
        attributes: ['id', 'config_key', 'config_value', 'description', 'createdAt', 'updatedAt']
    });

    if (!config) {
        throw { status: 404, message: `Không tìm thấy cấu hình với key: ${key}` };
    }

    return config;
};
