'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false, //
        references: {
          model: 'Roles', // Tên table cha
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // Không cho xóa Role nếu đang có nhân viên thuộc Role đó 
      },
      phoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: false, //
        unique: true // SĐT dùng để đăng nhập và OTP nên không được trùng [cite: 466]
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false // Tuyệt đối không để NULL mật khẩu 
      },
      fullName: {
        type: Sequelize.STRING(150),
        allowNull: false //
      },
      avatar: {
        type: Sequelize.STRING(255),
        defaultValue: "" // Giá trị mặc định nếu chưa có ảnh
      },
      refreshToken: {
        type: Sequelize.STRING(255),
        allowNull: true // 
      },
      status: {
        type: Sequelize.STRING(50),
        defaultValue: 'ACTIVE', // Các trạng thái: ACTIVE, INACTIVE, BANNED
        allowNull: false
      },
      hasDrivingLicense: {
        type: Sequelize.BOOLEAN,
        defaultValue: false, // Mặc định là không có bằng lái
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW // DB tự sinh thời gian
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
    // Thêm Index để Login bằng SĐT chạy nhanh hơn [cite: 466]
    await queryInterface.addIndex('Users', ['phoneNumber']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};