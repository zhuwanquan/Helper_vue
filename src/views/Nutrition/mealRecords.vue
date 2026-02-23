<script setup>
import MealCard from '@/components/mealCard.vue'
import MealForm from '@/components/MealForm.vue'
import { ref, onMounted } from 'vue'
import { useMealStore } from '@/stores/mealStore'
import { formatMealInfo } from '@/utils/mealUtils'

const mealStore = useMealStore()
const dialogVisible = ref(false)
const mealFormRef = ref(null)

const handleCheck = (meal, isChecked) => {
  mealStore.toggleMealChecked(meal.id, isChecked)
}

const handleOpenDialog = () => {
  dialogVisible.value = true
}

const handleCloseDialog = () => {
  dialogVisible.value = false
  mealFormRef.value?.resetForm()
}

const handleSubmitForm = async (mealData) => {
  try {
    await mealStore.addMeal(mealData)
    dialogVisible.value = false
    mealFormRef.value?.resetForm()
    await mealStore.fetchMeals()
  } catch (error) {
    console.error('添加餐品失败:', error)
  }
}

onMounted(() => {
  mealStore.initialize()
})
</script>

<template>
  <div class="meal-records">
    <div class="meal-records__header">
      <h2 class="meal-records__title">餐品记录</h2>
      <el-button type="primary" @click="handleOpenDialog">添加餐品</el-button>
    </div>

    <div class="meal-records__content">
      <div class="meal-records__grid">
        <MealCard
          v-for="meal in mealStore.allMeals"
          :key="meal.id"
          :title="meal.title"
          :image-url="meal.imageUrl"
          :info="formatMealInfo(meal)"
          v-model:checked="meal.checked"
          @check="(isChecked) => handleCheck(meal, isChecked)"
        />
      </div>

      <div v-if="mealStore.allMeals.length === 0" class="meal-records__empty">
        <el-empty description="暂无餐品记录" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="添加餐品" width="600px" @close="handleCloseDialog">
      <MealForm ref="mealFormRef" @submit="handleSubmitForm" @cancel="handleCloseDialog" />
    </el-dialog>
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
