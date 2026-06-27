'use strict';

/** @type {import('sequelize-cli').Migration} */
const bcrypt = require("bcrypt")
module.exports = {

  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash('123', salt);
    return queryInterface.bulkInsert('Users', [
      {
        roleId: 1,
        phoneNumber: '84999999999',
        password: hashPassword,
        fullName: 'Nguyễn Admin',
        avatar: 'https://i.pravatar.cc/150?u=admin',
        status: 'ACTIVE',
        hasDrivingLicense: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleId: 3, // ID của TECHNICIAN_LEADER
        phoneNumber: '84382657269',
        password: hashPassword,
        fullName: 'Trần Tổ Trưởng',
        avatar: 'https://i.pravatar.cc/150?u=leader',
        status: 'ACTIVE',
        hasDrivingLicense: true, // Tổ trưởng thường có bằng lái để lái xe khách vào cầu nâng
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleId: 4, // ID của TECHNICIAN
        phoneNumber: '84900000001',
        password: hashPassword,
        fullName: 'Lê Thợ Máy',
        avatar: 'https://i.pravatar.cc/150?u=tech',
        status: 'ACTIVE',
        hasDrivingLicense: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleId: 5, // ID của CUSTOMER
        phoneNumber: '84888888888',
        password: hashPassword,
        fullName: 'Phạm Văn A',
        avatar: 'https://i.pravatar.cc/150?u=customer',
        status: 'ACTIVE',
        hasDrivingLicense: true,
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
