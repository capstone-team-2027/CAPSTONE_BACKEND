const vehicleModelService = require("../../service/customer/vehicleModel.service");

module.exports.getVehicleModel = async (req, res) => {
    try {
        const source = Object.keys(req.body).length > 0 ? req.body : req.query;
        const make_id = source.make_id ? parseInt(source.make_id) : undefined;
        const search = source.search;

        const result = await vehicleModelService.getVehicleModels({ make_id, search });
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách dòng xe thành công",
            data: result
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};
