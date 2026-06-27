'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Service_Catalogs', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: ""
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Service_Catalogs', 'description');
  }
};
