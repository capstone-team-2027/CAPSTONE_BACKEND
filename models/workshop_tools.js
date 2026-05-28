'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Workshop_Tools extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Service_Bays, {
        foreignKey: 'bay_id',
        as: 'bay'
      });

      // 2. Một thiết bị sẽ có một chuỗi lịch sử sửa chữa/bảo trì (Tool_History)
      if (models.Tool_History) {
        this.hasMany(models.Tool_History, {
          foreignKey: 'tool_id',
          as: 'historyRecords'
        });
      }
    }
  }
  Workshop_Tools.init({
    tool_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    serial_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    bay_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    current_location: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    purchase_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    current_value: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    vendor_info: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'AVAILABLE'
    },
    purchase_date: DataTypes.DATEONLY,
    warranty_expiry: DataTypes.DATEONLY,
    last_maintenance_date: DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'Workshop_Tools',
    tableName: 'Workshop_Tools', // Ép Sequelize map chuẩn xác viết đúng tên bảng trong Postgres
    timestamps: true
  });
  return Workshop_Tools;
};