const db = require("../../../models");

module.exports.getConfigurations = async () => {
    return await db.Garage_Configurations.findAll({
        attributes: ['id', 'config_key', 'config_value', 'description', 'createdAt', 'updatedAt'],
        order: [['config_key', 'ASC']]
    });
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

module.exports.getShifts = async () => {
    return await db.Garage_Shifts.findAll({
        where: { is_active: true },
        attributes: ['id', 'shift_name', 'start_time', 'end_time', 'is_active', 'createdAt', 'updatedAt'],
        order: [['start_time', 'ASC']]
    });
};
