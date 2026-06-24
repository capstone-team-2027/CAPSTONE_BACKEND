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
      let unitPrice = 0;

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
        unitPrice = catalog.labor_price;
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
        unitPrice = part.retail_price;
      }
      const amount = item.quantity * unitPrice;
      totalAmount += amount;
      detailsData.push({
        service_catalog_id: item.service_catalog_id || null,
        spare_part_id: item.spare_part_id || null,
        quantity: item.quantity,
        unit_price: unitPrice,
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

module.exports.updateQuotation = async (id, data) => {
  return await db.sequelize.transaction(async (t) => {
    const quotation = await Quotation.findByPk(id, { transaction: t });
    if (!quotation) {
      throw { status: 404, message: "Không tìm thấy báo giá" };
    }
    if (quotation.status !== "PENDING") {
      throw {
        status: 400,
        message: "Chỉ có thể cập nhật báo giá đang ở trạng thái PENDING",
      };
    }
    await QuotationDetail.destroy({
      where: { quotation_id: id },
      transaction: t,
    });
    let totalAmount = 0;
    let unitPrice = 0;
    const detailsData = [];
    for (const item of data.items) {
      let unitPrice = 0;
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
        unitPrice = catalog.labor_price;
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
        unitPrice = part.retail_price;
      }
      const amount = item.quantity * unitPrice;
      totalAmount += amount;
      detailsData.push({
        quotation_id: quotation.id,
        service_catalog_id: item.service_catalog_id || null,
        spare_part_id: item.spare_part_id || null,
        quantity: item.quantity,
        unit_price: unitPrice,
        amount,
      });
    }
    await QuotationDetail.bulkCreate(detailsData, { transaction: t });
    await quotation.update(
      {
        total_amount: totalAmount,
        note: data.note !== undefined ? data.note : quotation.note,
      },
      { transaction: t },
    );
    return quotation;
  });
};

module.exports.getQuoteHistory = async () => {
  const result = await Quotation.findAll({
    attributes: [
      "id",
      "service_order_id",
      "total_amount",
      "status",
      "approved_at",
      "note",
      "createdAt",
    ],
    include: [
      {
        model: QuotationDetail,
        as: "items",
        attributes: ["id", "quantity", "unit_price", "amount"],
        include: [
          {
            model: ServiceCatalog,
            as: "catalog",
            attributes: ["id", "service_name"],
          },
          {
            model: SparePart,
            as: "sparePart",
            attributes: ["id", "name", "sku"],
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
  return result;
};
