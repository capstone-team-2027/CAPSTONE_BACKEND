'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Customers', 'name', {
      type: Sequelize.STRING(150),
      allowNull: true, // Cho phép null vì có thể khách cũ chưa có tên
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Customers', 'name');
  }
};
