import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!formData.email || !formData.password) {
            setError('Email y contraseña son requeridos');
            return;
        }

        setLoading(true);
        
        try {
            const response = await axios.post('/api/auth/login', {
                email: formData.email,
                password: formData.password
            });

            if (response.data.success) {
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                
                const userRole = response.data.data.user.role_id;
                
                if (userRole === 1) {
                    navigate('/admin/dashboard');
                } else if (userRole === 3) {
                    navigate('/restaurant/dashboard');
                } else if (userRole === 4) {
                    navigate('/delivery/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setError(response.data.message || 'Error en el login');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>Iniciar Sesión</h2>
                <p style={styles.subtitle}>Accede a tu cuenta de Delivereats</p>
                
                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="ejemplo@mail.com"
                            required
                            style={styles.input}
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Ingresa tu contraseña"
                            required
                            style={styles.input}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>
                
                <div style={styles.link}>
                    ¿No tienes cuenta? <Link to="/register" style={styles.linkText}>Regístrate aquí</Link>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        padding: '20px'
    },
    card: {
        background: 'white',
        borderRadius: '10px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '400px'
    },
    subtitle: {
        color: '#666',
        textAlign: 'center',
        marginBottom: '30px'
    },
    error: {
        background: '#fee',
        color: '#c33',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '20px',
        border: '1px solid #fcc'
    },
    formGroup: {
        marginBottom: '20px'
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '16px'
    },
    button: {
        width: '100%',
        padding: '12px',
        background: '#f5576c',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    link: {
        textAlign: 'center',
        marginTop: '20px',
        color: '#666'
    },
    linkText: {
        color: '#f5576c',
        textDecoration: 'none',
        fontWeight: '500'
    }
};

export default Login;
