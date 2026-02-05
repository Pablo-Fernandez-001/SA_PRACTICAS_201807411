import React, { useState } from 'react'
import { 
  UsersIcon, 
  UserPlusIcon, 
  ChartBarIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'
import useAuthStore from '../../stores/authStore'
import RegisterUserForm from '../../components/RegisterUserForm'

const AdminDashboard = () => {
  const { user } = useAuthStore()
  const [showRegisterForm, setShowRegisterForm] = useState(false)

  const stats = [
    {
      name: 'Total Usuarios',
      value: '1,248',
      icon: UsersIcon,
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: 'Clientes Activos',
      value: '892',
      icon: UsersIcon,
      change: '+8%',
      changeType: 'increase',
    },
    {
      name: 'Restaurantes',
      value: '156',
      icon: BuildingStorefrontIcon,
      change: '+3%',
      changeType: 'increase',
    },
    {
      name: 'Repartidores',
      value: '89',
      icon: TruckIcon,
      change: '+5%',
      changeType: 'increase',
    },
  ]

  const recentUsers = [
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      role: 'CLIENTE',
      status: 'Activo',
      date: '2024-02-04',
    },
    {
      id: 2,
      name: 'Pizza Express',
      email: 'pizzaexpress@restaurant.com',
      role: 'RESTAURANTE',
      status: 'Activo',
      date: '2024-02-03',
    },
    {
      id: 3,
      name: 'María González',
      email: 'maria@delivery.com',
      role: 'REPARTIDOR',
      status: 'Activo',
      date: '2024-02-02',
    },
    {
      id: 4,
      name: 'Carlos Admin',
      email: 'carlos@admin.com',
      role: 'ADMIN',
      status: 'Activo',
      date: '2024-02-01',
    },
  ]

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800'
      case 'CLIENTE':
        return 'bg-green-100 text-green-800'
      case 'RESTAURANTE':
        return 'bg-blue-100 text-blue-800'
      case 'REPARTIDOR':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Activo':
        return 'bg-green-100 text-green-800'
      case 'Inactivo':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Panel de Administracion
            </h1>
            <p className="text-gray-600 mt-2">
              Bienvenido {user?.name}. Gestiona usuarios y monitorea el sistema.
            </p>
          </div>
          <button
            onClick={() => setShowRegisterForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlusIcon className="h-5 w-5" />
            <span>Registrar Usuario</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((item) => (
            <div key={item.name} className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <item.icon className="h-8 w-8 text-primary-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {item.value}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    item.changeType === 'increase' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.change}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Users */}
        <div className="card mb-8">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Usuarios Recientes
            </h3>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentUsers.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {userItem.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userItem.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(userItem.role)}`}>
                          {userItem.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(userItem.status)}`}>
                          {userItem.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userItem.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900 mr-4">
                          Editar
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Desactivar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <button 
            onClick={() => setShowRegisterForm(true)}
            className="card hover:shadow-lg transition-shadow duration-200"
          >
            <div className="card-body text-center">
              <UserPlusIcon className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nuevo Usuario
              </h3>
              <p className="text-gray-600">
                Registrar cliente o administrador
              </p>
            </div>
          </button>

          <button className="card hover:shadow-lg transition-shadow duration-200">
            <div className="card-body text-center">
              <ChartBarIcon className="h-12 w-12 text-secondary-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Reportes
              </h3>
              <p className="text-gray-600">
                Ver estadísticas y reportes
              </p>
            </div>
          </button>

          <button className="card hover:shadow-lg transition-shadow duration-200">
            <div className="card-body text-center">
              <BuildingStorefrontIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Restaurantes
              </h3>
              <p className="text-gray-600">
                Gestionar restaurantes
              </p>
            </div>
          </button>

          <button className="card hover:shadow-lg transition-shadow duration-200">
            <div className="card-body text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Alertas
              </h3>
              <p className="text-gray-600">
                Ver alertas del sistema
              </p>
            </div>
          </button>
        </div>

      </div>

      {/* Register User Modal */}
      {showRegisterForm && (
        <RegisterUserForm onClose={() => setShowRegisterForm(false)} />
      )}
    </div>
  )
}

export default AdminDashboard