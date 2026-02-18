<script setup>
import MealCard from '@/components/mealCard.vue'
import { ref, onMounted } from 'vue'
import { getTodayMealsFromStorage } from '@/utils/storage'
import { setupDailyCleanup } from '@/utils/timer'

// 从本地存储读取的餐品数据
const selectedMeals = ref([])

// 加载本地存储的餐品数据
const loadSelectedMeals = () => {
  selectedMeals.value = getTodayMealsFromStorage()
}

// 组件挂载时加载数据并设置定时清理
onMounted(() => {
  loadSelectedMeals()
  setupDailyCleanup()
})
</script>

<template>
  <div class="nutrient-intake">
    <div class="nutrient-intake__header">
      <h2 class="nutrient-intake__title">营养摄入</h2>
    </div>

    <div class="nutrient-intake__content">
      <div class="nutrient-intake__grid">
        <MealCard
          v-for="meal in selectedMeals"
          :key="meal.id"
          :title="meal.title"
          :image-url="meal.imageUrl"
          :info="meal.info"
          :checked="true"
          :disabled="true"
        />
      </div>

      <!-- 空状态 -->
      <div v-if="selectedMeals.length === 0" class="nutrient-intake__empty">
        <el-empty description="暂无营养摄入记录" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.nutrient-intake {
  padding: 20px;
}

.nutrient-intake__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.nutrient-intake__title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.nutrient-intake__content {
  min-height: 400px;
}

.nutrient-intake__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.nutrient-intake__empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: #f9fafb;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .nutrient-intake {
    padding: 10px;
  }

  .nutrient-intake__grid {
    grid-template-columns: 1fr;
  }

  .nutrient-intake__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
