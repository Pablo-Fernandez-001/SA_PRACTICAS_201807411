import { useState, useEffect } from 'react'
import { catalogAPI, ordersAPI, deliveryAPI } from '../services/api'

export default function AdminPanel() {
  const [tab, setTab] = useState('restaurants')
  const [restaurants, setRestaurants] = useState([])
  const [orders, setOrders] = useState([])
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  // New restaurant form
  const [newRest, setNewRest] = useState({ name: '', description: '', category: '', address: '' })
  // New menu item form
  const [newItem, setNewItem] = useState({ restaurant_id: '', name: '', description: '', price: '', category: '' })

  useEffect(() => {
    if (tab === 'restaurants') fetchRestaurants()
    if (tab === 'orders') fetchOrders()
    if (tab === 'deliveries') fetchDeliveries()
  }, [tab])

  const fetchRestaurants = async () => {
    setLoading(true)
    try {
      const res = await catalogAPI.getRestaurants()
      setRestaurants(res.data.data || res.data || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await ordersAPI.getOrders()
      setOrders(res.data.data || res.data || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const fetchDeliveries = async () => {
    setLoading(true)
    try {
      const res = await deliveryAPI.getDeliveries()
      setDeliveries(res.data.data || res.data || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const createRestaurant = async (e) => {
    e.preventDefault()
    try {
      await catalogAPI.createRestaurant(newRest)
      setMessage('✅ Restaurante creado')
      setNewRest({ name: '', description: '', category: '', address: '' })
      fetchRestaurants()
    } catch (err) {
      setMessage('❌ Error: ' + (err.response?.data?.message || err.message))
    }
    setTimeout(() => setMessage(null), 4000)
  }

  const createMenuItem = async (e) => {
    e.preventDefault()
    try {
      await catalogAPI.createMenuItem({
        ...newItem,
        restaurant_id: parseInt(newItem.restaurant_id),
        price: parseFloat(newItem.price)
      })
      setMessage('✅ Item de menú creado')
      setNewItem({ restaurant_id: '', name: '', description: '', price: '', category: '' })
    } catch (err) {
      setMessage('❌ Error: ' + (err.response?.data?.message || err.message))
    }
    setTimeout(() => setMessage(null), 4000)
  }

  const tabs = [
    { key: 'restaurants', label: '🍽️ Restaurantes' },
    { key: 'orders', label: '📦 Pedidos' },
    { key: 'deliveries', label: '🚚 Entregas' },
    { key: 'create', label: '➕ Crear' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">⚙️ Panel de Administración</h1>

      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
              tab === t.key
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      )}

      {/* Restaurants Tab */}
      {tab === 'restaurants' && !loading && (
        <div className="space-y-3">
          {restaurants.map(r => (
            <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold">{r.name}</h3>
                <p className="text-sm text-gray-500">{r.description} — {r.category}</p>
              </div>
              <span className={`text-sm font-medium ${r.is_active ? 'text-green-600' : 'text-red-500'}`}>
                {r.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          ))}
          {restaurants.length === 0 && <p className="text-gray-400">Sin restaurantes</p>}
        </div>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && !loading && (
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">Pedido #{o.id}</h3>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{o.status}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Usuario: {o.user_id} | Restaurante: {o.restaurant_id} | Total: Q{parseFloat(o.total || 0).toFixed(2)}
              </p>
            </div>
          ))}
          {orders.length === 0 && <p className="text-gray-400">Sin pedidos</p>}
        </div>
      )}

      {/* Deliveries Tab */}
      {tab === 'deliveries' && !loading && (
        <div className="space-y-3">
          {deliveries.map(d => (
            <div key={d.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">Entrega #{d.id}</h3>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{d.status}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Pedido: {d.order_id} | Repartidor: {d.driver_id || 'Sin asignar'}
              </p>
            </div>
          ))}
          {deliveries.length === 0 && <p className="text-gray-400">Sin entregas</p>}
        </div>
      )}

      {/* Create Tab */}
      {tab === 'create' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* New Restaurant */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-bold mb-4">Nuevo Restaurante</h3>
            <form onSubmit={createRestaurant} className="space-y-3">
              <input type="text" placeholder="Nombre" value={newRest.name} onChange={e => setNewRest({...newRest, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" required />
              <input type="text" placeholder="Descripción" value={newRest.description} onChange={e => setNewRest({...newRest, description: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
              <input type="text" placeholder="Categoría" value={newRest.category} onChange={e => setNewRest({...newRest, category: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
              <input type="text" placeholder="Dirección" value={newRest.address} onChange={e => setNewRest({...newRest, address: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
              <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-700">Crear Restaurante</button>
            </form>
          </div>

          {/* New Menu Item */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-bold mb-4">Nuevo Item de Menú</h3>
            <form onSubmit={createMenuItem} className="space-y-3">
              <input type="number" placeholder="ID Restaurante" value={newItem.restaurant_id} onChange={e => setNewItem({...newItem, restaurant_id: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" required />
              <input type="text" placeholder="Nombre" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" required />
              <input type="text" placeholder="Descripción" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
              <input type="number" step="0.01" placeholder="Precio" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" required />
              <input type="text" placeholder="Categoría" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
              <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-700">Crear Item</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
