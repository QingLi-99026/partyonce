const { test } = require('@playwright/test');
const path = require('path');
const screenshotDir = path.join(__dirname, '../test_evidence/venues-v1-revised');
const TARGET_URL = 'http://localhost:3000/venues';

test.describe('Venues Page V1 Revised', () => {
  test('Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(TARGET_URL);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotDir, 'venues-v1-desktop.png'), fullPage: true });
  });
  test('iPhone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(TARGET_URL);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotDir, 'venues-v1-iphone.png'), fullPage: true });
  });
  test('Android', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto(TARGET_URL);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotDir, 'venues-v1-android.png'), fullPage: true });
  });
});
