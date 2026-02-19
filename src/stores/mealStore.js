import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { saveMealToStorage, removeMealFromStorage, getTodayMealsFromStorage } from '@/utils/storage'
import { setupDailyCleanup } from '@/utils/timer'
import { mealApi } from '@/api/mealApi'

export const useMealStore = defineStore('meal', () => {
  const meals = ref([])

  const allMeals = computed(() => meals.value)

  const selectedMeals = computed(() => meals.value.filter((meal) => meal.checked))

  const fetchMeals = async () => {
    try {
      const response = await mealApi.getAllMeals()
      console.log('=== 后端数据调试 ===')
      console.log('1. 完整响应:', response)
      console.log('2. 响应类型:', typeof response)
      console.log('3. 是否为数组:', Array.isArray(response))
      console.log('4. 所有字段:', Object.keys(response))
      console.log('5. data字段:', response.data)
      console.log('6. data类型:', typeof response.data)
      console.log('7. data是否为数组:', Array.isArray(response.data))

      const mealList = Array.isArray(response.data?.content)
        ? response.data.content
        : Array.isArray(response.data?.records)
          ? response.data.records
          : Array.isArray(response.data?.list)
            ? response.data.list
            : Array.isArray(response.data?.items)
              ? response.data.items
              : Array.isArray(response.data)
                ? response.data
                : []

      console.log('8. 提取到的餐品列表:', mealList)
      console.log('9. 餐品列表长度:', mealList.length)
      console.log('==================')

      meals.value = mealList.map((meal) => ({
        ...meal,
        id: meal.meal_id || meal.id,
        imageUrl: meal.image_url || meal.imageUrl,
        checked: false,
      }))
    } catch (error) {
      console.error('获取餐食数据失败:', error)
      ElMessage.error(error.message || '获取餐食数据失败')
      meals.value = []
    }
  }

  const initialize = async () => {
    setupDailyCleanup()
    await fetchMeals()

    const todayMeals = getTodayMealsFromStorage()
    console.log('从本地存储恢复的选中餐品:', todayMeals)

    meals.value.forEach((meal) => {
      const storedMeal = todayMeals.find((item) => item.id === meal.id)
      if (storedMeal) {
        meal.checked = true
      }
    })
  }

  const toggleMealChecked = (mealId, isChecked) => {
    const meal = meals.value.find((meal) => meal.id === mealId)
    if (meal) {
      meal.checked = isChecked
      if (isChecked) {
        saveMealToStorage(meal)
      } else {
        removeMealFromStorage(mealId)
      }
    }
  }

  const addMeal = async (meal) => {
    try {
      const response = await mealApi.addMeal(meal)
      meals.value.push(response)
      ElMessage.success('添加餐食成功')
    } catch (error) {
      console.error('添加餐食失败:', error)
      ElMessage.error(error.message || '添加餐食失败')
    }
  }

  const removeMeal = async (mealId) => {
    try {
      await mealApi.deleteMeal(mealId)
      meals.value = meals.value.filter((meal) => meal.id !== mealId)
      ElMessage.success('删除餐食成功')
    } catch (error) {
      console.error('删除餐食失败:', error)
      ElMessage.error(error.message || '删除餐食失败')
    }
  }

  const updateMeal = async (mealId, meal) => {
    try {
      const response = await mealApi.updateMeal(mealId, meal)
      const index = meals.value.findIndex((meal) => meal.id === mealId)
      if (index !== -1) {
        meals.value[index] = response
      }
      ElMessage.success('更新餐食成功')
    } catch (error) {
      console.error('更新餐食失败:', error)
      ElMessage.error(error.message || '更新餐食失败')
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
