const db = require("../../../models");
const { Op } = require("sequelize");

module.exports.getVehicleModels = async (query = {}) => {
    const { make_id, search } = query;
    const where = {};
    if (make_id) {
        where.make_id = make_id;
    }
    if (search) {
        where.model_name = {
            [Op.iLike]: `%${search.trim()}%`
        };
    }
    return await db.Vehicle_Models.findAll({
        where,
        attributes: ["id", "make_id", "model_name", "vehicle_type"],
        include: [
            {
                model: db.Vehicle_Makes,
                as: "make",
                attributes: ["id", "make_name"],
            }
        ],
        order: [["model_name", "ASC"]],
    });
};
