import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Unauthorized from './pages/Unauthorized'
import ClientDashboard from './pages/dashboards/ClientDashboard'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import useAuthStore from './stores/authStore'

function App() {
  const { initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Client Dashboard */}
          <Route 
            path="/client/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['CLIENTE']}>
                <ClientDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Dashboard */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Placeholder routes for other roles */}
          <Route 
            path="/restaurant/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['RESTAURANTE']}>
                <div className="p-8 text-center">
                  <h1 className="text-2xl font-bold mb-4">Dashboard de Restaurante</h1>
                  <p>En construcción...</p>
                </div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/delivery/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['REPARTIDOR']}>
                <div className="p-8 text-center">
                  <h1 className="text-2xl font-bold mb-4">Dashboard de Repartidor</h1>
                  <p>En construcción...</p>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* Generic dashboard redirect */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              },
            },
          }}
        />
      </div>
    </Router>
  )
}

// Component to redirect to appropriate dashboard
const DashboardRedirect = () => {
  const { getDashboardRoute } = useAuthStore()
  const navigate = useNavigate()
  
  useEffect(() => {
    navigate(getDashboardRoute())
  }, [navigate, getDashboardRoute])
  
  return <div>Redirigiendo...</div>
}

export default App