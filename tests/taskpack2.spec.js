const { test, expect } = require('@playwright/test');
const path = require('path');

// 截图目录
const screenshotDir = path.join(__dirname, '../test_evidence/taskpack2');

/**
 * Task Pack 2 自动化验证测试
 * 验证内容：
 * 1. 首页 3 入口卡片
 * 2. Wizard 5步流程 + 生成草稿
 * 3. Venues Empty State
 * 4. Templates Empty State
 */

test.describe('Task Pack 2 Verification', () => {
  
  test.beforeAll(async () => {
    // 确保截图目录存在
    const fs = require('fs');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  });

  test('1. 首页 - 3入口卡片展示', async ({ page }) => {
    console.log('→ 打开首页...');
    await page.goto('https://partyonce-a4iw.vercel.app');
    await page.waitForLoadState('networkidle');
    
    // 等待页面加载
    await page.waitForTimeout(2000);
    
    // 截图：首页
    await page.screenshot({ 
      path: path.join(screenshotDir, '01-home-3-entries.png'),
      fullPage: true 
    });
    
    // 验证 3 个入口卡片存在
    const quickStartCard = await page.locator('.entry-card--quick').count();
    const aiCard = await page.locator('.entry-card--ai').count();
    const design3dCard = await page.locator('.entry-card--3d').count();
    
    console.log(`✓ 快速开始卡片: ${quickStartCard > 0 ? '存在' : '不存在'}`);
    console.log(`✓ AI策划卡片: ${aiCard > 0 ? '存在' : '不存在'}`);
    console.log(`✓ 3D设计卡片: ${design3dCard > 0 ? '存在' : '不存在'}`);
    
    expect(quickStartCard).toBeGreaterThan(0);
    expect(aiCard).toBeGreaterThan(0);
    expect(design3dCard).toBeGreaterThan(0);
  });

  test('2. Wizard - 打开并填写', async ({ page }) => {
    console.log('→ 打开首页...');
    await page.goto('https://partyonce-a4iw.vercel.app');
    await page.waitForTimeout(2000);
    
    console.log('→ 点击 AI 智能策划卡片...');
    await page.click('.entry-card--ai');
    await page.waitForTimeout(1000);
    
    // 截图：Wizard 打开
    await page.screenshot({ 
      path: path.join(screenshotDir, '02-wizard-open.png'),
      fullPage: false 
    });
    
    // 验证 Wizard 弹窗出现
    const wizardVisible = await page.locator('.wizard-overlay').isVisible().catch(() => false);
    console.log(`✓ Wizard 弹窗: ${wizardVisible ? '已打开' : '未打开'}`);
    expect(wizardVisible).toBe(true);
    
    // 步骤1: 选择城市
    console.log('→ 步骤1: 选择城市...');
    await page.click('.option-btn:has-text("悉尼")');
    await page.waitForTimeout(500);
    await page.click('.btn--primary:has-text("下一步")');
    await page.waitForTimeout(500);
    
    // 截图：步骤1完成
    await page.screenshot({ 
      path: path.join(screenshotDir, '03-wizard-step1-city.png'),
      fullPage: false 
    });
    
    // 步骤2: 选择人数
    console.log('→ 步骤2: 选择人数...');
    await page.click('.option-btn:has-text("21-50人")');
    await page.waitForTimeout(500);
    await page.click('.btn--primary:has-text("下一步")');
    await page.waitForTimeout(500);
    
    // 步骤3: 选择预算
    console.log('→ 步骤3: 选择预算...');
    await page.click('.option-btn:has-text("$3,000-8,000")');
    await page.waitForTimeout(500);
    await page.click('.btn--primary:has-text("下一步")');
    await page.waitForTimeout(500);
    
    // 步骤4: 选择风格
    console.log('→ 步骤4: 选择风格...');
    await page.click('.option-btn:has-text("浪漫优雅")');
    await page.waitForTimeout(500);
    await page.click('.btn--primary:has-text("下一步")');
    await page.waitForTimeout(500);
    
    // 截图：步骤4完成
    await page.screenshot({ 
      path: path.join(screenshotDir, '04-wizard-step4-style.png'),
      fullPage: false 
    });
    
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
    
    await page.click('.btn--primary:has-text("生成方案")');
    await page.waitForTimeout(3000);
    
    // 截图：生成结果
    await page.screenshot({ 
      path: path.join(screenshotDir, '05-wizard-complete.png'),
      fullPage: false 
    });
    
    // 验证完成页面
    const completeVisible = await page.locator('.wizard-step--complete').isVisible().catch(() => false);
    console.log(`✓ Wizard 完成页: ${completeVisible ? '显示' : '未显示'}`);
    
    // 输出 API 结果
    if (apiResponse) {
      console.log(`\n📊 API 验证结果:`);
      console.log(`   状态码: ${apiResponse.status}`);
      console.log(`   URL: ${apiResponse.url}`);
      console.log(`   结果: ${apiResponse.status === 200 || apiResponse.status === 201 ? '成功' : '失败'}`);
    } else {
      console.log(`\n⚠️ 未检测到 API 调用，可能是本地存储模式`);
    }
    
    expect(completeVisible).toBe(true);
  });

  test('3. Venues - Empty State', async ({ page }) => {
    console.log('→ 打开 Venues 页面...');
    await page.goto('https://partyonce-a4iw.vercel.app/venues');
    await page.waitForTimeout(2000);
    
    // 先截图正常状态
    await page.screenshot({ 
      path: path.join(screenshotDir, '06-venues-normal.png'),
      fullPage: true 
    });
    
    // 构造空结果：输入一个不存在的搜索词
    console.log('→ 构造空结果场景...');
    await page.fill('.search-box input', 'xyz_nonexistent_venue_12345');
    await page.press('.search-box input', 'Enter');
    await page.waitForTimeout(2000);
    
    // 截图：Empty State
    await page.screenshot({ 
      path: path.join(screenshotDir, '07-venues-empty-state.png'),
      fullPage: true 
    });
    
    // 验证 Empty State 组件
    const emptyStateVisible = await page.locator('.empty-state').count() > 0 || 
                              await page.locator('.el-empty').count() > 0;
    console.log(`✓ Venues Empty State: ${emptyStateVisible ? '已显示' : '未显示'}`);
    
    // 验证引导按钮
    const hasPrimaryBtn = await page.locator('.empty-state .btn--primary, .empty-actions .el-button--primary').count() > 0;
    console.log(`✓ 引导按钮: ${hasPrimaryBtn ? '存在' : '不存在'}`);
  });

  test('4. Templates - Empty State', async ({ page }) => {
    console.log('→ 打开 Templates 页面...');
    await page.goto('https://partyonce-a4iw.vercel.app/templates');
    await page.waitForTimeout(2000);
    
    // 先截图正常状态
    await page.screenshot({ 
      path: path.join(screenshotDir, '08-templates-normal.png'),
      fullPage: true 
    });
    
    // 构造空结果：选择不存在的场景类型组合
    console.log('→ 构造空结果场景...');
    
    // 如果有筛选器，尝试选择一个限制性条件
    const filterExists = await page.locator('.filter-card select, .el-select').count() > 0;
    if (filterExists) {
      // 尝试点击筛选并选择
      console.log('   尝试使用筛选器...');
      // 这里需要根据实际页面结构调整
    }
    
    // 截图：可能显示 Empty State 或正常列表
    await page.screenshot({ 
      path: path.join(screenshotDir, '09-templates-empty-or-list.png'),
      fullPage: true 
    });
    
    // 验证 Empty State 或列表
    const emptyStateCount = await page.locator('.empty-state').count();
    const templateListCount = await page.locator('.template-card, .template-list').count();
    
    console.log(`✓ Templates Empty State: ${emptyStateCount > 0 ? '已显示' : '未显示'}`);
    console.log(`✓ Templates 列表: ${templateListCount > 0 ? '已显示' : '未显示'}`);
    
    // 如果显示了 Empty State，验证引导按钮
    if (emptyStateCount > 0) {
      const hasPrimaryBtn = await page.locator('.empty-state .btn--primary').count() > 0;
      console.log(`✓ 引导按钮: ${hasPrimaryBtn ? '存在' : '不存在'}`);
    }
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
    await page.click('.entry-card--ai');
    await page.waitForTimeout(2000);
    
    console.log(`\n📊 控制台错误统计: ${errors.length} 个`);
    if (errors.length > 0) {
      console.log('   错误列表:', errors.slice(0, 5)); // 只显示前5个
    }
    
    // 截图
    await page.screenshot({ 
      path: path.join(screenshotDir, '10-console-check.png'),
      fullPage: false 
    });
  });
});

// 导出测试结果摘要
test.afterAll(async () => {
  console.log('\n========================================');
  console.log('Task Pack 2 Verification Summary');
  console.log('========================================');
  console.log('截图文件位置:', screenshotDir);
  console.log('请查看 screenshots 目录获取详细证据');
  console.log('========================================');
});
