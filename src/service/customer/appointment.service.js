const db = require("../../../models");
const { Op } = require("sequelize");
const getGarageCapacity = require("../../util/getGarageCapacity.util");

module.exports.getAppointments = async (userId) => {
    let customer = await db.Customers.findOne({ where: { user_id: userId } });
    if (!customer) {
        const user = await db.User.findByPk(userId);
        if (!user) {
            throw { status: 404, message: "Hồ sơ khách hàng không tồn tại" };
        }
        customer = await db.Customers.create({
            user_id: userId,
            phone: user.phoneNumber || '0000000000',
            membership_tier: 'BRONZE',
            loyalty_points: 0
        });
    }

    const appointments = await db.Appointments.findAll({
        where: { customer_id: customer.id },
        include: [
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

module.exports.createAppointment = async (userId, data) => {
    // Kiểm tra sức chứa của gara
    const capacity = await getGarageCapacity();
    if (capacity === 0) {
        throw { status: 400, message: "Garage hiện tại không có khả năng tiếp nhận thêm xe (thiếu nhân sự hoặc khoang sửa chữa)." };
    }

    // Đếm số lượng lịch hẹn trong cùng khung giờ (mỗi giờ)
    const targetDate = new Date(data.scheduled_time);
    const startOfHour = new Date(targetDate);
    startOfHour.setUTCMinutes(0, 0, 0);
    const endOfHour = new Date(targetDate);
    endOfHour.setUTCMinutes(59, 59, 999);

    const currentAppointmentsCount = await db.Appointments.count({
        where: {
            scheduled_time: {
                [Op.between]: [startOfHour, endOfHour]
            },
            status: {
                [Op.in]: ['PENDING', 'CONFIRMED']
            }
        }
    });
    console.log("count is: ", currentAppointmentsCount)
    if (currentAppointmentsCount >= capacity) {
        throw { status: 400, message: "Garage đã đạt sức chứa tối đa cho khung giờ này. Vui lòng chọn thời gian khác." };
    }

    let customer = await db.Customers.findOne({ where: { user_id: userId } });
    if (!customer) {
        const user = await db.User.findByPk(userId);
        if (!user) {
            throw { status: 404, message: "Hồ sơ khách hàng không tồn tại" };
        }
        customer = await db.Customers.create({
            user_id: userId,
            phone: user.phoneNumber || '0000000000',
            membership_tier: 'BRONZE',
            loyalty_points: 0
        });
    }


    if (data.details && data.details.length > 0) {
        for (const detail of data.details) {
            if (detail.catalog_id) {
                const catalog = await db.Service_Catalog.findByPk(detail.catalog_id);
                if (!catalog) {
                    throw { status: 400, message: `Dịch vụ lẻ với ID ${detail.catalog_id} không tồn tại` };
                }
            }
            if (detail.combo_id) {
                const combo = await db.Service_Combo.findByPk(detail.combo_id);
                if (!combo) {
                    throw { status: 400, message: `Gói dịch vụ (combo) với ID ${detail.combo_id} không tồn tại` };
                }
            }
        }
    }

    const transaction = await db.sequelize.transaction();
    try {
        let resolvedVehicleId = data.vehicle_id || null;

        if (!resolvedVehicleId && data.booking_type === 'SPECIFIC' && data.vehicle_plate) {
            let make = null;
            if (data.vehicle_brand) {
                [make] = await db.Vehicle_Makes.findOrCreate({
                    where: { make_name: data.vehicle_brand.trim() },
                    defaults: { make_name: data.vehicle_brand.trim() },
                    transaction
                });
            } else {
                [make] = await db.Vehicle_Makes.findOrCreate({
                    where: { make_name: 'Khác' },
                    defaults: { make_name: 'Khác' },
                    transaction
                });
            }

            let modelName = data.vehicle_model ? data.vehicle_model.trim() : 'Khác';
            const [model] = await db.Vehicle_Models.findOrCreate({
                where: { make_id: make.id, model_name: modelName },
                defaults: {
                    make_id: make.id,
                    model_name: modelName,
                    vehicle_type: 'Sedan'
                },
                transaction
            });

            const [vehicle] = await db.Vehicles.findOrCreate({
                where: { customer_id: customer.id, license_plate: data.vehicle_plate.trim() },
                defaults: {
                    customer_id: customer.id,
                    model_id: model.id,
                    license_plate: data.vehicle_plate.trim(),
                    year: data.vehicle_year ? parseInt(data.vehicle_year, 10) : new Date().getFullYear(),
                    color: data.vehicle_color || null,
                    avg_daily_mileage: 0.0
                },
                transaction
            });

            resolvedVehicleId = vehicle.id;
        } else if (resolvedVehicleId) {
            const vehicle = await db.Vehicles.findOne({
                where: { id: resolvedVehicleId, customer_id: customer.id },
                transaction
            });
            if (!vehicle) {
                throw { status: 400, message: "Xe không tồn tại hoặc không thuộc sở hữu của khách hàng này" };
            }
        }

        const appointment = await db.Appointments.create({
            customer_id: customer.id,
            vehicle_id: resolvedVehicleId,
            booking_type: data.booking_type,
            scheduled_time: new Date(data.scheduled_time),
            notes: data.notes || null,
            status: 'CONFIRMED'
        }, { transaction });

        if (data.details && data.details.length > 0) {
            const detailsToCreate = data.details.map(d => ({
                appointment_id: appointment.id,
                catalog_id: d.catalog_id || null,
                combo_id: d.combo_id || null
            }));
            await db.Appointment_Details.bulkCreate(detailsToCreate, { transaction });
        }

        await transaction.commit();

        return await db.Appointments.findByPk(appointment.id, {
            include: [
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
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports.deleteAppointment = async (userId, appointmentId) => {
    const customer = await db.Customers.findOne({ where: { user_id: userId } });
    if (!customer) {
        throw { status: 404, message: "Hồ sơ khách hàng không tồn tại" };
    }

    const appointment = await db.Appointments.findOne({
        where: { id: appointmentId, customer_id: customer.id }
    });

    if (!appointment) {
        throw { status: 404, message: "Lịch hẹn không tồn tại hoặc không thuộc quyền sở hữu của bạn" };
    }

    if (appointment.status !== 'PENDING' && appointment.status !== 'CONFIRMED') {
        throw { status: 400, message: `Không thể xóa hoặc hủy lịch hẹn khi đã ở trạng thái: ${appointment.status}` };
    }

    await appointment.destroy();
    return { message: "Xóa lịch hẹn thành công" };
};
