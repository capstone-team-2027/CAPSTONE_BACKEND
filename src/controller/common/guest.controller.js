const guestService = require("../../service/common/guest.service");
const {
  getServiceCatalogByIdSchema,
  searchServiceCatalogSchema,
} = require("../../validation/common/guest.validation");

module.exports.getServiceCategories = async (req, res) => {
  try {
    const result = await guestService.getServiceCategories();
    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

module.exports.getServiceCatalog = async (req, res) => {
  try {
    const result = await guestService.getServiceCatalog();
    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

module.exports.searchServiceCatalog = async (req, res) => {
  try {
    const validation = searchServiceCatalogSchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0].message || "Tham số tìm kiếm không hợp lệ",
      });
    }

    const result = await guestService.searchServiceCatalog(validation.data);
    const hasItems = Array.isArray(result.items) && result.items.length > 0;

    return res.status(200).json({
      success: true,
      message: hasItems
        ? "Tìm kiếm dịch vụ thành công"
        : "Không tìm thấy dịch vụ phù hợp",
      data: result,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

module.exports.getServiceCatalogDetail = async (req, res) => {
  try {
    const validation = getServiceCatalogByIdSchema.safeParse(req.params);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0].message || "ID dịch vụ không hợp lệ",
      });
    }

    const result = await guestService.getServiceCatalogDetail(Number(validation.data.id));
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin dịch vụ thành công",
      data: result,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

module.exports.getServiceCombos = async (req, res) => {
  try {
    const result = await guestService.getServiceCombos();
    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error",
    });
  }
};
