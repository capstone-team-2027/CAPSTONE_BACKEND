const guestService = require("../../service/common/guest.service");

module.exports.getServiceCategories = async (req, res) => {
    try {
        const lang = req.query.lang || 'vi';
        const result = await guestService.getServiceCategories(lang);
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
        const lang = req.query.lang || 'vi';
        const result = await guestService.getServiceCatalog(lang);
        return res.status(200).json({
            data: result,
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

module.exports.getServiceCombos = async (req, res) => {
    try {
        const lang = req.query.lang || 'vi';
        const result = await guestService.getServiceCombos(lang);
        return res.status(200).json({
            data: result,
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

module.exports.checkLicensePlate = async (req, res) => {
    try {
        const { license_plate } = req.query;
        
        if (!license_plate) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp biển số xe." });
        }
        
        const exists = await guestService.checkLicensePlate(license_plate);
        
        if (exists) {
            return res.status(200).json({ 
                success: true, 
                exists: true, 
                message: "Biển số xe đã tồn tại trong hệ thống." 
            });
        } else {
            return res.status(200).json({ 
                success: true, 
                exists: false, 
                message: "Biển số xe chưa tồn tại, có thể sử dụng." 
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Lỗi server khi kiểm tra biển số.",
        });
    }
};
