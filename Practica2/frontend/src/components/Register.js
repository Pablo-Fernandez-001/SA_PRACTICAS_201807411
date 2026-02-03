import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role_id: '2'
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
        
        if (!formData.name || !formData.email || !formData.password) {
            setError('Todos los campos son requeridos');
            return;
        }
        
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        
        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        
        try {
            const response = await axios.post('/api/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role_id: parseInt(formData.role_id)
            });

            if (response.data.success) {
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                navigate('/dashboard');
            } else {
                setError(response.data.message || 'Error en el registro');
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
                <h2>Crear Cuenta</h2>
                <p style={styles.subtitle}>Regístrate en Delivereats</p>
                
                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label htmlFor="name">Nombre Completo</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ingresa tu nombre"
                            required
                            style={styles.input}
                        />
                    </div>
                    
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
                            placeholder="Mínimo 6 caracteres"
                            required
                            style={styles.input}
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Repite tu contraseña"
                            required
                            style={styles.input}
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label htmlFor="role_id">Tipo de Cuenta</label>
                        <select
                            id="role_id"
                            name="role_id"
                            value={formData.role_id}
                            onChange={handleChange}
                            style={styles.select}
                        >
                            <option value="2">Cliente</option>
                            <option value="3">Restaurante</option>
                            <option value="4">Repartidor</option>
                        </select>
                    </div>
                    
                    <button 
                        type="submit" 
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>
                
                <div style={styles.link}>
                    ¿Ya tienes una cuenta? <Link to="/login" style={styles.linkText}>Inicia Sesión</Link>
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
    select: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '16px'
    },
    button: {
        width: '100%',
        padding: '12px',
        background: '#667eea',
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
        color: '#667eea',
        textDecoration: 'none',
        fontWeight: '500'
    }
};

export default Register;
