const staffService = require("../../service/admin/staff.service");
const { createStaffSchema, updateStaffSchema } = require("../../validation/admin/staff.validation");

module.exports.getStaffList = async (req, res) => {
  try {
    const { page, limit, search, role } = req.query;
    const result = await staffService.getStaffList({
      page,
      limit,
      search,
      roleCode: role,
    });

    return res.status(200).json({
      message: "Lấy danh sách nhân sự thành công",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || "Internal server error" });
  }
};

module.exports.createStaff = async (req, res) => {
  try {
    const validation = createStaffSchema.safeParse({
      fullName: req.body.fullName,
      phoneNumber: req.body.phoneNumber,
      roleCode: req.body.roleCode,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
    });
    if (!validation.success) {
      return res.status(400).json({ message: validation.error.issues[0].message });
    }

    const result = await staffService.createStaff(validation.data);

    return res.status(201).json({
      message: "Tạo nhân sự thành công",
      data: result.user,
      tempPassword: result.tempPassword,
    });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || "Internal server error" });
  }
};

module.exports.updateStaff = async (req, res) => {
  try {
    const validation = updateStaffSchema.safeParse({
      fullName: req.body.fullName,
      phoneNumber: req.body.phoneNumber,
      roleCode: req.body.roleCode,
      status: req.body.status,
    });
    if (!validation.success) {
      return res.status(400).json({ message: validation.error.issues[0].message });
    }

    const result = await staffService.updateStaff(req.params.userId, validation.data);

    return res.status(200).json({
      message: "Cập nhật nhân sự thành công",
      data: result,
    });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || "Internal server error" });
  }
};
