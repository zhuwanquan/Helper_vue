import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { saveMealToStorage, removeMealFromStorage } from '@/utils/storage'
import { setupDailyCleanup } from '@/utils/timer'
import { mealApi } from '@/api/mealApi'

export const useMealStore = defineStore('meal', () => {
  const meals = ref([])

  const allMeals = computed(() => meals.value)

  const selectedMeals = computed(() => meals.value.filter((meal) => meal.checked))

  const fetchMeals = async () => {
    try {
      const response = await mealApi.getAllMeals()
      meals.value = response || []
    } catch (error) {
      console.error('获取餐食数据失败:', error)
      meals.value = []
    }
  }

  const initialize = async () => {
    setupDailyCleanup()
    await fetchMeals()
  }

  const toggleMealChecked = async (mealId, isChecked) => {
    const meal = meals.value.find((meal) => meal.id === mealId)
    if (meal) {
      meal.checked = isChecked
      try {
        await mealApi.toggleMealSelection(mealId)
        if (isChecked) {
          saveMealToStorage(meal)
        } else {
          removeMealFromStorage(mealId)
        }
      } catch (error) {
        console.error('更新餐食状态失败:', error)
      }
    }
  }

  const addMeal = async (meal) => {
    try {
      const response = await mealApi.addMeal(meal)
      meals.value.push(response)
    } catch (error) {
      console.error('添加餐食失败:', error)
    }
  }

  const removeMeal = async (mealId) => {
    try {
      await mealApi.deleteMeal(mealId)
      meals.value = meals.value.filter((meal) => meal.id !== mealId)
    } catch (error) {
      console.error('删除餐食失败:', error)
    }
  }

  const updateMeal = async (mealId, meal) => {
    try {
      const response = await mealApi.updateMeal(mealId, meal)
      const index = meals.value.findIndex((meal) => meal.id === mealId)
      if (index !== -1) {
        meals.value[index] = response
      }
    } catch (error) {
      console.error('更新餐食失败:', error)
    }
  }

  return {
    meals,
    allMeals,
    selectedMeals,
    initialize,
    fetchMeals,
    toggleMealChecked,
    addMeal,
    removeMeal,
    updateMeal,
  }
})
