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

    const capacity = await getGarageCapacity();

    let bookedCounts = {};
    if (dateStr) {
        const startOfDay = new Date(`${dateStr}T00:00:00Z`);
        const endOfDay = new Date(`${dateStr}T23:59:59Z`);

        const appointments = await db.Appointments.findAll({
            where: {
                scheduled_time: {
                    [Op.between]: [startOfDay, endOfDay]
                },
                status: {
                    [Op.in]: ['PENDING', 'CONFIRMED']
                }
            },
            attributes: ['scheduled_time']
        });

        appointments.forEach(app => {
            const h = app.scheduled_time.getHours();
            bookedCounts[h] = (bookedCounts[h] || 0) + 1;
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
