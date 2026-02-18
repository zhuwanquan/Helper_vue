<script setup>
import MealCard from '@/components/mealCard.vue'
import { onMounted } from 'vue'
import { useMealStore } from '@/stores/mealStore'

// 使用mealStore管理数据
const mealStore = useMealStore()

// 处理复选框点击事件
const handleCheck = (meal, isChecked) => {
  mealStore.toggleMealChecked(meal.id, isChecked)
}

// 组件挂载时初始化store
onMounted(() => {
  mealStore.initialize()
})
</script>

<template>
  <div class="meal-records">
    <div class="meal-records__header">
      <h2 class="meal-records__title">餐品记录</h2>
      <el-button type="primary">添加餐品</el-button>
    </div>

    <div class="meal-records__content">
      <div class="meal-records__grid">
        <MealCard
          v-for="meal in mealStore.allMeals"
          :key="meal.id"
          :title="meal.title"
          :image-url="meal.imageUrl"
          :info="meal.info"
          v-model:checked="meal.checked"
          @check="(isChecked) => handleCheck(meal, isChecked)"
        />
      </div>

      <!-- 空状态 -->
      <div v-if="mealStore.allMeals.length === 0" class="meal-records__empty">
        <el-empty description="暂无餐品记录" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.meal-records {
  padding: 20px;
}

.meal-records__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.meal-records__title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.meal-records__content {
  min-height: 400px;
}

.meal-records__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.meal-records__empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: #f9fafb;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .meal-records {
    padding: 10px;
  }

  .meal-records__grid {
    grid-template-columns: 1fr;
  }

  .meal-records__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
