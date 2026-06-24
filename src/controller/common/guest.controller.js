const guestService = require("../../service/common/guest.service");

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
