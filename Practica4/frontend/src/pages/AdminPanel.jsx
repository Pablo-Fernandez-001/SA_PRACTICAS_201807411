import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { catalogAPI, ordersAPI, deliveryAPI } from '../services/api'
import { PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useSocket } from '../hooks/useSocket'

export default function AdminPanel() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('restaurants')
  const [restaurants, setRestaurants] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [orders, setOrders] = useState([])
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  
  // Edit states
  const [editingRestaurant, setEditingRestaurant] = useState(null)
  const [editingMenuItem, setEditingMenuItem] = useState(null)

  // New restaurant form
  const [newRest, setNewRest] = useState({ name: '', description: '', category: '', address: '' })
  // New menu item form
  const [newItem, setNewItem] = useState({ restaurant_id: '', name: '', description: '', price: '' })

  useEffect(() => {
    if (tab === 'restaurants') fetchRestaurants()
    if (tab === 'menu-items') fetchMenuItems()
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

  const fetchMenuItems = async () => {
    setLoading(true)
    try {
      const res = await catalogAPI.getAllMenuItems()
      setMenuItems(res.data.data || res.data || [])
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

  // Real-time updates for orders/deliveries tabs
  useSocket('order:statusChanged', () => {
    if (tab === 'orders') fetchOrders()
    if (tab === 'deliveries') fetchDeliveries()
  })
  useSocket('order:created', () => {
    if (tab === 'orders') fetchOrders()
  })
  useSocket('delivery:updated', () => {
    if (tab === 'deliveries') fetchDeliveries()
  })

  // Restaurant CRUD
  const createRestaurant = async (e) => {
    e.preventDefault()
    try {
      await catalogAPI.createRestaurant(newRest)
      setMessage('Restaurante creado exitosamente')
      setNewRest({ name: '', description: '', category: '', address: '' })
      fetchRestaurants()
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.message || err.message))
    }
    setTimeout(() => setMessage(null), 4000)
  }

  const updateRestaurant = async (id, data) => {
    try {
      await catalogAPI.updateRestaurant(id, data)
      setMessage('Restaurante actualizado')
      setEditingRestaurant(null)
      fetchRestaurants()
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.message || err.message))
    }
    setTimeout(() => setMessage(null), 4000)
  }

  const deleteRestaurant = async (id) => {
    if (!confirm('¿Eliminar este restaurante?')) return
    try {
      await catalogAPI.deleteRestaurant(id)
      setMessage('Restaurante eliminado')
      fetchRestaurants()
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.message || err.message))
    }
    setTimeout(() => setMessage(null), 4000)
  }

  const toggleRestaurant = async (id) => {
    try {
      await catalogAPI.toggleRestaurant(id)
      setMessage('Estado actualizado')
      fetchRestaurants()
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.message || err.message))
    }
    setTimeout(() => setMessage(null), 4000)
  }

  // Menu Item CRUD
  const createMenuItem = async (e) => {
    e.preventDefault()
    try {
      await catalogAPI.createMenuItem({
        restaurant_id: parseInt(newItem.restaurant_id),
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price)
      })
      setMessage('Item de menú creado')
      setNewItem({ restaurant_id: '', name: '', description: '', price: '' })
      if (tab === 'menu-items') fetchMenuItems()
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.message || err.message))
    }
    setTimeout(() => setMessage(null), 4000)
  }

  const updateMenuItem = async (id, data) => {
    try {
      // Ensure price is a number and remove category (not in model)
      const payload = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price)
      }
      await catalogAPI.updateMenuItem(id, payload)
      setMessage('Item actualizado')
      setEditingMenuItem(null)
      fetchMenuItems()
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.message || err.response?.data?.error || err.message))
    }
    setTimeout(() => setMessage(null), 4000)
  }

  const deleteMenuItem = async (id) => {
    if (!confirm('¿Eliminar este item?')) return
    try {
      await catalogAPI.deleteMenuItem(id)
      setMessage('Item eliminado')
      fetchMenuItems()
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.message || err.message))
    }
    setTimeout(() => setMessage(null), 4000)
  }

  const toggleMenuItem = async (id) => {
    try {
      await catalogAPI.toggleMenuItem(id)
      setMessage('Disponibilidad actualizada')
      fetchMenuItems()
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.message || err.message))
    }
    setTimeout(() => setMessage(null), 4000)
  }

  // Delivery Actions
  const handleDeliveryAction = async (action, id) => {
    try {
      if (action === 'start') {
        await deliveryAPI.start(id)
        setMessage('Entrega iniciada')
      } else if (action === 'complete') {
        await deliveryAPI.complete(id)
        setMessage('Entrega completada')
      } else if (action === 'cancel') {
        if (!confirm('¿Cancelar esta entrega?')) return
        await deliveryAPI.cancel(id)
        setMessage('Entrega cancelada')
      }
      fetchDeliveries()
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.message || err.message))
    }
    setTimeout(() => setMessage(null), 4000)
  }

  // Order Actions
  const handleOrderStatusChange = async (id, status) => {
    try {
      await ordersAPI.updateStatus(id, status)
      setMessage('Estado de pedido actualizado')
      fetchOrders()
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.message || err.message))
    }
    setTimeout(() => setMessage(null), 4000)
  }

  const handleOrderCancel = async (id) => {
    if (!confirm('¿Cancelar este pedido?')) return
    try {
      await ordersAPI.cancel(id)
      setMessage('Pedido cancelado')
      fetchOrders()
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.message || err.message))
    }
    setTimeout(() => setMessage(null), 4000)
  }

  const tabs = [
    { key: 'users', label: 'Usuarios', action: () => navigate('/admin/users') },
    { key: 'restaurants', label: 'Restaurantes' },
    { key: 'menu-items', label: 'Menu Items' },
    { key: 'orders', label: 'Pedidos' },
    { key: 'deliveries', label: 'Entregas' },
    { key: 'create', label: 'Crear' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>

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
            onClick={() => t.action ? t.action() : setTab(t.key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
              tab === t.key && !t.action
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
        <div className="bg-white rounded-xl shadow">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Restaurantes ({restaurants.length})</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dirección</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {restaurants.map(r => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 text-sm">{r.id}</td>
                      <td className="px-4 py-3 text-sm font-medium">{r.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{r.address || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${r.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {r.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm space-x-2">
                        <button onClick={() => setEditingRestaurant(r)} className="text-orange-600 hover:text-orange-800">
                          <PencilIcon className="h-4 w-4 inline" />
                        </button>
                        <button onClick={() => toggleRestaurant(r.id)} className="text-blue-600 hover:text-blue-800">
                          {r.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button onClick={() => deleteRestaurant(r.id)} className="text-red-600 hover:text-red-800">
                          <TrashIcon className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {restaurants.length === 0 && <p className="text-gray-400 text-center py-4">Sin restaurantes</p>}
            </div>
          </div>
        </div>
      )}

      {/* Menu Items Tab */}
      {tab === 'menu-items' && !loading && (
        <div className="bg-white rounded-xl shadow">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Items de Menú ({menuItems.length})</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurante</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {menuItems.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm">{item.id}</td>
                      <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-sm">Q{parseFloat(item.price).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.restaurant_id}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.is_available ? 'Disponible' : 'No disponible'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm space-x-2">
                        <button onClick={() => setEditingMenuItem(item)} className="text-orange-600 hover:text-orange-800">
                          <PencilIcon className="h-4 w-4 inline" />
                        </button>
                        <button onClick={() => toggleMenuItem(item.id)} className="text-blue-600 hover:text-blue-800">
                          {item.is_available ? 'Ocultar' : 'Mostrar'}
                        </button>
                        <button onClick={() => deleteMenuItem(item.id)} className="text-red-600 hover:text-red-800">
                          <TrashIcon className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {menuItems.length === 0 && <p className="text-gray-400 text-center py-4">Sin items de menú</p>}
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && !loading && (
        <div className="bg-white rounded-xl shadow">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Pedidos ({orders.length})</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurante</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="px-4 py-3 text-sm">{o.id}</td>
                      <td className="px-4 py-3 text-sm font-medium">{o.order_number || `#${o.id}`}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{o.user_id}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{o.restaurant_name || o.restaurant_id}</td>
                      <td className="px-4 py-3 text-sm font-medium">Q{parseFloat(o.total || 0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          o.status === 'ENTREGADO' ? 'bg-green-100 text-green-800' :
                          o.status === 'EN_PROCESO' ? 'bg-blue-100 text-blue-800' :
                          o.status === 'EN_CAMINO' ? 'bg-indigo-100 text-indigo-800' :
                          o.status === 'FINALIZADA' ? 'bg-purple-100 text-purple-800' :
                          o.status === 'CANCELADO' || o.status === 'RECHAZADA' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {{
                            CREADA: 'Nueva',
                            EN_PROCESO: 'En Proceso',
                            FINALIZADA: 'Lista',
                            EN_CAMINO: 'En Camino',
                            ENTREGADO: 'Entregado',
                            CANCELADO: 'Cancelado',
                            RECHAZADA: 'Rechazada'
                          }[o.status] || o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm space-x-2">
                        {o.status === 'pending' && (
                          <>
                            <button onClick={() => handleOrderStatusChange(o.id, 'in_progress')} className="text-blue-600 hover:text-blue-800 text-xs">
                              Procesar
                            </button>
                            <button onClick={() => handleOrderCancel(o.id)} className="text-red-600 hover:text-red-800 text-xs">
                              Cancelar
                            </button>
                          </>
                        )}
                        {o.status === 'in_progress' && (
                          <button onClick={() => handleOrderStatusChange(o.id, 'delivered')} className="text-green-600 hover:text-green-800 text-xs">
                            Entregar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && <p className="text-gray-400 text-center py-4">Sin pedidos</p>}
            </div>
          </div>
        </div>
      )}

      {/* Deliveries Tab */}
      {tab === 'deliveries' && !loading && (
        <div className="bg-white rounded-xl shadow">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Entregas ({deliveries.length})</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Repartidor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deliveries.map(d => (
                    <tr key={d.id}>
                      <td className="px-4 py-3 text-sm">{d.id}</td>
                      <td className="px-4 py-3 text-sm font-medium">#{d.order_id}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{d.driver_id || 'Sin asignar'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          d.status === 'ENTREGADO' || d.status === 'completed' ? 'bg-green-100 text-green-800' :
                          d.status === 'EN_CAMINO' || d.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                          d.status === 'CANCELADO' || d.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {{
                            EN_CAMINO: 'En Camino',
                            ENTREGADO: 'Entregado',
                            CANCELADO: 'Cancelado'
                          }[d.status] || d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm space-x-2">
                        {d.status === 'pending' && (
                          <button onClick={() => handleDeliveryAction('start', d.id)} className="text-blue-600 hover:text-blue-800 text-xs">
                            Iniciar
                          </button>
                        )}
                        {d.status === 'in_transit' && (
                          <button onClick={() => handleDeliveryAction('complete', d.id)} className="text-green-600 hover:text-green-800 text-xs">
                            Completar
                          </button>
                        )}
                        {['pending', 'in_transit'].includes(d.status) && (
                          <button onClick={() => handleDeliveryAction('cancel', d.id)} className="text-red-600 hover:text-red-800 text-xs">
                            Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {deliveries.length === 0 && <p className="text-gray-400 text-center py-4">Sin entregas</p>}
            </div>
          </div>
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
              <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-700">Crear Item</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Restaurant Modal */}
      {editingRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Editar Restaurante</h3>
              <button onClick={() => setEditingRestaurant(null)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              updateRestaurant(editingRestaurant.id, {
                name: formData.get('name'),
                description: formData.get('description'),
                category: formData.get('category'),
                address: formData.get('address')
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input type="text" name="name" defaultValue={editingRestaurant.name} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <input type="text" name="description" defaultValue={editingRestaurant.description} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <input type="text" name="category" defaultValue={editingRestaurant.category} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dirección</label>
                <input type="text" name="address" defaultValue={editingRestaurant.address} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditingRestaurant(null)} className="flex-1 border rounded-lg py-2 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-orange-600 text-white rounded-lg py-2 hover:bg-orange-700">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Menu Item Modal */}
      {editingMenuItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Editar Item de Menú</h3>
              <button onClick={() => setEditingMenuItem(null)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              updateMenuItem(editingMenuItem.id, {
                name: formData.get('name'),
                description: formData.get('description'),
                price: formData.get('price')
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input type="text" name="name" defaultValue={editingMenuItem.name} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <input type="text" name="description" defaultValue={editingMenuItem.description} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Precio</label>
                <input type="number" step="0.01" name="price" defaultValue={editingMenuItem.price} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditingMenuItem(null)} className="flex-1 border rounded-lg py-2 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-orange-600 text-white rounded-lg py-2 hover:bg-orange-700">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
