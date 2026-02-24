<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const activeMenu = ref(route.path)

const menuItems = [
  {
    path: '/mealRecords',
    title: '餐品记录',
    icon: 'meal',
  },
  {
    path: '/nutrientIntake',
    title: '营养摄入',
    icon: 'Menu',
  },
  {
    path: '/nutritionVisualization',
    title: '营养视图',
    icon: 'Document',
  },
  {
    path: '/nutritionAnalysis',
    title: '营养分析',
    icon: 'ChatDotRound',
  },
]

const handleMenuSelect = (index) => {
  router.push(index)
}
</script>

<template>
  <el-container class="nutrition-layout">
    <el-aside width="200px">
      <div class="logo-section">
        <h3>营养管理</h3>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="nutrition-menu"
        @select="handleMenuSelect"
        router
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <div class="header-content">
          <h2>{{ route.meta.title || '营养管理' }}</h2>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.nutrition-layout {
  height: 100vh;
  width: 100vw;
}

.el-aside {
  background-color: #304156;
  overflow-x: hidden;
}

.logo-section {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3a4b;
  color: #fff;
  margin-bottom: 0;
}

.logo-section h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.nutrition-menu {
  border-right: none;
  background-color: #304156;
}

.nutrition-menu .el-menu-item {
  color: #bfcbd9;
}

.nutrition-menu .el-menu-item:hover {
  background-color: #263445;
  color: #fff;
}

.nutrition-menu .el-menu-item.is-active {
  background-color: #409eff;
  color: #fff;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.header-content h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: #303133;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
