const db = require("../../../models");
const { Op } = require("sequelize");

module.exports.getMyShifts = async (technicianId, startDate, endDate) => {
    const whereCondition = {
        user_id: technicianId,
        //is_confirmed: true 
    };

    if (startDate && endDate) {
        whereCondition.work_date = {
            [Op.between]: [startDate, endDate]
        };
    }

    const shifts = await db.Shift_Templates.findAll({
        where: whereCondition,
        include: [
            {
                model: db.Shift_Slots,
                as: 'shiftSlot',
                attributes: ['id', 'slot_name', 'start_time', 'end_time']
            }
        ],
        order: [
            ['work_date', 'ASC'],
            [{ model: db.Shift_Slots, as: 'shiftSlot' }, 'start_time', 'ASC']
        ]
    });

    return shifts;
};
