import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleLabel = {
    ADMIN: 'Administrador',
    CLIENTE: 'Cliente',
    RESTAURANTE: 'Restaurante',
    REPARTIDOR: 'Repartidor',
  }

  return (
    <nav className="bg-orange-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          🍔 DeliverEats
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-orange-200 transition">Restaurantes</Link>
            <Link to="/my-orders" className="hover:text-orange-200 transition">Mis Órdenes</Link>
            {user.role === 'ADMIN' && (
              <Link to="/admin" className="hover:text-orange-200 transition">Admin</Link>
            )}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 bg-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-800 transition"
              >
                <span className="text-sm">{user.name}</span>
                <span className="text-xs bg-orange-500 px-2 py-0.5 rounded">{roleLabel[user.role] || user.role}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl z-50">
                  <div className="p-3 border-b">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-gray-500">ID: {user.id}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-b-lg transition"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link to="/login" className="bg-white text-orange-600 px-4 py-1.5 rounded-lg font-medium hover:bg-orange-50 transition">
              Iniciar Sesión
            </Link>
            <Link to="/register" className="border border-white px-4 py-1.5 rounded-lg hover:bg-orange-700 transition">
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
