import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { entradasAPI } from '../services/api';
import { isAuthenticated as isLoggedIn, getUsername } from '../config/keycloak';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';

const MisEntradas = () => {
  const [entradas, setEntradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelando, setCancelando] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      doLogin();
      return;
    }
    cargarEntradas();
  }, [currentPage]);

  const cargarEntradas = async () => {
    try {
      setLoading(true);
      const response = await entradasAPI.getAll({ 
        page: currentPage, 
        limit: 10 
      });
      setEntradas(response.data.entradas);
      setTotalPages(response.data.totalPaginas);
    } catch (error) {
      console.error('Error cargando entradas:', error);
      alert('Error al cargar tus entradas');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (entrada) => {
    const confirmar = window.confirm(
      `¿Estás seguro de cancelar esta entrada?\n\n` +
      `Película: ${entrada.funcion.pelicula.titulo}\n` +
      `Fecha: ${entrada.funcion.fecha}\n` +
      `Hora: ${entrada.funcion.hora}\n` +
      `Asientos: ${entrada.cantidadAsientos}\n` +
      `Total: $${entrada.precioTotal}`
    );

    if (!confirmar) return;

    try {
      setCancelando(entrada.id);
      await entradasAPI.cancelar(entrada.id);
      alert('✅ Entrada cancelada correctamente');
      cargarEntradas();
    } catch (error) {
      alert(`❌ Error: ${error.mensaje || 'No se pudo cancelar la entrada'}`);
    } finally {
      setCancelando(null);
    }
  };

  if (!isLoggedIn()) {
    return null;
  }

  if (loading && entradas.length === 0) {
    return <Loading mensaje="Cargando tus entradas..." />;
  }

  const entradasConfirmadas = entradas.filter(e => e.estado === 'confirmada');
  const entradasCanceladas = entradas.filter(e => e.estado === 'cancelada');

  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
      >
        <h1 style={styles.titulo}>🎟️ Mis Entradas</h1>
        <p style={styles.subtitulo}>
          {entradasConfirmadas.length} entrada(s) confirmada(s)
        </p>
      </motion.div>

      {/* Entradas Confirmadas */}
      <section style={styles.seccion}>
        <h2 style={styles.seccionTitulo}>✅ Entradas Confirmadas</h2>
        
        {entradasConfirmadas.length === 0 ? (
          <div style={styles.vacio}>
            <p style={styles.vacioIcono}>🎬</p>
            <p style={styles.vacioTexto}>No tienes entradas confirmadas</p>
            <button 
              onClick={() => window.location.href = '/'}
              style={styles.botonVolver}
            >
              Ver Cartelera
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {entradasConfirmadas.map((entrada) => (
              <motion.div
                key={entrada.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={styles.card}
              >
                <div style={styles.cardHeader}>
                  <img
                    src={entrada.funcion.pelicula.imagen}
                    alt={entrada.funcion.pelicula.titulo}
                    style={styles.cardImagen}
                  />
                  <div style={styles.badge}>✅ CONFIRMADA</div>
                </div>
                
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitulo}>
                    {entrada.funcion.pelicula.titulo}
                  </h3>
                  
                  <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>📅 Fecha</span>
                      <span style={styles.infoValor}>{entrada.funcion.fecha}</span>
                    </div>
                    
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>⏰ Hora</span>
                      <span style={styles.infoValor}>{entrada.funcion.hora}</span>
                    </div>
                    
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>🎭 Sala</span>
                      <span style={styles.infoValor}>{entrada.funcion.sala}</span>
                    </div>
                    
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>💺 Asientos</span>
                      <span style={styles.infoValor}>{entrada.cantidadAsientos}</span>
                    </div>
                    
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>🎬 Género</span>
                      <span style={styles.infoValor}>{entrada.funcion.pelicula.genero}</span>
                    </div>
                    
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>⏱️ Duración</span>
                      <span style={styles.infoValor}>{entrada.funcion.pelicula.duracion} min</span>
                    </div>
                  </div>
                  
                  <div style={styles.cardFooter}>
                    <div style={styles.precio}>
                      <span style={styles.precioLabel}>Total pagado</span>
                      <span style={styles.precioValor}>${entrada.precioTotal}</span>
                    </div>
                    
                    <button
                      onClick={() => handleCancelar(entrada)}
                      disabled={cancelando === entrada.id}
                      style={{
                        ...styles.botonCancelar,
                        ...(cancelando === entrada.id && styles.botonDeshabilitado)
                      }}
                    >
                      {cancelando === entrada.id ? '⏳ Cancelando...' : '❌ Cancelar entrada'}
                    </button>
                  </div>
                  
                  <p style={styles.fechaCompra}>
                    Comprada el {new Date(entrada.createdAt).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Entradas Canceladas */}
      {entradasCanceladas.length > 0 && (
        <section style={styles.seccion}>
          <h2 style={styles.seccionTitulo}>❌ Entradas Canceladas</h2>
          
          <div style={styles.grid}>
            {entradasCanceladas.map((entrada) => (
              <motion.div
                key={entrada.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{...styles.card, ...styles.cardCancelada}}
              >
                <div style={styles.cardHeader}>
                  <img
                    src={entrada.funcion.pelicula.imagen}
                    alt={entrada.funcion.pelicula.titulo}
                    style={{...styles.cardImagen, filter: 'grayscale(100%)'}}
                  />
                  <div style={{...styles.badge, backgroundColor: '#ef4444'}}>
                    ❌ CANCELADA
                  </div>
                </div>
                
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitulo}>
                    {entrada.funcion.pelicula.titulo}
                  </h3>
                  
                  <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>📅 Fecha</span>
                      <span style={styles.infoValor}>{entrada.funcion.fecha}</span>
                    </div>
                    
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>⏰ Hora</span>
                      <span style={styles.infoValor}>{entrada.funcion.hora}</span>
                    </div>
                    
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>💺 Asientos</span>
                      <span style={styles.infoValor}>{entrada.cantidadAsientos}</span>
                    </div>
                    
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>💵 Total</span>
                      <span style={styles.infoValor}>${entrada.precioTotal}</span>
                    </div>
                  </div>
                  
                  <p style={styles.fechaCancelacion}>
                    Cancelada el {new Date(entrada.updatedAt).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem 1rem',
    minHeight: '80vh'
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem'
  },
  titulo: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '0.5rem'
  },
  subtitulo: {
    fontSize: '1.25rem',
    color: '#9ca3af'
  },
  seccion: {
    marginBottom: '3rem'
  },
  seccionTitulo: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '1.5rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '2px solid #10b981',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
  },
  cardCancelada: {
    border: '2px solid #6b7280',
    opacity: 0.7
  },
  cardHeader: {
    position: 'relative',
    height: '200px'
  },
  cardImagen: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  badge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    backgroundColor: '#10b981',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
  },
  cardBody: {
    padding: '1.5rem'
  },
  cardTitulo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '1rem'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  infoLabel: {
    color: '#9ca3af',
    fontSize: '0.875rem'
  },
  infoValor: {
    color: 'white',
    fontSize: '1rem',
    fontWeight: '500'
  },
  cardFooter: {
    borderTop: '1px solid #374151',
    paddingTop: '1rem',
    marginTop: '1rem'
  },
  precio: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  precioLabel: {
    color: '#9ca3af',
    fontSize: '1rem'
  },
  precioValor: {
    color: '#fbbf24',
    fontSize: '1.75rem',
    fontWeight: 'bold'
  },
  botonCancelar: {
    width: '100%',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  botonDeshabilitado: {
    backgroundColor: '#6b7280',
    cursor: 'not-allowed'
  },
  fechaCompra: {
    color: '#6b7280',
    fontSize: '0.75rem',
    marginTop: '1rem',
    textAlign: 'center'
  },
  fechaCancelacion: {
    color: '#6b7280',
    fontSize: '0.75rem',
    marginTop: '1rem',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  vacio: {
    textAlign: 'center',
    padding: '4rem 1rem',
    backgroundColor: '#1f2937',
    borderRadius: '12px'
  },
  vacioIcono: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  vacioTexto: {
    color: '#9ca3af',
    fontSize: '1.25rem',
    marginBottom: '2rem'
  },
  botonVolver: {
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    padding: '0.75rem 2rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
  }
};

export default MisEntradas;