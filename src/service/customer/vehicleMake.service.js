const db = require("../../../models");
const { Op } = require("sequelize");

module.exports.getVehicleMakes = async (query = {}) => {
    const { search } = query;
    const where = {};
    if (search) {
        where.make_name = {
            [Op.iLike]: `%${search.trim()}%`
        };
    }
    return await db.Vehicle_Makes.findAll({
        where,
        attributes: ["id", "make_name"],
        order: [["make_name", "ASC"]],
    });
};
