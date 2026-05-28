'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Inventory_Logs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      if (models.Spare_Parts) {
        this.belongsTo(models.Spare_Parts, {
          foreignKey: 'part_id',
          as: 'part'
        });
      }

      // 2. Một dòng log có thể liên kết
      //  tới một Lệnh sửa chữa xe (Service_Order)
      if (models.Service_Orders) {
        this.belongsTo(models.Service_Orders, {
          foreignKey: 'service_order_id',
          as: 'serviceOrder'
        });
      }
      // 3. Một dòng log bắt buộc phải được thực hiện bởi một Nhân viên/Thủ kho (User)
      if (models.User) {
        this.belongsTo(models.User, {
          foreignKey: 'manager_id',
          as: 'manager'
        });
      }
    }
  }
  Inventory_Logs.init({
    part_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    service_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true // Nullable khi nhập kho / cân bằng kho
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false // IN, OUT, ADJUST
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    manager_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Inventory_Logs',
    tableName: 'Inventory_Logs',
    timestamps: true
  });
  return Inventory_Logs;
};