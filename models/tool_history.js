'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tool_History extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Workshop_Tools, {
        foreignKey: 'tool_id',
        as: 'tool'
      });

      // 2. Một bản ghi lịch sử bắt buộc phải được xác nhận/phụ trách bởi một Nhân viên (User)
      this.belongsTo(models.User, {
        foreignKey: 'technician_id',
        as: 'operator'
      });
    }
  }
  Tool_History.init({
    tool_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    event_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    event_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // ai là người đứng ra đưa đi bảo trì sửa chữa
    technician_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Tool_History',
    tableName: 'Tool_Histories',
    timestamps: true
  });
  return Tool_History;
};