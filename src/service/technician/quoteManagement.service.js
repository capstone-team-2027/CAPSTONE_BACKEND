const db = require("../../../models");
const Quotation = db.Quotations;
const QuotationDetail = db.Quotation_Details;
const ServiceCatalog = db.Service_Catalog;
const SparePart = db.Spare_Parts;

module.exports.createQuotation = async (data) => {
  return await db.sequelize.transaction(async (t) => {
    let totalAmount = 0;
    const detailsData = [];
    for (const item of data.items) {
      if (item.service_catalog_id) {
        const catalog = await ServiceCatalog.findByPk(item.service_catalog_id, {
          transaction: t,
        });
        if (!catalog) {
          throw {
            status: 404,
            message: `Dịch vụ #${item.service_catalog_id} không tồn tại`,
          };
        }
      }
      if (item.spare_part_id) {
        const part = await SparePart.findByPk(item.spare_part_id, {
          transaction: t,
        });
        if (!part) {
          throw {
            status: 404,
            message: `Phụ tùng #${item.spare_part_id} không tồn tại`,
          };
        }
      }
      const amount = item.quantity * item.unit_price;
      totalAmount += amount;
      detailsData.push({
        service_catalog_id: item.service_catalog_id || null,
        spare_part_id: item.spare_part_id || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount,
      });
    }
    const quotation = await Quotation.create(
      {
        service_order_id: data.service_order_id,
        total_amount: totalAmount,
        status: "PENDING",
        note: data.note || null,
      },
      { transaction: t },
    );
    const details = detailsData.map((item) => ({
      ...item,
      quotation_id: quotation.id,
    }));
    await QuotationDetail.bulkCreate(details, { transaction: t });
    return quotation;
  });
};
