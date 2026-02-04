import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCartIcon, UserIcon, BuildingStorefrontIcon, TruckIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import useAuthStore from '../stores/authStore'

const Navbar = () => {
  const { user, logout, isAuthenticated, getDashboardRoute } = useAuthStore()

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BuildingStorefrontIcon className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-gray-900">DeliverEats</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Dashboard Link */}
                <Link 
                  to={getDashboardRoute()} 
                  className="text-gray-700 hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>

                {user?.role === 'CLIENTE' && (
                  <>
                    <Link to="/restaurants" className="text-gray-700 hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium">
                      Restaurantes
                    </Link>
                    <Link to="/orders" className="text-gray-700 hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium">
                      Mis Pedidos
                    </Link>
                    <Link to="/cart" className="text-gray-700 hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium">
                      <ShoppingCartIcon className="h-6 w-6" />
                    </Link>
                  </>
                )}
                
                {user?.role === 'RESTAURANTE' && (
                  <>
                    <Link to="/restaurant/menu" className="text-gray-700 hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium">
                      Mi Menú
                    </Link>
                    <Link to="/restaurant/orders" className="text-gray-700 hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium">
                      Pedidos
                    </Link>
                  </>
                )}

                {user?.role === 'REPARTIDOR' && (
                  <>
                    <Link to="/deliveries" className="text-gray-700 hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium">
                      <TruckIcon className="h-6 w-6" />
                      Entregas
                    </Link>
                  </>
                )}

                <div className="flex items-center space-x-3">
                  <UserIcon className="h-6 w-6 text-gray-500" />
                  <span className="text-sm text-gray-700">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login" className="text-gray-700 hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="btn-primary">
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar