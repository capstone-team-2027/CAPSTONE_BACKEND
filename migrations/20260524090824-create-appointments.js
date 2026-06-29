'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Appointments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      vehicle_id: {
        type: Sequelize.INTEGER,
        allowNull: true, //  xe
        references: {
          model: 'Vehicles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      booking_type: {
        type: Sequelize.STRING(50),
        allowNull: false, // 🔥 THÊM MỚI: Bắt buộc truyền lên là SPECIFIC hoặc CONSULTATION
      },
      scheduled_time: {
        type: Sequelize.DATE,
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true, // 🔥 THÊM MỚI: Rất quan trọng khi booking_type là CONSULTATION (khách mô tả bệnh)
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'CONFIRMED'
      },
      created_at: {
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
    await queryInterface.dropTable('Appointments');
  }
};