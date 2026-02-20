<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const features = ref([
  {
    title: '营养管理',
    description: '全面的营养摄入追踪与分析，帮助您科学管理饮食健康',
    icon: 'Food',
    color: '#67c23a',
    path: '/nutrition',
    onClick: () => navigateTo('/nutrition'),
  },
])

const techStack = ref([
  { name: 'Vue 3', desc: '渐进式 JavaScript 框架' },
  { name: 'Vite', desc: '新一代前端构建工具' },
  { name: 'Element Plus', desc: 'Vue 3 组件库' },
  { name: 'Pinia', desc: 'Vue 状态管理库' },
  { name: 'Vue Router', desc: 'Vue 官方路由' },
])

const navigateTo = (path) => {
  router.push(path)
}
</script>

<template>
  <div class="introduction-page">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">营养助手</h1>
        <p class="hero-subtitle">您的营养管理助手</p>
        <p class="hero-description">
          营养助手是一款专注于健康饮食管理的智能应用，帮助您轻松追踪营养摄入，通过数据可视化让健康生活触手可及
        </p>
        <div class="hero-buttons">
          <el-button type="primary" size="large" @click="navigateTo('/nutrition')">
            开始使用
          </el-button>
        </div>
      </div>
    </div>

    <div class="features-section">
      <h2 class="section-title">核心功能</h2>
      <div class="features-grid">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="feature-card"
          @click="navigateTo(feature.path)"
        >
          <div class="feature-icon" :style="{ backgroundColor: feature.color }">
            <el-icon :size="40">
              <component :is="feature.icon" />
            </el-icon>
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </div>

    <div class="tech-stack-section">
      <h2 class="section-title">技术栈</h2>
      <div class="tech-stack-grid">
        <div v-for="tech in techStack" :key="tech.name" class="tech-card">
          <h4 class="tech-name">{{ tech.name }}</h4>
          <p class="tech-desc">{{ tech.desc }}</p>
        </div>
      </div>
    </div>

    <div class="getting-started-section">
      <h2 class="section-title">快速开始</h2>
      <div class="steps-container">
        <div class="step-item">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>记录营养摄入</h4>
            <p>在营养菜单中添加您的日常饮食，系统将自动计算营养成分</p>
          </div>
        </div>
        <div class="step-item">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>查看营养分析</h4>
            <p>通过可视化图表了解您的营养摄入情况，科学调整饮食结构</p>
          </div>
        </div>
        <div class="step-item">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>优化饮食方案</h4>
            <p>根据营养分析结果，制定更健康的饮食计划，保持营养均衡</p>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>&copy; 2025 营养助手. 让健康管理更简单</p>
    </div>
  </div>
</template>

<style scoped>
.introduction-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-section {
  padding: 100px 20px 80px;
  text-align: center;
  color: #fff;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 56px;
  font-weight: 700;
  margin: 0 0 20px;
  letter-spacing: 2px;
}

.hero-subtitle {
  font-size: 24px;
  margin: 0 0 30px;
  opacity: 0.9;
}

.hero-description {
  font-size: 18px;
  line-height: 1.8;
  margin: 0 0 40px;
  opacity: 0.85;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.features-section {
  background-color: #fff;
  padding: 80px 20px;
}

.section-title {
  text-align: center;
  font-size: 36px;
  font-weight: 600;
  margin: 0 0 60px;
  color: #303133;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background-color: #f9fafc;
  border-radius: 12px;
  padding: 40px 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: #fff;
}

.feature-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 16px;
  color: #303133;
}

.feature-description {
  font-size: 15px;
  line-height: 1.6;
  color: #606266;
  margin: 0;
}

.tech-stack-section {
  background-color: #f5f7fa;
  padding: 80px 20px;
}

.tech-stack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.tech-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.tech-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.tech-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px;
  color: #409eff;
}

.tech-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.getting-started-section {
  background-color: #fff;
  padding: 80px 20px;
}

.steps-container {
  max-width: 900px;
  margin: 0 auto;
}

.step-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 40px;
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-number {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
  margin-right: 24px;
}

.step-content h4 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px;
  color: #303133;
}

.step-content p {
  font-size: 15px;
  line-height: 1.6;
  color: #606266;
  margin: 0;
}

.footer {
  background-color: #303133;
  color: #fff;
  text-align: center;
  padding: 30px 20px;
}

.footer p {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}
</style>
