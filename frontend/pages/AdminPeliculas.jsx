import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { peliculasAPI } from '../services/api';
import { hasRole, doLogin, isAuthenticated   } from '../config/keycloak';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';

const AdminPeliculas = () => {
  const [peliculas, setPeliculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    genero: '',
    duracion: '',
    imagen: '',
    precio: ''
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      doLogin();
      return;
    }
    if (!hasRole('admin')) {
      alert('❌ No tienes permisos de administrador');
      window.location.href = '/';
      return;
    }
    cargarPeliculas();
  }, [currentPage]);

  const cargarPeliculas = async () => {
    try {
      setLoading(true);
      const response = await peliculasAPI.getAll({ page: currentPage, limit: 12 });
      setPeliculas(response.data.peliculas);
      setTotalPages(response.data.totalPaginas);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar películas');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      titulo: '',
      descripcion: '',
      genero: '',
      duracion: '',
      imagen: '',
      precio: ''
    });
    setEditando(null);
    setMostrarForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editando) {
        await peliculasAPI.update(editando.id, form);
        alert('✅ Película actualizada');
      } else {
        await peliculasAPI.create(form);
        alert('✅ Película creada');
      }
      resetForm();
      cargarPeliculas();
    } catch (error) {
      alert(`❌ Error: ${error.mensaje || 'Error al guardar'}`);
    }
  };

  const handleEditar = (pelicula) => {
    setForm({
      titulo: pelicula.titulo,
      descripcion: pelicula.descripcion || '',
      genero: pelicula.genero,
      duracion: pelicula.duracion,
      imagen: pelicula.imagen || '',
      precio: pelicula.precio
    });
    setEditando(pelicula);
    setMostrarForm(true);
  };

  const handleEliminar = async (pelicula) => {
    const confirmar = window.confirm(
      `¿Eliminar "${pelicula.titulo}"?\n\nEsto eliminará también todas sus funciones y reseñas.`
    );
    
    if (!confirmar) return;

    try {
      await peliculasAPI.delete(pelicula.id);
      alert('✅ Película eliminada');
      cargarPeliculas();
    } catch (error) {
      alert(`❌ Error: ${error.mensaje || 'Error al eliminar'}`);
    }
  };

  if (!isAuthenticated() || !hasRole('admin')) {
    return null;
  }

  if (loading && peliculas.length === 0) {
    return <Loading mensaje="Cargando películas..." />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.titulo}>🎬 Administrar Películas</h1>
        <button
          onClick={() => setMostrarForm(true)}
          style={styles.botonNuevo}
        >
          ➕ Nueva Película
        </button>
      </div>

      <div style={styles.grid}>
        {peliculas.map((pelicula) => (
          <motion.div
            key={pelicula.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.card}
          >
            <img
              src={pelicula.imagen}
              alt={pelicula.titulo}
              style={styles.imagen}
            />
            <div style={styles.cardBody}>
              <h3 style={styles.cardTitulo}>{pelicula.titulo}</h3>
              <p style={styles.cardGenero}>🎭 {pelicula.genero}</p>
              <p style={styles.cardDuracion}>⏱️ {pelicula.duracion} min</p>
              <p style={styles.cardPrecio}>💵 ${pelicula.precio}</p>
              
              <div style={styles.botones}>
                <button
                  onClick={() => handleEditar(pelicula)}
                  style={styles.botonEditar}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleEliminar(pelicula)}
                  style={styles.botonEliminar}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Modal de Formulario */}
      <AnimatePresence>
        {mostrarForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              style={styles.overlay}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={styles.modal}
            >
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitulo}>
                  {editando ? '✏️ Editar Película' : '➕ Nueva Película'}
                </h2>
                <button onClick={resetForm} style={styles.botonCerrar}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.campo}>
                  <label style={styles.label}>Título *</label>
                  <input
                    type="text"
                    value={form.titulo}
                    onChange={(e) => setForm({...form, titulo: e.target.value})}
                    required
                    style={styles.input}
                    placeholder="Ej: Oppenheimer"
                  />
                </div>

                <div style={styles.campo}>
                  <label style={styles.label}>Descripción</label>
                  <textarea
                    value={form.descripcion}
                    onChange={(e) => setForm({...form, descripcion: e.target.value})}
                    style={{...styles.input, minHeight: '100px', resize: 'vertical'}}
                    placeholder="Sinopsis de la película..."
                  />
                </div>

                <div style={styles.campoGrid}>
                  <div style={styles.campo}>
                    <label style={styles.label}>Género *</label>
                    <input
                      type="text"
                      value={form.genero}
                      onChange={(e) => setForm({...form, genero: e.target.value})}
                      required
                      style={styles.input}
                      placeholder="Ej: Drama"
                    />
                  </div>

                  <div style={styles.campo}>
                    <label style={styles.label}>Duración (min) *</label>
                    <input
                      type="number"
                      value={form.duracion}
                      onChange={(e) => setForm({...form, duracion: e.target.value})}
                      required
                      min="1"
                      style={styles.input}
                      placeholder="120"
                    />
                  </div>
                </div>

                <div style={styles.campo}>
                  <label style={styles.label}>URL Imagen</label>
                  <input
                    type="url"
                    value={form.imagen}
                    onChange={(e) => setForm({...form, imagen: e.target.value})}
                    style={styles.input}
                    placeholder="https://..."
                  />
                  {form.imagen && (
                    <img
                      src={form.imagen}
                      alt="Preview"
                      style={styles.preview}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                </div>

                <div style={styles.campo}>
                  <label style={styles.label}>Precio *</label>
                  <input
                    type="number"
                    value={form.precio}
                    onChange={(e) => setForm({...form, precio: e.target.value})}
                    required
                    min="0"
                    step="0.01"
                    style={styles.input}
                    placeholder="2500"
                  />
                </div>

                <div style={styles.botones}>
                  <button
                    type="button"
                    onClick={resetForm}
                    style={styles.botonCancelar}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={styles.botonGuardar}
                  >
                    {editando ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem 1rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  titulo: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'white'
  },
  botonNuevo: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
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
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
  },
  imagen: {
    width: '100%',
    height: '375px',
    objectFit: 'cover'
  },
  cardBody: {
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
    marginTop: '0.5rem',
    marginBottom: '1rem'
  },
  botones: {
    display: 'flex',
    gap: '0.5rem'
  },
  botonEditar: {
    flex: 1,
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    padding: '0.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  botonEliminar: {
    flex: 1,
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '0.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  overlay: {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  height: '100vh',
  //backgroundColor: 'rgba(0,0,0,0.7)',
  pointerEvents: 'none',
  zIndex: 1000
},
modal: {
  backgroundColor: '#1f2937',
  borderRadius: '12px',
  padding: '2rem',
  maxWidth: '600px',
  width: '90%',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxSizing: 'border-box',
  pointerEvents: 'auto',
  zIndex: 1001
},
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  modalTitulo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'white'
  },
  botonCerrar: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    fontSize: '1.5rem',
    cursor: 'pointer'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  campo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  campoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  label: {
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  input: {
    padding: '0.75rem',
    backgroundColor: '#374151',
    border: '1px solid #4b5563',
    borderRadius: '6px',
    color: 'white',
    fontSize: '1rem'
  },
  preview: {
    width: '200px',
    height: '300px',
    objectFit: 'cover',
    borderRadius: '6px',
    marginTop: '0.5rem'
  },
  botonCancelar: {
    flex: 1,
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
  }
};

export default AdminPeliculas;