'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Task_Assignments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      task_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tasks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      technician_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      staff_shift_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Shift_Templates',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      bay_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Service_Bays',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      role_in_task: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'LEAD'
      },
      contribution_percent: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100
      },
      actual_start_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      actual_end_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'ASSIGNED'
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('Task_Assignments', ['technician_id'], {
      name: 'idx_technician_tasks'
    });
    await queryInterface.addIndex('Task_Assignments', ['task_id'], {
      name: 'idx_task_assignments_task'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Task_Assignments');
  }
};
