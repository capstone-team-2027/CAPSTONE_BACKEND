'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Garage_Shifts', [
      {
        shift_name: 'Ca sáng',
        start_time: '08:00:00',
        end_time: '12:00:00',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        shift_name: 'Ca chiều',
        start_time: '13:30:00',
        end_time: '18:00:00',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Garage_Shifts', {
      shift_name: ['Ca sáng', 'Ca chiều']
    }, {});
  }
};
