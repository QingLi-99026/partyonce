'use strict';

const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');
const { createEvidenceRecord, validateEvidenceRecord } = require('./evidenceSchema');

const DEFAULT_OUT_DIR = path.join(os.tmpdir(), 'party_event_browser_evidence_runner_v1');

const routes = [
  '/',
  '/themes',
  '/themes/castle-princess',
  '/packages',
  '/venue-finder',
  '/quote',
  '/my/quotes',
  '/my/orders',
  '/my/rewards',
  '/share',
  '/payment/deposit'
];

const internalTermPattern = /\b(staging|fixture|skeleton|webhook|n8n|PaymentIntent|Stripe|localStorage|sessionStorage)\b/i;
const rawI18nPattern = /\b[a-z][a-z0-9_]*\.[a-z][a-z0-9_.]*\b/i;
const zhEnglishResiduePattern = /\b(VENUE|RESTAURANT FINDER|Find a venue|Basic|Standard|Premium|Copy the caption|Current configuration status|Test-mode|Investor homepage hero|Package matrix|App mockup|SPACE EXPLORER|CASTLE PRINCESS|FOREST ADVENTURE)\b/;

const customerFixture = {
  id: 'customer-local-41',
  customer_fixture_id: 'customer-local-41',
  full_name: '预览用户',
  name: '预览用户',
  email: 'preview.parent@example.test',
  contact: 'preview.parent@example.test',
  role: 'customer',
  user_type: 'personal',
  customer_readonly_fixture: true
};

function parseArgs(argv) {
  const parsed = {
    url: process.env.PARTY_EVENT_APP_URL || '',
    out: DEFAULT_OUT_DIR
  };

  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--url=')) parsed.url = arg.slice('--url='.length);
    if (arg.startsWith('--out=')) parsed.out = arg.slice('--out='.length);
    if (!arg.startsWith('--')) parsed.out = arg;
  }

  parsed.url = normalizeBaseUrl(parsed.url);
  parsed.out = path.resolve(parsed.out);
  return parsed;
}

function normalizeBaseUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  return trimmed.replace(/\/+$/, '');
}

function ensureDirs(outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(path.join(outDir, 'screenshots'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'dom'), { recursive: true });
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function urlFor(baseUrl, route) {
  return `${baseUrl}${route === '/' ? '/' : route}`;
}

function requestHead(targetUrl) {
  return new Promise((resolve) => {
    const client = targetUrl.startsWith('https:') ? https : http;
    const req = client.get(targetUrl, (res) => {
      res.resume();
      resolve({ reachable: true, statusCode: res.statusCode });
    });
    req.on('error', (error) => resolve({ reachable: false, error: error.message }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ reachable: false, error: 'timeout' });
    });
  });
}

function routeSlug(route) {
  return route.replace(/[/?=&]+/g, '-').replace(/^-|-$/g, '') || 'home';
}

function keyClickableExpectations(route) {
  const expectations = {
    '/themes': ['Castle', 'Space', 'Forest', '梦幻', '星际', '森林', '详情', '选择'],
    '/packages': ['使用这一档', '选择', '报价', '套餐'],
    '/themes/castle-princess': ['返回主题', '获取报价', '报价', '返回'],
    '/quote': ['提交', '咨询', '报价', '返回'],
    '/share': ['分享', '提交', '复制', '平台']
  };
  return expectations[route] || [];
}

async function collectDom(page) {
  return page.evaluate(() => {
    const visibleText = (node) => (node?.innerText || node?.textContent || '').replace(/\s+/g, ' ').trim();
    const text = visibleText(document.body);
    const clickables = Array.from(document.querySelectorAll('a, button, [role="button"], .el-button, .theme-card, .package-card, article')).map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        label: visibleText(el).slice(0, 120),
        tag: el.tagName,
        disabled: Boolean(el.disabled || el.getAttribute('aria-disabled') === 'true' || el.classList.contains('is-disabled')),
        href: el.getAttribute('href') || '',
        role: el.getAttribute('role') || '',
        visible: rect.width > 0 && rect.height > 0
      };
    }).filter((item) => item.visible && (item.label || item.href));
    const images = Array.from(document.images).map((img) => ({
      src: img.currentSrc || img.src,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight
    }));
    const overflow = Array.from(document.querySelectorAll('h1,h2,h3,p,span,strong,button,a,.el-button,.el-card,article')).filter((el) => (
      el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0
    )).slice(0, 25).map((el) => ({
      tag: el.tagName,
      text: visibleText(el).slice(0, 160),
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth
    }));

    return {
      title: document.title,
      dir: document.documentElement.getAttribute('dir') || document.body.getAttribute('dir') || 'ltr',
      h1: visibleText(document.querySelector('h1')),
      nav: Array.from(document.querySelectorAll('nav a, header a, .nav a, .el-menu-item')).slice(0, 60).map(visibleText).filter(Boolean),
      ctas: clickables.slice(0, 80),
      imageCount: images.length,
      brokenImages: images.filter((img) => !img.complete || img.naturalWidth === 0 || img.naturalHeight === 0),
      overflow,
      textSample: text.slice(0, 2200),
      fullText: text
    };
  });
}

async function trialClickByLabels(page, route) {
  const labels = keyClickableExpectations(route);
  if (!labels.length) return [];
  const results = [];
  for (const label of labels) {
    const locator = page.getByText(label, { exact: false }).first();
    const count = await locator.count().catch(() => 0);
    if (!count) {
      results.push({ label, found: false, trial_click: false, result: 'blocked', reason: 'label not found' });
      continue;
    }
    try {
      await locator.click({ trial: true, timeout: 1500 });
      results.push({ label, found: true, trial_click: true, result: 'success' });
    } catch (error) {
      results.push({ label, found: true, trial_click: false, result: 'blocked', reason: error.message.slice(0, 300) });
    }
  }
  return results;
}

async function collectRouteEvidence(page, baseUrl, route, outDir) {
  const consoleErrors = [];
  const pageErrors = [];
  page.removeAllListeners('console');
  page.removeAllListeners('pageerror');
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const response = await page.goto(urlFor(baseUrl, route), { waitUntil: 'networkidle', timeout: 30000 });
  await page.evaluate((fixture) => {
    window.localStorage.setItem('userInfo', JSON.stringify(fixture));
    window.localStorage.removeItem('token');
    window.localStorage.setItem('partyonce_locale', 'zh');
  }, customerFixture);
  await page.reload({ waitUntil: 'networkidle', timeout: 30000 });

  const dom = await collectDom(page);
  const clickChecks = await trialClickByLabels(page, route);
  const screenshot = path.join(outDir, 'screenshots', `${routeSlug(route)}.png`);
  const domPath = path.join(outDir, 'dom', `${routeSlug(route)}.json`);
  await page.screenshot({ path: screenshot, fullPage: true });
  writeJson(domPath, {
    route,
    url: urlFor(baseUrl, route),
    dom,
    clickChecks,
    consoleErrors,
    pageErrors
  });

  const checks = {
    http_or_spa_accessible: Boolean(response && response.status() < 400),
    non_empty: dom.fullText.trim().length > 80,
    nav_present: dom.nav.length > 0,
    primary_cta_present: dom.ctas.length > 0,
    raw_i18n_key_found: rawI18nPattern.test(dom.fullText),
    english_residue_found_in_zh: zhEnglishResiduePattern.test(dom.fullText),
    internal_terms_found: internalTermPattern.test(dom.fullText),
    overflow_detected: dom.overflow.length > 0,
    broken_images_found: dom.brokenImages.length > 0,
    console_errors_found: consoleErrors.length > 0,
    key_click_blocked: clickChecks.some((item) => item.result !== 'success')
  };

  const failures = Object.entries(checks)
    .filter(([key, value]) => key.endsWith('_found') ? value : key === 'key_click_blocked' ? value : !value)
    .map(([key]) => key);

  return {
    route,
    url: urlFor(baseUrl, route),
    status: response ? response.status() : null,
    screenshot,
    dom_path: domPath,
    checks,
    clickChecks,
    consoleErrors,
    pageErrors,
    brokenImages: dom.brokenImages,
    overflow: dom.overflow,
    textSample: dom.textSample,
    failures,
    action: {
      page: route,
      action: 'scan',
      selector_or_label: 'body/nav/cta/images/click-trial',
      expected_result: 'Route renders, copy is customer-facing, no raw i18n/internal terms, images load, key actions are actionable.',
      actual_result: `status=${response ? response.status() : 'none'} nav=${dom.nav.length} ctas=${dom.ctas.length} failures=${failures.join(',') || 'none'}`,
      result: failures.length ? 'failed' : 'success'
    }
  };
}

function buildSchemaRecord(routeResults) {
  const failed = routeResults.filter((item) => item.failures.length);
  const record = createEvidenceRecord({
    run_id: `browser-evidence-${Date.now()}`,
    skill_type: 'virtual_consumer',
    persona_or_role_id: 'browser_evidence_runner_v1',
    model_primary: 'mock',
    model_challenger: 'mock',
    model_judge: 'openai_codex',
    route_checked: routes,
    actions_taken: routeResults.map((item) => item.action),
    screenshots: routeResults.map((item) => item.screenshot),
    dom_evidence: routeResults.map((item) => ({
      route: item.route,
      dom_path: item.dom_path,
      textSample: item.textSample.slice(0, 900),
      failures: item.failures
    })),
    primary_model_findings: [{
      severity: failed.length ? 'P1' : 'OK',
      category: 'browser_evidence',
      finding: failed.length ? `${failed.length} route(s) failed browser evidence checks.` : 'All browser evidence checks passed.'
    }],
    challenger_model_findings: [{
      severity: 'OK',
      category: 'dry_run',
      finding: 'Mock challenger only. No Gemini or Kimi API was called.'
    }],
    disagreements: [],
    final_verdict: failed.length ? 'Browser evidence found route failures requiring owner review.' : 'Browser evidence passed for configured routes.',
    severity: failed.length ? 'P1' : 'OK'
  });

  record.visible_copy_checks = {
    raw_i18n_key_found: routeResults.some((item) => item.checks.raw_i18n_key_found),
    english_residue_found_in_zh: routeResults.some((item) => item.checks.english_residue_found_in_zh),
    technical_terms_exposed: routeResults.some((item) => item.checks.internal_terms_found) ? ['internal_term_visible'] : [],
    overflow_detected: routeResults.some((item) => item.checks.overflow_detected),
    unclickable_elements: [...new Set(routeResults.flatMap((item) => item.clickChecks.filter((click) => click.result !== 'success').map((click) => `${item.route}:${click.label}`)))]
  };
  return record;
}

function blockedResult(outDir, reason, details = {}) {
  const blocked = {
    version: 'party_event_browser_evidence_runner_v1',
    dry_run: true,
    blocked: true,
    blocker: reason,
    ...details,
    external_api_called: false,
    gemini_api_called: false,
    kimi_api_called: false,
    env_file_read: false,
    production_env_read: false,
    payment_triggered: false,
    webhook_triggered: false,
    n8n_triggered: false,
    messaging_triggered: false,
    deploy_triggered: false
  };
  ensureDirs(outDir);
  writeJson(path.join(outDir, 'browser_evidence_summary.json'), blocked);
  writeJson(path.join(outDir, 'multimodel_browser_evidence_result.json'), blocked);
  return blocked;
}

async function main() {
  const { url, out } = parseArgs(process.argv);
  ensureDirs(out);

  if (!url) {
    const blocked = blockedResult(out, 'No app URL provided. Use PARTY_EVENT_APP_URL or --url=http://127.0.0.1:<port>.');
    console.log(JSON.stringify(blocked, null, 2));
    return;
  }

  const reachable = await requestHead(url);
  if (!reachable.reachable) {
    const blocked = blockedResult(out, `Base URL not reachable: ${url}`, { reachable });
    console.log(JSON.stringify(blocked, null, 2));
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const page = await context.newPage();
  const routeResults = [];

  for (const route of routes) {
    routeResults.push(await collectRouteEvidence(page, url, route, out));
  }

  await context.close();
  await browser.close();

  const record = buildSchemaRecord(routeResults);
  const validation = validateEvidenceRecord(record);
  const failures = routeResults.filter((item) => item.failures.length).map((item) => ({
    route: item.route,
    failures: item.failures,
    screenshot: item.screenshot,
    dom_path: item.dom_path
  }));

  const summary = {
    version: 'party_event_browser_evidence_runner_v1',
    dry_run: true,
    base_url: url,
    routes,
    schema_valid: validation.valid,
    schema_errors: validation.errors,
    evidence_record: record,
    route_results: routeResults,
    failures,
    external_api_called: false,
    gemini_api_called: false,
    kimi_api_called: false,
    env_file_read: false,
    production_env_read: false,
    payment_triggered: false,
    webhook_triggered: false,
    n8n_triggered: false,
    messaging_triggered: false,
    deploy_triggered: false
  };

  writeJson(path.join(out, 'browser_evidence_summary.json'), summary);
  writeJson(path.join(out, 'multimodel_browser_evidence_result.json'), summary);
  console.log(JSON.stringify({
    ok: validation.valid,
    blocked: false,
    severity: record.severity,
    failures: failures.length,
    evidence_path: path.join(out, 'browser_evidence_summary.json'),
    external_api_called: false,
    gemini_api_called: false,
    kimi_api_called: false
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

