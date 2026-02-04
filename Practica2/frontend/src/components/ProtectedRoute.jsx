import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore()

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If allowedRoles is provided and user role is not in allowed roles, redirect to unauthorized
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // If authenticated and authorized, render children
  return children
}

export default ProtectedRoute