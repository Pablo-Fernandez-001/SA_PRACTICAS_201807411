import React from 'react'
import { Link } from 'react-router-dom'
import { 
  BuildingStorefrontIcon, 
  TruckIcon, 
  ClockIcon, 
  StarIcon 
} from '@heroicons/react/24/outline'
import useAuthStore from '../stores/authStore'

const Home = () => {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              DeliverEats
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Tu comida favorita, entregada rápido y fresco
            </p>
            {!isAuthenticated ? (
              <div className="space-x-4">
                <Link to="/register" className="btn-secondary text-lg px-8 py-3">
                  Comenzar
                </Link>
                <Link to="/login" className="border border-white text-white hover:bg-white hover:text-primary-500 font-medium py-3 px-8 rounded-lg transition duration-200 ease-in-out">
                  Iniciar Sesión
                </Link>
              </div>
            ) : (
              <div className="space-x-4">
                {user?.role === 'CLIENTE' && (
                  <Link to="/restaurants" className="btn-secondary text-lg px-8 py-3">
                    Ver Restaurantes
                  </Link>
                )}
                {user?.role === 'RESTAURANTE' && (
                  <Link to="/restaurant/menu" className="btn-secondary text-lg px-8 py-3">
                    Gestionar Menú
                  </Link>
                )}
                {user?.role === 'REPARTIDOR' && (
                  <Link to="/deliveries" className="btn-secondary text-lg px-8 py-3">
                    Ver Entregas
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¿Por qué elegir DeliverEats?
          </h2>
          <p className="text-lg text-gray-600">
            La mejor experiencia de delivery de comida en la ciudad
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <BuildingStorefrontIcon className="h-8 w-8 text-primary-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Amplia Variedad
            </h3>
            <p className="text-gray-600">
              Cientos de restaurantes y opciones para todos los gustos
            </p>
          </div>

          <div className="text-center">
            <div className="bg-secondary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <TruckIcon className="h-8 w-8 text-secondary-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Entrega Rápida
            </h3>
            <p className="text-gray-600">
              Seguimiento en tiempo real y entregas en 30-45 minutos
            </p>
          </div>

          <div className="text-center">
            <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <StarIcon className="h-8 w-8 text-yellow-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Calidad Garantizada
            </h3>
            <p className="text-gray-600">
              Solo trabajamos con los mejores restaurantes de la ciudad
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-500 mb-2">500+</div>
              <div className="text-gray-600">Restaurantes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-500 mb-2">10K+</div>
              <div className="text-gray-600">Entregas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-500 mb-2">25 min</div>
              <div className="text-gray-600">Tiempo Promedio</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-500 mb-2">4.8★</div>
              <div className="text-gray-600">Calificación</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para ordenar?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Únete a miles de usuarios satisfechos
          </p>
          {!isAuthenticated && (
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Crear Cuenta Gratis
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home