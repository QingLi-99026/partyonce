export const QUOTE_LINE_ITEM_SCHEMA_VERSION = 'quote_line_items_v1';

export const quoteLineItemTypes = {
  venue_fee: {
    type: 'venue_fee',
    label: 'Venue fee',
    labelZh: '场地费',
    customerLabel: '场地与空间使用',
    description: '餐厅、包间、场地基础使用和场景预留费用。',
    customerExplanation: '这部分对应场地、包间或 Restaurant A 样板空间的基础使用与预留。',
    adminEditHint: '确认真实场地档期、最低消费、包间费、超时费后再改。'
  },
  decor_fee: {
    type: 'decor_fee',
    label: 'Decor fee',
    labelZh: '装饰费',
    customerLabel: '主题装饰',
    description: '桌布、气球、背景板、KT 板、花艺、甜品台等主题装饰。',
    customerExplanation: '这部分对应主题颜色、桌布、气球、背景板、花艺、甜品台和空间装饰层。',
    adminEditHint: '按 party_scene_config 的 decor、套餐层级和实际物料清单复核。'
  },
  supplier_fee: {
    type: 'supplier_fee',
    label: 'Supplier fee',
    labelZh: '供应商费',
    customerLabel: '供应商服务',
    description: '蛋糕、气球、花艺、儿童娱乐、摄影等第三方服务。',
    customerExplanation: '这部分对应蛋糕、气球、花艺、儿童娱乐、摄影等外部供应商预算。',
    adminEditHint: '按供应商报价、服务区域、最低起订和可用性复核。'
  },
  labor_fee: {
    type: 'labor_fee',
    label: 'Labor fee',
    labelZh: '人工费',
    customerLabel: '现场人工',
    description: '方案准备、现场布置、撤场和基础协调人工。',
    customerExplanation: '这部分对应方案准备、现场布置、撤场和当天基础协调人工。',
    adminEditHint: '按布置复杂度、入场时间、撤场限制和人员数量复核。'
  },
  transport_fee: {
    type: 'transport_fee',
    label: 'Transport fee',
    labelZh: '运输费',
    customerLabel: '运输与搬运',
    description: '物料运输、装卸、跨区配送和现场搬运。',
    customerExplanation: '这部分对应物料配送、装卸、搬运和跨区交通成本。',
    adminEditHint: '按服务区域、停车/电梯限制、物料体积和往返距离复核。'
  },
  service_fee: {
    type: 'service_fee',
    label: 'Service fee',
    labelZh: '服务费',
    customerLabel: '策划服务',
    description: '方案策划、报价复核、供应商协调和运营跟进。',
    customerExplanation: '这部分对应方案策划、报价复核、供应商协调和项目跟进服务。',
    adminEditHint: '按报价复杂度、供应商数量和运营跟进强度复核。'
  },
  optional_upgrade: {
    type: 'optional_upgrade',
    label: 'Optional upgrade',
    labelZh: '可选升级项',
    customerLabel: '可选升级',
    description: '客户主动选择的蛋糕、摄影、餐饮、主持等升级项。',
    customerExplanation: '这部分只包含客户主动选择的蛋糕、摄影、餐饮、主持等升级项。',
    adminEditHint: '确认客户确实选择后再保留；未确认升级项不要进入正式报价。'
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

const roundMoney = (value) => Math.max(0, Math.round(Number(value || 0)));

const supplierNames = (suppliers = []) => {
  if (!Array.isArray(suppliers) || suppliers.length === 0) return '';
  return suppliers.map((supplier) => `${supplier.name} (${supplier.category})`).join(' / ');
};

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
    schema_version: item.schema_version || QUOTE_LINE_ITEM_SCHEMA_VERSION,
    id: item.id || item.key || `${type}-${index + 1}`,
    type,
    line_item_type: type,
    type_label: meta.label,
    type_label_zh: meta.labelZh,
    customer_label: meta.customerLabel,
    name: item.name || item.item_name || meta.customerLabel,
    description: item.description || item.note || meta.description,
    amount,
    amount_basis: item.amount_basis || item.pricing_basis || item.basis || meta.description,
    calculation_note: item.calculation_note || item.calculationNote || '',
    customer_explanation: item.customer_explanation || item.customerExplanation || meta.customerExplanation,
    admin_edit_hint: item.admin_edit_hint || item.adminEditHint || meta.adminEditHint,
    quantity: Number(item.quantity || 1),
    source: item.source || item.quoteRole || item.operationsRole || 'quote_snapshot',
    party_scene_config_path: item.party_scene_config_path || item.sceneConfigPath || '',
    deposit_basis: item.deposit_basis || 'future_deposit_placeholder_only',
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
    schema_version: QUOTE_LINE_ITEM_SCHEMA_VERSION,
    items: normalized,
    groups,
    total: groups.reduce((sum, group) => sum + group.amount, 0),
    customer_visible_total: normalized
      .filter((item) => item.customer_visible)
      .reduce((sum, item) => sum + toAmount(item.amount), 0),
    deposit_placeholder: Math.round(groups.reduce((sum, group) => sum + group.amount, 0) * 0.2),
    deposit_note: '20% placeholder only. This does not create PaymentIntent, checkout, Stripe status, or real deposit collection.'
  };
}

export function buildQuoteLineItemsFromSelection({
  packageData,
  sceneData,
  selectedAddons = [],
  addons = [],
  visualContext,
  packageExplanation,
  partySceneConfig,
  currency = 'AUD'
} = {}) {
  const packagePrice = toAmount(packageData?.price);
  const sceneConfig = partySceneConfig || {};
  const supplierList = Array.isArray(sceneConfig.suppliers) && sceneConfig.suppliers.length
    ? sceneConfig.suppliers
    : visualContext?.suppliers || [];
  const layout = sceneConfig.layout || {};
  const decor = sceneConfig.decor || {};
  const venue = sceneConfig.venue || visualContext?.primaryVenue || {};
  const venueFee = roundMoney(toAmount(sceneData?.basePrice) * 0.1);
  const decorRatio = sceneConfig.packageTier === 'premium' ? 0.64 : sceneConfig.packageTier === 'basic' ? 0.58 : 0.62;
  const supplierRatio = sceneConfig.packageTier === 'premium' ? 0.2 : sceneConfig.packageTier === 'basic' ? 0.14 : 0.18;
  const laborRatio = sceneConfig.packageTier === 'premium' ? 0.15 : sceneConfig.packageTier === 'basic' ? 0.12 : 0.14;
  const decorFee = roundMoney(packagePrice * decorRatio);
  const supplierFee = roundMoney(packagePrice * supplierRatio);
  const laborFee = roundMoney(packagePrice * laborRatio);
  const transportFee = packagePrice >= 2000 ? 120 : packagePrice >= 1200 ? 80 : 50;
  const serviceFee = roundMoney(packagePrice - decorFee - supplierFee - laborFee - transportFee);
  const selectedAddonRows = selectedAddons
    .map((id) => addons.find((addon) => addon.id === id))
    .filter(Boolean);

  return normalizeQuoteLineItems([
    {
      id: 'venue-fee',
      type: 'venue_fee',
      name: venue.name || sceneData?.name || 'Venue / scene fee',
      description: venue.name
        ? `${venue.name} · ${venue.capacity || visualContext?.primaryVenue?.capacity || 'capacity pending'}`
        : quoteLineItemTypes.venue_fee.description,
      amount: venueFee,
      amount_basis: `Scene base ${sceneData?.basePrice || 0} x 10% staging venue placeholder.`,
      calculation_note: 'Local/staging estimate until real venue minimum spend or hire fee is confirmed.',
      source: 'scene_base_fee',
      party_scene_config_path: 'venue',
      currency
    },
    {
      id: 'decor-fee',
      type: 'decor_fee',
      name: `${packageData?.name || 'Package'} decor layer`,
      description: [
        visualContext?.packageVisual?.scope || packageExplanation?.positioning || quoteLineItemTypes.decor_fee.description,
        decor.tablecloth ? `Decor: ${decor.tablecloth}, ${decor.balloons}, ${decor.backdropStyle}` : ''
      ].filter(Boolean).join(' · '),
      amount: decorFee,
      amount_basis: `${packageData?.name || 'Package'} x ${Math.round(decorRatio * 100)}% decor allocation.`,
      calculation_note: `Layout uses ${layout.tables || '-'} tables, ${layout.chairs || '-'} chairs, dessert ${layout.dessertTable || '-'}, photo ${layout.photoZone || '-'}.`,
      source: 'package_decor_split',
      party_scene_config_path: 'decor',
      currency
    },
    {
      id: 'supplier-fee',
      type: 'supplier_fee',
      name: 'Supplier allowance',
      description: supplierNames(supplierList) || quoteLineItemTypes.supplier_fee.description,
      amount: supplierFee,
      amount_basis: `${packageData?.name || 'Package'} x ${Math.round(supplierRatio * 100)}% supplier allowance.`,
      calculation_note: supplierList.length ? `${supplierList.length} suggested supplier role(s) from scene config / visual context.` : 'Supplier list pending.',
      source: 'package_supplier_split',
      party_scene_config_path: 'suppliers',
      currency
    },
    {
      id: 'labor-fee',
      type: 'labor_fee',
      name: 'Setup and pack-down labor',
      description: 'Local/staging estimate for styling setup, basic coordination, and pack-down.',
      amount: laborFee,
      amount_basis: `${packageData?.name || 'Package'} x ${Math.round(laborRatio * 100)}% labor allocation.`,
      calculation_note: `Styling intensity: ${decor.stylingIntensity || 'standard'}.`,
      source: 'package_labor_split',
      party_scene_config_path: 'layout',
      currency
    },
    {
      id: 'transport-fee',
      type: 'transport_fee',
      name: 'Transport and handling',
      description: 'Local/staging placeholder for material transport and on-site handling.',
      amount: transportFee,
      amount_basis: packagePrice >= 2000 ? 'High package tier transport placeholder.' : packagePrice >= 1200 ? 'Standard package transport placeholder.' : 'Basic package transport placeholder.',
      calculation_note: `Area and delivery constraints must be confirmed before formal quote.`,
      source: 'standard_transport_placeholder',
      party_scene_config_path: 'venue',
      currency
    },
    {
      id: 'service-fee',
      type: 'service_fee',
      name: 'Planning service',
      description: 'Quote review, supplier coordination, and customer follow-up.',
      amount: serviceFee,
      amount_basis: 'Residual package amount after decor, supplier, labor, and transport allocations.',
      calculation_note: 'Covers planning and operations coordination; final service fee should be human-reviewed.',
      source: 'package_service_split',
      party_scene_config_path: 'pricingExplanation',
      currency
    },
    ...selectedAddonRows.map((addon) => ({
      id: addon.id,
      type: 'optional_upgrade',
      name: addon.name,
      description: 'Optional customer-selected upgrade item.',
      amount: toAmount(addon.price),
      amount_basis: 'Explicit customer-selected optional upgrade.',
      calculation_note: 'Keep only if confirmed by customer before formal quote.',
      source: 'customer_selected_addon',
      party_scene_config_path: 'optionalUpgrades',
      currency
    }))
  ]);
}
