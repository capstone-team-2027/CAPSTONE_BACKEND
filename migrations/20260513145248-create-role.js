'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Roles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      roleCode: {
        type: Sequelize.STRING,
        allowNull: false, // kh cho phép null 
        unique: true, // giá trị kh dc trùng 
      },
      roleName: {
        type: Sequelize.STRING,
        allowNull: false, // kh cho phép null 
        unique: true // giá trị kh dc trùng 
      },
      description: {
        type: Sequelize.TEXT,
        defaultValue: ""
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      otpCode: {
        type: Sequelize.STRING(10), // Độ dài tùy chọn (thường là 6-10 ký tự)
        allowNull: true,
      },
      otpExpiration: {
        type: Sequelize.DATE, // Lưu trữ thời điểm hết hạn
        allowNull: true,
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
    await queryInterface.addIndex('Roles', ['roleCode']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Roles');
  }
};