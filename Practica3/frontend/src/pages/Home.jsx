import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { catalogAPI } from '../services/api'
import useAuthStore from '../stores/authStore'

export default function Home() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuthStore()

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      setLoading(true)
      const res = await catalogAPI.getRestaurants()
      setRestaurants(res.data.data || res.data || [])
    } catch (err) {
      setError('Error al cargar restaurantes: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          ¡Bienvenido{user?.name ? `, ${user.name}` : ''}!
        </h1>
        <p className="text-gray-500 mt-2">Elige tu restaurante favorito y haz tu pedido</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
          <button onClick={fetchRestaurants} className="ml-3 underline">Reintentar</button>
        </div>
      )}

      {restaurants.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No hay restaurantes disponibles aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((r) => (
            <Link
              key={r.id}
              to={`/restaurant/${r.id}`}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden"
            >
              <div className="h-40 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <span className="text-6xl text-white font-bold">{r.name.charAt(0)}</span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800">{r.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{r.description || 'Restaurante disponible'}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                    {r.category || 'General'}
                  </span>
                  <span className={`text-xs font-medium ${r.is_active ? 'text-green-600' : 'text-red-500'}`}>
                    {r.is_active ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
