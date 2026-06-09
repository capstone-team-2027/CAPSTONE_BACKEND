'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Spare_Parts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Warehouse_Locations, {
        foreignKey: 'location_id',
        as: 'location'
      });
      this.belongsTo(models.Part_Categories, {
        foreignKey: 'category_id',
        as: 'category'
      });
    }
  }
  Spare_Parts.init({
    sku: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true // Chặn trùng lặp mã phụ tùng
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: true // Cho phép null nếu hàng không rõ thương hiệu (hoặc hàng oem chưa phân loại)
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0 // Mặc định phụ tùng mới tạo có số lượng bằng 0
    },
    min_threshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5 // Mặc định dưới 5 món sẽ kích hoạt cảnh báo sắp hết hàng
    },
    cogs: {
      type: DataTypes.DECIMAL(12, 2), // Hỗ trợ số tiền lớn và độ chính xác phần thập phân
      allowNull: false,
      defaultValue: 0.00
    },
    retail_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    location_id: {
      type: DataTypes.INTEGER,
      allowNull: true // Cho phép null nếu hàng mới về chưa kịp xếp lên kệ kho
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false // Bắt buộc phải gắn với một danh mục cụ thể
    },
    warranty_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'NONE' // Các giá trị hợp lệ: 'TIME', 'DISTANCE', 'BOTH', 'NONE'
    },
    warranty_period_months: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    warranty_km_limit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
  }, {
    sequelize,
    modelName: 'Spare_Parts',
    tableName: 'Spare_Parts',
    timestamps: true
  });
  return Spare_Parts;
};