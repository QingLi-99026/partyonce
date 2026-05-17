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

    <section v-if="aiExperienceEnabled && aiPrefillNotice" class="ai-prefill-notice">
      <div class="section-container">
        <div class="ai-prefill-card" :style="cardStyle">
          <span class="ai-prefill-kicker">AI Concierge prefill</span>
          <strong>{{ aiPrefillNotice.title }}</strong>
          <p>{{ aiPrefillNotice.body }}</p>
          <div v-if="aiQuoteReadySummary" class="ai-summary-grid">
            <span>{{ $t('ai.interaction.quoteReady') }}</span>
            <p>{{ aiQuoteReadySummary.emotional_summary }}</p>
            <ul>
              <li v-if="aiQuoteReadySummary.age">Age: {{ aiQuoteReadySummary.age }}</li>
              <li v-if="aiQuoteReadySummary.budget_range">Budget: {{ aiQuoteReadySummary.budget_range }}</li>
              <li v-if="aiQuoteReadySummary.package_recommendation">Package: {{ aiQuoteReadySummary.package_recommendation }}</li>
              <li v-if="aiQuoteReadySummary.venue_recommendation">Venue: {{ aiQuoteReadySummary.venue_recommendation }}</li>
              <li v-if="aiQuoteReadySummary.missing_fields?.length">
                Missing: {{ aiQuoteReadySummary.missing_fields.join(' / ') }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section v-if="venueFinderPrefill && venueFinderVisual" class="ai-prefill-notice venue-prefill-notice">
      <div class="section-container">
        <div class="venue-prefill-card" :style="cardStyle">
          <div class="venue-prefill-media">
            <img :src="venueFinderVisual.image" :alt="venueFinderVisual.venueName" />
            <span>{{ isChineseLocale ? '场地筛选样板' : 'Venue Finder sample' }}</span>
          </div>
          <div class="venue-prefill-copy">
            <span class="ai-prefill-kicker">{{ isChineseLocale ? '场地筛选预填 · 本地 / 预览' : 'Venue Finder prefill · local/staging' }}</span>
            <h2>{{ displayVenueName(venueFinderVisual.venueName) }} · {{ venueFinderVisual.guests }} {{ isChineseLocale ? '位客人' : 'guests' }}</h2>
            <p>{{ venueFinderVisual.summary }}</p>
            <div class="venue-prefill-stats">
              <div><small>{{ isChineseLocale ? '主题' : 'Theme' }}</small><strong>{{ displayThemeText(venueFinderVisual.theme) }}</strong></div>
              <div><small>{{ isChineseLocale ? '套餐' : 'Package' }}</small><strong>{{ displayPackageText(venueFinderVisual.package) }}</strong></div>
              <div><small>{{ isChineseLocale ? '区域' : 'Area' }}</small><strong>{{ venueFinderVisual.area }}</strong></div>
              <div><small>{{ isChineseLocale ? '预算' : 'Budget' }}</small><strong>{{ displayPackageText(venueFinderVisual.budget) }}</strong></div>
            </div>
            <div class="venue-ops-notes">
              <strong>{{ isChineseLocale ? '正式报价前需要人工核对场地' : 'Manual venue checks before formal quote' }}</strong>
              <span>{{ isChineseLocale ? '餐饮' : 'Food' }}: {{ venueFinderOps.foodOptions.join(' · ') }}</span>
              <span>{{ isChineseLocale ? '过敏 / 饮食' : 'Allergy' }}: {{ venueFinderOps.allergyNotes.join(' · ') }}</span>
              <span v-if="venueFinderOps.dietaryTags.length">{{ isChineseLocale ? '文化 / 宗教适配' : 'Cultural fit' }}: {{ venueFinderOps.dietaryTags.join(' · ') }}</span>
              <span>{{ isChineseLocale ? '文化说明' : 'Cultural notes' }}: {{ venueFinderOps.culturalFitNotes.join(' · ') }}</span>
              <span>{{ isChineseLocale ? '包间 / 最低消费' : 'Room/minimum spend' }}: {{ venueFinderOps.roomHireHint }} · {{ venueFinderOps.minimumSpendHint }}</span>
            </div>
            <div v-if="venueFinderVerification" class="venue-verification-panel">
              <div>
                <span class="visual-kicker">{{ isChineseLocale ? '正式报价前场地核验' : 'Venue verification before formal quote' }}</span>
                <h3>
                  {{ venueFinderVerification.researchSeed ? (isChineseLocale ? '公开资料种子 · 需要 owner 电话确认' : 'Public research seed · owner call required') : (isChineseLocale ? '本地预览场地 · 需要人工确认' : 'Local staging venue · manual check required') }}
                </h3>
                <p>
                  {{ isChineseLocale
                    ? '这个场地可以先用于方案规划，但正式报价前团队必须确认档期、餐饮 / 过敏规则、最低消费、布置限制和供应商进场条件。'
                    : 'This venue can be used for planning, but the team must confirm availability, food/allergy rules, minimum spend, decoration limits and supplier access before issuing a formal quote.' }}
                </p>
              </div>
              <ul>
                <li v-for="item in venueFinderVerification.checklist" :key="item">{{ item }}</li>
              </ul>
              <p v-if="venueFinderVerification.publicSourceUrl" class="venue-source-note">
                {{ isChineseLocale ? '供 owner 核验的公开来源：' : 'Public source for owner verification:' }}
                <a :href="venueFinderVerification.publicSourceUrl" target="_blank" rel="noopener noreferrer">
                  {{ venueFinderVerification.publicSourceLabel || venueFinderVerification.publicSourceUrl }}
                </a>
              </p>
            </div>
          </div>
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
        <div class="human-review-card" :style="cardStyle">
          <div class="pricing-explainer-header">
            <span class="visual-kicker">{{ $t('quotePage.reviewTimeline.kicker') }}</span>
            <h3>{{ $t('quotePage.reviewTimeline.title') }}</h3>
            <p>{{ $t('quotePage.reviewTimeline.copy') }}</p>
          </div>
          <div class="human-review-steps">
            <article v-for="step in humanReviewSteps" :key="step.title">
              <span>{{ step.index }}</span>
              <strong>{{ step.title }}</strong>
              <p>{{ step.body }}</p>
            </article>
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
            <span>{{ displayLineItemGroup(group) }} · {{ group.customerLabel }}</span>
            <span>{{ formatPrice(group.amount) }}</span>
          </div>
          <div class="price-divider"></div>
          <div class="price-row is-total">
            <span>{{ $t('quotePage.estimatedTotal') }}</span>
            <span class="total-price">{{ formatPrice(finalTotal) }}</span>
          </div>
        </div>

        <div class="quote-trust-card" :style="cardStyle">
          <div>
            <span class="visual-kicker">{{ $t('quotePage.trustKicker') }}</span>
            <h3>{{ $t('quotePage.trustTitle') }}</h3>
            <p>{{ $t('quotePage.trustCopy') }}</p>
          </div>
          <ul>
            <li>{{ $t('quotePage.trustPointEstimate') }}</li>
            <li>{{ $t('quotePage.trustPointReview') }}</li>
            <li>{{ $t('quotePage.trustPointPayment') }}</li>
          </ul>
        </div>

        <div class="parent-faq-card" :style="cardStyle">
          <div class="pricing-explainer-header">
            <span class="visual-kicker">{{ isChineseLocale ? '家长信任说明' : 'Parent trust FAQ' }}</span>
            <h3>{{ isChineseLocale ? '提交前家长需要知道什么' : 'What parents should know before submitting' }}</h3>
            <p>
              {{ isChineseLocale
                ? '这里会清楚说明报价申请的边界：不会立即预订、不会隐藏扣款，也不会在人工复核前承诺供应商。'
                : 'This keeps the quote request honest: no instant booking, no hidden payment, and no supplier promise until the team completes human review.' }}
            </p>
          </div>
          <div class="parent-faq-grid">
            <article v-for="item in parentTrustFaq" :key="item.id">
              <strong>{{ item.question }}</strong>
              <p>{{ item.answer }}</p>
            </article>
          </div>
        </div>

        <div class="parent-proof-card" :style="cardStyle">
          <div class="pricing-explainer-header">
            <span class="visual-kicker">{{ isChineseLocale ? '家庭决策样板 · 预览数据' : 'Family decision patterns · staging samples' }}</span>
            <h3>{{ isChineseLocale ? '家长通常如何做选择' : 'How parents usually make this choice' }}</h3>
            <p>
              {{ isChineseLocale
                ? '这些是策划样板，不是真实评价。它们用于检查套餐和附加服务是否容易被家庭理解。'
                : 'These are sample planning patterns, not real testimonials. They help check whether the package and add-on story is easy for families to understand before formal launch.' }}
            </p>
          </div>
          <div class="parent-proof-grid">
            <article v-for="choice in popularFamilyChoices" :key="choice.id">
              <strong>{{ choice.title }}</strong>
              <span>{{ choice.familyProfile }}</span>
              <p>{{ choice.recommendedPackage }} · {{ choice.whyItWorks }}</p>
              <small>{{ choice.addOns.join(' / ') }}</small>
            </article>
          </div>
        </div>

        <div class="line-item-card" :style="cardStyle">
          <div class="pricing-explainer-header">
            <span class="visual-kicker">{{ $t('quotePage.lineItemsKicker') }}</span>
            <h3>{{ $t('quotePage.lineItemsTitle') }}</h3>
            <p>{{ $t('quotePage.lineItemsCopy') }}</p>
          </div>
          <div class="line-item-grid">
            <article v-for="group in lineItemSummary.groups" :key="group.type">
              <strong>{{ displayLineItemGroup(group) }}</strong>
              <span>{{ formatPrice(group.amount) }}</span>
              <p>{{ isChineseLocale ? group.description : $t('quotePage.lineItemGenericDescription') }}</p>
              <small>{{ displayAmountBasisList(group.items) }}</small>
            </article>
          </div>
          <p class="pricing-explainer-note">
            {{ isChineseLocale ? '订金准备占位' : 'Deposit readiness placeholder' }}: {{ formatPrice(lineItemSummary.deposit_placeholder) }} · {{ isChineseLocale ? '正式收取前仍需人工确认报价和支付条件。' : lineItemSummary.deposit_note }}
          </p>
        </div>

        <div class="pricing-explainer" :style="cardStyle">
          <div class="pricing-explainer-header">
            <span class="visual-kicker">{{ $t('quotePage.packageExplanationKicker') }}</span>
            <h3>{{ displayPackageExplanationLabel }} {{ $t('quotePage.packageDifference') }}</h3>
            <p>{{ displayPackageText(packageExplanation.positioning) }}</p>
          </div>
          <div class="package-comparison-card">
            <div>
              <h4>{{ $t('quotePage.packageComparison.title') }}</h4>
              <p>{{ $t('quotePage.packageComparison.copy') }}</p>
            </div>
            <div class="package-comparison-table" role="table" :aria-label="$t('quotePage.packageComparison.title')">
              <div class="comparison-row comparison-head" role="row">
                <span role="columnheader">{{ $t('quotePage.packageComparison.dimension') }}</span>
                <strong role="columnheader">{{ $t('quotePage.packageComparison.basic') }}</strong>
                <strong role="columnheader">{{ $t('quotePage.packageComparison.standard') }}</strong>
                <strong role="columnheader">{{ $t('quotePage.packageComparison.premium') }}</strong>
              </div>
              <div v-for="row in packageComparisonRows" :key="row.label" class="comparison-row" role="row">
                <span role="cell">{{ row.label }}</span>
                <p role="cell">{{ row.basic }}</p>
                <p role="cell">{{ row.standard }}</p>
                <p role="cell">{{ row.premium }}</p>
              </div>
            </div>
          </div>
          <div class="pricing-explainer-grid">
            <div>
              <h4>{{ $t('quotePage.whyRecommend') }}</h4>
              <p>{{ displayPackageText(packageExplanation.whyRecommend) }}</p>
            </div>
            <div>
              <h4>{{ $t('quotePage.priceDrivers') }}</h4>
              <ul>
                <li v-for="item in displayPackageList(packageExplanation.priceDrivers)" :key="item">{{ item }}</li>
              </ul>
            </div>
            <div>
              <h4>{{ displayPackageText(upgradeExplanation.title) }}</h4>
              <ul>
                <li v-for="item in displayPackageList(upgradeExplanation.items)" :key="item">{{ item }}</li>
              </ul>
            </div>
            <div>
              <h4>{{ $t('quotePage.customerFit') }}</h4>
              <p>{{ displayPackageText(packageExplanation.customerFit) }}</p>
            </div>
          </div>
          <p class="pricing-explainer-note">{{ displayPackageText(packageExplanation.quoteExplanation) }}</p>
        </div>
      </div>
    </section>

    <section class="visual-context-section">
      <div class="section-container">
        <h2 class="section-title" :style="titleStyle">{{ $t('quotePage.visualBasis') }}</h2>
        <div class="visual-context-card" :style="cardStyle">
          <img v-if="isChineseLocale" :src="visualContext.restaurant.image_path" :alt="visualContext.restaurant.title">
          <div v-else class="visual-placeholder-card">
            <span>🍽️</span>
            <strong>{{ $t('ai.restaurantPlaceholderTitle') }}</strong>
          </div>
          <div class="visual-context-copy">
            <span class="visual-kicker">{{ isChineseLocale ? visualContext.restaurant.title : $t('ai.restaurantPlaceholderTitle') }}</span>
            <p>{{ isChineseLocale ? visualContext.packageVisual.scope : $t('ai.restaurantPlaceholderCopy') }}</p>
            <dl>
              <div>
                <dt>{{ $t('quotePage.suitableAge') }}</dt>
                <dd>{{ isChineseLocale ? `${visualContext.packageVisual.suitableAge} 岁` : $t('ai.ageRange') }}</dd>
              </div>
              <div>
                <dt>{{ $t('quotePage.recommendedVenue') }}</dt>
                <dd>{{ isChineseLocale ? `${displayVenueName(visualContext.primaryVenue.name)} · ${visualContext.primaryVenue.capacity}` : $t('quotePage.sampleRoom') }}</dd>
              </div>
              <div>
                <dt>{{ $t('quotePage.supplierSuggestions') }}</dt>
                <dd>{{ isChineseLocale ? visualContext.suppliers.map((item) => item.name).join(' / ') : $t('ai.supplier') }}</dd>
              </div>
              <div>
                <dt>{{ $t('quotePage.quoteBasis') }}</dt>
                <dd>{{ isChineseLocale ? visualContext.restaurant.decorationLayer : $t('quotePage.visualBasisCopy') }}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div v-if="partySceneConfig" class="scene-config-card" :style="cardStyle">
          <span class="visual-kicker">{{ $t('quotePage.sceneConfigKicker') }} · {{ partySceneConfig.version }}</span>
          <h3>{{ $t('customerPages.sceneConfig') }}</h3>
          <dl>
            <div>
              <dt>{{ isChineseLocale ? '空间布局' : 'Layout' }}</dt>
              <dd>{{ partySceneConfig.layout.tables }} tables · {{ partySceneConfig.layout.chairs }} chairs · dessert {{ partySceneConfig.layout.dessertTable }} · photo {{ partySceneConfig.layout.photoZone }}</dd>
            </div>
            <div>
              <dt>{{ isChineseLocale ? '布置元素' : 'Decor' }}</dt>
              <dd>{{ partySceneConfig.decor.tablecloth }} / {{ partySceneConfig.decor.balloons }} / {{ partySceneConfig.decor.backdropStyle }} / {{ partySceneConfig.decor.lighting }}</dd>
            </div>
            <div>
              <dt>{{ isChineseLocale ? '供应商' : 'Suppliers' }}</dt>
              <dd>{{ partySceneConfig.suppliers.map((item) => `${item.categoryLabel || item.category}: ${item.name}`).join(' / ') }}</dd>
            </div>
            <div v-if="featureFlags.threeDExperienceEnabled">
              <dt>{{ isChineseLocale ? '未来 3D 数据' : 'Future 3D' }}</dt>
              <dd>{{ partySceneConfig.future3d.suggestedRoute }} · {{ partySceneConfig.future3d.layoutCoordinateSystem }}</dd>
            </div>
          </dl>
          <button v-if="featureFlags.threeDExperienceEnabled" class="scene-preview-btn" type="button" @click="openParty3DPreview">
            {{ $t('quotePage.view3dPreview') }}
          </button>
          <p v-else class="scene-preview-note">{{ isChineseLocale ? '当前消费者预览中暂时隐藏 3D / 场景预览入口。' : '3D / scene preview is temporarily hidden in this customer preview.' }}</p>
        </div>
      </div>
    </section>

    <!-- 附加项 -->
    <section class="addons-section">
      <div class="section-container">
        <h2 class="section-title" :style="titleStyle">{{ $t('quotePage.optionalAddons') }}</h2>
        <p class="addons-lead">{{ $t('quotePage.addonsLead') }}</p>
        <div class="addon-value-story-panel">
          <div class="pricing-explainer-header">
            <span class="visual-kicker">{{ isChineseLocale ? '附加服务价值说明 · 预览' : 'Add-on value guide · staging' }}</span>
            <h3>{{ isChineseLocale ? '为什么家长会在选场地后增加服务' : 'Why families add services after choosing a venue' }}</h3>
            <p>
              {{ isChineseLocale
                ? '这些卡片用家长能理解的语言解释附加服务价值。它们是策划样例，不是供应商承诺；最终是否加入仍需人工复核。'
                : 'These cards explain the commercial value in parent language. They are planning examples, not supplier commitments; final inclusion still needs human review.' }}
            </p>
          </div>
          <div class="addon-value-story-grid">
            <article
              v-for="story in addOnValueStories"
              :key="story.id"
              class="addon-value-story"
              :class="`tone-${story.visualTone}`"
            >
              <span class="story-visual">{{ story.services.map((service) => service.icon).join(' ') }}</span>
              <div>
                <small>{{ story.text.subtitle }}</small>
                <h4>{{ story.text.title }}</h4>
                <dl>
                  <div>
                    <dt>{{ isChineseLocale ? '加入前' : 'Before' }}</dt>
                    <dd>{{ story.text.before }}</dd>
                  </div>
                  <div>
                    <dt>{{ isChineseLocale ? '加入后' : 'After' }}</dt>
                    <dd>{{ story.text.after }}</dd>
                  </div>
                </dl>
                <p>{{ displayPackageText(story.text.proofPoint) }}</p>
                <div class="story-services">
                  <button
                    v-for="service in story.services"
                    :key="service.id"
                    type="button"
                    :class="{ 'is-selected': selectedAddons.includes(service.id) }"
                    @click="toggleAddon(service)"
                  >
                    {{ service.text.name }} · +{{ formatPrice(service.price) }}
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
        <div v-if="recommendedVenueAddons.length" class="recommended-addon-panel">
          <div>
            <span class="visual-kicker">{{ isChineseLocale ? '场地匹配附加服务建议' : 'Venue Finder add-on suggestions' }}</span>
            <h3>{{ isChineseLocale ? '适合这个场地的高价值服务' : 'High-value services that fit this venue' }}</h3>
            <p>
              {{ isChineseLocale
                ? '这些服务不会自动加入报价。它们帮助家长理解人工确认场地规则和供应商档期后，派对可以在哪些地方升级。'
                : 'These are not automatically added. They help parents understand where the party can be upgraded after a human review confirms venue rules and supplier availability.' }}
            </p>
          </div>
          <div class="recommended-addon-list">
            <button
              v-for="addon in recommendedVenueAddons"
              :key="addon.id"
              type="button"
              :class="{ 'is-selected': selectedAddons.includes(addon.id) }"
              @click="toggleAddon(addon)"
            >
              <span>{{ addon.icon }} {{ addon.name }}</span>
              <small>{{ addon.customerValue }}</small>
              <strong>+{{ formatPrice(addon.price) }}</strong>
            </button>
          </div>
        </div>
        <div v-if="selectedAddons.length > 0" class="addons-subtotal">
          {{ $t('quotePage.selectedAddons', { count: selectedAddons.length, total: formatPrice(addonsTotal) }) }}
        </div>
        <div class="addon-group-list">
          <article v-for="group in addonGroups" :key="group.id" class="addon-group">
            <header>
              <span class="addon-group-icon">{{ group.icon }}</span>
              <div>
                <h3>{{ group.text.title }}</h3>
                <p>{{ group.text.subtitle }}</p>
              </div>
            </header>
            <div class="addons-grid">
              <button
                v-for="addon in group.items"
                :key="addon.id"
                type="button"
                class="addon-card"
                :class="{ 'is-selected': selectedAddons.includes(addon.id) }"
                @click="toggleAddon(addon)"
              >
                <div class="addon-icon">{{ addon.icon }}</div>
                <div class="addon-info">
                  <span class="addon-name">{{ addon.name }}</span>
                  <span class="addon-description">{{ addon.description }}</span>
                  <small>{{ addon.customerValue }}</small>
                </div>
                <div class="addon-price-wrap">
                  <span class="addon-price">+{{ formatPrice(addon.price) }}</span>
                  <div v-if="selectedAddons.includes(addon.id)" class="addon-check">✓</div>
                </div>
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- 恢复方案提示 -->
    <div v-if="restoredFromSave" class="restore-notice">
      <span class="restore-icon">↺</span>
      <span>{{ $t('quotePage.restoredNotice') }}</span>
    </div>

    <!-- 保存成功提示 -->
    <div v-if="saveSuccess" class="save-success">
      <span class="success-icon">✓</span>
      <span>{{ $t('quotePage.savedNotice', { total: formatPrice(finalTotal) }) }}</span>
    </div>

    <!-- 提交成功提示 -->
    <div v-if="submitSuccess" class="submit-success">
      <span class="success-icon">✓</span>
      <span>{{ submitMessage }}</span>
    </div>

    <section v-if="submittedNextSteps" class="post-inquiry-section">
      <div class="section-container">
        <div class="post-inquiry-card" :style="cardStyle">
          <span class="visual-kicker">{{ $t('quotePage.inquiryReceivedKicker') }}</span>
          <h2>{{ submittedNextSteps.title }}</h2>
          <p>{{ submittedNextSteps.summary }}</p>
          <ul>
            <li v-for="item in submittedNextSteps.items" :key="item">{{ item }}</li>
          </ul>
          <div class="post-inquiry-actions">
            <button class="btn-secondary" @click="$router.push('/my/quotes')">{{ $t('nav.myQuotes') }}</button>
            <button class="btn-secondary" @click="$router.push('/my/orders')">{{ $t('nav.myOrders') }}</button>
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
            {{ isSaving ? $t('quotePage.saving') : $t('quotePage.savePlan') }}
          </button>
          <button class="btn-primary" @click="showInquiryForm">
            {{ $t('quotePage.submitInquiry') }} →
          </button>
        </div>
      </div>
    </section>

    <!-- 咨询表单弹窗 -->
    <div v-if="showForm" class="form-overlay" @click.self="hideInquiryForm">
      <div class="inquiry-form" :style="formStyle">
        <div class="form-header">
          <h3>{{ $t('quotePage.submitInquiry') }}</h3>
          <button class="close-btn" @click="hideInquiryForm">×</button>
        </div>
        <div class="form-body">
          <div class="form-group">
            <label>{{ $t('quotePage.contactName') }} *</label>
            <input v-model="inquiryForm.name" type="text" :placeholder="$t('quotePage.contactNamePlaceholder')" required />
          </div>
          <div class="form-group">
            <label>{{ $t('quotePage.contactMethod') }} *</label>
            <input v-model="inquiryForm.contact" type="text" :placeholder="$t('quotePage.contactMethodPlaceholder')" required />
          </div>
          <div class="form-group">
            <label>{{ $t('quotePage.eventDate') }} *</label>
            <input v-model="inquiryForm.date" type="date" required />
          </div>
          <div class="form-group">
            <label>{{ $t('quotePage.notes') }}</label>
            <textarea v-model="inquiryForm.notes" rows="3" :placeholder="$t('quotePage.notesPlaceholder')"></textarea>
          </div>
          <div class="form-group">
            <label>{{ $t('quotePage.foodNotes') }}</label>
            <textarea v-model="inquiryForm.foodNotes" rows="2" :placeholder="$t('quotePage.foodNotesPlaceholder')"></textarea>
          </div>
          <div class="form-group">
            <label>{{ $t('quotePage.allergyNotes') }}</label>
            <textarea v-model="inquiryForm.allergyNotes" rows="2" :placeholder="$t('quotePage.allergyNotesPlaceholder')"></textarea>
          </div>
          <div class="form-group">
            <label>{{ $t('quotePage.culturalRequirements') }}</label>
            <textarea v-model="inquiryForm.culturalRequirements" rows="2" :placeholder="$t('quotePage.culturalRequirementsPlaceholder')"></textarea>
          </div>
          <div class="form-group">
            <label>{{ $t('quotePage.cakeNeeds') }}</label>
            <textarea v-model="inquiryForm.cakeNeeds" rows="2" :placeholder="$t('quotePage.cakeNeedsPlaceholder')"></textarea>
          </div>
          <div class="form-group">
            <label>{{ $t('quotePage.parentPriorities') }}</label>
            <textarea v-model="inquiryForm.parentPriorities" rows="2" :placeholder="$t('quotePage.parentPrioritiesPlaceholder')"></textarea>
          </div>
          <div class="form-summary">
            <span>{{ $t('quotePage.estimatedTotal') }}:</span>
            <strong>{{ formatPrice(finalTotal) }}</strong>
          </div>
        </div>
        <div class="form-footer">
          <button class="btn-cancel" @click="hideInquiryForm">{{ $t('nav.cancel') }}</button>
          <button class="btn-submit" @click="submitInquiryForm" :disabled="isSubmittingInquiry">
            {{ isSubmittingInquiry ? $t('quotePage.submitting') : $t('nav.confirm') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 提示信息 -->
    <div class="notice">
      <p>{{ $t('quotePage.noticeEstimate') }}</p>
      <p>{{ $t('quotePage.noticeFollowup') }}</p>
    </div>
  </div>
</template>

<script>
import { getTheme } from '@/themes';
import { getVisualContext } from '@/data/visualAssets';
import { getPackageExplanation, getUpgradeExplanation } from '@/data/packageExplanation';
import { buildQuoteLineItemsFromSelection, summarizeQuoteLineItems } from '@/data/quoteLineItems';
import {
  getAddOnServiceById,
  getAddOnServiceGroups,
  getAddOnServices,
  getAddOnValueStories,
  summarizeSelectedAddOns
} from '@/data/addOnServices';
import { getVenueOperationalReadiness } from '@/data/supplierVenueImportTemplate';
import { getParentTrustFaq } from '@/data/parentTrustContent';
import { getPopularFamilyChoices } from '@/data/parentSocialProof';
import { readQuotePrefill } from '@/services/aiVoiceIntakeService';
import { writePartySceneConfig } from '@/services/partyScenePreviewService';
import { buildVenueFinderQuotePrefill, readVenueFinderQuotePrefill } from '@/services/venueFinderService';
import { featureFlags } from '@/config/featureFlags';

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
        notes: '',
        foodNotes: '',
        allergyNotes: '',
        culturalRequirements: '',
        cakeNeeds: '',
        parentPriorities: ''
      },
      restoredFromSave: false,
      submitSuccess: false,
      submitError: false,
      submitMessage: '',
      isSubmittingInquiry: false,
      submittedNextSteps: null,
      aiPrefill: null,
      venueFinderPrefill: null,
      quoteSource: this.$route.query.source || 'web_quote'
    };
  },
  
  computed: {
    aiExperienceEnabled() {
      return featureFlags.aiExperienceEnabled;
    },

    themeConfig() {
      return getTheme(this.themeId);
    },

    isChineseLocale() {
      return this.$i18n.locale === 'zh';
    },

    pageStyle() {
      return {};
    },

    titleStyle() {
      return {};
    },

    cardStyle() {
      return {};
    },

    selectionItemStyle() {
      return {};
    },

    formStyle() {
      return {};
    },
    
    sceneData() {
      const scenes = {
        space: {
          'restaurant-a': { name: this.$t('quotePage.scenes.restaurantA'), icon: '🍽️', basePrice: 2600 },
          command: { name: this.$t('quotePage.scenes.command'), icon: '🚀', basePrice: 2800 },
          moon: { name: this.$t('quotePage.scenes.moon'), icon: '🌙', basePrice: 3200 },
          observatory: { name: this.$t('quotePage.scenes.observatory'), icon: '🔭', basePrice: 2500 }
        },
        castle: {
          'restaurant-a': { name: this.$t('quotePage.scenes.restaurantA'), icon: '🍽️', basePrice: 2800 },
          banquet: { name: this.$t('quotePage.scenes.banquet'), icon: '👑', basePrice: 3500 },
          garden: { name: this.$t('quotePage.scenes.garden'), icon: '🌹', basePrice: 2800 },
          tower: { name: this.$t('quotePage.scenes.tower'), icon: '🏰', basePrice: 3000 }
        },
        forest: {
          'restaurant-a': { name: this.$t('quotePage.scenes.restaurantA'), icon: '🍽️', basePrice: 2400 },
          clearing: { name: this.$t('quotePage.scenes.clearing'), icon: '🌲', basePrice: 2200 },
          treehouse: { name: this.$t('quotePage.scenes.treehouse'), icon: '🏕️', basePrice: 3800 },
          firefly: { name: this.$t('quotePage.scenes.firefly'), icon: '✨', basePrice: 2600 }
        }
      };
      return (scenes[this.themeId] || scenes.space)[this.sceneId] || { name: this.$t('quotePage.scenes.unknown'), icon: '❓', basePrice: 0 };
    },
    
    packageData() {
      const basePrice = this.sceneData.basePrice;
      const multiplier = this.themeId === 'castle' ? 1.1 : this.themeId === 'forest' ? 0.9 : 1;
      
      const packages = {
        basic: { 
          name: this.$t('quotePage.packages.basic.name'), 
          icon: '🎈', 
          description: this.$t('quotePage.packages.basic.description'),
          price: Math.round(basePrice * 0.3 * multiplier)
        },
        standard: { 
          name: this.$t('quotePage.packages.standard.name'), 
          icon: '🎉', 
          description: this.$t('quotePage.packages.standard.description'),
          price: Math.round(basePrice * 0.55 * multiplier)
        },
        premium: { 
          name: this.$t('quotePage.packages.premium.name'), 
          icon: '👑', 
          description: this.$t('quotePage.packages.premium.description'),
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

    displayPackageExplanationLabel() {
      return this.isChineseLocale ? this.packageExplanation.labelZh : this.packageData.name;
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
        body: this.$t('quotePage.aiPrefillBody')
      };
    },

    aiQuoteReadySummary() {
      return this.aiPrefill?.quote_ready_summary
        || this.aiPrefill?.aiRecommendation?.quote_ready_summary
        || null;
    },

    venueFinderVisual() {
      if (!this.venueFinderPrefill) return null;
      const selectedVenue = this.venueFinderPrefill.venueFinder?.selectedVenue || {};
      const selection = this.venueFinderPrefill.selection || {};
      const customerInfo = this.venueFinderPrefill.customerInfo || {};
      const image = selectedVenue.image
        || selection.venueLayoutImage
        || this.visualContext.restaurant.image_path;
      const venueName = selection.venueName || selectedVenue.name || this.visualContext.primaryVenue.name;
      const guests = customerInfo.guestCount || selectedVenue.capacityMax || this.visualContext.primaryVenue.capacity;
      const theme = selection.themeName || this.themeConfig.name;
      const packageName = selection.packageName || this.packageData.name;
      const area = customerInfo.area || selectedVenue.suburb || 'Selected suburb';
      const budget = customerInfo.budgetRange || selectedVenue.priceRange || 'Staging estimate';

      return {
        image,
        venueName,
        guests,
        theme,
        package: packageName,
        area,
        budget,
        summary: this.isChineseLocale
          ? `${this.displayVenueName(venueName)} 已作为 ${guests} 位客人的场地样板带入报价页。当前只保留场地、主题、套餐、区域和预算上下文，不会创建真实预订或支付。`
          : `${venueName} is selected from Venue Finder as a demo/staging venue for ${guests} guests. The quote request keeps the venue, theme, package, area, and budget context together without creating a real booking or payment.`
      };
    },

    venueFinderOps() {
      const verification = this.venueFinderPrefill?.venueFinder?.verification;
      if (verification) {
        return {
          foodOptions: verification.foodOptions?.length ? verification.foodOptions : ['Food options require manual confirmation'],
          allergyNotes: verification.allergyNotes?.length ? verification.allergyNotes : ['Allergy handling requires manual confirmation'],
          culturalFitNotes: verification.culturalFitNotes?.length ? verification.culturalFitNotes : ['Cultural or religious requirements require manual confirmation'],
          dietaryTags: verification.dietaryTags?.length ? verification.dietaryTags : [],
          roomHireHint: verification.roomHireHint || 'Room hire requires manual confirmation',
          minimumSpendHint: verification.minimumSpendHint || 'Minimum spend requires manual confirmation',
          verificationStatus: verification.status || 'manual_review_required'
        };
      }
      return getVenueOperationalReadiness(this.venueFinderPrefill?.venueFinder?.selectedVenue || {});
    },

    venueFinderVerification() {
      return this.venueFinderPrefill?.venueFinder?.verification || null;
    },

    quoteFlowSummary() {
      const source = this.venueFinderPrefill
        ? (this.isChineseLocale ? '场地筛选已带入' : 'Venue Finder selected')
        : this.aiPrefill && this.aiExperienceEnabled
          ? this.$t('quotePage.aiPrepared')
          : this.$t('quotePage.currentPlan');
      const venueName = this.displayVenueName(this.aiPrefill?.selection?.venueName || this.visualContext.primaryVenue.name);
      return {
        title: `${source}: ${this.displayThemeText(this.themeConfig.name)} · ${this.displayPackageText(this.packageData.name)} · ${venueName}`,
        body: this.$t('quotePage.flowBody')
      };
    },
    
    addonsTotal() {
      return this.selectedAddOnSummary.total;
    },

    selectedAddOnSummary() {
      return summarizeSelectedAddOns(this.selectedAddons, this.$i18n.locale);
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

    humanReviewSteps() {
      return [1, 2, 3, 4].map((index) => ({
        index,
        title: this.$t(`quotePage.reviewTimeline.step${index}.title`),
        body: this.$t(`quotePage.reviewTimeline.step${index}.body`)
      }));
    },

    packageComparisonRows() {
      return ['visual', 'included', 'bestFor', 'ageGuests', 'priceRange', 'upgrade'].map((key) => ({
        label: this.$t(`quotePage.packageComparison.rows.${key}.label`),
        basic: this.$t(`quotePage.packageComparison.rows.${key}.basic`),
        standard: this.$t(`quotePage.packageComparison.rows.${key}.standard`),
        premium: this.$t(`quotePage.packageComparison.rows.${key}.premium`)
      }));
    },

    finalTotal() {
      return this.lineItemSummary.total;
    },
    
    addons() {
      return getAddOnServices(this.$i18n.locale).map((addon) => ({
        ...addon,
        name: addon.text.name,
        description: addon.text.short,
        amount_basis: addon.text.basis,
        customer_explanation: addon.text.customerValue,
        customerValue: addon.text.customerValue,
        admin_edit_hint: `${addon.marginRole}; confirm local supplier availability and customer approval before formal quote.`
      }));
    },

    addonGroups() {
      const services = this.addons;
      return getAddOnServiceGroups(this.$i18n.locale)
        .map((group) => ({
          ...group,
          items: services.filter((addon) => addon.group === group.id)
        }))
        .filter((group) => group.items.length > 0);
    },

    addOnValueStories() {
      return getAddOnValueStories(this.$i18n.locale);
    },

    recommendedVenueAddons() {
      const suggestions = this.venueFinderPrefill?.venueFinder?.recommendedAddons
        || this.venueFinderPrefill?.selection?.addonSuggestions
        || [];
      return suggestions
        .map((item) => getAddOnServiceById(item.id, this.$i18n.locale))
        .filter(Boolean)
        .map((addon) => ({
          ...addon,
          name: addon.text.name,
          description: addon.text.short,
          customerValue: addon.text.customerValue
        }));
    },

    parentTrustFaq() {
      if (this.isChineseLocale) {
        return [
          {
            id: 'manual-review',
            question: '这是即时预订吗？',
            answer: '不是。这个页面帮助家长比较场地、主题、套餐和附加服务。正式报价前，团队仍会人工核对场地规则、供应商档期、餐饮和过敏说明。'
          },
          {
            id: 'payment-readiness',
            question: '提交报价需求会被扣款吗？',
            answer: '不会。提交咨询单不会触发支付。订金步骤只会在正式报价经过复核并被接受后才有意义。'
          },
          {
            id: 'venue-data',
            question: '这些场地信息是最终保证吗？',
            answer: '当前场地数据用于本地 / 预览演示。容量、包间费、最低消费、切蛋糕费、餐饮选项和过敏处理都需要在正式报价前和场地方确认。'
          },
          {
            id: 'addons',
            question: '为什么附加服务要单独列出来？',
            answer: '布置、搭建、主持、音响、娱乐、蛋糕、摄影和清洁等都是可选服务。单独展示可以让家长清楚知道钱花在哪里，而不是藏在一个模糊套餐里。'
          },
          {
            id: 'share-rewards',
            question: '分享奖励现在是真实优惠券吗？',
            answer: '在当前预览中，奖励仍是占位说明。未来正式版本可在人工审核后提供固定金额券、免费气球升级或免费拍照角升级。'
          }
        ];
      }
      return getParentTrustFaq();
    },

    popularFamilyChoices() {
      if (this.isChineseLocale) {
        return [
          {
            id: 'standard-30-guests',
            title: '多数家庭的实用起点',
            familyProfile: '25-35 人 · 中等预算 · 餐厅 / 包间',
            recommendedPackage: '标准套餐',
            addOns: ['布置 / 撤场', '蛋糕或甜品台', '拍照角'],
            whyItWorks: '基础套餐范围清楚，同时加入家长最常需要的省心服务。'
          },
          {
            id: 'basic-budget-control',
            title: '控制预算路线',
            familyProfile: '15-25 人 · 简单场地 · 较低预算',
            recommendedPackage: '基础套餐',
            addOns: ['气球小组合', '简单蛋糕桌'],
            whyItWorks: '适合只需要整洁布置、不想承担高额造型费用的家庭。'
          },
          {
            id: 'premium-visual-event',
            title: '强视觉照片路线',
            familyProfile: '30-50 人 · 重要生日 · 更高视觉期待',
            recommendedPackage: '高级套餐',
            addOns: ['主持 / 现场引导', '拍照区', '摄影'],
            whyItWorks: '适合希望派对更精致、更适合分享和留念的家庭。'
          }
        ];
      }
      return getPopularFamilyChoices();
    }
  },
  
  methods: {
    formatPrice(price) {
      return '$' + price.toLocaleString();
    },

    displayLineItemGroup(group) {
      return this.isChineseLocale ? group.labelZh : group.customerLabel;
    },

    displayVenueName(name) {
      if (!this.isChineseLocale) return name;
      return String(name || '')
        .replaceAll('Restaurant A Private Dining', '餐厅 A 私人包间')
        .replaceAll('Restaurant A private dining', '餐厅 A 私人包间')
        .replaceAll('Restaurant A', '餐厅 A')
        .replaceAll('Private Dining', '私人包间')
        .replaceAll('Selected suburb', '待确认区域')
        .replaceAll('Staging estimate', '预览估算');
    },

    displayThemeText(text) {
      if (!this.isChineseLocale) return text;
      return String(text || '')
        .replaceAll('Space Explorer', '星际探险')
        .replaceAll('Castle Princess', '梦幻城堡')
        .replaceAll('Forest Adventure', '森林奇境');
    },

    displayPackageText(text) {
      if (!this.isChineseLocale) return String(text || '');
      return String(text || '')
        .replaceAll('Basic', '基础套餐')
        .replaceAll('Standard', '标准套餐')
        .replaceAll('Premium', '高级套餐');
    },

    displayPackageList(items) {
      return this.isChineseLocale ? items.map((item) => this.displayPackageText(item)) : [
        this.$t('quotePage.localizedPackagePoint1'),
        this.$t('quotePage.localizedPackagePoint2')
      ];
    },

    displayAmountBasisList(items = []) {
      const text = items.map((item) => item.amount_basis).filter(Boolean).join(' / ');
      return this.displayTechnicalBasisText(text);
    },

    displayTechnicalBasisText(text) {
      const normalized = this.displayPackageText(text);
      if (!this.isChineseLocale) return normalized;
      return String(normalized || '')
        .replace(/Scene base\s*([\d,.]+)\s*x\s*10% staging venue placeholder\./gi, '场地基础价 $1 的 10% 作为预览场地占位。')
        .replace(/基础套餐 x\s*([\d,.]+)% decor allocation\./gi, '基础套餐的 $1% 计入主题装饰预估。')
        .replace(/标准套餐 x\s*([\d,.]+)% decor allocation\./gi, '标准套餐的 $1% 计入主题装饰预估。')
        .replace(/高级套餐 x\s*([\d,.]+)% decor allocation\./gi, '高级套餐的 $1% 计入主题装饰预估。')
        .replace(/基础套餐 x\s*([\d,.]+)% supplier allowance\./gi, '基础套餐的 $1% 计入供应商服务预估。')
        .replace(/标准套餐 x\s*([\d,.]+)% supplier allowance\./gi, '标准套餐的 $1% 计入供应商服务预估。')
        .replace(/高级套餐 x\s*([\d,.]+)% supplier allowance\./gi, '高级套餐的 $1% 计入供应商服务预估。')
        .replace(/基础套餐 x\s*([\d,.]+)% labor allocation\./gi, '基础套餐的 $1% 计入现场人工预估。')
        .replace(/标准套餐 x\s*([\d,.]+)% labor allocation\./gi, '标准套餐的 $1% 计入现场人工预估。')
        .replace(/高级套餐 x\s*([\d,.]+)% labor allocation\./gi, '高级套餐的 $1% 计入现场人工预估。')
        .replace('High package tier transport placeholder.', '高档套餐运输与搬运占位预估。')
        .replace('标准套餐 package transport placeholder.', '标准套餐运输与搬运占位预估。')
        .replace('基础套餐 package transport placeholder.', '基础套餐运输与搬运占位预估。')
        .replace('Residual package amount after decor, supplier, labor, and transport allocations.', '扣除装饰、供应商、人工和运输后的剩余部分计入策划服务。')
        .replace('Explicit customer-selected optional upgrade.', '客户主动选择的可选升级项。');
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
      if (!featureFlags.threeDExperienceEnabled) return;
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

    buildIntakeNotes(customerInfo = {}) {
      const sections = [
        ['Notes', customerInfo.notes],
        ['Food / catering', customerInfo.foodNotes],
        ['Allergy / dietary', customerInfo.allergyNotes],
        ['Cultural / religious requirements', customerInfo.culturalRequirements],
        ['Cake / dessert', customerInfo.cakeNeeds],
        ['Parent priorities', customerInfo.parentPriorities]
      ].filter(([, value]) => value && String(value).trim());

      if (!sections.length) {
        return null;
      }

      return sections.map(([label, value]) => `${label}: ${String(value).trim()}`).join('\n');
    },

    buildLeadPayloadFromInquiry(inquiryData) {
      return {
        customer: {
          name: inquiryData.customerInfo.name,
          contact: inquiryData.customerInfo.contact
        },
        preferred_event_date: inquiryData.customerInfo.preferredDate || null,
        intake_notes: this.buildIntakeNotes(inquiryData.customerInfo),
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
        this.submitMessage = this.$t('quotePage.requiredError');
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
          foodNotes: this.inquiryForm.foodNotes,
          allergyNotes: this.inquiryForm.allergyNotes,
          culturalRequirements: this.inquiryForm.culturalRequirements,
          cakeNeeds: this.inquiryForm.cakeNeeds,
          parentPriorities: this.inquiryForm.parentPriorities,
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
          addonSuggestions: this.recommendedVenueAddons.map((addon) => ({
            id: addon.id,
            group: addon.group,
            name: addon.name,
            price: addon.price,
            customerValue: addon.customerValue
          })),
          addons: this.selectedAddons.map(id => {
            const addon = this.addons.find(a => a.id === id);
            return {
              id,
              group: addon?.group,
              name: addon?.name,
              price: addon?.price,
              description: addon?.description,
              customerValue: addon?.customerValue,
              amount_basis: addon?.amount_basis
            };
          }),
          addonServiceSummary: this.selectedAddOnSummary
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
          this.submitMessage = this.$t('quotePage.backendSaved', { id: backendLead.id });
        } else if (backendSyncFailed) {
          this.submitMessage = this.$t('quotePage.localSavedBackendFailed');
        } else {
          this.submitMessage = this.$t('quotePage.submitSuccess');
        }
        this.submittedNextSteps = this.buildPostInquiryNextSteps(backendLead, backendSyncFailed);
        this.showForm = false;

        // 重置表单
        this.inquiryForm = {
          name: '',
          contact: '',
          date: '',
          notes: '',
          foodNotes: '',
          allergyNotes: '',
          culturalRequirements: '',
          cakeNeeds: '',
          parentPriorities: ''
        };

        // 3秒后隐藏成功提示
        setTimeout(() => {
          this.submitSuccess = false;
        }, 5000);

        console.log('咨询已提交:', inquiryData);
      } catch (error) {
        this.submitError = true;
        this.submitMessage = this.$t('quotePage.submitFailure');
        console.error('咨询保存失败:', error);
      } finally {
        this.isSubmittingInquiry = false;
      }
    },

    buildPostInquiryNextSteps(backendLead, backendSyncFailed) {
      const syncLine = backendLead?.id
        ? this.$t('quotePage.syncRecorded', { id: backendLead.id })
        : backendSyncFailed
          ? this.$t('quotePage.syncFailed')
          : this.$t('quotePage.localSaved');

      return {
        title: this.$t('quotePage.receivedTitle'),
        summary: this.$t('quotePage.receivedSummary'),
        items: [
          this.$t('quotePage.receivedItem1'),
          this.$t('quotePage.receivedItem2'),
          this.$t('quotePage.receivedItem3'),
          this.$t('quotePage.receivedItem4'),
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
      if (!prefill || !['ai', 'ai_concierge'].includes(this.$route.query.source)) {
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
        notes: prefill.customerInfo?.notes || '',
        foodNotes: prefill.customerInfo?.foodNotes || '',
        allergyNotes: prefill.customerInfo?.allergyNotes || '',
        culturalRequirements: prefill.customerInfo?.culturalRequirements || '',
        cakeNeeds: prefill.customerInfo?.cakeNeeds || '',
        parentPriorities: prefill.customerInfo?.parentPriorities || ''
      };
      this.showForm = true;
    },

    applyVenueFinderPrefill() {
      if (this.$route.query.source !== 'venue_finder') {
        return;
      }
      const prefill = readVenueFinderQuotePrefill()
        || buildVenueFinderQuotePrefill(this.$route.query.venue, {
          area: this.$route.query.area,
          adults: this.$route.query.adults || 10,
          kids: this.$route.query.kids || 20,
          budgetPerPerson: this.$route.query.budget || '25_45',
          radiusKm: this.$route.query.radius || 5,
          halalFriendly: this.$route.query.halal === '1',
          noPorkFriendly: this.$route.query.noPork === '1',
          noAlcoholFriendly: this.$route.query.noAlcohol === '1',
          vegetarianFriendly: this.$route.query.vegetarian === '1',
          egglessCakeFriendly: this.$route.query.egglessCake === '1',
          allergyAware: this.$route.query.allergyAware === '1',
          privateFamilyArea: this.$route.query.privateFamilyArea === '1'
        });
      if (!prefill) return;

      this.venueFinderPrefill = prefill;
      this.aiPrefill = prefill;
      this.quoteSource = 'venue_finder';
      this.themeId = this.$route.query.theme || prefill.selection?.themeId || this.themeId;
      this.sceneId = this.$route.query.scene || prefill.selection?.sceneId || 'restaurant-a';
      this.packageId = this.$route.query.package || prefill.selection?.packageId || this.packageId;
      this.inquiryForm = {
        name: '',
        contact: '',
        date: prefill.customerInfo?.preferredDate || '',
        notes: prefill.customerInfo?.notes || '',
        foodNotes: prefill.customerInfo?.foodNotes || '',
        allergyNotes: prefill.customerInfo?.allergyNotes || '',
        culturalRequirements: prefill.customerInfo?.culturalRequirements || '',
        cakeNeeds: prefill.customerInfo?.cakeNeeds || '',
        parentPriorities: prefill.customerInfo?.parentPriorities || ''
      };
      this.showForm = false;
    }
  },

  mounted() {
    this.applyAiConciergePrefill();
    this.applyVenueFinderPrefill();
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

.venue-prefill-notice .section-container {
  max-width: 1100px;
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

.venue-prefill-card {
  display: grid;
  grid-template-columns: minmax(240px, 0.9fr) minmax(0, 1.1fr);
  gap: 18px;
  align-items: stretch;
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(125, 211, 252, 0.34);
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.2), rgba(37, 99, 235, 0.12)),
    rgba(255, 255, 255, 0.08);
}

.venue-prefill-media {
  position: relative;
  min-height: 220px;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid rgba(226, 232, 240, 0.24);
  background: rgba(15, 23, 42, 0.24);
}

.venue-prefill-media img {
  width: 100%;
  height: 100%;
  min-height: 220px;
  object-fit: cover;
  display: block;
}

.venue-prefill-media span {
  position: absolute;
  left: 12px;
  top: 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.78);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 900;
  padding: 6px 10px;
}

.venue-prefill-copy {
  display: grid;
  align-content: center;
  gap: 10px;
}

.venue-prefill-copy h2 {
  margin: 0;
  color: #fff;
  font-size: clamp(1.35rem, 3vw, 2rem);
}

.venue-prefill-copy p {
  margin: 0;
  color: rgba(255, 255, 255, 0.84);
  line-height: 1.65;
}

.venue-prefill-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 4px;
}

.venue-prefill-stats div {
  border: 1px solid rgba(226, 232, 240, 0.2);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.22);
  padding: 10px;
}

.venue-prefill-stats small {
  display: block;
  color: #bae6fd;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.venue-prefill-stats strong {
  display: block;
  margin-top: 4px;
  color: #fff;
}

.venue-ops-notes {
  display: grid;
  gap: 6px;
  margin-top: 2px;
  padding: 12px;
  border: 1px solid rgba(254, 215, 170, 0.38);
  border-radius: 12px;
  background: rgba(67, 56, 202, 0.22);
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.88rem;
  line-height: 1.45;
}

.venue-ops-notes strong {
  color: #fed7aa;
}

.venue-verification-panel {
  display: grid;
  gap: 12px;
  margin-top: 12px;
  padding: 14px;
  border: 1px solid rgba(125, 211, 252, 0.35);
  border-radius: 14px;
  background: rgba(8, 47, 73, 0.32);
  color: rgba(255, 255, 255, 0.9);
}

.venue-verification-panel h3 {
  margin: 4px 0 6px;
  color: #fff7ed;
  font-size: 1rem;
}

.venue-verification-panel p {
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.55;
}

.venue-verification-panel ul {
  display: grid;
  gap: 6px;
  margin: 0;
  padding-left: 18px;
}

.venue-source-note a {
  color: #bfdbfe;
  font-weight: 800;
  word-break: break-word;
}

.ai-summary-grid {
  margin-top: 8px;
  padding: 14px;
  border: 1px solid rgba(196, 181, 253, 0.32);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.22);
}

.ai-summary-grid span {
  display: block;
  margin-bottom: 6px;
  color: #ddd6fe;
  font-weight: 900;
}

.ai-summary-grid p {
  margin: 0 0 8px;
  line-height: 1.6;
}

.ai-summary-grid ul {
  margin: 0;
  padding-left: 18px;
  line-height: 1.55;
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

.human-review-card {
  display: grid;
  gap: 18px;
  margin-top: 18px;
  padding: 26px;
  color: #fff;
  border: 1px solid rgba(34, 197, 94, 0.32);
  background: rgba(14, 116, 144, 0.18);
}

.human-review-steps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.human-review-steps article {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.07);
  padding: 14px;
}

.human-review-steps span {
  display: inline-grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 999px;
  background: #22c55e;
  color: #052e16;
  font-weight: 900;
}

.human-review-steps strong {
  display: block;
  margin-top: 10px;
  color: #fff;
}

.human-review-steps p {
  margin: 8px 0 0;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.55;
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

.visual-placeholder-card {
  min-height: 240px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.18), rgba(255, 255, 255, 0.08));
  display: grid;
  align-content: center;
  gap: 12px;
  padding: 28px;
}

.visual-placeholder-card strong {
  color: #ffffff;
  font-size: 1.2rem;
}

.visual-placeholder-card p {
  color: rgba(255, 255, 255, 0.76);
  line-height: 1.6;
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

.parent-faq-card {
  display: grid;
  gap: 18px;
  margin-top: 22px;
  padding: 28px;
  color: #eaf8ff;
}

.parent-proof-card {
  margin-top: 24px;
  padding: 28px;
  border: 1px solid rgba(236, 72, 153, 0.18);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(253, 242, 248, 0.95), rgba(255, 247, 237, 0.95));
}

.parent-proof-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.parent-proof-grid article {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  padding: 16px;
}

.parent-proof-grid strong {
  display: block;
  color: #831843;
  font-size: 15px;
}

.parent-proof-grid span,
.parent-proof-grid small {
  display: block;
  margin-top: 6px;
  color: #7c2d12;
  font-weight: 700;
}

.parent-proof-grid p {
  color: #5b3b2e;
  line-height: 1.6;
}

.parent-faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.parent-faq-grid article {
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
}

.parent-faq-grid strong {
  display: block;
  color: #fff;
}

.parent-faq-grid p {
  margin: 8px 0 0;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.55;
}

.quote-trust-card {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.9fr);
  gap: 18px;
  margin-top: 18px;
  padding: 24px 28px;
  color: #eaf8ff;
  border: 1px solid rgba(34, 197, 94, 0.32);
  background: rgba(15, 118, 110, 0.18);
}

.quote-trust-card h3 {
  margin: 8px 0;
  color: #fff;
  font-size: 1.35rem;
}

.quote-trust-card p,
.quote-trust-card li {
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.65;
}

.quote-trust-card ul {
  display: grid;
  gap: 8px;
  margin: 0;
  padding-left: 18px;
}

:global([dir='rtl']) .quote-trust-card ul {
  padding-right: 18px;
  padding-left: 0;
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

.addons-lead {
  max-width: 760px;
  margin: -6px 0 20px;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.7;
}

.addons-subtotal {
  margin-bottom: 20px;
  color: #ffd700;
  font-weight: 600;
}

.addon-value-story-panel {
  display: grid;
  gap: 18px;
  margin: 0 0 24px;
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 22px;
  background:
    radial-gradient(circle at 12% 18%, rgba(252, 211, 77, 0.18), transparent 32%),
    radial-gradient(circle at 86% 6%, rgba(244, 114, 182, 0.16), transparent 34%),
    rgba(255, 255, 255, 0.055);
}

.addon-value-story-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
}

.addon-value-story {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  min-height: 100%;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.07);
}

.addon-value-story.tone-execution {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.16), rgba(255, 255, 255, 0.07));
}

.addon-value-story.tone-visual {
  background: linear-gradient(135deg, rgba(244, 114, 182, 0.16), rgba(255, 255, 255, 0.07));
}

.addon-value-story.tone-experience {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(255, 255, 255, 0.07));
}

.story-visual {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 1.35rem;
}

.addon-value-story small,
.addon-value-story p,
.addon-value-story dd {
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.55;
}

.addon-value-story h4 {
  margin: 4px 0 12px;
  color: #fff;
  font-size: 1.05rem;
}

.addon-value-story dl {
  display: grid;
  gap: 8px;
  margin: 0 0 10px;
}

.addon-value-story dl div {
  padding-left: 10px;
  border-left: 2px solid rgba(255, 255, 255, 0.16);
}

.addon-value-story dt {
  color: #fef3c7;
  font-size: 0.74rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.addon-value-story dd {
  margin: 2px 0 0;
  font-size: 0.86rem;
}

.story-services {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.story-services button {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  padding: 8px 10px;
  font-size: 0.8rem;
  cursor: pointer;
}

.story-services button.is-selected {
  border-color: #fbbf24;
  background: rgba(251, 191, 36, 0.18);
  color: #fef3c7;
}

.recommended-addon-panel {
  display: grid;
  gap: 16px;
  margin: 0 0 22px;
  padding: 22px;
  border: 1px solid rgba(253, 186, 116, 0.34);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(251, 146, 60, 0.16), rgba(255, 255, 255, 0.06)),
    rgba(255, 255, 255, 0.05);
}

.recommended-addon-panel h3 {
  margin: 0 0 8px;
  color: #fff;
  font-size: 1.25rem;
}

.recommended-addon-panel p {
  margin: 0;
  color: rgba(255, 255, 255, 0.76);
  line-height: 1.65;
}

.recommended-addon-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}

.recommended-addon-list button {
  display: grid;
  gap: 6px;
  min-height: 116px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.07);
  color: #fff;
  padding: 14px;
  text-align: left;
  cursor: pointer;
}

.recommended-addon-list button.is-selected {
  border-color: #fbbf24;
  background: rgba(251, 191, 36, 0.16);
}

.recommended-addon-list span {
  font-weight: 900;
}

.recommended-addon-list small {
  color: rgba(255, 255, 255, 0.68);
  line-height: 1.45;
}

.recommended-addon-list strong {
  color: #ffd700;
}

.addon-group-list {
  display: grid;
  gap: 18px;
}

.addon-group {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.055);
  padding: 18px;
}

.addon-group header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 14px;
}

.addon-group h3 {
  margin: 0 0 4px;
  color: #fff;
}

.addon-group p {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
}

.addon-group-icon {
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 1.35rem;
}

.addons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}

.package-comparison-card {
  display: grid;
  gap: 14px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
}

.package-comparison-card h4 {
  margin: 0 0 6px;
  color: #fff;
  font-size: 1.1rem;
}

.package-comparison-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.76);
  line-height: 1.55;
}

.package-comparison-table {
  display: grid;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
}

.comparison-row {
  display: grid;
  grid-template-columns: 1fr repeat(3, minmax(0, 1.15fr));
}

.comparison-row > * {
  margin: 0;
  min-width: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 11px;
}

.comparison-row:first-child > * {
  border-top: 0;
}

.comparison-row > * + * {
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

:global([dir='rtl']) .comparison-row > * + * {
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 0;
}

.comparison-head {
  background: rgba(255, 255, 255, 0.09);
}

.comparison-head span,
.comparison-head strong,
.comparison-row span {
  color: #fff;
  font-weight: 900;
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

  .quote-trust-card {
    grid-template-columns: 1fr;
  }

  .human-review-steps,
  .comparison-row {
    grid-template-columns: 1fr;
  }

  .comparison-row > * + * {
    border-left: 0;
  }
}

.addon-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: inherit;
  text-align: left;
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
  min-width: 0;
}

.addon-name {
  display: block;
  font-size: 0.9375rem;
  margin-bottom: 4px;
  font-weight: 800;
}

.addon-description,
.addon-info small {
  display: block;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.45;
}

.addon-info small {
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.56);
}

.addon-price-wrap {
  display: grid;
  justify-items: end;
  gap: 8px;
}

.addon-price {
  font-size: 0.875rem;
  color: #ffd700;
  font-weight: 800;
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
  .venue-prefill-card,
  .venue-prefill-stats {
    grid-template-columns: 1fr;
  }

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
