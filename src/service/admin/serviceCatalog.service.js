/** @type {import("sequelize").ModelStatic<import("sequelize").Model>} */
const { where } = require("sequelize");
const db = require("../../../models");
const { includes } = require("zod");
const Service_Categories = db.Service_Categories
const Service_Catalog = db.Service_Catalog

module.exports.getServiceCategories = async () => {
    const categories = await Service_Categories.findAll({
        attributes: ['id','category_name']
    });
        console.log('>>> Kết quả:', categories);

    return categories;
};

module.exports.createServiceCatalog = async (category_id, service_name, estimated_duration, is_active) =>{
    const category = await Service_Categories.findOne({
        where: {id: category_id}
    });
    if(!category){
        throw { status: 404, message: "Danh mục không tồn tại" }
    }
    const serviceCatalog = await Service_Catalog.create({
        category_id: category_id,
        service_name: service_name,
        estimated_duration: estimated_duration,
        is_active: is_active
    });
    return serviceCatalog;
};

module.exports.getServiceCatalog = async () =>{
    const serviceCatalog = await Service_Catalog.findAll({
        attributes: ['id','category_id','service_name','estimated_duration'],
        include: [
            {
                model: Service_Categories,
                as: 'category',
                attributes: ['category_name']
            }
        ]
    });
    return serviceCatalog;
};

module.exports.updateServiceCatalog = async (service_catalog_id, service_name, estimated_duration,is_active) => {
    const serviceCatalog = await Service_Catalog.findOne({
        where: {id: service_catalog_id}
    });
    if(!serviceCatalog){
        throw { status: 404, message: "Dịch vụ không tồn tại" }
    }
    await serviceCatalog.update({
        service_name: service_name,
        estimated_duration: estimated_duration,
        is_active: is_active
    });
    return serviceCatalog;
}

