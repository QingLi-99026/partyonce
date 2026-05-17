import fs from 'fs';
import path from 'path';

const root = new URL('../src/locales/', import.meta.url);
const locales = ['zh', 'ko', 'ar'];
const localeFiles = Object.fromEntries(locales.map((locale) => [locale, path.join(root.pathname, `${locale}.json`)]));
const allowedEnglish = new Set([
  'PartyOnce', 'Party Event', 'Restaurant A', 'Venue Finder', 'TikTok', 'Instagram', 'Facebook',
  'WeChat', 'WhatsApp', 'SMS', 'n8n', 'webhook', 'Stripe', 'Google Maps', 'Places API',
  'localStorage', 'sessionStorage', 'customer-local', 'local', 'staging', 'preview',
  'placeholder', 'test-mode', 'Browser', 'SpeechRecognition', 'Sandbox', 'Beta',
  'Coming soon', 'Local preview', 'production deploy', 'Payment readiness', 'AI', '3D',
  'English', 'Basic', 'Standard', 'Premium', 'Castle Princess', 'Space Explorer',
  'Forest Adventure', 'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide',
  'Quote', 'Order', 'Lead API', 'My Quotes', 'My Orders'
]);

function flatten(value, prefix = '') {
  if (typeof value === 'string') return [[prefix, value]];
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) => flatten(child, prefix ? `${prefix}.${key}` : key));
}

function stripAllowed(value) {
  let output = value;
  for (const term of allowedEnglish) output = output.replaceAll(term, '');
  return output;
}

function hasChinese(value) {
  return /[\u3400-\u9fff]/.test(value);
}

function hasI18nKeyLeak(value) {
  return /\b[a-z][a-z0-9]*(\.[a-z0-9_]+){1,}\b/i.test(value);
}

function hasEnglishResidue(value) {
  const stripped = stripAllowed(value).replace(/\{[^}]+\}/g, '');
  return /[A-Za-z]{4,}/.test(stripped);
}

const report = { generated_at: new Date().toISOString(), files: {}, summary: { p0: 0, p1: 0, p2: 0 } };

for (const [locale, file] of Object.entries(localeFiles)) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const rows = flatten(data);
  const findings = [];
  for (const [key, value] of rows) {
    if (hasI18nKeyLeak(value)) findings.push({ severity: 'P0', key, value, reason: 'possible visible i18n key / dotted token' });
    if ((locale === 'ko' || locale === 'ar') && key !== 'language.zh' && hasChinese(value)) findings.push({ severity: 'P1', key, value, reason: 'Chinese characters in Korean/Arabic locale' });
    if ((locale === 'ko' || locale === 'ar') && hasEnglishResidue(value)) findings.push({ severity: 'P2', key, value, reason: 'English residue; may be acceptable for brand/technical terms only' });
  }
  report.files[locale] = { file, checked_strings: rows.length, findings };
  for (const item of findings) report.summary[item.severity.toLowerCase()] += 1;
}

report.p2_by_locale = Object.fromEntries(Object.entries(report.files).map(([locale, data]) => [
  locale,
  data.findings.filter((item) => item.severity === 'P2').length
]));
report.p2_by_prefix = {};
for (const data of Object.values(report.files)) {
  for (const item of data.findings.filter((finding) => finding.severity === 'P2')) {
    const prefix = item.key.split('.').slice(0, 2).join('.');
    report.p2_by_prefix[prefix] = (report.p2_by_prefix[prefix] || 0) + 1;
  }
}
report.next_actions = [
  'P0 means a likely visible i18n key leak and should block release.',
  'P1 means Chinese characters in Korean/Arabic and should block external review.',
  'P2 means English residue in Korean/Arabic; review manually because brand, platform, and technical terms may be acceptable.',
  'Run with I18N_STRICT_P2=1 when preparing a multilingual release gate that should fail on any P2 residue.'
];

const outDir = process.env.I18N_AUDIT_OUT || '/tmp/party_event_package_addons_upgrade_sprint1_20260516';
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'i18n_residue_audit.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  ...report.summary,
  p2_by_locale: report.p2_by_locale,
  top_p2_prefixes: Object.entries(report.p2_by_prefix)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
}, null, 2));
if (report.summary.p0 > 0) process.exitCode = 1;
if (process.env.I18N_STRICT_P2 === '1' && report.summary.p2 > 0) process.exitCode = 1;
