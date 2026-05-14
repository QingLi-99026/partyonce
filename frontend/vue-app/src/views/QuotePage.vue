<template>
  <div class="quote-page" :style="pageStyle">
    <!-- 返回导航 -->
    <nav class="back-nav">
      <button class="back-btn" @click="goBack">
        <span>←</span> {{ $t('quotePage.back') }}
      </button>
    </nav>

    <!-- 页面标题 -->
    <header class="page-header">
      <h1 class="page-title" :style="titleStyle">{{ $t('quotePage.title') }}</h1>
      <p class="page-subtitle">{{ $t('quotePage.subtitle') }}</p>
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

    <section class="quote-flow-summary">
      <div class="section-container">
        <div class="quote-flow-card" :style="cardStyle">
          <div>
            <span class="visual-kicker">{{ $t('quotePage.summaryKicker') }}</span>
            <h2>{{ quoteFlowSummary.title }}</h2>
            <p>{{ quoteFlowSummary.body }}</p>
          </div>
          <div class="quote-flow-steps">
            <span>1. {{ $t('quotePage.steps.summary') }}</span>
            <span>2. {{ $t('quotePage.steps.rendering') }}</span>
            <span>3. {{ $t('quotePage.steps.package') }}</span>
            <span>4. {{ $t('quotePage.steps.pricing') }}</span>
            <span>5. {{ $t('quotePage.steps.inquiry') }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 当前选择结果 -->
    <section class="current-selection">
      <div class="section-container">
        <h2 class="section-title" :style="titleStyle">{{ $t('quotePage.currentSelection') }}</h2>
        <div class="selection-grid">
          <div class="selection-item" :style="selectionItemStyle">
            <div class="item-label">{{ $t('quotePage.theme') }}</div>
            <div class="item-value">
              <span class="item-icon">{{ themeConfig.icon }}</span>
              <span>{{ themeConfig.name }}</span>
            </div>
            <button class="edit-btn" @click="editTheme">{{ $t('quotePage.edit') }}</button>
          </div>
          <div class="selection-item" :style="selectionItemStyle">
            <div class="item-label">{{ $t('quotePage.scene') }}</div>
            <div class="item-value">
              <span class="item-icon">{{ sceneData.icon }}</span>
              <span>{{ sceneData.name }}</span>
            </div>
            <button class="edit-btn" @click="editScene">{{ $t('quotePage.edit') }}</button>
          </div>
          <div class="selection-item" :style="selectionItemStyle">
            <div class="item-label">{{ $t('quotePage.package') }}</div>
            <div class="item-value">
              <span class="item-icon">{{ packageData.icon }}</span>
              <span>{{ packageData.name }}</span>
            </div>
            <button class="edit-btn" @click="editPackage">{{ $t('quotePage.edit') }}</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 价格明细 -->
    <section class="price-section">
      <div class="section-container">
        <h2 class="section-title" :style="titleStyle">{{ $t('quotePage.priceDetails') }}</h2>
        <div class="price-card" :style="cardStyle">
          <div
            v-for="group in lineItemSummary.groups"
            :key="group.type"
            class="price-row"
            :class="{ 'is-addon': group.type === 'optional_upgrade' }"
          >
            <span>{{ group.labelZh }} · {{ group.customerLabel }}</span>
            <span>{{ formatPrice(group.amount) }}</span>
          </div>
          <div class="price-divider"></div>
          <div class="price-row is-total">
            <span>{{ $t('quotePage.estimatedTotal') }}</span>
            <span class="total-price">{{ formatPrice(finalTotal) }}</span>
          </div>
        </div>

        <div class="line-item-card" :style="cardStyle">
          <div class="pricing-explainer-header">
            <span class="visual-kicker">Standardized line items</span>
            <h3>报价由哪些稳定类型构成</h3>
            <p>场地费、装饰费、供应商费、人工费、运输费、服务费和可选升级项会进入 quote snapshot，方便后台编辑、PDF 报价单和未来 deposit 计算。</p>
          </div>
          <div class="line-item-grid">
            <article v-for="group in lineItemSummary.groups" :key="group.type">
              <strong>{{ group.labelZh }}</strong>
              <span>{{ formatPrice(group.amount) }}</span>
              <p>{{ group.description }}</p>
              <small>{{ group.items.map((item) => item.amount_basis).filter(Boolean).join(' / ') }}</small>
            </article>
          </div>
          <p class="pricing-explainer-note">
            Deposit readiness placeholder: {{ formatPrice(lineItemSummary.deposit_placeholder) }} · {{ lineItemSummary.deposit_note }}
          </p>
        </div>

        <div class="pricing-explainer" :style="cardStyle">
          <div class="pricing-explainer-header">
            <span class="visual-kicker">Package explanation</span>
            <h3>{{ packageExplanation.label }} 到底差在哪里</h3>
            <p>{{ packageExplanation.positioning }}</p>
          </div>
          <div class="pricing-explainer-grid">
            <div>
              <h4>为什么推荐这一档</h4>
              <p>{{ packageExplanation.whyRecommend }}</p>
            </div>
            <div>
              <h4>价格差异来自哪里</h4>
              <ul>
                <li v-for="item in packageExplanation.priceDrivers" :key="item">{{ item }}</li>
              </ul>
            </div>
            <div>
              <h4>{{ upgradeExplanation.title }}</h4>
              <ul>
                <li v-for="item in upgradeExplanation.items" :key="item">{{ item }}</li>
              </ul>
            </div>
            <div>
              <h4>这个方案为什么适合我</h4>
              <p>{{ packageExplanation.customerFit }}</p>
            </div>
          </div>
          <p class="pricing-explainer-note">{{ packageExplanation.quoteExplanation }}</p>
        </div>
      </div>
    </section>

    <section class="visual-context-section">
      <div class="section-container">
        <h2 class="section-title" :style="titleStyle">视觉方案依据</h2>
        <div class="visual-context-card" :style="cardStyle">
          <img :src="visualContext.restaurant.image_path" :alt="visualContext.restaurant.title">
          <div class="visual-context-copy">
            <span class="visual-kicker">{{ visualContext.restaurant.title }}</span>
            <p>{{ visualContext.packageVisual.scope }}</p>
            <dl>
              <div>
                <dt>适合年龄</dt>
                <dd>{{ visualContext.packageVisual.suitableAge }} 岁</dd>
              </div>
              <div>
                <dt>推荐场地</dt>
                <dd>{{ visualContext.primaryVenue.name }} · {{ visualContext.primaryVenue.capacity }}</dd>
              </div>
              <div>
                <dt>供应商建议</dt>
                <dd>{{ visualContext.suppliers.map((item) => item.name).join(' / ') }}</dd>
              </div>
              <div>
                <dt>报价依据</dt>
                <dd>{{ visualContext.restaurant.decorationLayer }}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div v-if="partySceneConfig" class="scene-config-card" :style="cardStyle">
          <span class="visual-kicker">party_scene_config · {{ partySceneConfig.version }}</span>
          <h3>AI 场景配置摘要</h3>
          <dl>
            <div>
              <dt>Layout</dt>
              <dd>{{ partySceneConfig.layout.tables }} tables · {{ partySceneConfig.layout.chairs }} chairs · dessert {{ partySceneConfig.layout.dessertTable }} · photo {{ partySceneConfig.layout.photoZone }}</dd>
            </div>
            <div>
              <dt>Decor</dt>
              <dd>{{ partySceneConfig.decor.tablecloth }} / {{ partySceneConfig.decor.balloons }} / {{ partySceneConfig.decor.backdropStyle }} / {{ partySceneConfig.decor.lighting }}</dd>
            </div>
            <div>
              <dt>Suppliers</dt>
              <dd>{{ partySceneConfig.suppliers.map((item) => `${item.categoryLabel || item.category}: ${item.name}`).join(' / ') }}</dd>
            </div>
            <div>
              <dt>Future 3D</dt>
              <dd>{{ partySceneConfig.future3d.suggestedRoute }} · {{ partySceneConfig.future3d.layoutCoordinateSystem }}</dd>
            </div>
          </dl>
          <button class="scene-preview-btn" type="button" @click="openParty3DPreview">
            查看实验性 3D 场景预览（非施工图）
          </button>
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

    <section v-if="submittedNextSteps" class="post-inquiry-section">
      <div class="section-container">
        <div class="post-inquiry-card" :style="cardStyle">
          <span class="visual-kicker">Inquiry received · staging preview</span>
          <h2>{{ submittedNextSteps.title }}</h2>
          <p>{{ submittedNextSteps.summary }}</p>
          <ul>
            <li v-for="item in submittedNextSteps.items" :key="item">{{ item }}</li>
          </ul>
          <div class="post-inquiry-actions">
            <button class="btn-secondary" @click="$router.push('/my/quotes')">查看 My Quotes</button>
            <button class="btn-secondary" @click="$router.push('/my/orders')">查看 My Orders</button>
          </div>
        </div>
      </div>
    </section>

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
import { getPackageExplanation, getUpgradeExplanation } from '@/data/packageExplanation';
import { buildQuoteLineItemsFromSelection, summarizeQuoteLineItems } from '@/data/quoteLineItems';
import { readQuotePrefill } from '@/services/aiVoiceIntakeService';
import { writePartySceneConfig } from '@/services/partyScenePreviewService';

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
      submittedNextSteps: null,
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

    packageExplanation() {
      return getPackageExplanation(this.packageId);
    },

    upgradeExplanation() {
      return getUpgradeExplanation(this.packageId);
    },

        partySceneConfig() {
      return this.aiPrefill?.party_scene_config
        || this.aiPrefill?.selection?.party_scene_config
        || this.aiPrefill?.aiRecommendation?.party_scene_config
        || null;
    },

    aiPrefillNotice() {
      if (!this.aiPrefill) return null;
      return {
        title: `${this.aiPrefill.selection?.themeName || this.themeConfig.name} · ${this.aiPrefill.selection?.packageName || this.packageData.name}`,
        body: '已从 AI Concierge 自动带入联系人、日期、人数、预算、场地偏好和推荐理由。确认后只会提交 inquiry / Lead skeleton，不会创建 Quote、Order 或 PaymentIntent。'
      };
    },

    quoteFlowSummary() {
      const source = this.aiPrefill ? 'AI Concierge 已整理' : '当前方案';
      return {
        title: `${source}: ${this.themeConfig.name} · ${this.packageData.name} · ${this.visualContext.primaryVenue.name}`,
        body: '先确认主题、套餐和 Restaurant A 视觉效果；再看套餐差异和报价组成；最后只提交 inquiry / Lead skeleton，不会触发真实支付。'
      };
    },
    
    addonsTotal() {
      return this.selectedAddons.reduce((sum, id) => {
        const addon = this.addons.find(a => a.id === id);
        return sum + (addon ? addon.price : 0);
      }, 0);
    },

    standardizedLineItems() {
      return buildQuoteLineItemsFromSelection({
        packageData: this.packageData,
        sceneData: this.sceneData,
        selectedAddons: this.selectedAddons,
        addons: this.addons,
        visualContext: this.visualContext,
        packageExplanation: this.packageExplanation,
        partySceneConfig: this.partySceneConfig,
        currency: 'AUD'
      });
    },

    lineItemSummary() {
      return summarizeQuoteLineItems(this.standardizedLineItems);
    },

    finalTotal() {
      return this.lineItemSummary.total;
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

    openParty3DPreview() {
      if (this.partySceneConfig) {
        writePartySceneConfig(this.partySceneConfig);
      }
      this.$router.push('/experimental/party-3d');
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
        customer_brief: inquiryData.customerInfo.customerBrief || null,
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
      this.submittedNextSteps = null;

      // 构建完整的咨询数据
      const inquiryData = {
        customerInfo: {
          name: this.inquiryForm.name,
          contact: this.inquiryForm.contact,
          preferredDate: this.inquiryForm.date,
          notes: this.inquiryForm.notes,
          customerBrief: this.aiPrefill?.customerInfo?.customerBrief || null,
          guestCount: this.aiPrefill?.customerInfo?.guestCount || null,
          budgetRange: this.aiPrefill?.customerInfo?.budgetRange || null,
          area: this.aiPrefill?.customerInfo?.area || null,
          venuePreference: this.aiPrefill?.customerInfo?.venuePreference || null
        },
        selection: {
          themeId: this.themeId,
          theme: this.aiPrefill?.selection?.theme || this.themeConfig.name,
          themeName: this.themeConfig.name,
          sceneId: this.sceneId,
          sceneName: this.sceneData.name,
          packageTier: this.aiPrefill?.selection?.packageTier || this.packageId,
          packageId: this.packageId,
          packageName: this.packageData.name,
          source: this.quoteSource,
          venueType: this.aiPrefill?.selection?.venueType || this.sceneData.name,
          restaurantVisual: this.aiPrefill?.selection?.restaurantVisual || this.visualContext.restaurant.image_path,
          packageVisual: this.aiPrefill?.selection?.packageVisual || this.visualContext.packageVisual.image_path,
          venueId: this.aiPrefill?.selection?.venueId || this.visualContext.primaryVenue.id,
          venueName: this.aiPrefill?.selection?.venueName || this.visualContext.primaryVenue.name,
          venueCapacity: this.aiPrefill?.selection?.venueCapacity || this.visualContext.primaryVenue.capacity,
          venueLayoutImage: this.aiPrefill?.selection?.venueLayoutImage || this.visualContext.primaryVenue.layoutImage || this.visualContext.primaryVenue.image_path,
          party_scene_config: this.partySceneConfig,
          sceneConfigSummary: this.aiPrefill?.aiRecommendation?.sceneConfigSummary || null,
          supplierSuggestions: this.aiPrefill?.selection?.supplierSuggestions || this.visualContext.suppliers.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            categoryLabel: item.categoryLabel,
            role: item.quoteRole,
            responsibility: item.responsibility || item.operationsRole
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
          lineItems: this.standardizedLineItems,
          lineItemSummary: this.lineItemSummary,
          lineItemSchemaVersion: this.lineItemSummary.schema_version,
          depositReadiness: {
            placeholderAmount: this.lineItemSummary.deposit_placeholder,
            basis: this.lineItemSummary.deposit_note,
            enabled: false
          },
          party_scene_config: this.partySceneConfig,
          packageExplanation: this.packageExplanation,
          upgradeExplanation: this.upgradeExplanation,
          snapshot_note: this.aiPrefill?.pricing?.snapshot_note || 'Frontend staging estimate; final quote requires human review.',
          aiEstimate: this.aiPrefill?.pricing || null
        },
        source: this.quoteSource,
        party_scene_config: this.partySceneConfig,
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
        this.submittedNextSteps = this.buildPostInquiryNextSteps(backendLead, backendSyncFailed);
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

    buildPostInquiryNextSteps(backendLead, backendSyncFailed) {
      const syncLine = backendLead?.id
        ? `Local/staging Lead skeleton 已记录：${backendLead.id}。`
        : backendSyncFailed
          ? '浏览器本地已保存，Lead API skeleton 暂未同步；演示仍可继续。'
          : '浏览器本地已保存，适合 staging 演示和客户路径说明。';

      return {
        title: '我们已收到你的派对需求',
        summary: '团队会根据场地、主题和供应商可用性人工确认方案，并把报价进度展示在客户侧页面。',
        items: [
          '团队会根据 Restaurant A 样板、主题视觉和供应商建议确认方案。',
          '你可以在 My Quotes 查看报价进度和状态说明。',
          '你可以在 My Orders 查看后续订单状态。',
          '当前为 staging preview，不会触发真实支付、PaymentIntent、webhook、n8n 或外发消息。',
          syncLine
        ]
      };
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

.quote-flow-summary {
  padding: 18px 0 10px;
}

.quote-flow-card {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.9fr);
  gap: 24px;
  padding: 26px;
  color: #fff;
}

.quote-flow-card h2 {
  margin: 6px 0 10px;
  color: #fff;
  font-size: 1.6rem;
}

.quote-flow-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.7;
}

.quote-flow-steps {
  display: grid;
  gap: 8px;
}

.quote-flow-steps span {
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-weight: 800;
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

.scene-config-card {
  margin-top: 22px;
  padding: 28px;
  color: #eaf8ff;
}

.scene-config-card h3 {
  margin: 0 0 16px;
  color: #fff;
  font-size: 1.35rem;
}

.scene-config-card dl {
  display: grid;
  gap: 12px;
  margin: 0;
}

.scene-config-card div {
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.scene-config-card dt {
  margin-bottom: 4px;
  color: #fff;
  font-weight: 800;
}

.scene-config-card dd {
  margin: 0;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.55;
}

.scene-preview-btn {
  margin-top: 18px;
  min-height: 42px;
  padding: 0 18px;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}

.scene-preview-btn:hover {
  background: rgba(255, 255, 255, 0.24);
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

.pricing-explainer {
  display: grid;
  gap: 22px;
  margin-top: 22px;
  padding: 28px;
  color: #eaf8ff;
}

.line-item-card {
  display: grid;
  gap: 18px;
  margin-top: 22px;
  padding: 28px;
  color: #eaf8ff;
}

.line-item-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.line-item-grid article {
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
}

.line-item-grid strong,
.line-item-grid span {
  display: block;
}

.line-item-grid span {
  margin-top: 6px;
  color: #ffd700;
  font-weight: 800;
}

.line-item-grid p {
  margin: 8px 0 0;
  color: rgba(255, 255, 255, 0.74);
  line-height: 1.55;
}

.line-item-grid small {
  display: block;
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.58);
  line-height: 1.45;
}

.pricing-explainer-header h3 {
  margin: 8px 0;
  color: #fff;
  font-size: 1.45rem;
}

.pricing-explainer-header p,
.pricing-explainer-grid p,
.pricing-explainer-grid li,
.pricing-explainer-note {
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.65;
}

.pricing-explainer-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.pricing-explainer-grid > div {
  padding: 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
}

.pricing-explainer-grid h4 {
  margin: 0 0 8px;
  color: #fff;
}

.pricing-explainer-grid ul {
  display: grid;
  gap: 6px;
  margin: 0;
  padding-left: 18px;
}

.pricing-explainer-note {
  margin: 0;
  padding-top: 4px;
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

  .pricing-explainer-grid {
    grid-template-columns: 1fr;
  }

  .line-item-grid {
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

.post-inquiry-section {
  padding: 18px 0 10px;
}

.post-inquiry-card {
  display: grid;
  gap: 14px;
  color: #e5f7ff;
}

.post-inquiry-card h2 {
  margin: 0;
  color: #fff;
}

.post-inquiry-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.7;
}

.post-inquiry-card ul {
  display: grid;
  gap: 10px;
  margin: 0;
  padding-left: 18px;
  color: rgba(255, 255, 255, 0.82);
}

.post-inquiry-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.post-inquiry-actions .btn-secondary {
  min-height: 42px;
  padding: 0 18px;
  border-radius: 999px;
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
