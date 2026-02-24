import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

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

api.interceptors.response.use(
  (response) => {
    console.log('=== API拦截器调试 ===')
    console.log('原始响应:', response)
    console.log('响应数据:', response.data)
    console.log('响应数据类型:', typeof response.data)
    console.log('==================')

    if (response.data.code === 200) {
      return response.data
    }
    return Promise.reject(new Error(response.data.message || '请求失败'))
  },
  (error) => {
    console.error('API请求错误:', error)

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

export const mealApi = {
  getAllMeals(page = 0, size = 10, sortBy = 'id', sortDir = 'asc') {
    return api.get(`/meals?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`)
  },

  getMealById(id) {
    return api.get(`/meals/${id}`)
  },

  addMeal(meal) {
    return api.post('/meals', meal)
  },

  updateMeal(id, meal) {
    return api.put(`/meals/${id}`, meal)
  },

  deleteMeal(id) {
    return api.delete(`/meals/${id}`)
  },

  toggleMealSelection(mealId) {
    return api.patch(`/meals/${mealId}/toggle`)
  },

  getSelectedMeals() {
    return api.get('/meals/selected')
  },

  searchMeals(title) {
    return api.get(`/meals/search?title=${encodeURIComponent(title)}`)
  },

  getMealStatistics() {
    return api.get('/meals/statistics')
  },
}

export default api
