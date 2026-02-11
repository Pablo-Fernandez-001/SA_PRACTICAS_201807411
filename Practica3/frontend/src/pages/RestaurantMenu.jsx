import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { catalogAPI, ordersAPI } from '../services/api'
import useAuthStore from '../stores/authStore'

export default function RestaurantMenu() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [orderLoading, setOrderLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [restRes, menuRes] = await Promise.all([
        catalogAPI.getRestaurant(id),
        catalogAPI.getMenu(id)
      ])
      setRestaurant(restRes.data.data || restRes.data)
      setMenuItems(menuRes.data.data || menuRes.data || [])
    } catch (err) {
      setError('Error al cargar el menú: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.menu_item_id === item.id)
      if (existing) {
        return prev.map(c => c.menu_item_id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      }
      return [...prev, { menu_item_id: item.id, name: item.name, price: parseFloat(item.price), quantity: 1 }]
    })
  }

  const removeFromCart = (menuItemId) => {
    setCart(prev => prev.filter(c => c.menu_item_id !== menuItemId))
  }

  const updateQty = (menuItemId, delta) => {
    setCart(prev => prev.map(c => {
      if (c.menu_item_id !== menuItemId) return c
      const newQty = c.quantity + delta
      return newQty < 1 ? c : { ...c, quantity: newQty }
    }))
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0)

  const placeOrder = async () => {
    if (cart.length === 0) return
    setOrderLoading(true)
    setMessage(null)
    setError(null)
    try {
      const orderData = {
        restaurant_id: parseInt(id),
        items: cart.map(c => ({
          menu_item_id: c.menu_item_id,
          quantity: c.quantity,
          unit_price: c.price
        })),
        delivery_address: 'Dirección de prueba, Ciudad de Guatemala'
      }
      const res = await ordersAPI.createOrder(orderData)
      setMessage('¡Pedido creado exitosamente! ID: ' + (res.data.data?.id || res.data.orderId || 'OK'))
      setCart([])
    } catch (err) {
      const errData = err.response?.data
      let errMsg = errData?.message || err.message
      if (errData?.failedItems) {
        errMsg += '\n\nDetalles de validación gRPC:\n' +
          errData.failedItems.map(f => `• Item ${f.menu_item_id}: ${f.error_message}`).join('\n')
      }
      setError('Error al crear pedido: ' + errMsg)
    } finally {
      setOrderLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <button onClick={() => navigate('/')} className="text-orange-600 hover:underline mb-4 inline-block">
        ← Volver a restaurantes
      </button>

      {restaurant && (
        <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 mb-6 text-white">
          <h1 className="text-3xl font-bold">{restaurant.name}</h1>
          <p className="mt-1 opacity-90">{restaurant.description || 'Restaurante disponible'}</p>
          <span className="inline-block mt-2 text-sm bg-white/20 px-3 py-1 rounded-full">
            {restaurant.category || 'General'}
          </span>
        </div>
      )}

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 whitespace-pre-wrap">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 whitespace-pre-wrap">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Menú</h2>
          {menuItems.length === 0 ? (
            <p className="text-gray-400">No hay items disponibles.</p>
          ) : (
            <div className="space-y-3">
              {menuItems.map(item => (
                <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.description || ''}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-orange-600 font-bold">Q{parseFloat(item.price).toFixed(2)}</span>
                      <span className={`text-xs ${item.is_available ? 'text-green-500' : 'text-red-500'}`}>
                        {item.is_available ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    disabled={!item.is_available}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    + Agregar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart */}
        <div>
          <div className="bg-white rounded-2xl shadow-md p-5 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Carrito</h2>
            {cart.length === 0 ? (
              <p className="text-gray-400 text-sm">Tu carrito está vacío</p>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {cart.map(c => (
                    <div key={c.menu_item_id} className="flex items-center justify-between text-sm">
                      <div className="flex-1">
                        <p className="font-medium">{c.name}</p>
                        <p className="text-gray-500">Q{c.price.toFixed(2)} x {c.quantity}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQty(c.menu_item_id, -1)} className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">-</button>
                        <span className="w-6 text-center text-sm">{c.quantity}</span>
                        <button onClick={() => updateQty(c.menu_item_id, 1)} className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">+</button>
                        <button onClick={() => removeFromCart(c.menu_item_id)} className="ml-1 text-red-400 hover:text-red-600">×</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 mb-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-orange-600">Q{cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={placeOrder}
                  disabled={orderLoading}
                  className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                >
                  {orderLoading ? 'Procesando...' : 'Realizar Pedido'}
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Los items se validan vía gRPC antes de confirmar
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
