const {createServiceCatalogSchema} = require ("../../validation/admin/serviceCatalog.validation")
const serviceCatalog = require ("../../service/admin/serviceCatalog.service");

module.exports.getServiceCategories = async (req,res) => {
    try {
        const result = await serviceCatalog.getServiceCategories();
        return res.status(200).json({
            data: result,
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

module.exports.createServiceCatalog = async (req,res) => {
    try {
        const {category_id, service_name, estimated_duration,is_active} = req.body;
        const validation = createServiceCatalogSchema.safeParse({service_name});
        const result = await serviceCatalog.createServiceCatalog(category_id, service_name,estimated_duration,is_active);
        return res.status(201).json({
            message: "Tạo mới dịch vụ thành công",
            data: result,
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

module.exports.getServiceCatalog = async (req,res) => {
    try {
        const result = await serviceCatalog.getServiceCatalog();
        return res.status(200).json({
            data: result,
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

module.exports.updateServiceCatalog  = async (req,res) => {
    try {
        const {service_catalog_id, service_name, estimated_duration,is_active} = req.body;
        const validation = createServiceCatalogSchema.safeParse({service_name});
        const result =  await serviceCatalog.updateServiceCatalog(service_catalog_id, service_name, estimated_duration,is_active);
        return res.status(201).json({
            message: "Cập nhật dịch vụ thành công",
            data: result,
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
        });
    }
};