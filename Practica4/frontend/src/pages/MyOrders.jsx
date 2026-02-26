import { useState, useEffect } from 'react'
import { ordersAPI } from '../services/api'
import useAuthStore from '../stores/authStore'
import { useSocketReload } from '../hooks/useSocket'

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancelLoading, setCancelLoading] = useState(null)
  const [message, setMessage] = useState(null)
  const { user } = useAuthStore()

  useEffect(() => {
    fetchOrders()
  }, [user])

  const fetchOrders = async () => {
    if (!user || !user.id) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const res = await ordersAPI.getByUser(user.id)
      setOrders(res.data.data || res.data || [])
    } catch (err) {
      setError('Error al cargar pedidos: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  // Real-time updates
  useSocketReload(['order:statusChanged', 'order:created', 'delivery:updated'], fetchOrders)

  const statusColors = {
    CREADA: 'bg-gray-100 text-gray-800',
    PENDIENTE: 'bg-yellow-100 text-yellow-800',
    CONFIRMADO: 'bg-blue-100 text-blue-800',
    EN_PROCESO: 'bg-blue-100 text-blue-800',
    EN_PREPARACION: 'bg-purple-100 text-purple-800',
    FINALIZADA: 'bg-purple-100 text-purple-800',
    EN_CAMINO: 'bg-indigo-100 text-indigo-800',
    ENTREGADO: 'bg-green-100 text-green-800',
    CANCELADO: 'bg-red-100 text-red-800',
    RECHAZADA: 'bg-red-100 text-red-800',
  }

  const statusLabels = {
    CREADA: 'Creada',
    EN_PROCESO: 'En Proceso',
    FINALIZADA: 'Lista para Envío',
    EN_CAMINO: 'En Camino',
    ENTREGADO: 'Entregado',
    CANCELADO: 'Cancelado',
    RECHAZADA: 'Rechazada',
  }

  // Orders that can be cancelled by client
  const canCancel = (status) => ['CREADA', 'EN_PROCESO'].includes(status)

  const handleCancel = async (orderId) => {
    if (!window.confirm('¿Estás seguro de cancelar esta orden?')) return
    setCancelLoading(orderId)
    try {
      await ordersAPI.cancel(orderId)
      setMessage({ text: 'Orden cancelada exitosamente', type: 'success' })
      fetchOrders()
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Error al cancelar', type: 'error' })
    }
    setCancelLoading(null)
    setTimeout(() => setMessage(null), 3000)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mis Pedidos</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
          <button onClick={fetchOrders} className="ml-3 underline">Reintentar</button>
        </div>
      )}

      {message && (
        <div className={`px-4 py-3 rounded-lg mb-4 ${message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
          {message.text}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No tienes pedidos aún.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">Pedido #{order.id}</h3>
                  <p className="text-sm text-gray-500">
                    {order.created_at ? new Date(order.created_at).toLocaleString('es-GT') : ''}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1 mb-3">
                <p><span className="font-medium">Restaurante:</span> {order.restaurantName || `ID ${order.restaurantId}`}</p>
                <p><span className="font-medium">Dirección de entrega:</span> {order.delivery_address || order.deliveryAddress || 'No especificada'}</p>
                {order.notes && <p><span className="font-medium">Notas:</span> {order.notes}</p>}
              </div>
              
              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div className="border-t pt-3 mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">Items:</p>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-gray-600">
                          Q{parseFloat(item.subtotal || (item.price * item.quantity)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm text-gray-500">
                  {order.items?.length || 0} item(s)
                </span>
                <div className="flex items-center gap-3">
                  {canCancel(order.status) && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={cancelLoading === order.id}
                      className="text-sm text-red-600 hover:text-red-800 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 disabled:opacity-50 transition"
                    >
                      {cancelLoading === order.id ? 'Cancelando...' : 'Cancelar Orden'}
                    </button>
                  )}
                  <span className="text-lg font-bold text-orange-600">
                    Q{parseFloat(order.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={fetchOrders}
        className="mt-6 bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition"
      >
        Actualizar
      </button>
    </div>
  )
}
