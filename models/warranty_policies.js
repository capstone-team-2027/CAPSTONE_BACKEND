'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Warranty_Policies extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Warranty_Policies.init({
    policy_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    policy_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image_cover_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    pdf_document_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Warranty_Policies',
    tableName: 'Warranty_Policies',
    timestamps: true
  });
  return Warranty_Policies;
};