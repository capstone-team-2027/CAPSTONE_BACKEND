/** @type {import("sequelize").ModelStatic<import("sequelize").Model>} */
const { where } = require("sequelize");
const db = require("../../../models");
const { HfInference } = require('@huggingface/inference');

const Service_Categories = db.Service_Categories
const Service_Catalog = db.Service_Catalog

const NLLB_LANG_MAP = {
  en: 'eng_Latn'
};

async function applyCatalogTranslations(t, catalogId, serviceName, description) {
  console.log("--- Bắt đầu applyCatalogTranslations ---");
  const hfToken = process.env.HUGGINGFACE_API_KEY;
  console.log("Có HuggingFace Token không?", !!hfToken);

  if (!hfToken || !db.Languages || !db.Service_Catalog_Translations) {
    console.log("Thiếu cấu hình HF Token hoặc Model DB!");
    return;
  }

  const hf = new HfInference(hfToken.trim());

  const languages = await db.Languages.findAll({
    where: { id: 'en' },
    transaction: t
  });

  if (languages.length === 0) return;

  const translationsToInsert = [];
  for (const lang of languages) {
    const tgtLangCode = NLLB_LANG_MAP[lang.id];
    if (!tgtLangCode) {
      translationsToInsert.push({ serviceCatalogId: catalogId, languageId: lang.id, name: serviceName, description: description });
      continue;
    }

    try {
      let translatedName = serviceName;
      if (serviceName) {
        const resName = await hf.translation({
          model: 'Helsinki-NLP/opus-mt-vi-en',
          inputs: serviceName
        }, { use_cache: false, wait_for_model: true });
        if (resName && resName.translation_text) translatedName = resName.translation_text;
        else if (Array.isArray(resName) && resName.length > 0) translatedName = resName[0].translation_text;
      }

      let translatedDesc = description;
      if (description) {
        const resDesc = await hf.translation({
          model: 'Helsinki-NLP/opus-mt-vi-en',
          inputs: description
        }, { use_cache: false, wait_for_model: true });
        if (resDesc && resDesc.translation_text) translatedDesc = resDesc.translation_text;
        else if (Array.isArray(resDesc) && resDesc.length > 0) translatedDesc = resDesc[0].translation_text;
      }

      translationsToInsert.push({
        serviceCatalogId: catalogId,
        languageId: lang.id,
        name: translatedName,
        description: translatedDesc
      });
    } catch (err) {
      console.error(`Lỗi dịch HF sang ${lang.id}:`, err);
      translationsToInsert.push({ serviceCatalogId: catalogId, languageId: lang.id, name: serviceName, description: description });
    }
  }

  if (translationsToInsert.length > 0) {
    await db.Service_Catalog_Translations.destroy({ where: { serviceCatalogId: catalogId }, transaction: t });
    await db.Service_Catalog_Translations.bulkCreate(translationsToInsert, { transaction: t });
  }
}

module.exports.getServiceCategories = async () => {
  const categories = await Service_Categories.findAll({
    attributes: ['id', 'category_name']
  });
  return categories;
};

module.exports.createServiceCatalog = async (category_id, service_name, description, estimated_duration, is_active, labor_price, spare_part_id) => {
  const category = await Service_Categories.findOne({
    where: { id: category_id }
  });
  if (!category) {
    throw { status: 404, message: "Danh mục không tồn tại" }
  }

  const t = await db.sequelize.transaction();
  try {
    const serviceCatalog = await Service_Catalog.create({
      category_id: category_id,
      service_name: service_name,
      description: description,
      estimated_duration: estimated_duration,
      is_active: is_active,
      labor_price: labor_price || 0,
      spare_part_id: spare_part_id || null
    }, { transaction: t });

    await applyCatalogTranslations(t, serviceCatalog.id, service_name, description);

    await t.commit();
    return serviceCatalog;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports.getServiceCatalog = async () => {
  const includes = [
    {
      model: Service_Categories,
      as: 'category',
      attributes: ['category_name']
    },
    {
      model: db.Spare_Parts,
      as: 'sparePart',
      attributes: ['id', 'name', 'retail_price']
    }
  ];

  if (db.Service_Catalog_Translations) {
    includes.push({
      model: db.Service_Catalog_Translations,
      as: "translations",
    });
  }

  const serviceCatalog = await Service_Catalog.findAll({
    attributes: ['id', 'category_id', 'service_name', 'description', 'estimated_duration', 'is_active', 'labor_price', 'spare_part_id'],
    include: includes
  });
  
  const { mapServicePrices } = require('../../util/calculateServicePrice.util');
  return mapServicePrices(serviceCatalog);
};

module.exports.updateServiceCatalog = async (service_catalog_id, category_id, service_name, description, estimated_duration, is_active, labor_price, spare_part_id) => {
  const category = await Service_Categories.findOne({
    where: { id: category_id }
  });
  if (!category) {
    throw { status: 404, message: "Danh mục không tồn tại" }
  }
  const serviceCatalog = await Service_Catalog.findOne({
    where: { id: service_catalog_id }
  });
  if (!serviceCatalog) {
    throw { status: 404, message: "Dịch vụ không tồn tại" }
  }

  const t = await db.sequelize.transaction();
  try {
    const oldName = serviceCatalog.service_name;
    const oldDesc = serviceCatalog.description;

    await serviceCatalog.update({
      category_id: category_id,
      service_name: service_name,
      description: description,
      estimated_duration: estimated_duration,
      is_active: is_active,
      labor_price: labor_price || 0,
      spare_part_id: spare_part_id || null
    }, { transaction: t });

    if (service_name !== undefined && (service_name !== oldName || description !== oldDesc)) {
      await applyCatalogTranslations(t, serviceCatalog.id, service_name, description);
    }

    await t.commit();
    return serviceCatalog;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}
