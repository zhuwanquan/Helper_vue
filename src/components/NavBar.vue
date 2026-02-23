<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { House, Food, Document, Histogram, ChatDotRound } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => {
  if (route.path === '/') return '/'
  if (route.path.startsWith('/nutrition')) return 'nutrition'
  return route.path
})

const menuItems = [
  {
    index: '/',
    title: '首页',
    icon: House,
  },
  {
    index: 'nutrition',
    title: '营养管理',
    icon: Food,
    children: [
      {
        index: '/mealRecords',
        title: '餐品记录',
        icon: Document,
      },
      {
        index: '/nutrientIntake',
        title: '营养摄入',
        icon: Histogram,
      },
      {
        index: '/nutritionVisualization',
        title: '营养视图',
        icon: Histogram,
      },
      {
        index: '/nutritionAnalysis',
        title: '营养分析',
        icon: ChatDotRound,
      },
    ],
  },
]

const handleMenuSelect = (index) => {
  if (index === 'nutrition') {
    router.push('/mealRecords')
  }
}
</script>

<template>
  <div class="nav-bar">
    <el-menu
      :default-active="activeMenu"
      mode="horizontal"
      :ellipsis="false"
      class="main-menu"
      @select="handleMenuSelect"
      router
    >
      <div class="logo">
        <h2>营养助手</h2>
      </div>
      <template v-for="item in menuItems" :key="item.index">
        <el-menu-item v-if="!item.children" :index="item.index">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
        <el-sub-menu v-else :index="item.index">
          <template #title>
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </template>
          <el-menu-item v-for="child in item.children" :key="child.index" :index="child.index">
            <el-icon><component :is="child.icon" /></el-icon>
            <span>{{ child.title }}</span>
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>
  </div>
</template>

<style scoped>
.nav-bar {
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.main-menu {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
}

.logo {
  float: left;
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #409eff;
}

.logo h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: #fff;
}

.el-menu {
  border-bottom: none;
}

.el-menu-item,
.el-sub-menu__title {
  font-size: 15px;
}

.el-menu-item.is-active {
  color: #409eff;
  border-bottom-color: #409eff;
}
</style>
