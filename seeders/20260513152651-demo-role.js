'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Roles', [
      {
        roleCode: 'ADMIN',
        roleName: 'Quản trị viên',
        description: 'Toàn quyền hệ thống, quản lý nhân sự và cấu hình gara',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleCode: 'RECEPTIONIST',
        roleName: 'Lễ tân',
        description: 'Tiếp nhận xe, tạo lệnh sửa chữa, báo giá và thu ngân',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleCode: 'TECHNICIAN_LEADER',
        roleName: 'Quản lý kỹ thuật',
        description: 'Tổ trưởng thợ, duyệt báo giá kỹ thuật, phân công công việc và kiểm tra chất lượng',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleCode: 'TECHNICIAN',
        roleName: 'Kỹ thuật viên',
        description: 'Thợ sửa chữa, thực hiện các task được giao và cập nhật tiến độ',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleCode: 'CUSTOMER',
        roleName: 'Khách hàng',
        description: 'Chủ xe, sử dụng App để đặt lịch và theo dõi quá trình sửa chữa',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
