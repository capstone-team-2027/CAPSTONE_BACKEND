const { Op, where } = require("sequelize");
const db = require("../../../models");
const supplier = require("../../../models/supplier");

const Supplier = db.Suppliers;

module.exports.createSupplier = async (name, phone, address, is_active) => {
  const supplier = await Supplier.create({
    name: name,
    phone: phone,
    address: address,
    is_active: is_active,
  });
  return supplier;
};

module.exports.getSupplier = async () => {
  const supplier = await Supplier.findAll({
    attributes: ["id", "name", "phone", "address", "is_active"],
  });
  return supplier;
};

module.exports.updateSupplier = async (id, name, phone, address, is_active) => {
  const supplier = await Supplier.findOne({
    where: { id: id },
  });
  if (!supplier) {
    throw { status: 404, message: "Nhà cung cấp không tồn tại" };
  }
  await supplier.update({
    name: name,
    phone: phone,
    address: address,
    is_active: is_active,
  });
  return supplier;
};
