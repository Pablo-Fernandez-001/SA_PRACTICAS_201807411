import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// Componente de ruta protegida
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <PrivateRoute>
              <div>Admin Dashboard (Próximamente)</div>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/restaurant/dashboard" 
          element={
            <PrivateRoute>
              <div>Restaurant Dashboard (Próximamente)</div>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/delivery/dashboard" 
          element={
            <PrivateRoute>
              <div>Delivery Dashboard (Próximamente)</div>
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
