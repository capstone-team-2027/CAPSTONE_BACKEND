const vehicleMakeService = require("../../service/customer/vehicleMake.service");

module.exports.getVehicleMake = async (req, res) => {
    try {
        const queryParams = Object.keys(req.body).length > 0 ? req.body : req.query;
        const result = await vehicleMakeService.getVehicleMakes(queryParams);
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách hãng xe thành công",
            data: result
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};
