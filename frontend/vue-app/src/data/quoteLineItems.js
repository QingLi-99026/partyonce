export const quoteLineItemTypes = {
  venue_fee: {
    label: 'Venue fee',
    labelZh: '场地费',
    customerLabel: '场地与空间使用',
    description: '餐厅、包间、场地基础使用和场景预留费用。'
  },
  decor_fee: {
    label: 'Decor fee',
    labelZh: '装饰费',
    customerLabel: '主题装饰',
    description: '桌布、气球、背景板、KT 板、花艺、甜品台等主题装饰。'
  },
  supplier_fee: {
    label: 'Supplier fee',
    labelZh: '供应商费',
    customerLabel: '供应商服务',
    description: '蛋糕、气球、花艺、儿童娱乐、摄影等第三方服务。'
  },
  labor_fee: {
    label: 'Labor fee',
    labelZh: '人工费',
    customerLabel: '现场人工',
    description: '方案准备、现场布置、撤场和基础协调人工。'
  },
  transport_fee: {
    label: 'Transport fee',
    labelZh: '运输费',
    customerLabel: '运输与搬运',
    description: '物料运输、装卸、跨区配送和现场搬运。'
  },
  service_fee: {
    label: 'Service fee',
    labelZh: '服务费',
    customerLabel: '策划服务',
    description: '方案策划、报价复核、供应商协调和运营跟进。'
  },
  optional_upgrade: {
    label: 'Optional upgrade',
    labelZh: '可选升级项',
    customerLabel: '可选升级',
    description: '客户主动选择的蛋糕、摄影、餐饮、主持等升级项。'
  }
};

export const quoteLineItemOrder = [
  'venue_fee',
  'decor_fee',
  'supplier_fee',
  'labor_fee',
  'transport_fee',
  'service_fee',
  'optional_upgrade'
];

const typeAlias = {
  venue: 'venue_fee',
  venue_package: 'venue_fee',
  room: 'venue_fee',
  scene: 'venue_fee',
  scene_fee: 'venue_fee',
  package: 'decor_fee',
  package_fee: 'decor_fee',
  decor: 'decor_fee',
  decoration: 'decor_fee',
  styling: 'decor_fee',
  material: 'decor_fee',
  materials: 'decor_fee',
  supplier: 'supplier_fee',
  vendor: 'supplier_fee',
  cake: 'supplier_fee',
  activity: 'supplier_fee',
  entertainment: 'supplier_fee',
  photo: 'supplier_fee',
  photography: 'supplier_fee',
  labor: 'labor_fee',
  labour: 'labor_fee',
  setup: 'labor_fee',
  setup_packdown: 'labor_fee',
  service_note: 'service_fee',
  service: 'service_fee',
  planning: 'service_fee',
  transport: 'transport_fee',
  delivery: 'transport_fee',
  logistics: 'transport_fee',
  addon: 'optional_upgrade',
  add_on: 'optional_upgrade',
  addons: 'optional_upgrade',
  upgrade: 'optional_upgrade',
  optional: 'optional_upgrade'
};

const toAmount = (value) => Number(value || 0);

export function normalizeQuoteLineItemType(value = '') {
  const normalized = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (quoteLineItemTypes[normalized]) return normalized;
  return typeAlias[normalized] || 'service_fee';
}

export function getQuoteLineItemTypeMeta(type = 'service_fee') {
  return quoteLineItemTypes[normalizeQuoteLineItemType(type)];
}

export function normalizeQuoteLineItem(item = {}, index = 0) {
  const type = normalizeQuoteLineItemType(item.type || item.category || item.line_item_type || item.kind);
  const meta = getQuoteLineItemTypeMeta(type);
  const amount = toAmount(
    item.amount ?? item.final_amount ?? item.finalAmount ?? item.total ?? item.price ?? item.unit_price
  );
  return {
    id: item.id || item.key || `${type}-${index + 1}`,
    type,
    type_label: meta.label,
    type_label_zh: meta.labelZh,
    customer_label: meta.customerLabel,
    name: item.name || item.item_name || meta.customerLabel,
    description: item.description || item.note || meta.description,
    amount,
    quantity: Number(item.quantity || 1),
    source: item.source || item.quoteRole || item.operationsRole || 'quote_snapshot',
    customer_visible: item.customer_visible !== false,
    editable: item.editable !== false,
    raw: item
  };
}

export function normalizeQuoteLineItems(items = []) {
  return (Array.isArray(items) ? items : [])
    .map(normalizeQuoteLineItem)
    .filter((item) => item.amount > 0 || item.name);
}

export function summarizeQuoteLineItems(items = []) {
  const normalized = normalizeQuoteLineItems(items);
  const groups = quoteLineItemOrder
    .map((type) => {
      const meta = quoteLineItemTypes[type];
      const rows = normalized.filter((item) => item.type === type);
      return {
        type,
        label: meta.label,
        labelZh: meta.labelZh,
        customerLabel: meta.customerLabel,
        description: meta.description,
        amount: rows.reduce((sum, item) => sum + toAmount(item.amount), 0),
        count: rows.length,
        items: rows
      };
    })
    .filter((group) => group.amount > 0 || group.count > 0);
  return {
    items: normalized,
    groups,
    total: groups.reduce((sum, group) => sum + group.amount, 0)
  };
}

export function buildQuoteLineItemsFromSelection({
  packageData,
  sceneData,
  selectedAddons = [],
  addons = [],
  visualContext,
  packageExplanation,
  currency = 'AUD'
} = {}) {
  const packagePrice = toAmount(packageData?.price);
  const venueFee = Math.round(toAmount(sceneData?.basePrice) * 0.1);
  const decorFee = Math.round(packagePrice * 0.62);
  const supplierFee = Math.round(packagePrice * 0.18);
  const laborFee = Math.round(packagePrice * 0.14);
  const transportFee = packagePrice >= 2000 ? 120 : packagePrice >= 1200 ? 80 : 50;
  const serviceFee = Math.max(0, packagePrice - decorFee - supplierFee - laborFee - transportFee);
  const selectedAddonRows = selectedAddons
    .map((id) => addons.find((addon) => addon.id === id))
    .filter(Boolean);

  return normalizeQuoteLineItems([
    {
      id: 'venue-fee',
      type: 'venue_fee',
      name: sceneData?.name || visualContext?.primaryVenue?.name || 'Venue / scene fee',
      description: visualContext?.primaryVenue
        ? `${visualContext.primaryVenue.name} · ${visualContext.primaryVenue.capacity}`
        : quoteLineItemTypes.venue_fee.description,
      amount: venueFee,
      source: 'scene_base_fee',
      currency
    },
    {
      id: 'decor-fee',
      type: 'decor_fee',
      name: `${packageData?.name || 'Package'} decor layer`,
      description: visualContext?.packageVisual?.scope || packageExplanation?.positioning || quoteLineItemTypes.decor_fee.description,
      amount: decorFee,
      source: 'package_decor_split',
      currency
    },
    {
      id: 'supplier-fee',
      type: 'supplier_fee',
      name: 'Supplier allowance',
      description: visualContext?.suppliers?.map((supplier) => `${supplier.name} (${supplier.category})`).join(' / ') || quoteLineItemTypes.supplier_fee.description,
      amount: supplierFee,
      source: 'package_supplier_split',
      currency
    },
    {
      id: 'labor-fee',
      type: 'labor_fee',
      name: 'Setup and pack-down labor',
      description: 'Local/staging estimate for styling setup, basic coordination, and pack-down.',
      amount: laborFee,
      source: 'package_labor_split',
      currency
    },
    {
      id: 'transport-fee',
      type: 'transport_fee',
      name: 'Transport and handling',
      description: 'Local/staging placeholder for material transport and on-site handling.',
      amount: transportFee,
      source: 'standard_transport_placeholder',
      currency
    },
    {
      id: 'service-fee',
      type: 'service_fee',
      name: 'Planning service',
      description: 'Quote review, supplier coordination, and customer follow-up.',
      amount: serviceFee,
      source: 'package_service_split',
      currency
    },
    ...selectedAddonRows.map((addon) => ({
      id: addon.id,
      type: 'optional_upgrade',
      name: addon.name,
      description: 'Optional customer-selected upgrade item.',
      amount: toAmount(addon.price),
      source: 'customer_selected_addon',
      currency
    }))
  ]);
}
