'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Vehicle_Makes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      make_name: {
        type: Sequelize.STRING(50),
        allowNull: false, // FIX: Tên hãng xe bắt buộc phải nhập
        unique: true      // FIX: Chặn tuyệt đối việc tạo trùng tên hãng (Vd: Có 2 chữ 'Toyota' trong DB)
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
    await queryInterface.dropTable('Vehicle_Makes');
  }
};