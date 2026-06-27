'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Part_Catalog extends Model {

    static associate(models) {
      this.belongsTo(models.Part_Categories, {
        foreignKey: 'category_id',
        as: 'category'
      });
    }
  }
  Part_Catalog.init({
    sku: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true // Đảm bảo mã định danh linh kiện quốc tế/mã hãng không bị trùng lặp
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false // Tên linh kiện tổng quát bắt buộc phải nhập
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false // Bắt buộc phải gắn với một danh mục phân loại
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: true // Cho phép null nếu hàng không rõ thương hiệu (hoặc hàng oem chưa phân loại)
    },
    base_price: {
      type: DataTypes.DECIMAL(12, 2), // Độ chính xác tiền tệ lên đến hàng chục tỷ, có 2 chữ số thập phân
      allowNull: false,
      defaultValue: 0.00
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true // Mặc định linh kiện catalogue này được bật kinh doanh luôn
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Part_Catalog',
    tableName: 'Part_Catalogs',
    timestamps: true
  });
  return Part_Catalog;
};