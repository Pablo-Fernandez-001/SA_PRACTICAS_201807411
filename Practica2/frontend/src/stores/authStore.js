import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/login', { email, password })
          const { user, token } = response.data.data
          
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          })
          
          // Set default authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          return { success: true, data: { user, token } }
        } catch (error) {
          set({ isLoading: false })
          return { 
            success: false, 
            error: error.response?.data?.message || 'Login failed' 
          }
        }
      },

      // Get dashboard route based on user role
      getDashboardRoute: () => {
        const user = get().user
        if (!user) return '/login'
        
        switch (user.role) {
          case 'ADMIN':
            return '/admin/dashboard'
          case 'CLIENTE':
            return '/client/dashboard'
          case 'RESTAURANTE':
            return '/restaurant/dashboard'
          case 'REPARTIDOR':
            return '/delivery/dashboard'
          default:
            return '/client/dashboard'
        }
      },

      register: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/register', userData)
          const { user, token } = response.data.data
          
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          })
          
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          return { success: true, data: { user, token } }
        } catch (error) {
          set({ isLoading: false })
          return { 
            success: false, 
            error: error.response?.data?.message || 'Registration failed' 
          }
        }
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization']
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        })
      },

      initializeAuth: () => {
        const token = get().token
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore