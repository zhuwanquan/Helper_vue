import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.response.use(
  (response) => {
    if (response.data.code === 200) {
      return response.data
    }
    return Promise.reject(new Error(response.data.message || '请求失败'))
  },
  (error) => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
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
