import axios from 'axios'

/**
 * 创建 API 客户端
 * @returns {Object} API 实例
 */
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
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  /**
   * 响应拦截器
   */
  api.interceptors.response.use(
    (response) => {
      if (response.data.code === 200) {
        return response.data
      }
      return Promise.reject(new Error(response.data.message || '请求失败'))
    },
    (error) => {
      if (error.response) {
        const { status, data } = error.response

        switch (status) {
          case 401:
            console.error('未授权，请重新登录')
            localStorage.removeItem('token')
            window.location.href = '/login'
            break
          case 403:
            console.error('拒绝访问')
            break
          case 404:
            console.error('请求的资源不存在')
            break
          case 500:
            console.error('服务器错误')
            break
          default:
            console.error(data?.message || '请求失败')
        }

        return Promise.reject(new Error(data?.message || '请求失败'))
      } else if (error.request) {
        console.error('网络错误，请检查网络连接')
        return Promise.reject(new Error('网络错误，请检查网络连接'))
      } else {
        console.error('请求配置错误:', error.message)
        return Promise.reject(error)
      }
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
