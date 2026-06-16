const db = require("../../../models");
const { Op } = require("sequelize");
const InventoryLog = db.Inventory_Logs;
const InventoryBatch = db.Inventory_Batches;
const SparePart = db.Spare_Parts;
const Supplier = db.Suppliers;
const User = db.User;
const sparePartService = require("../../service/inventory/sparePartManagement.service");

const normalizeName = (str) =>
  (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// Thuật toán Levenshtein Distance
function similarity(a, b) {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;
  const m = [];
  for (let i = 0; i <= b.length; i++) m[i] = [i];
  for (let j = 0; j <= a.length; j++) m[0][j] = j;
  for (let i = 1; i <= b.length; i++)
    for (let j = 1; j <= a.length; j++)
      m[i][j] =
        b[i - 1] === a[j - 1]
          ? m[i - 1][j - 1]
          : Math.min(m[i - 1][j - 1], m[i][j - 1], m[i - 1][j]) + 1;
  return 1 - m[b.length][a.length] / Math.max(a.length, b.length);
}

module.exports.importSparePart = async (manager_id, supplier_id, items) => {
  return await db.sequelize.transaction(async (t) => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const prefix = `PN-${year}${month}${day}-`;
    const last = await InventoryLog.findOne({
      where: {
        receipt_code: {
          [Op.like]: `${prefix}%`,
        },
      },
      order: [["receipt_code", "DESC"]],
      transaction: t,
    });
    let next = 1;
    if (last?.receipt_code) {
      next = parseInt(last.receipt_code.slice(prefix.length), 10) + 1;
    }
    const receipt_code = `${prefix}${String(next).padStart(4, "0")}`;
    const parts = [];
    const logsData = [];
    for (const item of items) {
      const {
        quantity,
        unit_price,
        retail_price,
        part_id,
        name,
        brand,
        category_id,
        warranty_period_months,
        warranty_km_limit,
        force,
      } = item;
      let part;
      if (part_id) {
        part = await SparePart.findByPk(part_id, {
          transaction: t,
        });
        if (!part) {
          throw {
            status: 404,
            message: `Sản phẩm #${part_id} không tồn tại`,
          };
        }
        await part.increment("stock_quantity", {
          by: quantity,
          transaction: t,
        });
        if (retail_price != null) {
          await part.update(
            {
              retail_price,
            },
            {
              transaction: t,
            },
          );
        }
      } else {
        const normName = normalizeName(name);
        const samePart = await SparePart.findAll({
          where: {
            category_id,
          },
          attributes: ["id", "sku", "name", "brand"],
          transaction: t,
        });
        const sameBrand = (b1, b2) =>
          (b1 || "").trim().toLowerCase() === (b2 || "").trim().toLowerCase();
        const exactPart = samePart.find(
          (p) =>
            normalizeName(p.name) === normName && sameBrand(p.brand, brand),
        );
        if (exactPart) {
          throw {
            status: 409,
            message: `Sản phẩm "${name}" đã tồn tại, vui lòng chọn từ danh sách`,
            part: {
              id: exactPart.id,
              sku: exactPart.sku,
              name: exactPart.name,
              brand: exactPart.brand,
            },
          };
        }
        const candidateParts = samePart
          .map((p) => ({
            p,
            score: similarity(normName, normalizeName(p.name)),
          }))
          .filter((x) => x.score >= 0.8)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map((x) => ({
            id: x.p.id,
            sku: x.p.sku,
            name: x.p.name,
            brand: x.p.brand,
          }));
        if (!force && candidateParts.length) {
          throw {
            status: 409,
            message: `Có sản phẩm gần giống "${name}". Kiểm tra lại trước khi tạo mới`,
            part: candidateParts,
          };
        }
        part = await sparePartService.createSparePart(
          name,
          brand,
          category_id,
          warranty_period_months,
          warranty_km_limit,
          t,
        );
        await part.update(
          {
            stock_quantity: quantity,
            retail_price: retail_price ?? 0,
          },
          {
            transaction: t,
          },
        );
      }
      logsData.push({
        receipt_code,
        part_id: part.id,
        supplier_id,
        type: "IN",
        quantity,
        unit_price,
        manager_id,
      });
      await part.reload({
        transaction: t,
      });
      parts.push(part);
    }
    const logs = await InventoryLog.bulkCreate(logsData, {
      transaction: t,
      returning: true,
    });
    const batchData = logs.map((log, index) => ({
      inventory_log_id: log.id,
      unit_cost: items[index].unit_price,
      remaining_quantity: items[index].quantity,
    }));
    await InventoryBatch.bulkCreate(batchData, {
      transaction: t,
    });
    const results = parts.map((part, index) => ({
      part,
      importLog: logs[index],
    }));
    return {
      receipt_code,
      items: results,
    };
  });
};

module.exports.viewImportHistory = async () => {
  const result = await InventoryLog.findAll({
    attributes: [
      "id",
      "receipt_code",
      "createdAt",
      "type",
      "quantity",
      "unit_price",
    ],
    include: [
      {
        model: User,
        as: "manager",
        attributes: ["fullName"],
      },
      {
        model: SparePart,
        as: "part",
        attributes: ["sku", "name"],
      },
      {
        model: Supplier,
        as: "supplier",
        attributes: ["name"],
      },
    ],
  });
  return result;
};
