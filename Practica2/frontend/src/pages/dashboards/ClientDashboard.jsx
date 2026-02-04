import React from 'react'
import { 
  UserIcon, 
  ShoppingBagIcon, 
  ClockIcon,
  StarIcon,
  TruckIcon 
} from '@heroicons/react/24/outline'
import useAuthStore from '../../stores/authStore'

const ClientDashboard = () => {
  const { user } = useAuthStore()

  const stats = [
    {
      name: 'Pedidos Totales',
      value: '24',
      icon: ShoppingBagIcon,
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: 'Pedidos Este Mes',
      value: '8',
      icon: ClockIcon,
      change: '+4.5%',
      changeType: 'increase',
    },
    {
      name: 'Dinero Gastado',
      value: 'Q1,245',
      icon: StarIcon,
      change: '+2.1%',
      changeType: 'increase',
    },
    {
      name: 'Entregas Pendientes',
      value: '2',
      icon: TruckIcon,
      change: null,
      changeType: null,
    },
  ]

  const recentOrders = [
    {
      id: 1,
      restaurant: 'Pizza GT',
      items: 'Pizza Pepperoni, Coca Cola',
      total: 'Q87.50',
      status: 'Entregado',
      date: '2024-02-01',
    },
    {
      id: 2,
      restaurant: 'Burger King',
      items: 'Whopper Combo',
      total: 'Q65.00',
      status: 'En camino',
      date: '2024-02-04',
    },
    {
      id: 3,
      restaurant: 'Sushi Express',
      items: '12 piezas California Roll',
      total: 'Q125.00',
      status: 'Preparando',
      date: '2024-02-04',
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Entregado':
        return 'bg-green-100 text-green-800'
      case 'En camino':
        return 'bg-blue-100 text-blue-800'
      case 'Preparando':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Hola {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenido a tu dashboard. Aquí puedes ver tus pedidos y estadísticas.
          </p>
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
                {item.change && (
                  <div className="mt-4">
                    <div className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${
                      item.changeType === 'increase' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.change}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="card mb-8">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Pedidos Recientes
            </h3>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restaurante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.restaurant}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.items}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {order.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="card hover:shadow-lg transition-shadow duration-200">
            <div className="card-body text-center">
              <ShoppingBagIcon className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nuevo Pedido
              </h3>
              <p className="text-gray-600">
                Explora restaurantes y haz un nuevo pedido
              </p>
            </div>
          </button>

          <button className="card hover:shadow-lg transition-shadow duration-200">
            <div className="card-body text-center">
              <ClockIcon className="h-12 w-12 text-secondary-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Mis Pedidos
              </h3>
              <p className="text-gray-600">
                Ve el historial completo de tus pedidos
              </p>
            </div>
          </button>

          <button className="card hover:shadow-lg transition-shadow duration-200">
            <div className="card-body text-center">
              <UserIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Mi Perfil
              </h3>
              <p className="text-gray-600">
                Actualiza tu información personal
              </p>
            </div>
          </button>
        </div>

      </div>
    </div>
  )
}

export default ClientDashboard