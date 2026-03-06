const { test, expect } = require('@playwright/test');
const path = require('path');

// 截图目录
const screenshotDir = path.join(__dirname, '../docs/ui-audit/taskpack2');

/**
 * Task Pack 2 自动化验证测试 (稳定版)
 * 使用 data-testid 定位元素，避免超时
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
    
    // 等待3入口卡片加载
    await page.waitForSelector('[data-testid="entry-quick"]', { timeout: 10000 });
    await page.waitForSelector('[data-testid="entry-ai"]', { timeout: 10000 });
    await page.waitForSelector('[data-testid="entry-3d"]', { timeout: 10000 });
    
    // 截图：首页
    await page.screenshot({ 
      path: path.join(screenshotDir, '01-home-3-entries.png'),
      fullPage: true 
    });
    
    // 验证 3 个入口卡片存在
    const quickStartCard = await page.locator('[data-testid="entry-quick"]').count();
    const aiCard = await page.locator('[data-testid="entry-ai"]').count();
    const design3dCard = await page.locator('[data-testid="entry-3d"]').count();
    
    console.log(`✓ 快速开始卡片: ${quickStartCard > 0 ? '存在' : '不存在'}`);
    console.log(`✓ AI策划卡片: ${aiCard > 0 ? '存在' : '不存在'}`);
    console.log(`✓ 3D设计卡片: ${design3dCard > 0 ? '存在' : '不存在'}`);
    
    expect(quickStartCard).toBeGreaterThan(0);
    expect(aiCard).toBeGreaterThan(0);
    expect(design3dCard).toBeGreaterThan(0);
  });

  test('2. Wizard - 5步流程完成', async ({ page }) => {
    console.log('→ 打开首页...');
    await page.goto('https://partyonce-a4iw.vercel.app');
    await page.waitForSelector('[data-testid="entry-ai"]', { timeout: 10000 });
    
    console.log('→ 点击 AI 智能策划卡片...');
    await page.click('[data-testid="entry-ai"]');
    
    // 等待 Wizard 弹窗
    await page.waitForSelector('[data-testid="wizard-step-1"]', { timeout: 10000 });
    
    // 截图：Wizard 打开
    await page.screenshot({ 
      path: path.join(screenshotDir, '02-wizard-step1.png'),
      fullPage: false 
    });
    
    // 步骤1: 选择城市
    console.log('→ 步骤1: 选择城市...');
    await page.click('[data-testid="city-悉尼"]');
    await page.click('[data-testid="btn-next"]');
    
    // 等待步骤2
    await page.waitForSelector('[data-testid="wizard-step-2"]', { timeout: 5000 });
    
    // 步骤2: 选择人数
    console.log('→ 步骤2: 选择人数...');
    await page.click('[data-testid="guest-21-50"]');
    await page.click('[data-testid="btn-next"]');
    
    // 等待步骤3
    await page.waitForSelector('[data-testid="wizard-step-3"]', { timeout: 5000 });
    
    // 步骤3: 选择预算
    console.log('→ 步骤3: 选择预算...');
    await page.click('[data-testid="budget-medium"]');
    await page.click('[data-testid="btn-next"]');
    
    // 等待步骤4
    await page.waitForSelector('[data-testid="wizard-step-4"]', { timeout: 5000 });
    
    // 截图：步骤3完成
    await page.screenshot({ 
      path: path.join(screenshotDir, '03-wizard-step3.png'),
      fullPage: false 
    });
    
    // 步骤4: 选择风格
    console.log('→ 步骤4: 选择风格...');
    await page.click('[data-testid="style-浪漫优雅"]');
    await page.click('[data-testid="btn-next"]');
    
    // 等待步骤5
    await page.waitForSelector('[data-testid="wizard-step-5"]', { timeout: 5000 });
    
    // 步骤5: 生成方案
    console.log('→ 步骤5: 点击生成方案...');
    
    // 监听 API 请求
    let apiResponse = null;
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/events') && response.request().method() === 'POST') {
        apiResponse = {
          status: response.status(),
          url: url
        };
        console.log(`✓ API 调用: ${url} - 状态: ${response.status()}`);
      }
    });
    
    await page.click('[data-testid="btn-submit"]');
    
    // 等待完成页
    await page.waitForSelector('[data-testid="wizard-step-6"]', { timeout: 10000 });
    
    // 截图：生成结果
    await page.screenshot({ 
      path: path.join(screenshotDir, '04-wizard-done.png'),
      fullPage: false 
    });
    
    // 验证完成页面
    const completeVisible = await page.locator('[data-testid="wizard-step-6"]').isVisible().catch(() => false);
    console.log(`✓ Wizard 完成页: ${completeVisible ? '显示' : '未显示'}`);
    
    // 输出 API 结果
    if (apiResponse) {
      console.log(`\n📊 API 验证结果:`);
      console.log(`   状态码: ${apiResponse.status}`);
      console.log(`   结果: ${apiResponse.status === 200 || apiResponse.status === 201 ? '成功' : '失败'}`);
      expect(apiResponse.status).toBe(201); // 期望201 Created
    } else {
      console.log(`\n⚠️ 未检测到 API 调用`);
    }
    
    expect(completeVisible).toBe(true);
  });

  test('3. Venues - 页面访问', async ({ page }) => {
    console.log('→ 打开 Venues 页面...');
    await page.goto('https://partyonce-a4iw.vercel.app/venues');
    await page.waitForLoadState('networkidle');
    
    // 截图
    await page.screenshot({ 
      path: path.join(screenshotDir, '05-venues.png'),
      fullPage: true 
    });
    
    // 验证页面标题或关键元素
    const pageTitle = await page.title();
    console.log(`✓ Venues 页面标题: ${pageTitle}`);
    
    // 检查是否有内容或 Empty State
    const hasContent = await page.locator('.venue-item, .empty-state, .el-empty').count() > 0;
    console.log(`✓ Venues 页面内容: ${hasContent ? '有' : '无'}`);
    
    expect(hasContent).toBe(true);
  });

  test('4. Templates - 页面访问', async ({ page }) => {
    console.log('→ 打开 Templates 页面...');
    await page.goto('https://partyonce-a4iw.vercel.app/templates');
    await page.waitForLoadState('networkidle');
    
    // 截图
    await page.screenshot({ 
      path: path.join(screenshotDir, '06-templates.png'),
      fullPage: true 
    });
    
    // 验证页面标题
    const pageTitle = await page.title();
    console.log(`✓ Templates 页面标题: ${pageTitle}`);
    
    // 检查是否有内容或 Empty State
    const hasContent = await page.locator('.template-card, .empty-state, .el-empty').count() > 0;
    console.log(`✓ Templates 页面内容: ${hasContent ? '有' : '无'}`);
    
    expect(hasContent).toBe(true);
  });

  test('5. 控制台错误检查', async ({ page }) => {
    console.log('→ 检查控制台错误...');
    
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log(`   控制台错误: ${msg.text()}`);
      }
    });
    
    await page.goto('https://partyonce-a4iw.vercel.app');
    await page.waitForTimeout(3000);
    
    // 点击 Wizard
    await page.click('[data-testid="entry-ai"]');
    await page.waitForTimeout(2000);
    
    console.log(`\n📊 控制台错误统计: ${errors.length} 个`);
    
    expect(errors.length).toBe(0);
  });
});

// 导出测试结果摘要
test.afterAll(async () => {
  console.log('\n========================================');
  console.log('Task Pack 2 Verification Summary');
  console.log('========================================');
  console.log('截图文件位置:', screenshotDir);
  console.log('========================================');
});
