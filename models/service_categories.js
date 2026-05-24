'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Service_Categories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Service_Categories.init({
    category_name: {
      type: DataTypes.STRING(100),
      allowNull: false // Không được để trống tên danh mục dịch vụ
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estimated_duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0 // Mặc định là 0 phút
    },
    base_price: {
      type: DataTypes.DECIMAL(12, 2), // Hỗ trợ lưu giá dịch vụ lớn chính xác từng đồng xu
      allowNull: false,
      defaultValue: 0.00
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true // Mặc định dịch vụ được kích hoạt sẵn
    }
  }, {
    sequelize,
    modelName: 'Service_Categories',
    tableName: 'Service_Categories', // Ép Sequelize map chuẩn xác với tên bảng viết hoa/thường này trong Postgres
    timestamps: true // Quản lý tự động các cột createdAt và updatedAt
  });
  return Service_Categories;
};