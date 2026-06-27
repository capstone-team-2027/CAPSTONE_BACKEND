'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Suppliers extends Model {
    static associate(models) {
      // Một NCC có nhiều dòng nhập kho (type = IN trong Inventory_Logs)
      if (models.Inventory_Logs) {
        this.hasMany(models.Inventory_Logs, {
          foreignKey: 'supplier_id',
          as: 'inventoryLogs'
        });
      }
    }
  }
  Suppliers.init({
    name: {
      type: DataTypes.STRING(255),
      allowNull: false // Tên NCC — bắt buộc
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true // Liên hệ đặt hàng
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true // Địa chỉ lấy hàng / ghi lên chứng từ
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true // Xóa mềm: ẩn NCC ngừng hợp tác
    },
  }, {
    sequelize,
    modelName: 'Suppliers',
    tableName: 'Suppliers',
    timestamps: true
  });
  return Suppliers;
};