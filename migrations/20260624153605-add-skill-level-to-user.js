'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'skillLevel', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: 'Trình độ tay nghề: 1=Junior, 2=Mid, 3=Senior'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'skillLevel');
  }
};
