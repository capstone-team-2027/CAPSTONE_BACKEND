'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Warranty_Policies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      policy_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      policy_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      warranty_type: {
        type: Sequelize.STRING(20),
        allowNull: false // e.g. TIME, DISTANCE, BOTH, NONE
      },
      duration_months: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      distance_km: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Warranty_Policies');
  }
};