import axios from 'axios'
import { ErrorHandler } from '@/utils/errorHandler'
import { useLogStore } from '@/stores/logStore'

const createApiClient = () => {
  /**
   * Axios 实例
   */
  const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
  })

  /**
   * 请求拦截器
   */
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // 记录请求开始
      config._startTime = Date.now()
      const logStore = useLogStore()
      logStore.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        method: config.method,
        url: config.url,
        params: config.params,
        data: config.data
      })

      return config
    },
    (error) => {
      const logStore = useLogStore()
      logStore.error('API Request Error', {
        error: error.message
      })
      return Promise.reject(error)
    }
  )

  api.interceptors.response.use(
    (response) => {
      // 计算请求耗时
      const duration = Date.now() - (response.config._startTime || Date.now())
      const logStore = useLogStore()

      logStore.debug(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
        method: response.config.method,
        url: response.config.url,
        status: response.status,
        duration,
        data: response.data
      })

      if (response.data.code === 200) {
        return response.data
      }

      const error = new Error(response.data.message || '请求失败')
      logStore.warn(`API Response Error: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      })

      return Promise.reject(error)
    },
    (error) => {
      // 计算请求耗时
      const duration = Date.now() - (error.config._startTime || Date.now())
      const logStore = useLogStore()

      logStore.error(`API Response Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`, {
        method: error.config?.method,
        url: error.config?.url,
        status: error.response?.status,
        duration,
        error: error.message
      })

      ErrorHandler.handleApiError(error)
      return Promise.reject(error)
    }
  )

  /**
   * 餐品 API
   */
  const mealApi = {
    /**
     * 获取所有餐品
     * @param {number} page - 页码
     * @param {number} size - 每页数量
     * @param {string} sortBy - 排序字段
     * @param {string} sortDir - 排序方向
     * @returns {Promise} 请求结果
     */
    getAllMeals(page = 0, size = 10, sortBy = 'id', sortDir = 'asc') {
      return api.get(`/meals?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`)
    },

    /**
     * 根据 ID 获取餐品
     * @param {string|number} id - 餐品 ID
     * @returns {Promise} 请求结果
     */
    getMealById(id) {
      return api.get(`/meals/${id}`)
    },

    /**
     * 添加餐品
     * @param {Object} meal - 餐品信息
     * @returns {Promise} 请求结果
     */
    addMeal(meal) {
      return api.post('/meals', meal)
    },

    /**
     * 更新餐品
     * @param {string|number} id - 餐品 ID
     * @param {Object} meal - 餐品信息
     * @returns {Promise} 请求结果
     */
    updateMeal(id, meal) {
      return api.put(`/meals/${id}`, meal)
    },

    /**
     * 删除餐品
     * @param {string|number} id - 餐品 ID
     * @returns {Promise} 请求结果
     */
    deleteMeal(id) {
      return api.delete(`/meals/${id}`)
    },

    /**
     * 切换餐品选择状态
     * @param {string|number} mealId - 餐品 ID
     * @returns {Promise} 请求结果
     */
    toggleMealSelection(mealId) {
      return api.patch(`/meals/${mealId}/toggle`)
    },

    /**
     * 获取已选择的餐品
     * @returns {Promise} 请求结果
     */
    getSelectedMeals() {
      return api.get('/meals/selected')
    },

    /**
     * 搜索餐品
     * @param {string} title - 搜索关键词
     * @returns {Promise} 请求结果
     */
    searchMeals(title) {
      return api.get(`/meals/search?title=${encodeURIComponent(title)}`)
    },

    /**
     * 获取餐品统计信息
     * @returns {Promise} 请求结果
     */
    getMealStatistics() {
      return api.get('/meals/statistics')
    },
  }

  return {
    api,
    mealApi,
  }
}

const { api, mealApi } = createApiClient()

export { mealApi }
export default api
