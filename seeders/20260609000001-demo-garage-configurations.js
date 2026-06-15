'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Garage_Configurations', [
      {
        config_key: 'BUFFER_TIME_MINUTES',
        config_value: '60',
        description: 'Thời gian đệm giữa các lịch hẹn (phút)',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Garage_Configurations', {
      config_key: 'BUFFER_TIME_MINUTES'
    }, {});
  }
};
