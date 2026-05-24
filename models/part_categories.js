'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Part_Categories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Pricing_Rules, {
        foreignKey: 'pricing_rule_id',
        as: 'pricingRule'
      });
      this.belongsTo(models.Part_Categories, {
        foreignKey: 'parent_id',
        as: 'parentCategory'
      });

      // Mối quan hệ: Một Danh mục cha có thể có nhiều Danh mục con bên trong
      this.hasMany(models.Part_Categories, {
        foreignKey: 'parent_id',
        as: 'subCategories'
      });

      // 3. LIÊN KẾT ĐẾN CÁC BẢNG SẢN PHẨM / THẾ GIỚI LINH KIỆN
      // Một danh mục phân loại chứa nhiều linh kiện thực tế trong kho (Spare_Parts)
      if (models.Spare_Parts) {
        this.hasMany(models.Spare_Parts, {
          foreignKey: 'category_id',
          as: 'spareParts'
        });
      }

      // Một danh mục phân loại chứa nhiều linh kiện mẫu trong catalogue (Part_Catalog)
      if (models.Part_Catalog) {
        this.hasMany(models.Part_Catalog, {
          foreignKey: 'category_id',
          as: 'catalogItems'
        });
      }
    }
  }
  Part_Categories.init({
    category_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // khóa ngoại nối đến bảng pricing_rule
    pricing_rule_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Part_Categories',
    tableName: 'Part_Categories',
    timestamps: true
  });
  return Part_Categories;
};