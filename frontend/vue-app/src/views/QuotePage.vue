<template>
  <div class="quote-page" :style="pageStyle">
    <!-- 返回导航 -->
    <nav class="back-nav">
      <button class="back-btn" @click="goBack">
        <span>←</span> 返回套餐
      </button>
    </nav>

    <!-- 页面标题 -->
    <header class="page-header">
      <h1 class="page-title" :style="titleStyle">报价汇总</h1>
      <p class="page-subtitle">确认您的派对方案</p>
    </header>

    <section v-if="aiPrefillNotice" class="ai-prefill-notice">
      <div class="section-container">
        <div class="ai-prefill-card" :style="cardStyle">
          <span class="ai-prefill-kicker">AI Concierge prefill</span>
          <strong>{{ aiPrefillNotice.title }}</strong>
          <p>{{ aiPrefillNotice.body }}</p>
        </div>
      </div>
    </section>

    <!-- 当前选择结果 -->
    <section class="current-selection">
      <div class="section-container">
        <h2 class="section-title" :style="titleStyle">当前选择</h2>
        <div class="selection-grid">
          <div class="selection-item" :style="selectionItemStyle">
            <div class="item-label">主题</div>
            <div class="item-value">
              <span class="item-icon">{{ themeConfig.icon }}</span>
              <span>{{ themeConfig.name }}</span>
            </div>
            <button class="edit-btn" @click="editTheme">修改</button>
          </div>
          <div class="selection-item" :style="selectionItemStyle">
            <div class="item-label">场景</div>
            <div class="item-value">
              <span class="item-icon">{{ sceneData.icon }}</span>
              <span>{{ sceneData.name }}</span>
            </div>
            <button class="edit-btn" @click="editScene">修改</button>
          </div>
          <div class="selection-item" :style="selectionItemStyle">
            <div class="item-label">套餐</div>
            <div class="item-value">
              <span class="item-icon">{{ packageData.icon }}</span>
              <span>{{ packageData.name }}</span>
            </div>
            <button class="edit-btn" @click="editPackage">修改</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 价格明细 -->
    <section class="price-section">
      <div class="section-container">
        <h2 class="section-title" :style="titleStyle">价格明细</h2>
        <div class="price-card" :style="cardStyle">
          <div class="price-row">
            <span>套餐基础价</span>
            <span>{{ formatPrice(packageData.price) }}</span>
          </div>
          <div class="price-row">
            <span>场景基础费 (10%)</span>
            <span>{{ formatPrice(sceneData.basePrice * 0.1) }}</span>
          </div>
          <div v-if="selectedAddons.length > 0" class="price-row is-addon">
            <span>附加项 ({{ selectedAddons.length }}项)</span>
            <span>{{ formatPrice(addonsTotal) }}</span>
          </div>
          <div class="price-divider"></div>
          <div class="price-row is-total">
            <span>预估总价</span>
            <span class="total-price">{{ formatPrice(finalTotal) }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="visual-context-section">
      <div class="section-container">
        <h2 class="section-title" :style="titleStyle">视觉方案依据</h2>
        <div class="visual-context-card" :style="cardStyle">
          <img :src="visualContext.packageVisual.image_path" :alt="visualContext.packageVisual.title">
          <div class="visual-context-copy">
            <span class="visual-kicker">{{ visualContext.packageVisual.title }}</span>
            <p>{{ visualContext.packageVisual.scope }}</p>
            <dl>
              <div>
                <dt>适合年龄</dt>
                <dd>{{ visualContext.packageVisual.suitableAge }} 岁</dd>
              </div>
              <div>
                <dt>餐厅样板</dt>
                <dd>{{ visualContext.restaurant.structureLock }}</dd>
              </div>
              <div>
                <dt>供应商建议</dt>
                <dd>{{ visualContext.suppliers.map((item) => item.name).join(' / ') }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>

    <!-- 附加项 -->
    <section class="addons-section">
      <div class="section-container">
        <h2 class="section-title" :style="titleStyle">可选附加项</h2>
        <div v-if="selectedAddons.length > 0" class="addons-subtotal">
          已选 {{ selectedAddons.length }} 项，小计 {{ formatPrice(addonsTotal) }}
        </div>
        <div class="addons-grid">
          <div 
            v-for="addon in addons" 
            :key="addon.id"
            class="addon-card"
            :class="{ 'is-selected': selectedAddons.includes(addon.id) }"
            @click="toggleAddon(addon)"
          >
            <div class="addon-icon">{{ addon.icon }}</div>
            <div class="addon-info">
              <span class="addon-name">{{ addon.name }}</span>
              <span class="addon-price">+{{ formatPrice(addon.price) }}</span>
            </div>
            <div v-if="selectedAddons.includes(addon.id)" class="addon-check">✓</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 恢复方案提示 -->
    <div v-if="restoredFromSave" class="restore-notice">
      <span class="restore-icon">↺</span>
      <span>已恢复您上次保存的方案</span>
    </div>

    <!-- 保存成功提示 -->
    <div v-if="saveSuccess" class="save-success">
      <span class="success-icon">✓</span>
      <span>方案已保存！总价 {{ formatPrice(finalTotal) }}</span>
    </div>

    <!-- 提交成功提示 -->
    <div v-if="submitSuccess" class="submit-success">
      <span class="success-icon">✓</span>
      <span>{{ submitMessage }}</span>
    </div>

    <!-- 提交错误提示 -->
    <div v-if="submitError" class="submit-error">
      <span class="error-icon">!</span>
      <span>{{ submitMessage }}</span>
    </div>

    <!-- 操作按钮 -->
    <section class="action-section">
      <div class="section-container">
        <div class="action-buttons">
          <button class="btn-secondary" @click="saveQuote" :disabled="isSaving">
            {{ isSaving ? '保存中...' : '保存方案' }}
          </button>
          <button class="btn-primary" @click="showInquiryForm">
            提交咨询 →
          </button>
        </div>
      </div>
    </section>

    <!-- 咨询表单弹窗 -->
    <div v-if="showForm" class="form-overlay" @click.self="hideInquiryForm">
      <div class="inquiry-form" :style="formStyle">
        <div class="form-header">
          <h3>提交咨询</h3>
          <button class="close-btn" @click="hideInquiryForm">×</button>
        </div>
        <div class="form-body">
          <div class="form-group">
            <label>联系人姓名 *</label>
            <input v-model="inquiryForm.name" type="text" placeholder="请输入您的姓名" required />
          </div>
          <div class="form-group">
            <label>联系方式 *</label>
            <input v-model="inquiryForm.contact" type="text" placeholder="手机号或微信号" required />
          </div>
          <div class="form-group">
            <label>活动日期 *</label>
            <input v-model="inquiryForm.date" type="date" required />
          </div>
          <div class="form-group">
            <label>备注需求</label>
            <textarea v-model="inquiryForm.notes" rows="3" placeholder="请描述您的特殊需求或问题"></textarea>
          </div>
          <div class="form-summary">
            <span>预估总价：</span>
            <strong>{{ formatPrice(finalTotal) }}</strong>
          </div>
        </div>
        <div class="form-footer">
          <button class="btn-cancel" @click="hideInquiryForm">取消</button>
          <button class="btn-submit" @click="submitInquiryForm" :disabled="isSubmittingInquiry">
            {{ isSubmittingInquiry ? '提交中...' : '确认提交' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 提示信息 -->
    <div class="notice">
      <p>* 以上价格为预估报价，最终价格将根据具体日期、人数、场地等因素调整</p>
      <p>提交咨询后，我们的策划师将在24小时内与您联系</p>
    </div>
  </div>
</template>

<script>
import { getTheme } from '@/themes';
import { getVisualContext } from '@/data/visualAssets';
import { readQuotePrefill } from '@/services/aiVoiceIntakeService';

export default {
  name: 'QuotePageSimple',
  
  data() {
    return {
      themeId: this.$route.query.theme || 'space',
      sceneId: this.$route.query.scene || 'command',
      packageId: this.$route.query.package || 'standard',
      selectedAddons: [],
      isSaving: false,
      saveSuccess: false,
      showForm: false,
      inquiryForm: {
        name: '',
        contact: '',
        date: '',
        notes: ''
      },
      restoredFromSave: false,
      submitSuccess: false,
      submitError: false,
      submitMessage: '',
      isSubmittingInquiry: false,
      aiPrefill: null,
      quoteSource: this.$route.query.source || 'web_quote'
    };
  },
  
  computed: {
    themeConfig() {
      return getTheme(this.themeId);
    },
    
    sceneData() {
      const scenes = {
        space: {
          'restaurant-a': { name: 'Restaurant A 私人餐厅样板', icon: '🍽️', basePrice: 2600 },
          command: { name: '星际指挥舱', icon: '🚀', basePrice: 2800 },
          moon: { name: '月球表面基地', icon: '🌙', basePrice: 3200 },
          observatory: { name: '星际观测站', icon: '🔭', basePrice: 2500 }
        },
        castle: {
          'restaurant-a': { name: 'Restaurant A 私人餐厅样板', icon: '🍽️', basePrice: 2800 },
          banquet: { name: '皇家宴会厅', icon: '👑', basePrice: 3500 },
          garden: { name: '秘密花园露台', icon: '🌹', basePrice: 2800 },
          tower: { name: '魔法塔楼', icon: '🏰', basePrice: 3000 }
        },
        forest: {
          'restaurant-a': { name: 'Restaurant A 私人餐厅样板', icon: '🍽️', basePrice: 2400 },
          clearing: { name: '林间空地', icon: '🌲', basePrice: 2200 },
          treehouse: { name: '树屋秘境', icon: '🏕️', basePrice: 3800 },
          firefly: { name: '萤火虫溪谷', icon: '✨', basePrice: 2600 }
        }
      };
      return (scenes[this.themeId] || scenes.space)[this.sceneId] || { name: '未知场景', icon: '❓', basePrice: 0 };
    },
    
    packageData() {
      const basePrice = this.sceneData.basePrice;
      const multiplier = this.themeId === 'castle' ? 1.1 : this.themeId === 'forest' ? 0.9 : 1;
      
      const packages = {
        basic: { 
          name: '基础探索包', 
          icon: '🎈', 
          description: '基础布置，2小时场地',
          price: Math.round(basePrice * 0.3 * multiplier)
        },
        standard: { 
          name: '标准体验包', 
          icon: '🎉', 
          description: '全套布置，4小时场地，策划师服务',
          price: Math.round(basePrice * 0.55 * multiplier)
        },
        premium: { 
          name: '高端尊享包', 
          icon: '👑', 
          description: 'VIP定制，全天场地，专属团队',
          price: Math.round(basePrice * multiplier)
        }
      };
      return packages[this.packageId] || packages.standard;
    },

    visualContext() {
      return getVisualContext(this.themeId, this.packageId);
    },

    aiPrefillNotice() {
      if (!this.aiPrefill) return null;
      return {
        title: `${this.aiPrefill.selection?.themeName || this.themeConfig.name} · ${this.aiPrefill.selection?.packageName || this.packageData.name}`,
        body: '已从 AI Concierge 自动带入联系人、日期、人数、预算、场地偏好和推荐理由。确认后只会提交 inquiry / Lead skeleton，不会创建 Quote、Order 或 PaymentIntent。'
      };
    },
    
    addonsTotal() {
      return this.selectedAddons.reduce((sum, id) => {
        const addon = this.addons.find(a => a.id === id);
        return sum + (addon ? addon.price : 0);
      }, 0);
    },

    finalTotal() {
      return this.packageData.price + (this.sceneData.basePrice * 0.1) + this.addonsTotal;
    },
    
    addons() {
      return [
        { id: 'cake', name: '定制主题蛋糕', icon: '🎂', price: 150 },
        { id: 'photo', name: '专业摄影服务', icon: '📷', price: 300 },
        { id: 'catering', name: '精致餐饮服务', icon: '🍽️', price: 500 }
      ];
    }
  },
  
  methods: {
    formatPrice(price) {
      return '$' + price.toLocaleString();
    },

    goBack() {
      this.$router.push(`/theme/${this.themeId}/scenes/${this.sceneId}/packages`);
    },

    editTheme() {
      this.$router.push('/');
    },

    editScene() {
      this.$router.push(`/theme/${this.themeId}/scenes`);
    },

    editPackage() {
      this.$router.push(`/theme/${this.themeId}/scenes/${this.sceneId}/packages`);
    },

    toggleAddon(addon) {
      const index = this.selectedAddons.indexOf(addon.id);
      if (index > -1) {
        this.selectedAddons.splice(index, 1);
      } else {
        this.selectedAddons.push(addon.id);
      }
    },

    saveQuote() {
      this.isSaving = true;
      this.saveSuccess = false;
      
      setTimeout(() => {
        const quoteData = {
          theme: this.themeId,
          scene: this.sceneId,
          package: this.packageId,
          addons: this.selectedAddons,
          totalPrice: this.finalTotal,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('savedQuote', JSON.stringify(quoteData));
        
        this.isSaving = false;
        this.saveSuccess = true;
        
        setTimeout(() => {
          this.saveSuccess = false;
        }, 3000);
      }, 500);
    },

    showInquiryForm() {
      this.showForm = true;
    },

    hideInquiryForm() {
      this.showForm = false;
    },

    getLeadBridgeMode() {
      const mode = import.meta.env.VITE_LEAD_BRIDGE_MODE || 'local_only';
      return ['local_only', 'dual_write_skeleton'].includes(mode) ? mode : 'local_only';
    },

    buildLeadPayloadFromInquiry(inquiryData) {
      return {
        customer: {
          name: inquiryData.customerInfo.name,
          contact: inquiryData.customerInfo.contact
        },
        preferred_event_date: inquiryData.customerInfo.preferredDate || null,
        intake_notes: inquiryData.customerInfo.notes || null,
        selection: inquiryData.selection || {},
        pricing_snapshot: inquiryData.pricing || {},
        source: inquiryData.source || 'web_quote'
      };
    },

    async submitLeadToBackendSkeleton(inquiryData) {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.buildLeadPayloadFromInquiry(inquiryData))
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Lead API skeleton returned ${response.status}`);
      }

      return response.json();
    },

    saveInquiryToLocalStorage(inquiryData) {
      let existingSubmissions = [];

      try {
        existingSubmissions = JSON.parse(localStorage.getItem('inquirySubmissions') || '[]');
        if (!Array.isArray(existingSubmissions)) {
          existingSubmissions = [];
        }
      } catch (error) {
        existingSubmissions = [];
      }

      existingSubmissions.push(inquiryData);
      localStorage.setItem('inquirySubmissions', JSON.stringify(existingSubmissions));
    },

    async submitInquiryForm() {
      // 验证必填字段
      if (!this.inquiryForm.name || !this.inquiryForm.contact || !this.inquiryForm.date) {
        this.submitError = true;
        this.submitMessage = '请填写所有必填字段（姓名、联系方式、活动日期）';
        setTimeout(() => {
          this.submitError = false;
        }, 3000);
        return;
      }

      if (this.isSubmittingInquiry) {
        return;
      }

      this.isSubmittingInquiry = true;
      this.submitError = false;
      this.submitSuccess = false;

      // 构建完整的咨询数据
      const inquiryData = {
        customerInfo: {
          name: this.inquiryForm.name,
          contact: this.inquiryForm.contact,
          preferredDate: this.inquiryForm.date,
          notes: this.inquiryForm.notes,
          guestCount: this.aiPrefill?.customerInfo?.guestCount || null,
          budgetRange: this.aiPrefill?.customerInfo?.budgetRange || null,
          area: this.aiPrefill?.customerInfo?.area || null,
          venuePreference: this.aiPrefill?.customerInfo?.venuePreference || null
        },
        selection: {
          themeId: this.themeId,
          themeName: this.themeConfig.name,
          sceneId: this.sceneId,
          sceneName: this.sceneData.name,
          packageId: this.packageId,
          packageName: this.packageData.name,
          source: this.quoteSource,
          venueType: this.aiPrefill?.selection?.venueType || this.sceneData.name,
          restaurantVisual: this.aiPrefill?.selection?.restaurantVisual || this.visualContext.restaurant.image_path,
          packageVisual: this.aiPrefill?.selection?.packageVisual || this.visualContext.packageVisual.image_path,
          supplierSuggestions: this.aiPrefill?.selection?.supplierSuggestions || this.visualContext.suppliers.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category
          })),
          addons: this.selectedAddons.map(id => {
            const addon = this.addons.find(a => a.id === id);
            return { id, name: addon?.name, price: addon?.price };
          })
        },
        pricing: {
          packagePrice: this.packageData.price,
          sceneFee: this.sceneData.basePrice * 0.1,
          addonsTotal: this.addonsTotal,
          finalTotal: this.finalTotal,
          aiEstimate: this.aiPrefill?.pricing || null
        },
        source: this.quoteSource,
        aiRecommendation: this.aiPrefill?.aiRecommendation || null,
        submitTime: new Date().toISOString(),
        status: 'pending'
      };

      try {
        // Always save locally first. Backend skeleton sync is local/staging only.
        this.saveInquiryToLocalStorage(inquiryData);

        const bridgeMode = this.getLeadBridgeMode();
        let backendLead = null;
        let backendSyncFailed = false;

        if (bridgeMode === 'dual_write_skeleton') {
          try {
            backendLead = await this.submitLeadToBackendSkeleton(inquiryData);
          } catch (error) {
            backendSyncFailed = true;
            console.warn('Lead API skeleton sync failed; inquiry remains saved locally.', error);
          }
        }

        // 显示成功反馈
        this.submitSuccess = true;
        if (backendLead?.id) {
          this.submitMessage = `咨询已保存，并已同步到本地 Lead API skeleton（${backendLead.id}）。`;
        } else if (backendSyncFailed) {
          this.submitMessage = '咨询已保存在本地浏览器；本地 Lead API skeleton 暂未同步。';
        } else {
          this.submitMessage = '咨询提交成功！我们的策划师将在24小时内与您联系。';
        }
        this.showForm = false;

        // 重置表单
        this.inquiryForm = { name: '', contact: '', date: '', notes: '' };

        // 3秒后隐藏成功提示
        setTimeout(() => {
          this.submitSuccess = false;
        }, 5000);

        console.log('咨询已提交:', inquiryData);
      } catch (error) {
        this.submitError = true;
        this.submitMessage = '本地保存失败，请检查浏览器存储后重试。';
        console.error('咨询保存失败:', error);
      } finally {
        this.isSubmittingInquiry = false;
      }
    },

    loadSavedQuote() {
      const saved = localStorage.getItem('savedQuote');
      if (saved) {
        try {
          const quoteData = JSON.parse(saved);
          // 检查是否是当前主题/场景/套餐的保存
          if (quoteData.theme === this.themeId &&
              quoteData.scene === this.sceneId &&
              quoteData.package === this.packageId) {
            this.selectedAddons = quoteData.addons || [];
            this.restoredFromSave = true;
            console.log('已恢复保存的方案:', quoteData);

            // 3秒后隐藏恢复提示
            setTimeout(() => {
              this.restoredFromSave = false;
            }, 3000);
          }
        } catch (e) {
          console.error('读取保存的方案失败:', e);
        }
      }
    },

    applyAiConciergePrefill() {
      const prefill = readQuotePrefill();
      if (!prefill || this.$route.query.source !== 'ai_concierge') {
        return;
      }

      this.aiPrefill = prefill;
      this.quoteSource = 'ai_concierge';
      this.themeId = prefill.selection?.themeId || this.themeId;
      this.sceneId = prefill.selection?.sceneId || 'restaurant-a';
      this.packageId = prefill.selection?.packageId || this.packageId;
      this.inquiryForm = {
        name: prefill.customerInfo?.name || '',
        contact: prefill.customerInfo?.contact || '',
        date: prefill.customerInfo?.preferredDate || '',
        notes: prefill.customerInfo?.notes || ''
      };
      this.showForm = true;
    }
  },

  mounted() {
    this.applyAiConciergePrefill();
    this.loadSavedQuote();
    
    // Debug: 暴露方法到全局，供验证使用
    if (typeof window !== 'undefined') {
      window.__quotePageDebug = {
        saveQuote: this.saveQuote.bind(this),
        submitInquiry: this.submitInquiryForm.bind(this),
        getData: () => ({
          themeId: this.themeId,
          sceneId: this.sceneId,
          packageId: this.packageId,
          selectedAddons: this.selectedAddons,
          finalTotal: this.finalTotal
        })
      };
      console.log('QuotePage Debug API 已暴露: window.__quotePageDebug');
    }
  }
};
</script>

<style scoped>
.quote-page {
  min-height: 100vh;
  padding-bottom: 60px;
  background: linear-gradient(180deg, #0a1628 0%, #1a0b2e 50%, #0d1b2a 100%);
  color: #ffffff;
}

.back-nav {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 100;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  color: white;
  font-size: 0.9375rem;
  cursor: pointer;
}

.page-header {
  padding: 100px 24px 40px;
  text-align: center;
}

.page-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  margin-bottom: 12px;
}

.page-subtitle {
  font-size: 1.125rem;
  opacity: 0.8;
}

.section-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
}

.ai-prefill-notice {
  margin-bottom: 28px;
}

.ai-prefill-card {
  display: grid;
  gap: 8px;
  padding: 18px 20px;
  border-radius: 18px;
  border: 1px solid rgba(139, 92, 246, 0.34);
  background:
    linear-gradient(135deg, rgba(124, 58, 237, 0.16), rgba(56, 189, 248, 0.12)),
    rgba(255, 255, 255, 0.08);
}

.ai-prefill-kicker {
  color: #c4b5fd;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 24px;
}

/* 当前选择 */
.current-selection {
  padding: 40px 0;
  background: rgba(0, 0, 0, 0.2);
}

.selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.selection-item {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.selection-item .item-label {
  font-size: 0.75rem;
  opacity: 0.6;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.selection-item .item-value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 12px;
}

.selection-item .item-icon {
  font-size: 1.5rem;
}

.edit-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: white;
  font-size: 0.8125rem;
  cursor: pointer;
}

/* 价格明细 */
.price-section {
  padding: 60px 0;
}

.price-card {
  padding: 32px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.visual-context-section {
  padding: 46px 0;
  background: rgba(255, 255, 255, 0.04);
}

.visual-context-card {
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(240px, 0.9fr) minmax(0, 1.1fr);
  gap: 22px;
  padding: 18px;
}

.visual-context-card img {
  width: 100%;
  height: 100%;
  min-height: 240px;
  border-radius: 14px;
  object-fit: cover;
  object-position: top center;
}

.visual-context-copy {
  align-self: center;
}

.visual-kicker {
  display: inline-flex;
  margin-bottom: 12px;
  color: var(--theme-accent);
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
}

.visual-context-copy p,
.visual-context-copy dd {
  color: rgba(255, 255, 255, 0.76);
  line-height: 1.65;
}

.visual-context-copy dl {
  display: grid;
  gap: 12px;
  margin: 18px 0 0;
}

.visual-context-copy dt {
  color: #fff;
  font-weight: 800;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 1rem;
}

.price-row.is-addon {
  color: #00d4ff;
}

.price-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 12px 0;
}

.price-row.is-total {
  font-size: 1.25rem;
  font-weight: 700;
}

.total-price {
  color: #ffd700;
  font-size: 1.5rem;
}

/* 附加项 */
.addons-section {
  padding: 40px 0;
  background: rgba(0, 0, 0, 0.2);
}

.addons-subtotal {
  margin-bottom: 20px;
  color: #ffd700;
  font-weight: 600;
}

.addons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

@media (max-width: 760px) {
  .visual-context-card {
    grid-template-columns: 1fr;
  }
}

.addon-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.addon-card:hover {
  background: rgba(255, 255, 255, 0.1);
}

.addon-card.is-selected {
  background: rgba(0, 212, 255, 0.15);
  border-color: #00d4ff;
}

.addon-icon {
  font-size: 1.5rem;
}

.addon-info {
  flex: 1;
}

.addon-name {
  display: block;
  font-size: 0.9375rem;
  margin-bottom: 4px;
}

.addon-price {
  font-size: 0.875rem;
  opacity: 0.7;
}

.addon-check {
  width: 24px;
  height: 24px;
  background: #00d4ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0a1628;
  font-weight: 700;
}

/* 提示消息通用样式 */
.notice-message {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  animation: fadeIn 0.3s ease;
  z-index: 1000;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* 恢复方案提示 */
.restore-notice {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 24px;
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid #ffc107;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffc107;
  font-weight: 600;
  animation: fadeIn 0.3s ease;
  z-index: 1000;
}

.restore-icon {
  font-size: 1.25rem;
}

/* 保存成功 */
.save-success {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 24px;
  background: rgba(0, 212, 255, 0.2);
  border: 1px solid #00d4ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #00d4ff;
  font-weight: 600;
  animation: fadeIn 0.3s ease;
  z-index: 1000;
}

/* 提交成功 */
.submit-success {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 24px;
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid #4caf50;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #4caf50;
  font-weight: 600;
  animation: fadeIn 0.3s ease;
  z-index: 1000;
}

/* 提交错误 */
.submit-error {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 24px;
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid #f44336;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #f44336;
  font-weight: 600;
  animation: fadeIn 0.3s ease;
  z-index: 1000;
}

.success-icon, .error-icon {
  font-size: 1.25rem;
}

/* 操作按钮 */
.action-section {
  padding: 40px 0;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.action-buttons button {
  flex: 1;
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.btn-primary {
  background: #00d4ff;
  color: #0a1628;
}

.action-buttons button:hover {
  transform: translateY(-2px);
}

/* 咨询表单 */
.form-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.inquiry-form {
  width: 100%;
  max-width: 480px;
  background: #0a1628;
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 20px;
  overflow: hidden;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
}

.form-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
}

.close-btn {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

.form-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  margin-bottom: 8px;
  opacity: 0.8;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #00d4ff;
}

.form-summary {
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-summary strong {
  color: #ffd700;
  font-size: 1.25rem;
}

.form-footer {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px;
}

.form-footer button {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-submit {
  background: #00d4ff;
  color: #0a1628;
}

/* 提示信息 */
.notice {
  text-align: center;
  padding: 40px 24px;
  font-size: 0.875rem;
  opacity: 0.7;
  line-height: 1.6;
}

.notice p {
  margin: 8px 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .selection-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .addons-grid {
    grid-template-columns: 1fr;
  }
}
</style>
