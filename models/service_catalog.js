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
    estimated_duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30 // Đơn vị: Phút. Mặc định là 30 phút nếu không nhập
    }
  }, {
    sequelize,
    modelName: 'Service_Catalog',
    tableName: 'Service_Catalogs',
    timestamps: true
  });
  return Service_Catalog;
};