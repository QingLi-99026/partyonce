const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const outputDir = '/Users/aiagentkevin/.openclaw/workspace/skills/computer-use/output/vercel-pricing';
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const logs = [];
function log(level, message) {
  const entry = { timestamp: new Date().toISOString(), level, message };
  logs.push(entry);
  console.log(`[${entry.timestamp}] [${level}] ${message}`);
}

(async () => {
  const startTime = Date.now();
  console.log('=== Task 2: Vercel Pricing Page ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  try {
    log('INFO', '[1/4] Opening vercel.com/pricing');
    const navStart = Date.now();
    await page.goto('https://vercel.com/pricing', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - navStart;
    
    const title = await page.title();
    log('INFO', `  ✓ Loaded: ${title} (${loadTime}ms)`);
    
    log('INFO', '[2/4] Screenshot - top section');
    await page.screenshot({ path: path.join(outputDir, 'vercel-pricing-top.png') });
    log('INFO', '  ✓ Saved: vercel-pricing-top.png');
    
    log('INFO', '[3/4] Scrolling to pricing table');
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(2000);
    
    log('INFO', '[4/4] Screenshot - pricing table');
    await page.screenshot({ path: path.join(outputDir, 'vercel-pricing-table.png') });
    log('INFO', '  ✓ Saved: vercel-pricing-table.png');
    
    await browser.close();
    
    const result = {
      task_id: 'BROWSER-002',
      task_name: 'Vercel Pricing Page',
      status: 'success',
      url: 'https://vercel.com/pricing',
      page_title: title,
      load_time_ms: loadTime,
      total_duration_ms: Date.now() - startTime,
      screenshots: [
        path.join(outputDir, 'vercel-pricing-top.png'),
        path.join(outputDir, 'vercel-pricing-table.png')
      ],
      logs
    };
    
    fs.writeFileSync(path.join(outputDir, 'result.json'), JSON.stringify(result, null, 2));
    
    console.log('\n=== Task 2 Complete ===');
    console.log(`✅ Success | Load: ${loadTime}ms | Screenshots: 2`);
    
  } catch (error) {
    log('ERROR', error.message);
    await browser.close();
    process.exit(1);
  }
})();
