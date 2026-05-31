const rankingService = require("../../service/admin/employeeRanking.service");

module.exports.getEmployeeRanking = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await rankingService.getEmployeeRanking({ startDate, endDate });

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy dữ liệu xếp hạng nhân viên",
        data: [],
      });
    }

    return res.status(200).json({
      message: "Lấy dữ liệu xếp hạng nhân viên thành công",
      data,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error",
    });
  }
};
