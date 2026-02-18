/**
 * 本地存储工具
 * 用于处理餐品记录的本地存储逻辑
 */

// 获取当天的存储键
export const getTodayStorageKey = () => {
  const today = new Date().toISOString().split('T')[0]
  return `meal_records_${today}`
}

// 保存数据到本地存储
export const saveMealToStorage = (meal) => {
  const storageKey = getTodayStorageKey()
  let storedData = JSON.parse(localStorage.getItem(storageKey) || '[]')
  
  // 检查是否已存在
  if (!storedData.some(item => item.id === meal.id)) {
    storedData.push(meal)
    localStorage.setItem(storageKey, JSON.stringify(storedData))
  }
}

// 从本地存储移除数据
export const removeMealFromStorage = (mealId) => {
  const storageKey = getTodayStorageKey()
  let storedData = JSON.parse(localStorage.getItem(storageKey) || '[]')
  
  storedData = storedData.filter(item => item.id !== mealId)
  localStorage.setItem(storageKey, JSON.stringify(storedData))
}

// 从本地存储获取当天的数据
export const getTodayMealsFromStorage = () => {
  const storageKey = getTodayStorageKey()
  return JSON.parse(localStorage.getItem(storageKey) || '[]')
}

// 清空本地存储中的过期数据
export const cleanupExpiredStorage = () => {
  const today = new Date().toISOString().split('T')[0]
  
  // 遍历所有本地存储键
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith('meal_records_') && key !== `meal_records_${today}`) {
      localStorage.removeItem(key)
    }
  }
}
