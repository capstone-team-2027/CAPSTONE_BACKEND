const db = require("../../../models");

module.exports.getAppointment = async () => {
    const appointments = await db.Appointments.findAll({
        include: [
            {
                model: db.Customers,
                as: 'customer',
                attributes: ['id', 'phone', 'membership_tier'],
                include: [
                    {
                        model: db.User,
                        as: 'user',
                        attributes: ['id', 'fullName', 'phoneNumber']
                    }
                ]
            },
            {
                model: db.Vehicles,
                as: 'vehicle',
                attributes: ['id', 'license_plate', 'vin_number', 'color', 'year'],
                include: [
                    {
                        model: db.Vehicle_Models,
                        as: 'model',
                        attributes: ['id', 'model_name', 'vehicle_type'],
                        include: [
                            {
                                model: db.Vehicle_Makes,
                                as: 'make',
                                attributes: ['id', 'make_name']
                            }
                        ]
                    }
                ]
            },
            {
                model: db.Appointment_Details,
                as: 'appointmentDetails',
                include: [
                    {
                        model: db.Service_Catalog,
                        as: 'catalog',
                        attributes: ['id', 'service_name', 'estimated_duration', 'description']
                    },
                    {
                        model: db.Service_Combo,
                        as: 'combo',
                        attributes: ['id', 'combo_name', 'description']
                    }
                ]
            }
        ],
        order: [['scheduled_time', 'DESC']]
    });

    return appointments;
};

module.exports.getAppointmentByKey = async (key) => {
    const appointment = await db.Appointments.findOne({
        where: { id: key },
        include: [
            {
                model: db.Customers,
                as: 'customer',
                attributes: ['id', 'phone', 'membership_tier'],
                include: [
                    {
                        model: db.User,
                        as: 'user',
                        attributes: ['id', 'fullName', 'phoneNumber']
                    }
                ]
            },
            {
                model: db.Vehicles,
                as: 'vehicle',
                attributes: ['id', 'license_plate', 'vin_number', 'color', 'year'],
                include: [
                    {
                        model: db.Vehicle_Models,
                        as: 'model',
                        attributes: ['id', 'model_name', 'vehicle_type'],
                        include: [
                            {
                                model: db.Vehicle_Makes,
                                as: 'make',
                                attributes: ['id', 'make_name']
                            }
                        ]
                    }
                ]
            },
            {
                model: db.Appointment_Details,
                as: 'appointmentDetails',
                include: [
                    {
                        model: db.Service_Catalog,
                        as: 'catalog',
                        attributes: ['id', 'service_name', 'estimated_duration', 'description']
                    },
                    {
                        model: db.Service_Combo,
                        as: 'combo',
                        attributes: ['id', 'combo_name', 'description']
                    }
                ]
            }
        ]
    });

    if (!appointment) {
        throw { status: 404, message: "Lịch hẹn không tồn tại" };
    }

    return appointment;
};

module.exports.receiveAppointment = async (key) => {
    const appointment = await db.Appointments.findByPk(key);
    if (!appointment) {
        throw { status: 404, message: "Lịch hẹn không tồn tại" };
    }

    if (appointment.status !== 'PENDING' && appointment.status !== 'CONFIRMED') {
        throw { status: 400, message: "Lịch hẹn này đã được tiếp nhận hoặc đã hủy, không thể tiếp nhận lại." };
    }

    appointment.status = 'IN_PROGRESS';
    await appointment.save();
    return appointment;
};