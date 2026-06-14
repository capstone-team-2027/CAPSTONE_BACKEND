const db = require('../../models');
const getGarageCapacity = async () => {
  try {
    const technicianCount = await db.User.count({
      include: [{
        model: db.Role,
        as: 'role',
        where: { roleCode: 'TECHNICIAN' }
      }],
      where: {
        status: 'ACTIVE'
      }
    });

    const bayCount = await db.Service_Bays.count({
      where: { is_active: true }
    });

    const capacity = Math.min(technicianCount, bayCount);
    console.log("cap count iss: ", capacity)
    return capacity > 0 ? capacity : 0;
  } catch (error) {
    console.error("Lỗi khi tính toán sức chứa garage:", error);
    throw error;
  }
};

module.exports = getGarageCapacity;
