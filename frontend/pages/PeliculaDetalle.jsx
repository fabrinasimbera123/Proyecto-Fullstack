import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { peliculasAPI, resenasAPI } from '../services/api';
import { isAuthenticated as isLoggedIn, getUsername } from '../config/keycloak';
import Loading from '../components/Loading';

const PeliculaDetalle = ({ onAgregarAlCarrito }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pelicula, setPelicula] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarResena, setMostrarResena] = useState(false);
  const [resena, setResena] = useState({ calificacion: 5, comentario: '' });

  useEffect(() => {
    cargarPelicula();
  }, [id]);

  const cargarPelicula = async () => {
    try {
      setLoading(true);
      const response = await peliculasAPI.getById(id);
      console.log('Datos de la película:', response.data);
      setPelicula(response.data);
    } catch (error) {
      console.error('Error cargando película:', error);
      alert('Error al cargar la película');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarAlCarrito = (funcion) => {
    if (!isLoggedIn()) {
      alert('Debes iniciar sesión para comprar entradas');
      return;
    }

    if (funcion.asientosDisponibles === 0) {
      alert('No hay asientos disponibles para esta función');
      return;
    }

    const item = {
      funcionId: funcion.id,
      pelicula: pelicula.titulo,
      fecha: funcion.fecha,
      hora: funcion.hora,
      sala: funcion.sala,
      precio: pelicula.precio,
      cantidadAsientos: 1,
      disponibles: funcion.asientosDisponibles
    };

    onAgregarAlCarrito(item);
    alert('✅ Función agregada al carrito');
  };

  const handleEnviarResena = async (e) => {
    e.preventDefault();

    if (!isLoggedIn()) {
      alert('Debes iniciar sesión para dejar una reseña');
      return;
    }

    try {
      await resenasAPI.create({
        peliculaId: pelicula.id,
        calificacion: resena.calificacion,
        comentario: resena.comentario
      });

      alert('✅ Reseña publicada exitosamente');
      setMostrarResena(false);
      setResena({ calificacion: 5, comentario: '' });
      cargarPelicula();
    } catch (error) {
      alert(`❌ Error: ${error.mensaje || 'No se pudo publicar la reseña'}`);
    }
  };

  if (loading) {
    return <Loading mensaje="Cargando película..." />;
  }

  if (!pelicula) {
    return null;
  }

  const promedioCalificacion = pelicula.resenas?.length > 0
    ? (pelicula.resenas.reduce((sum, r) => sum + r.calificacion, 0) / pelicula.resenas.length).toFixed(1)
    : 'Sin calificaciones';

  return (
    <div style={styles.container}>
      {/* Hero con imagen de fondo */}
      <div style={{
        ...styles.hero,
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(${pelicula.imagen})`
      }}>
        <div style={styles.heroContent}>
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={pelicula.imagen}
            alt={pelicula.titulo}
            style={styles.poster}
          />
          <div style={styles.heroInfo}>
            <motion.h1
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              style={styles.titulo}
            >
              {pelicula.titulo}
            </motion.h1>
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={styles.metadata}
            >
              <span style={styles.badge}>🎭 {pelicula.genero}</span>
              <span style={styles.badge}>⏱️ {pelicula.duracion} min</span>
              <span style={styles.badge}>💵 ${pelicula.precio}</span>
              <span style={styles.badge}>⭐ {promedioCalificacion}</span>
            </motion.div>
            {pelicula.descripcion && (
              <motion.p
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={styles.descripcion}
              >
                {pelicula.descripcion}
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* Funciones Disponibles */}
      <section style={styles.seccion}>
        <h2 style={styles.subtitulo}>🎟️ Funciones Disponibles</h2>
        {!pelicula.funciones || pelicula.funciones.length === 0 ? (
          <div style={styles.vacio}>
            <p>📅 No hay funciones disponibles para esta película</p>
          </div>
        ) : (
          <div style={styles.funcionesGrid}>
            {pelicula.funciones.map((funcion) => (
              <motion.div
                key={funcion.id}
                whileHover={{ scale: 1.02 }}
                style={styles.funcionCard}
              >
                <div style={styles.funcionInfo}>
                  <p style={styles.funcionFecha}>📅 {funcion.fecha}</p>
                  <p style={styles.funcionHora}>⏰ {funcion.hora}</p>
                  <p style={styles.funcionSala}>🎭 {funcion.sala}</p>
                  <p style={styles.funcionAsientos}>
                    💺 {funcion.asientosDisponibles} / {funcion.asientosTotales} disponibles
                  </p>
                </div>
                <button
                  onClick={() => handleAgregarAlCarrito(funcion)}
                  disabled={funcion.asientosDisponibles === 0}
                  style={{
                    ...styles.botonAgregar,
                    ...(funcion.asientosDisponibles === 0 && styles.botonDeshabilitado)
                  }}
                >
                  {funcion.asientosDisponibles === 0 ? '❌ Agotado' : '🛒 Agregar al carrito'}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Reseñas */}
      <section style={styles.seccion}>
        <div style={styles.resenasHeader}>
          <h2 style={styles.subtitulo}>
            💬 Reseñas ({pelicula.resenas?.length || 0})
          </h2>
          {isLoggedIn() && (
            <button
              onClick={() => setMostrarResena(!mostrarResena)}
              style={styles.botonNuevaResena}
            >
              {mostrarResena ? '❌ Cancelar' : '➕ Escribir reseña'}
            </button>
          )}
        </div>

        {mostrarResena && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleEnviarResena}
            style={styles.formResena}
          >
            <div style={styles.calificacionSelector}>
              <label style={styles.label}>Calificación:</label>
              <div style={styles.estrellas}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setResena({ ...resena, calificacion: num })}
                    style={{
                      ...styles.estrella,
                      color: num <= resena.calificacion ? '#fbbf24' : '#6b7280'
                    }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={resena.comentario}
              onChange={(e) => setResena({ ...resena, comentario: e.target.value })}
              placeholder="Escribe tu opinión sobre la película..."
              style={styles.textarea}
              rows="4"
            />
            <button type="submit" style={styles.botonEnviar}>
              Publicar reseña
            </button>
          </motion.form>
        )}

        <div style={styles.resenasList}>
          {pelicula.resenas && pelicula.resenas.length > 0 ? (
            pelicula.resenas.map((resenaItem) => (
              <motion.div
                key={resenaItem.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={styles.resenaCard}
              >
                <div style={styles.resenaHeader}>
                  <span style={styles.resenaUsuario}>
                    👤 {resenaItem.usuario?.username || 'Usuario'}
                  </span>
                  <div style={styles.resenaCalificacion}>
                    {'⭐'.repeat(resenaItem.calificacion)}
                  </div>
                </div>
                {resenaItem.comentario && (
                  <p style={styles.resenaComentario}>{resenaItem.comentario}</p>
                )}
                <p style={styles.resenaFecha}>
                  {new Date(resenaItem.createdAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))
          ) : (
            <div style={styles.vacio}>
              <p>Aún no hay reseñas para esta película</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh'
  },
  hero: {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '4rem 2rem',
    marginBottom: '2rem'
  },
  heroContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    gap: '3rem',
    alignItems: 'flex-start'
  },
  poster: {
    width: '300px',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
  },
  heroInfo: {
    flex: 1
  },
  titulo: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '1rem'
  },
  metadata: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap'
  },
  badge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    color: '#fbbf24',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  descripcion: {
    color: '#d1d5db',
    fontSize: '1.125rem',
    lineHeight: '1.8'
  },
  seccion: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem 1rem',
    marginBottom: '2rem'
  },
  subtitulo: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '1.5rem'
  },
  funcionesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  funcionCard: {
    backgroundColor: '#1f2937',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid #374151'
  },
  funcionInfo: {
    marginBottom: '1rem'
  },
  funcionFecha: {
    color: 'white',
    fontSize: '1.125rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem'
  },
  funcionHora: {
    color: '#9ca3af',
    marginBottom: '0.25rem'
  },
  funcionSala: {
    color: '#9ca3af',
    marginBottom: '0.25rem'
  },
  funcionAsientos: {
    color: '#10b981',
    fontWeight: '500',
    marginTop: '0.5rem'
  },
  botonAgregar: {
    width: '100%',
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  botonDeshabilitado: {
    backgroundColor: '#6b7280',
    cursor: 'not-allowed'
  },
  resenasHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  botonNuevaResena: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  formResena: {
    backgroundColor: '#1f2937',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '2rem'
  },
  calificacionSelector: {
    marginBottom: '1rem'
  },
  label: {
    color: 'white',
    fontSize: '1rem',
    fontWeight: '500',
    marginBottom: '0.5rem',
    display: 'block'
  },
  estrellas: {
    display: 'flex',
    gap: '0.5rem'
  },
  estrella: {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    cursor: 'pointer',
    padding: 0
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#374151',
    border: '1px solid #4b5563',
    borderRadius: '6px',
    color: 'white',
    fontSize: '1rem',
    marginBottom: '1rem',
    resize: 'vertical'
  },
  botonEnviar: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.75rem 2rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
  },
  resenasList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  resenaCard: {
    backgroundColor: '#1f2937',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid #374151'
  },
  resenaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem'
  },
  resenaUsuario: {
    color: 'white',
    fontWeight: '500'
  },
  resenaCalificacion: {
    color: '#fbbf24',
    fontSize: '1.25rem'
  },
  resenaComentario: {
    color: '#d1d5db',
    lineHeight: '1.6',
    marginBottom: '0.5rem'
  },
  resenaFecha: {
    color: '#6b7280',
    fontSize: '0.875rem'
  },
  vacio: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: '#9ca3af',
    backgroundColor: '#1f2937',
    borderRadius: '12px'
  }
};

export default PeliculaDetalle;