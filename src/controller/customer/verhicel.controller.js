const verhicelService = require("../../service/customer/verhicel.service");

module.exports.getVehicelByCustomer = async (req, res) => {
    try {
        const requestUser = res.locals.user;
        if (!requestUser) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const result = await verhicelService.getVehicelByCustomer(requestUser.id);
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách xe thành công",
            data: result
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};