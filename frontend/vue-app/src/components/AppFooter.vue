<template>
  <el-footer class="app-footer">
    <div class="footer-content">
      <div class="footer-main">
        <div class="footer-brand">
          <h3>Party Event</h3>
          <p>{{ t('footer.tagline') }}</p>
          <div class="social-links">
            <el-icon><Platform /></el-icon>
            <el-icon><ChatDotRound /></el-icon>
            <el-icon><Message /></el-icon>
          </div>
        </div>
        
        <div class="footer-links">
          <div class="link-group">
            <h4>{{ t('footer.services') }}</h4>
            <a href="/venues">{{ t('footer.venueBooking') }}</a>
            <a v-if="featureFlags.aiExperienceEnabled" href="/ai-planner">{{ t('footer.aiPlanning') }}</a>
            <a v-if="featureFlags.threeDExperienceEnabled" href="/3d-designer">{{ t('footer.design3d') }}</a>
            <a href="/quotation">{{ t('footer.onlineQuote') }}</a>
          </div>
          
          <div class="link-group">
            <h4>{{ t('footer.about') }}</h4>
            <a href="#">{{ t('footer.aboutUs') }}</a>
            <a href="#">{{ t('footer.partners') }}</a>
            <a href="#">{{ t('footer.news') }}</a>
            <a href="#">{{ t('footer.joinUs') }}</a>
          </div>
          
          <div class="link-group">
            <h4>{{ t('footer.help') }}</h4>
            <a href="#">{{ t('footer.faq') }}</a>
            <a href="#">{{ t('footer.guide') }}</a>
            <a href="#">{{ t('footer.contactSupport') }}</a>
            <a href="#">{{ t('footer.feedback') }}</a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>{{ t('footer.copyright') }}</p>
      </div>
    </div>
  </el-footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { featureFlags } from '@/config/featureFlags'

const { t } = useI18n()
</script>

<style scoped>
.app-footer {
  background: #fff8f0;
  color: #2b1d27;
  padding: 42px 20px 24px;
  border-top: 1px solid rgba(92, 43, 67, 0.12);
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
}

.footer-main {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 56px;
  align-items: start;
  margin-bottom: 30px;
}

.footer-brand h3 {
  font-size: 26px;
  margin-bottom: 10px;
  color: #2b1d27;
}

.footer-brand p {
  color: #5f4b58;
  margin-bottom: 18px;
  line-height: 1.6;
}

.social-links {
  display: flex;
  gap: 16px;
}

.social-links .el-icon {
  font-size: 24px;
  cursor: pointer;
  color: #9d366c;
  transition: color 0.3s;
}

.social-links .el-icon:hover {
  color: #d84a8f;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.link-group h4 {
  font-size: 16px;
  margin-bottom: 16px;
  color: #2b1d27;
}

.link-group a {
  display: block;
  color: #5f4b58;
  text-decoration: none;
  margin-bottom: 10px;
  transition: color 0.3s;
}

.link-group a:hover {
  color: #b72d7a;
}

.footer-bottom {
  border-top: 1px solid rgba(92, 43, 67, 0.12);
  padding-top: 18px;
  text-align: center;
  color: #6b5864;
}

@media (max-width: 768px) {
  .footer-main {
    grid-template-columns: 1fr;
    gap: 28px;
  }
  
  .footer-links {
    grid-template-columns: 1fr;
  }
}
</style>
