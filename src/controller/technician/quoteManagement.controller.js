const quoteManagementService = require("../../service/technician/quoteManagement.service");
const {
  createQuotationSchema,
  updateQuotationSchema,
} = require("../../validation/technician/quoteManagement.validation");

module.exports.getSpareParts = async (req, res) => {
  try {
    const result = await quoteManagementService.getSpareParts();
    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

module.exports.createQuotation = async (req, res) => {
  try {
    const { task_id, items, note, email } = req.body;
    const validation = createQuotationSchema.safeParse({
      task_id,
      items,
      note,
    });
    if (!validation.success) {
      return res.status(400).json({
        message: validation.error.issues[0].message,
      });
    }
    const result = await quoteManagementService.createQuotation(
      validation.data, email
    );
    return res.status(201).json({
      message: "Tạo báo giá thành công",
      data: result,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

module.exports.updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, note } = req.body;
    const validation = updateQuotationSchema.safeParse({
      items,
      note,
    });
    if (!validation.success) {
      return res.status(400).json({
        message: validation.error.issues[0].message,
      });
    }
    const result = await quoteManagementService.updateQuotation(
      id,
      validation.data,
    );
    return res.status(200).json({
      message: "Cập nhật báo giá thành công",
      data: result,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

module.exports.getQuoteHistory = async (req, res) => {
  try {
    const result = await quoteManagementService.getQuoteHistory();
    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error",
    });
  }
};
