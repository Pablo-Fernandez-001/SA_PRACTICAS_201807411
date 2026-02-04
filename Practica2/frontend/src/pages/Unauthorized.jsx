import React from 'react'
import { Link } from 'react-router-dom'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <ExclamationTriangleIcon className="h-24 w-24 text-red-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Acceso Denegado
          </h1>
          <p className="text-gray-600 mb-8">
            No tienes permisos para acceder a esta página. 
            Contacta al administrador si crees que esto es un error.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="btn-primary w-full"
          >
            Volver al Dashboard
          </Link>
          
          <Link
            to="/"
            className="btn-secondary w-full"
          >
            Ir al Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized