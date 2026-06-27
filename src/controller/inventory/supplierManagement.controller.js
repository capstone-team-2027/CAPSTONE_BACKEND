const supplier = require("../../../models/supplier");
const supplierManagement = require("../../service/inventory/supplierManagement.service");
const {createSupplierSchema,updateSupplierSchema} = require("../../validation/inventory/supplierManagement.validation");

module.exports.createSupplier = async (req, res) => {
  try {
    const { name, phone, address, is_active } = req.body;
    const validation = createSupplierSchema.safeParse({
      name,
      phone,
      address,
      is_active,
    });
    if (!validation.success) {
      return res.status(400).json({
        message: validation.error.issues[0].message,
      });
    }
    const result = await supplierManagement.createSupplier(
      name,
      phone,
      address,
      is_active,
    );
    return res.status(201).json({
      message: "Tạo nhà cung thành công",
      data: result,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

module.exports.getSupplier = async (req, res) => {
  try {
    const result = await supplierManagement.getSupplier();
    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

module.exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, is_active } = req.body;
    const validation = updateSupplierSchema.safeParse({
      name,
      phone,
      address,
      is_active,
    });
    if (!validation.success) {
      return res.status(400).json({
        message: validation.error.issues[0].message,
      });
    }
    const result = await supplierManagement.updateSupplier(
      id,
      name,
      phone,
      address,
      is_active,
    );
    return res.status(201).json({
      message: "Cập nhật nhà cung thành công",
      data: result,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error",
    });
  }
};
