const db = require("../../../models");
const Service_Bays = db.Service_Bays;
const { Op } = require("sequelize");
module.exports.listServiceBays = async () => {
    const rows = await Service_Bays.findAll({
        order: [['id', 'ASC']]
    });
    return rows;
};
module.exports.createServiceBay = async (body) => {
    const { bay_name, status, is_active } = body;

    const existing = await Service_Bays.findOne({ where: { bay_name } });
    if (existing) throw new Error('Tên cầu sửa chữa đã tồn tại');

    const newBay = await Service_Bays.create({
        bay_name,
        status: status || 'available',
        is_active: is_active !== undefined ? is_active : true
    });

    return newBay;
};
module.exports.updateServiceBay = async (id, body) => {
    const bay = await Service_Bays.findByPk(id);
    if (!bay) throw new Error('Không tìm thấy cầu sửa chữa');

    if (body.bay_name && body.bay_name !== bay.bay_name) {
        const existing = await Service_Bays.findOne({ where: { bay_name: body.bay_name } });
        if (existing) throw new Error('Tên cầu sửa chữa đã tồn tại');
    }

    await bay.update(body);
    return bay;
};
module.exports.removeServiceBay = async (id) => {
    const bay = await Service_Bays.findByPk(id);
    if (!bay) throw new Error('Không tìm thấy cầu sửa chữa');

    if (!bay.is_active) throw new Error('Cầu sửa chữa đã bị xóa trước đó');

    await bay.update({ is_active: false });
};