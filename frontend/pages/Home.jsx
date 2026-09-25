import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { peliculasAPI } from '../services/api';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';

const Home = ({ onAgregarAlCarrito }) => {
  const [peliculas, setPeliculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [busqueda, setBusqueda] = useState({ titulo: '', genero: '' });
  const navigate = useNavigate();

  useEffect(() => {
    cargarPeliculas();
  }, [currentPage]);

  const cargarPeliculas = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 8,
        ...(busqueda.titulo && { titulo: busqueda.titulo }),
        ...(busqueda.genero && { genero: busqueda.genero })
      };
      
      const response = await peliculasAPI.getAll(params);
      setPeliculas(response.data.peliculas);
      setTotalPages(response.data.totalPaginas);
    } catch (error) {
      console.error('Error cargando películas:', error);
      alert('Error al cargar películas');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    cargarPeliculas();
  };

  if (loading && peliculas.length === 0) {
    return <Loading mensaje="Cargando cartelera..." />;
  }

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={styles.hero}
      >
        <motion.h1
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          style={styles.titulo}
        >
          🎬 Bienvenido a Sala 7
        </motion.h1>
        <motion.p
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
          style={styles.descripcion}
        >
          Descubre las mejores películas y reserva tus entradas en línea
        </motion.p>
      </motion.section>

      {/* Filtros */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={styles.filtros}
      >
        <form onSubmit={handleBuscar} style={styles.formBusqueda}>
          <input
            type="text"
            placeholder="🔍 Buscar por título..."
            value={busqueda.titulo}
            onChange={(e) => setBusqueda({ ...busqueda, titulo: e.target.value })}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="🎭 Filtrar por género..."
            value={busqueda.genero}
            onChange={(e) => setBusqueda({ ...busqueda, genero: e.target.value })}
            style={styles.input}
          />
          <button type="submit" style={styles.botonBuscar}>
            🔎 Buscar
          </button>
        </form>
      </motion.section>

      {/* Grid de Películas */}
      <section style={styles.seccion}>
        <h2 style={styles.subtitulo}>🎥 Cartelera</h2>

        {peliculas.length === 0 ? (
          <div style={styles.vacio}>
            <p style={styles.vacioIcono}>🎬</p>
            <p style={styles.vacioTexto}>No se encontraron películas</p>
          </div>
        ) : (
          <>
            <div style={styles.grid}>
              {peliculas.map((pelicula) => (
                <motion.div
                  key={pelicula.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={styles.card}
                  onClick={() => navigate(`/peliculas/${pelicula.id}`)}
                >
                  <img 
                    src={pelicula.imagen} 
                    alt={pelicula.titulo}
                    style={styles.imagen}
                  />
                  <div style={styles.cardInfo}>
                    <h3 style={styles.cardTitulo}>{pelicula.titulo}</h3>
                    <p style={styles.cardGenero}>🎭 {pelicula.genero}</p>
                    <p style={styles.cardDuracion}>⏱️ {pelicula.duracion} min</p>
                    <p style={styles.cardPrecio}>💵 ${pelicula.precio}</p>
                    {pelicula.funciones && pelicula.funciones.length > 0 && (
                      <p style={styles.cardFunciones}>
                        📅 {pelicula.funciones.length} función(es) disponible(s)
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </section>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem 1rem'
  },
  hero: {
    textAlign: 'center',
    padding: '3rem 0',
    background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.3) 0%, rgba(219, 39, 119, 0.3) 100%)',
    borderRadius: '12px',
    marginBottom: '2rem'
  },
  titulo: {
    fontSize: '3rem',
    fontWeight: 'bold',
    background: 'linear-gradient(to right, #fbbf24, #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '1rem'
  },
  descripcion: {
    fontSize: '1.25rem',
    color: '#d1d5db',
    maxWidth: '600px',
    margin: '0 auto'
  },
  filtros: {
    marginBottom: '2rem'
  },
  formBusqueda: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    padding: '1.5rem',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)'
  },
  input: {
    padding: '0.75rem',
    backgroundColor: '#374151',
    border: '1px solid #4b5563',
    borderRadius: '6px',
    color: 'white',
    fontSize: '1rem'
  },
  botonBuscar: {
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  seccion: {
    marginTop: '2rem'
  },
  subtitulo: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '1.5rem',
    textAlign: 'center'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
  },
  imagen: {
    width: '100%',
    height: '375px',
    objectFit: 'cover'
  },
  cardInfo: {
    padding: '1rem'
  },
  cardTitulo: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '0.5rem'
  },
  cardGenero: {
    color: '#9ca3af',
    fontSize: '0.875rem',
    marginBottom: '0.25rem'
  },
  cardDuracion: {
    color: '#9ca3af',
    fontSize: '0.875rem',
    marginBottom: '0.25rem'
  },
  cardPrecio: {
    color: '#fbbf24',
    fontSize: '1.125rem',
    fontWeight: 'bold',
    marginTop: '0.5rem'
  },
  cardFunciones: {
    color: '#10b981',
    fontSize: '0.875rem',
    marginTop: '0.5rem'
  },
  vacio: {
    textAlign: 'center',
    padding: '4rem 1rem'
  },
  vacioIcono: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  vacioTexto: {
    color: '#9ca3af',
    fontSize: '1.25rem'
  }
};

export default Home;