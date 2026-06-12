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
      if (models.Spare_Parts) {
        this.hasMany(models.Spare_Parts, {
          foreignKey: 'category_id',
          as: 'spareParts'
        });
      }
    }
  }
  Part_Categories.init({
    category_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
      description: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
      pricing_rule_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
      code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true
    },
      is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true // Mặc định tạo xong nhóm này sẽ ở trạng thái bật/sẵn sàng
    }
   
  }, {
    sequelize,
    modelName: 'Part_Categories',
    tableName: 'Part_Categories',
    timestamps: true
  });
  return Part_Categories;
};