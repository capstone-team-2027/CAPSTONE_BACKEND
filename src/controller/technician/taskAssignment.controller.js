const taskAssignmentService = require("../../service/technician/taskAssignment.service");

module.exports.getTaskAssignment = async (req, res) => {
    try {
        const technicianId = res.locals.user.id;
        console.log("chạy vào ass")
        const result = await taskAssignmentService.getTaskAssignment(technicianId);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in getTaskAssignment:", error);
        return res.status(error.status || 500).json({
            message: error.message || "Đã xảy ra lỗi khi lấy danh sách phân công công việc"
        });
    }
}

module.exports.getServiceOrderDetail = async (req, res) => {
    try {
        const { id } = req.params; // service_order_id
        const technicianId = res.locals.user.id;

        const result = await taskAssignmentService.getServiceOrderDetail(id, technicianId);

        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in getServiceOrderDetail:", error);
        return res.status(error.status || 500).json({
            message: error.message || "Đã xảy ra lỗi khi lấy chi tiết Lệnh sửa chữa"
        });
    }
};

module.exports.startTask = async (req, res) => {
    try {
        const { taskAssignmentId } = req.body;
        const technicianId = res.locals.user.id;

        if (!taskAssignmentId) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng truyền taskAssignmentId vào body."
            });
        }

        const result = await taskAssignmentService.startTask(taskAssignmentId, technicianId);

        return res.status(200).json({
            success: true,
            message: "Đã bắt đầu công việc thành công.",
            data: result
        });
    } catch (error) {
        console.error("Error in startTask:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Đã xảy ra lỗi khi bắt đầu công việc."
        });
    }
};

module.exports.completeTask = async (req, res) => {
    try {
        const { taskAssignmentId } = req.body;
        const technicianId = res.locals.user.id;

        if (!taskAssignmentId) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng truyền taskAssignmentId vào body."
            });
        }

        const result = await taskAssignmentService.completeTask(taskAssignmentId, technicianId);

        return res.status(200).json({
            success: true,
            message: "Đã hoàn thành công việc thành công.",
            data: result
        });
    } catch (error) {
        console.error("Error in completeTask:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Đã xảy ra lỗi khi hoàn thành công việc."
        });
    }
};
