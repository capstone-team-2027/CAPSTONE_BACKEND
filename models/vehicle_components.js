"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Vehicle_Components extends Model {
    static associate(models) {
      this.hasMany(models.Vehicle_Issues, {
        foreignKey: "component_id",
        as: "issues",
      });

      // Nếu muốn phân nhóm cha-con (VD: "Hệ thống phanh" > "Phanh trước")
      this.belongsTo(models.Vehicle_Components, {
        foreignKey: "parent_id",
        as: "parent",
      });
      this.hasMany(models.Vehicle_Components, {
        foreignKey: "parent_id",
        as: "children",
      });
    }
  }
  Vehicle_Components.init(
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false, // VD: "Phanh trước", "Động cơ", "Lốp xe"
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Vehicle_Components", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Vehicle_Components",
      tableName: "Vehicle_Components",
      timestamps: true,
    },
  );

  return Vehicle_Components;
};
