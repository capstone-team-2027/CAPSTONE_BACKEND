'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Appointment_Details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      appointment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Appointments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // 🔥 FIX: Đặt CASCADE. Nếu lịch hẹn bị xóa/hủy, toàn bộ chi tiết này sẽ tự động bay màu theo, tránh sinh ra "rác" trong DB.
      },
      catalog_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Service_Catalogs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      combo_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Service_Combos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable('Appointment_Details');
  }
};
