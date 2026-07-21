const serviceQualityInspectionService = require("../../service/technicianLeader/serviceQualityInspection.service");

module.exports.getTasksPendingQC = async (req, res) => {
  try {
    const result = await serviceQualityInspectionService.getTasksPendingQC();
    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error",
    });
  }
};
