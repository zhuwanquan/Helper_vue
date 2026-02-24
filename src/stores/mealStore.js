import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { saveMealToStorage, removeMealFromStorage, getTodayMealsFromStorage } from '@/utils/storage'
import { setupDailyCleanup } from '@/utils/timer'
import { mealApi } from '@/api/mealApi'

/**
 * 餐品状态管理
 */
export const useMealStore = defineStore('meal', () => {
  /**
   * 餐品列表
   */
  const meals = ref([])

  /**
   * 所有餐品
   */
  const allMeals = computed(() => meals.value)

  /**
   * 已选择的餐品
   */
  const selectedMeals = computed(() => meals.value.filter((meal) => meal.checked))

  /**
   * 提取餐品列表数据
   * @param {Object} data - 响应数据
   * @returns {Array} 餐品列表
   */
  const extractMealList = (data) => {
    if (Array.isArray(data?.content)) {
      return data.content
    } else if (Array.isArray(data?.records)) {
      return data.records
    } else if (Array.isArray(data?.list)) {
      return data.list
    } else if (Array.isArray(data?.items)) {
      return data.items
    } else if (Array.isArray(data)) {
      return data
    }
    return []
  }

  /**
   * 标准化餐品数据
   * @param {Array} mealList - 原始餐品列表
   * @returns {Array} 标准化后的餐品列表
   */
  const normalizeMeals = (mealList) => {
    return mealList.map((meal) => ({
      ...meal,
      id: meal.meal_id || meal.id,
      imageUrl: meal.image_url || meal.imageUrl,
      checked: false,
    }))
  }

  /**
   * 获取餐品列表
   */
  const fetchMeals = async () => {
    try {
      const response = await mealApi.getAllMeals()
      const mealList = extractMealList(response.data)
      meals.value = normalizeMeals(mealList)
    } catch (error) {
      console.error('获取餐食数据失败:', error)
      ElMessage.error(error.message || '获取餐食数据失败')
      meals.value = []
    }
  }

  /**
   * 初始化餐品数据
   */
  const initialize = async () => {
    setupDailyCleanup()
    await fetchMeals()

    const todayMeals = getTodayMealsFromStorage()
    meals.value.forEach((meal) => {
      const storedMeal = todayMeals.find((item) => item.id === meal.id)
      if (storedMeal) {
        meal.checked = true
      }
    })
  }

  /**
   * 切换餐品选择状态
   * @param {string|number} mealId - 餐品 ID
   * @param {boolean} isChecked - 是否选中
   */
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

  /**
   * 添加餐品
   * @param {Object} meal - 餐品信息
   */
  const addMeal = async (meal) => {
    try {
      const response = await mealApi.addMeal(meal)
      meals.value.push({
        ...response,
        id: response.meal_id || response.id,
        imageUrl: response.image_url || response.imageUrl,
        checked: false,
      })
      ElMessage.success('添加餐食成功')
    } catch (error) {
      console.error('添加餐食失败:', error)
      ElMessage.error(error.message || '添加餐食失败')
    }
  }

  /**
   * 删除餐品
   * @param {string|number} mealId - 餐品 ID
   */
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

  /**
   * 更新餐品
   * @param {string|number} mealId - 餐品 ID
   * @param {Object} meal - 餐品信息
   */
  const updateMeal = async (mealId, meal) => {
    try {
      const response = await mealApi.updateMeal(mealId, meal)
      const index = meals.value.findIndex((meal) => meal.id === mealId)
      if (index !== -1) {
        meals.value[index] = {
          ...response,
          id: response.meal_id || response.id,
          imageUrl: response.image_url || response.imageUrl,
          checked: meals.value[index].checked,
        }
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
