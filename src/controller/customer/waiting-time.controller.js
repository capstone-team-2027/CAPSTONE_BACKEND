const waitingTimeService = require("../../service/customer/waitingTime.service");

module.exports.getWaitingTime = async (req, res) => {
    try {
        const requestUser = res.locals.user;
        if (!requestUser) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const result = await waitingTimeService.getWaitingTime(requestUser.id);
        return res.status(200).json({
            success: true,
            message: result.message,
            data: result
        });
    } catch (error) {
        console.error("Error in getWaitingTime:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};