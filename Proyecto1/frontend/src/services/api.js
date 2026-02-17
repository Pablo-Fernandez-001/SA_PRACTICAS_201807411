import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't clear on login attempts
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  validate: (token) => api.post('/auth/validate', { token }),
  getUsers: () => api.get('/auth/users'),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  updateRole: (id, role) => api.put(`/auth/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
}

// ─── Catalog ─────────────────────────────────────────────────────────────────
export const catalogAPI = {
  getRestaurants: () => api.get('/catalog/restaurants'),
  getRestaurant: (id) => api.get(`/catalog/restaurants/${id}`),
  getMenu: (restaurantId, all = false) => api.get(`/catalog/restaurants/${restaurantId}/menu${all ? '?all=true' : ''}`),
  getAllMenuItems: () => api.get('/catalog/menu-items'),
  createRestaurant: (data) => api.post('/catalog/restaurants', data),
  updateRestaurant: (id, data) => api.put(`/catalog/restaurants/${id}`, data),
  deleteRestaurant: (id) => api.delete(`/catalog/restaurants/${id}`),
  toggleRestaurant: (id) => api.patch(`/catalog/restaurants/${id}/toggle`),
  createMenuItem: (data) => api.post('/catalog/menu-items', data),
  updateMenuItem: (id, data) => api.put(`/catalog/menu-items/${id}`, data),
  deleteMenuItem: (id) => api.delete(`/catalog/menu-items/${id}`),
  toggleMenuItem: (id) => api.patch(`/catalog/menu-items/${id}/toggle`),
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export const ordersAPI = {
  getOrders: () => api.get('/orders'),
  getAll: () => api.get('/orders'),
  getByUser: (userId) => api.get(`/orders/user/${userId}`),
  getByRestaurant: (restaurantId) => api.get(`/orders/restaurant/${restaurantId}`),
  getById: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
  reject: (id, reason) => api.post(`/orders/${id}/reject`, { reason }),
}

// ─── Delivery ────────────────────────────────────────────────────────────────
export const deliveryAPI = {
  getDeliveries: () => api.get('/delivery'),
  getAll: () => api.get('/delivery'),
  getByCourier: (courierId) => api.get(`/delivery/courier/${courierId}`),
  getActiveByCourier: (courierId) => api.get(`/delivery/courier/${courierId}/active`),
  getById: (id) => api.get(`/delivery/${id}`),
  getByOrder: (orderId) => api.get(`/delivery/order/${orderId}`),
  getAvailableOrders: () => api.get('/delivery/available-orders'),
  acceptOrder: (data) => api.post('/delivery/accept', data),
  create: (data) => api.post('/delivery', data),
  start: (id) => api.post(`/delivery/${id}/start`),
  complete: (id) => api.post(`/delivery/${id}/complete`),
  cancel: (id) => api.post(`/delivery/${id}/cancel`),
  reassign: (id, courierId) => api.put(`/delivery/${id}/reassign`, { courierId }),
}

export default api
