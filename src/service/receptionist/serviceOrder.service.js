const db = require("../../../models");

module.exports.createServiceOrder = async (data, receptionistId) => {
    const transaction = await db.sequelize.transaction();
    
    try {
        // 1. Kiểm tra xe tồn tại
        const vehicle = await db.Vehicles.findByPk(data.vehicle_id, { transaction });
        if (!vehicle) {
            throw { status: 404, message: "Xe không tồn tại" };
        }

        // 2. Kiểm tra cầu nâng tồn tại
        const bay = await db.Service_Bays.findByPk(data.bay_id, { transaction });
        if (!bay) {
            throw { status: 404, message: "Cầu nâng không tồn tại" };
        }
        
        // Optional: Có thể kiểm tra cầu nâng có đang trống hay không
        // const currentOrderInBay = await db.Service_Orders.findOne({
        //     where: { bay_id: data.bay_id, status: ['INSPECTING', 'IN_PROGRESS', 'WAITING_FOR_PARTS'] },
        //     transaction
        // });
        // if (currentOrderInBay) {
        //     throw { status: 400, message: "Cầu nâng này đang được sử dụng" };
        // }

        // 3. Xử lý lịch hẹn nếu có
        if (data.appointment_id) {
            const appointment = await db.Appointments.findByPk(data.appointment_id, { transaction });
            if (!appointment) {
                throw { status: 404, message: "Lịch hẹn không tồn tại" };
            }

            // Kiểm tra xem lịch hẹn đã được gán lệnh sửa chữa nào chưa
            const existingOrder = await db.Service_Orders.findOne({
                where: { appointment_id: data.appointment_id },
                transaction
            });
            if (existingOrder) {
                throw { status: 400, message: "Lịch hẹn này đã được tạo lệnh sửa chữa" };
            }

            // Cập nhật trạng thái lịch hẹn
            await appointment.update({ status: 'IN_PROGRESS' }, { transaction });
        }

        // 4. Tạo lệnh sửa chữa
        const serviceOrder = await db.Service_Orders.create({
            appointment_id: data.appointment_id || null,
            vehicle_id: data.vehicle_id,
            receptionist_id: receptionistId,
            bay_id: data.bay_id,
            current_odo: data.current_odo,
            status: 'INSPECTING',
            entry_time: new Date(),
            estimated_finish_time: data.estimated_finish_time ? new Date(data.estimated_finish_time) : null
        }, { transaction });

        await transaction.commit();
        return serviceOrder;
        
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports.getServiceOrders = async () => {
    const serviceOrders = await db.Service_Orders.findAll({
        include: [
            {
                model: db.Vehicles,
                as: 'vehicle',
                attributes: ['id', 'license_plate', 'vin_number'],
                include: [
                    {
                        model: db.Vehicle_Models,
                        as: 'model',
                        attributes: ['id', 'model_name'],
                        include: [
                            {
                                model: db.Vehicle_Makes,
                                as: 'make',
                                attributes: ['id', 'make_name']
                            }
                        ]
                    },
                    {
                        model: db.Customers,
                        as: 'customer',
                        attributes: ['id', 'phone'],
                        include: [
                            {
                                model: db.User,
                                as: 'user',
                                attributes: ['fullName', 'phoneNumber']
                            }
                        ]
                    }
                ]
            },
            {
                model: db.User,
                as: 'receptionist',
                attributes: ['id', 'fullName']
            },
            {
                model: db.Service_Bays,
                as: 'bay',
                attributes: ['id', 'bay_name']
            },
            {
                model: db.Appointments,
                as: 'appointment',
                attributes: ['id', 'booking_type', 'scheduled_time']
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    return serviceOrders;
};

module.exports.getServiceOrderById = async (id) => {
    const serviceOrder = await db.Service_Orders.findByPk(id, {
        include: [
            {
                model: db.Vehicles,
                as: 'vehicle',
                attributes: ['id', 'license_plate', 'vin_number', 'avg_daily_mileage', 'color', 'year'],
                include: [
                    {
                        model: db.Vehicle_Models,
                        as: 'model',
                        attributes: ['id', 'model_name'],
                        include: [
                            {
                                model: db.Vehicle_Makes,
                                as: 'make',
                                attributes: ['id', 'make_name']
                            }
                        ]
                    },
                    {
                        model: db.Customers,
                        as: 'customer',
                        attributes: ['id', 'phone', 'membership_tier', 'loyalty_points'],
                        include: [
                            {
                                model: db.User,
                                as: 'user',
                                attributes: ['fullName', 'phoneNumber']
                            }
                        ]
                    }
                ]
            },
            {
                model: db.User,
                as: 'receptionist',
                attributes: ['id', 'fullName']
            },
            {
                model: db.Service_Bays,
                as: 'bay',
                attributes: ['id', 'bay_name']
            },
            {
                model: db.Appointments,
                as: 'appointment',
                attributes: ['id', 'booking_type', 'scheduled_time', 'notes']
            },
            {
                model: db.Task,
                as: 'tasks',
                include: [
                    {
                        model: db.Service_Catalog,
                        as: 'catalog',
                        attributes: ['id', 'service_name', 'estimated_duration']
                    },
                    {
                        model: db.Task_Assignment,
                        as: 'assignments',
                        include: [
                            {
                                model: db.User,
                                as: 'technician',
                                attributes: ['id', 'fullName']
                            }
                        ]
                    }
                ]
            }
        ]
    });

    if (!serviceOrder) {
        throw { status: 404, message: "Không tìm thấy Lệnh sửa chữa này" };
    }

    return serviceOrder;
};

module.exports.updateServiceOrderOdo = async (id, currentOdo) => {
    const serviceOrder = await db.Service_Orders.findByPk(id);
    if (!serviceOrder) {
        throw { status: 404, message: "Không tìm thấy Lệnh sửa chữa này" };
    }

    serviceOrder.current_odo = currentOdo;
    await serviceOrder.save();

    // Đồng bộ cập nhật số ODO cho bảng Vehicles nếu ODO mới lớn hơn ODO hiện tại của xe
    const vehicle = await db.Vehicles.findByPk(serviceOrder.vehicle_id);
    if (vehicle && currentOdo > vehicle.avg_daily_mileage) {
        vehicle.avg_daily_mileage = currentOdo;
        await vehicle.save();
    }

    return serviceOrder;
};
