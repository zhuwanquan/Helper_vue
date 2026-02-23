/**
 * 餐品工具函数
 * 用于处理餐品数据格式化和计算
 */

/**
 * 营养成分中英文键名映射
 */
export const nutritionKeyMapping = {
  energy: '能量',
  protein: '蛋白质',
  trans_fat: '反式脂肪酸',
  saturated_fat: '饱和脂肪',
  carbohydrate: '碳水',
  added_sugar: '添加糖',
  salt: '食盐',
  dietary_fiber: '膳食纤维',
}

/**
 * 营养成分中文键名映射到英文
 */
export const reverseNutritionKeyMapping = {
  能量: 'energy',
  蛋白质: 'protein',
  反式脂肪酸: 'trans_fat',
  饱和脂肪: 'saturated_fat',
  碳水: 'carbohydrate',
  添加糖: 'added_sugar',
  食盐: 'salt',
  膳食纤维: 'dietary_fiber',
}

/**
 * 格式化餐品营养信息
 * 将后端返回的餐品数据转换为前端展示所需的格式
 * @param {Object} meal - 餐品对象
 * @returns {Object} 格式化后的营养信息对象
 */
export const formatMealInfo = (meal) => {
  return {
    energy: `${meal.energy || 0} kcal`,
    protein: `${meal.protein || 0} g`,
    transFat: `${meal.trans_fat || 0} g`,
    saturatedFat: `${meal.saturated_fat || 0} g`,
    carbohydrate: `${meal.carbohydrate || 0} g`,
    addedSugar: `${meal.added_sugar || 0} g`,
    salt: `${meal.salt || 0} g`,
    dietaryFiber: `${meal.dietary_fiber || 0} g`,
  }
}

/**
 * 获取营养单位
 * @param {string} key - 营养成分键名（英文）
 * @returns {string} 单位
 */
export const getNutritionUnit = (key) => {
  const units = {
    energy: 'kcal',
    protein: 'g',
    trans_fat: 'g',
    saturated_fat: 'g',
    carbohydrate: 'g',
    added_sugar: 'g',
    salt: 'g',
    dietary_fiber: 'g',
  }
  return units[key] || ''
}

/**
 * 获取营养单位（中文键名）
 * @param {string} key - 营养成分键名（中文）
 * @returns {string} 单位
 */
export const getNutritionUnitCN = (key) => {
  const units = {
    能量: '卡',
    蛋白质: 'g',
    反式脂肪酸: 'g',
    饱和脂肪: 'g',
    碳水: 'g',
    添加糖: 'g',
    食盐: 'g',
    膳食纤维: 'g',
  }
  return units[key] || ''
}

/**
 * 计算多个餐品的总营养摄入
 * @param {Array} meals - 餐品数组
 * @returns {Object} 总营养摄入对象（英文键名）
 */
export const calculateTotalNutrition = (meals) => {
  const total = {
    energy: 0,
    protein: 0,
    trans_fat: 0,
    saturated_fat: 0,
    carbohydrate: 0,
    added_sugar: 0,
    salt: 0,
    dietary_fiber: 0,
  }

  meals.forEach((meal) => {
    Object.keys(total).forEach((key) => {
      const value = parseFloat(meal[key]) || 0
      total[key] += value
    })
  })

  return total
}

/**
 * 格式化营养数值（带单位）
 * @param {number} value - 数值
 * @param {string} key - 营养成分键名
 * @returns {string} 格式化后的字符串
 */
export const formatNutritionValue = (value, key) => {
  const unit = getNutritionUnit(key)
  return `${value || 0}${unit ? ' ' + unit : ''}`
}

/**
 * 从格式化的营养信息中提取数值
 * @param {string} formattedValue - 格式化的值，如 "100 kcal"
 * @returns {number} 提取的数值
 */
export const extractNutritionValue = (formattedValue) => {
  if (!formattedValue) return 0
  return parseFloat(String(formattedValue).replace(/[^\d.]/g, '')) || 0
}

/**
 * 将英文键名转换为中文键名
 * @param {string} englishKey - 英文键名
 * @returns {string} 中文键名
 */
export const toChineseKey = (englishKey) => {
  return nutritionKeyMapping[englishKey] || englishKey
}

/**
 * 将中文键名转换为英文键名
 * @param {string} chineseKey - 中文键名
 * @returns {string} 英文键名
 */
export const toEnglishKey = (chineseKey) => {
  return reverseNutritionKeyMapping[chineseKey] || chineseKey
}

/**
 * 将英文键名的对象转换为中文键名
 * @param {Object} obj - 英文键名对象
 * @returns {Object} 中文键名对象
 */
export const toChineseKeys = (obj) => {
  const result = {}
  Object.keys(obj).forEach((key) => {
    const chineseKey = toChineseKey(key)
    result[chineseKey] = obj[key]
  })
  return result
}

/**
 * 将中文键名的对象转换为英文键名
 * @param {Object} obj - 中文键名对象
 * @returns {Object} 英文键名对象
 */
export const toEnglishKeys = (obj) => {
  const result = {}
  Object.keys(obj).forEach((key) => {
    const englishKey = toEnglishKey(key)
    result[englishKey] = obj[key]
  })
  return result
}
