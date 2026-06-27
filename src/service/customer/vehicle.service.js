const db = require("../../../models");

module.exports.getVehicleByCustomer = async (userId) => {
    let customer = await db.Customers.findOne({ where: { user_id: userId } });
    if (!customer) {
        throw { status: 404, message: "Hồ sơ khách hàng không tồn tại" };
    }

    const vehicles = await db.Vehicles.findAll({
        where: { customer_id: customer.id },
        include: [
            {
                model: db.Vehicle_Models,
                as: 'model',
                attributes: ['id', 'model_name', 'vehicle_type'],
                include: [
                    {
                        model: db.Vehicle_Makes,
                        as: 'make',
                        attributes: ['id', 'make_name']
                    }
                ]
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    return vehicles;
};
