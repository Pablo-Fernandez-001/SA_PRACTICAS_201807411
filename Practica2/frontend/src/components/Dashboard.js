import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
            navigate('/login');
            return;
        }

        setUser(JSON.parse(storedUser));
        fetchProfile();
    }, [navigate]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer \${token}`
                }
            });

            if (response.data.success) {
                setProfileData(response.data.data.user);
            }
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getRoleName = (roleId) => {
        switch (roleId) {
            case 1: return 'Administrador';
            case 2: return 'Cliente';
            case 3: return 'Restaurante';
            case 4: return 'Repartidor';
            default: return 'Usuario';
        }
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                Cargando...
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <h1>Delivereats Dashboard</h1>
                    <div style={styles.userInfo}>
                        <span style={styles.userName}>{user?.name}</span>
                        <span style={styles.userRole}>{getRoleName(user?.role_id)}</span>
                        <button onClick={handleLogout} style={styles.logoutBtn}>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            <main style={styles.main}>
                <div style={styles.welcomeCard}>
                    <h2>¡Bienvenido a Delivereats!</h2>
                    <p>Gestiona tus pedidos y servicios desde este panel.</p>
                    
                    <div style={styles.userDetails}>
                        <h3>Información del Usuario</h3>
                        <div style={styles.detailsGrid}>
                            <div style={styles.detailItem}>
                                <span style={styles.detailLabel}>Nombre:</span>
                                <span style={styles.detailValue}>{profileData?.name}</span>
                            </div>
                            <div style={styles.detailItem}>
                                <span style={styles.detailLabel}>Email:</span>
                                <span style={styles.detailValue}>{profileData?.email}</span>
                            </div>
                            <div style={styles.detailItem}>
                                <span style={styles.detailLabel}>Rol:</span>
                                <span style={styles.detailValue}>{getRoleName(profileData?.role_id)}</span>
                            </div>
                            <div style={styles.detailItem}>
                                <span style={styles.detailLabel}>Registrado desde:</span>
                                <span style={styles.detailValue}>
                                    {profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={styles.featuresSection}>
                    <h3>Funcionalidades Disponibles</h3>
                    <div style={styles.featuresGrid}>
                        {user?.role_id === 2 && (
                            <>
                                <div style={styles.featureCard}>
                                    <h4>Realizar Pedido</h4>
                                    <p>Ordena comida de tus restaurantes favoritos</p>
                                </div>
                                <div style={styles.featureCard}>
                                    <h4>Ver Historial</h4>
                                    <p>Revisa tus pedidos anteriores</p>
                                </div>
                                <div style={styles.featureCard}>
                                    <h4>Gestionar Direcciones</h4>
                                    <p>Guarda tus direcciones de entrega</p>
                                </div>
                            </>
                        )}

                        {user?.role_id === 3 && (
                            <>
                                <div style={styles.featureCard}>
                                    <h4>Gestionar Menú</h4>
                                    <p>Administra los productos de tu restaurante</p>
                                </div>
                                <div style={styles.featureCard}>
                                    <h4>Ver Pedidos</h4>
                                    <p>Revisa y acepta pedidos pendientes</p>
                                </div>
                                <div style={styles.featureCard}>
                                    <h4>Estadísticas</h4>
                                    <p>Consulta reportes de ventas</p>
                                </div>
                            </>
                        )}

                        {user?.role_id === 4 && (
                            <>
                                <div style={styles.featureCard}>
                                    <h4>Entregas Pendientes</h4>
                                    <p>Ver entregas asignadas</p>
                                </div>
                                <div style={styles.featureCard}>
                                    <h4>Historial de Entregas</h4>
                                    <p>Revisa entregas completadas</p>
                                </div>
                                <div style={styles.featureCard}>
                                    <h4>Actualizar Estado</h4>
                                    <p>Reporta el progreso de entrega</p>
                                </div>
                            </>
                        )}

                        {user?.role_id === 1 && (
                            <>
                                <div style={styles.featureCard}>
                                    <h4>Gestionar Usuarios</h4>
                                    <p>Administra todos los usuarios del sistema</p>
                                </div>
                                <div style={styles.featureCard}>
                                    <h4>Ver Reportes</h4>
                                    <p>Consulta estadísticas del sistema</p>
                                </div>
                                <div style={styles.featureCard}>
                                    <h4>Configuración</h4>
                                    <p>Ajustes del sistema</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: '#f5f5f5'
    },
    header: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    headerContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    userName: {
        fontWeight: '600'
    },
    userRole: {
        background: 'rgba(255,255,255,0.2)',
        padding: '5px 10px',
        borderRadius: '20px',
        fontSize: '14px'
    },
    logoutBtn: {
        background: '#ff4757',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: '500'
    },
    main: {
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '0 20px'
    },
    welcomeCard: {
        background: 'white',
        borderRadius: '10px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
    },
    userDetails: {
        marginTop: '30px'
    },
    detailsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginTop: '20px'
    },
    detailItem: {
        display: 'flex',
        flexDirection: 'column'
    },
    detailLabel: {
        fontWeight: '600',
        color: '#555',
        marginBottom: '5px',
        fontSize: '14px'
    },
    detailValue: {
        color: '#333',
        fontSize: '16px'
    },
    featuresSection: {
        marginTop: '40px'
    },
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginTop: '20px'
    },
    featureCard: {
        background: 'white',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
    }
};

export default Dashboard;
