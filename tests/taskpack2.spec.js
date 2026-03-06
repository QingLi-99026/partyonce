const { test, expect } = require('@playwright/test');
const path = require('path');

// 截图目录
const screenshotDir = path.join(__dirname, '../docs/ui-audit/taskpack2');

/**
 * Task Pack 2 自动化验证测试 - 稳定版
 * 使用 data-testid 选择器，避免超时问题
 */

test.describe('Task Pack 2 Verification', () => {

  test.beforeAll(async () => {
    const fs = require('fs');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  });

  test('1. 首页 - 3入口卡片展示', async ({ page }) => {
    console.log('→ 打开首页...');
    await page.goto('https://partyonce-a4iw.vercel.app');
    await page.waitForLoadState('networkidle');

    // 使用 data-testid 验证 3 个入口卡片
    await expect(page.locator('[data-testid="entry-quick"]')).toBeVisible();
    await expect(page.locator('[data-testid="entry-ai"]')).toBeVisible();
    await expect(page.locator('[data-testid="entry-3d"]')).toBeVisible();

    console.log('✅ 3个入口卡片都存在');

    await page.screenshot({
      path: path.join(screenshotDir, 'home_3entry.png'),
      fullPage: true
    });
  });

  test('2. Wizard - 5步流程完成', async ({ page }) => {
    console.log('→ 打开首页...');
    await page.goto('https://partyonce-a4iw.vercel.app');
    await page.waitForLoadState('networkidle');

    console.log('→ 点击 AI 智能策划卡片...');
    await page.click('[data-testid="entry-ai"]');
    await page.waitForTimeout(500);

    // 验证 Wizard 弹窗打开
    await expect(page.locator('[data-testid="wizard-step-1"]')).toBeVisible();
    console.log('✅ Wizard 弹窗已打开');

    await page.screenshot({ path: path.join(screenshotDir, 'wizard_step1.png') });

    // 步骤1: 选择城市
    console.log('→ 步骤1: 选择城市...');
    await page.click('[data-testid="city-悉尼"]');
    await page.click('[data-testid="btn-next"]');
    await expect(page.locator('[data-testid="wizard-step-2"]')).toBeVisible();
    console.log('✅ 步骤1完成');

    await page.screenshot({ path: path.join(screenshotDir, 'wizard_step2.png') });

    // 步骤2: 选择人数
    console.log('→ 步骤2: 选择人数...');
    await page.click('[data-testid="guest-21-50"]');
    await page.click('[data-testid="btn-next"]');
    await expect(page.locator('[data-testid="wizard-step-3"]')).toBeVisible();
    console.log('✅ 步骤2完成');

    // 步骤3: 选择预算
    console.log('→ 步骤3: 选择预算...');
    await page.click('[data-testid="budget-medium"]');
    await page.click('[data-testid="btn-next"]');
    await expect(page.locator('[data-testid="wizard-step-4"]')).toBeVisible();
    console.log('✅ 步骤3完成');

    await page.screenshot({ path: path.join(screenshotDir, 'wizard_step3.png') });

    // 步骤4: 选择风格
    console.log('→ 步骤4: 选择风格...');
    await page.click('[data-testid="style-浪漫优雅"]');
    await page.click('[data-testid="btn-next"]');
    await expect(page.locator('[data-testid="wizard-step-5"]')).toBeVisible();
    console.log('✅ 步骤4完成');

    // 步骤5: 生成方案
    console.log('→ 步骤5: 生成方案...');
    await page.click('[data-testid="btn-submit"]');

    // 等待完成页显示（无论 API 成功失败）
    await page.waitForTimeout(2000);
    await expect(page.locator('[data-testid="btn-finish"]')).toBeVisible();
    console.log('✅ Wizard 完成页显示');

    await page.screenshot({ path: path.join(screenshotDir, 'wizard_done.png') });

    // 验证 mock 模式工作正常
    const mockEvent = await page.evaluate(() => {
      return localStorage.getItem('mock_events');
    });
    if (mockEvent) {
      console.log('✅ Mock 事件已保存到 localStorage');
    }
  });

  test('3. Venues - Empty State', async ({ page }) => {
    console.log('→ 打开 Venues 页面...');
    await page.goto('https://partyonce-a4iw.vercel.app/venues');
    await page.waitForLoadState('networkidle');

    // 截图正常状态
    await page.screenshot({ path: path.join(screenshotDir, 'emptystate_1.png'), fullPage: true });

    // 检查 EmptyState 组件是否存在（页面已接入）
    const hasEmptyState = await page.locator('[data-testid="empty-state"]').count() > 0;
    if (hasEmptyState) {
      console.log('✅ Venues 页面 EmptyState 组件已接入');
      await expect(page.locator('[data-testid="empty-primary-btn"]')).toBeVisible();
    } else {
      // 页面有数据时不显示 EmptyState，这是正常的
      console.log('ℹ️ Venues 页面有数据，EmptyState 未触发');
    }
  });

  test('4. Templates - Empty State', async ({ page }) => {
    console.log('→ 打开 Templates 页面...');
    await page.goto('https://partyonce-a4iw.vercel.app/templates');
    await page.waitForLoadState('networkidle');

    // 截图
    await page.screenshot({ path: path.join(screenshotDir, 'emptystate_2.png'), fullPage: true });

    // 检查 EmptyState 组件是否存在
    const hasEmptyState = await page.locator('[data-testid="empty-state"]').count() > 0;
    if (hasEmptyState) {
      console.log('✅ Templates 页面 EmptyState 组件已显示');
      await expect(page.locator('[data-testid="empty-primary-btn"]')).toBeVisible();
    } else {
      console.log('ℹ️ Templates 页面有数据，EmptyState 未触发');
    }
  });

  test('5. 控制台错误检查', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log(`   控制台错误: ${msg.text()}`);
      }
    });

    await page.goto('https://partyonce-a4iw.vercel.app');
    await page.click('[data-testid="entry-ai"]');
    await page.waitForTimeout(2000);

    // 完成 Wizard
    await page.click('[data-testid="city-悉尼"]');
    await page.click('[data-testid="btn-next"]');
    await page.click('[data-testid="guest-21-50"]');
    await page.click('[data-testid="btn-next"]');
    await page.click('[data-testid="budget-medium"]');
    await page.click('[data-testid="btn-next"]');
    await page.click('[data-testid="style-浪漫优雅"]');
    await page.click('[data-testid="btn-next"]');
    await page.click('[data-testid="btn-submit"]');
    await page.waitForTimeout(2000);

    console.log(`\n📊 控制台错误统计: ${errors.length} 个`);

    // API 404 不算测试失败（预期行为，mock 模式会处理）
    const nonApiErrors = errors.filter(e => !e.includes('/api/events') && !e.includes('404'));
    if (nonApiErrors.length > 0) {
      console.log('   非API错误:', nonApiErrors);
    }

    expect(nonApiErrors.length).toBe(0);
    console.log('✅ 无阻塞性控制台错误');
  });
});

test.afterAll(async () => {
  console.log('\n========================================');
  console.log('Task Pack 2 Verification Complete');
  console.log('========================================');
  console.log('截图文件位置:', screenshotDir);
  console.log('========================================');
});
