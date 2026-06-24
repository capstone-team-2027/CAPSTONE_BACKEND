const db = require("../../../models");
const Service_Categories = db.Service_Categories;
const Service_Catalog = db.Service_Catalog;
const Service_Combo = db.Service_Combo;

// Categories
module.exports.getServiceCategories = async () => {
    const categories = await Service_Categories.findAll({
        attributes: ['id', 'category_name']
    });
    return categories;
};

// Catalogs (Single Services)
module.exports.getServiceCatalog = async () => {
    const serviceCatalog = await Service_Catalog.findAll({
        where: {
            is_active: true
        },
        attributes: ['id', 'category_id', 'service_name', 'description', 'estimated_duration', 'is_active'],
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

// Combos
module.exports.getServiceCombos = async () => {
    const combos = await Service_Combo.findAll({
        where: {
            is_active: true
        },
        attributes: ["id", "combo_name", "description", "is_active", "createdAt", "updatedAt"],
        include: [
            {
                model: Service_Catalog,
                as: "catalogs",
                attributes: [
                    "id",
                    "category_id",
                    "service_name",
                    "description",
                    "estimated_duration",
                    "is_active",
                ],
                through: { attributes: [] },
                include: [
                    {
                        model: Service_Categories,
                        as: "category",
                        attributes: ["id", "category_name"],
                    },
                ],
            },
        ],
        order: [["createdAt", "DESC"]],
    });
    return combos;
};
