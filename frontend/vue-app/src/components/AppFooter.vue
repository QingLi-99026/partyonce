<template>
  <el-footer class="app-footer">
    <div class="footer-content">
      <div class="footer-main">
        <div class="footer-brand">
          <h3>PartyOnce</h3>
          <p>您的一站式派对策划平台</p>
          <div class="social-links">
            <el-icon><Platform /></el-icon>
            <el-icon><ChatDotRound /></el-icon>
            <el-icon><Message /></el-icon>
          </div>
        </div>
        
        <div class="footer-links">
          <div class="link-group">
            <h4>服务</h4>
            <a href="/venues">场地预订</a>
            <a href="/ai-planner">AI策划</a>
            <a href="/3d-designer">3D设计</a>
            <a href="/quotation">在线报价</a>
          </div>
          
          <div class="link-group">
            <h4>关于</h4>
            <a href="#">关于我们</a>
            <a href="#">合作伙伴</a>
            <a href="#">新闻动态</a>
            <a href="#">加入我们</a>
          </div>
          
          <div class="link-group">
            <h4>帮助</h4>
            <a href="#">常见问题</a>
            <a href="#">使用指南</a>
            <a href="#">联系客服</a>
            <a href="#">意见反馈</a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>© 2024 PartyOnce. All rights reserved. | 隐私政策 | 服务条款</p>
      </div>
    </div>
  </el-footer>
</template>

<style scoped>
.app-footer {
  background: #2c3e50;
  color: #fff;
  padding: 60px 20px 20px;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
}

.footer-main {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 60px;
  margin-bottom: 40px;
}

.footer-brand h3 {
  font-size: 24px;
  margin-bottom: 12px;
}

.footer-brand p {
  color: #b0b8c4;
  margin-bottom: 20px;
}

.social-links {
  display: flex;
  gap: 16px;
}

.social-links .el-icon {
  font-size: 24px;
  cursor: pointer;
  transition: color 0.3s;
}

.social-links .el-icon:hover {
  color: #409EFF;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.link-group h4 {
  font-size: 16px;
  margin-bottom: 16px;
  color: #fff;
}

.link-group a {
  display: block;
  color: #b0b8c4;
  text-decoration: none;
  margin-bottom: 10px;
  transition: color 0.3s;
}

.link-group a:hover {
  color: #409EFF;
}

.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 20px;
  text-align: center;
  color: #b0b8c4;
}

@media (max-width: 768px) {
  .footer-main {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .footer-links {
    grid-template-columns: 1fr;
  }
}
</style>