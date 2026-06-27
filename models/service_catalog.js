'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Service_Catalog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Service_Categories, {
        foreignKey: 'category_id',
        as: 'category'
      });
      this.belongsToMany(models.Service_Combo, {
        through: models.Service_Combo_Catalogs,
        foreignKey: 'catalog_id',
        otherKey: 'combo_id',
        as: 'combos'
      });
    }
  }
  Service_Catalog.init({
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false // Khóa ngoại bắt buộc phải có để phân nhóm dịch vụ
    },
    service_name: {
      type: DataTypes.STRING(255),
      allowNull: false // Tên dịch vụ mẫu không được để trống
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,        // cho phép trống
      defaultValue: ""
    },
    estimated_duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30 // Đơn vị: Phút. Mặc định là 30 phút nếu không nhập
    },
    labor_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Service_Catalog',
    tableName: 'Service_Catalogs',
    timestamps: true
  });
  return Service_Catalog;
};