
const ServiceBayService = require("./../../service/admin/serviceBay.service")
const { createServiceBaySchema, updateServiceBaySchema } = require("./../../validation/admin/serviceBay.validator")
module.exports.listServiceBays = async (req, res) => {
    try {
        const data = await ServiceBayService.listServiceBays();
        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách cầu sửa chữa thành công',
            data
        });
    } catch (error) {
        console.error('listServiceBays error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: error.message
        });
    }
};
module.exports.createServiceBay = async (req, res) => {
    try {
        const parsed = createServiceBaySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: parsed.error.issues.map(e => ({
                    field: e.path.join('.'),
                    message: e.message
                }))
            });
        }

        const data = await ServiceBayService.createServiceBay(parsed.data);
        return res.status(201).json({
            success: true,
            message: 'Tạo cầu sửa chữa thành công',
            data
        });
    } catch (error) {
        console.error('createServiceBay error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: error.message
        });
    }
};
module.exports.updateServiceBay = async (req, res) => {
    try {
        const { id } = req.params;

        const parsed = updateServiceBaySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: parsed.error.issues.map(e => ({
                    field: e.path.join('.'),
                    message: e.message
                }))
            });
        }

        const data = await ServiceBayService.updateServiceBay(id, parsed.data);
        return res.status(200).json({
            success: true,
            message: 'Cập nhật cầu sửa chữa thành công',
            data
        });
    } catch (error) {
        console.error('updateServiceBay error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: error.message
        });
    }
}
module.exports.removeServiceBay = async (req, res) => {
    try {
        const { id } = req.params;
        await ServiceBayService.removeServiceBay(id);
        return res.status(200).json({
            success: true,
            message: 'Xóa cầu sửa chữa thành công'
        });
    } catch (error) {
        console.error('removeServiceBay error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: error.message
        });
    }
}