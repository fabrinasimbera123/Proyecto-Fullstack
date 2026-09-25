import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { funcionesAPI, peliculasAPI } from '../services/api';
import { isAuthenticated, hasRole, doLogin } from '../config/keycloak';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';

const AdminFunciones = () => {
  const [funciones, setFunciones] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
    peliculaId: '',
    fecha: '',
    hora: '',
    sala: 'Sala 7',
    asientosTotales: 100
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
    cargarDatos();
  }, [currentPage]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resFunciones, resPeliculas] = await Promise.all([
        funcionesAPI.getAll({ page: currentPage, limit: 15 }),
        peliculasAPI.getAll({ limit: 100 })
      ]);
      setFunciones(resFunciones.data.funciones);
      setTotalPages(resFunciones.data.totalPaginas);
      setPeliculas(resPeliculas.data.peliculas);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      peliculaId: '',
      fecha: '',
      hora: '',
      sala: 'Sala 7',
      asientosTotales: 100
    });
    setEditando(null);
    setMostrarForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editando) {
        await funcionesAPI.update(editando.id, form);
        alert('✅ Función actualizada');
      } else {
        await funcionesAPI.create(form);
        alert('✅ Función creada');
      }
      resetForm();
      cargarDatos();
    } catch (error) {
      alert(`❌ Error: ${error.mensaje || 'Error al guardar'}`);
    }
  };

  const handleEditar = (funcion) => {
    setForm({
      peliculaId: funcion.peliculaId,
      fecha: funcion.fecha,
      hora: funcion.hora,
      sala: funcion.sala,
      asientosTotales: funcion.asientosTotales
    });
    setEditando(funcion);
    setMostrarForm(true);
  };

  const handleEliminar = async (funcion) => {
    const vendidos = funcion.asientosTotales - funcion.asientosDisponibles;
    
    if (vendidos > 0) {
      alert(`❌ No se puede eliminar. Ya se vendieron ${vendidos} entradas para esta función.`);
      return;
    }

    const confirmar = window.confirm(
      `¿Eliminar función de "${funcion.pelicula.titulo}"?\n\n` +
      `Fecha: ${funcion.fecha}\n` +
      `Hora: ${funcion.hora}`
    );
    
    if (!confirmar) return;

    try {
      await funcionesAPI.delete(funcion.id);
      alert('✅ Función eliminada');
      cargarDatos();
    } catch (error) {
      alert(`❌ Error: ${error.mensaje || 'Error al eliminar'}`);
    }
  };

  if (!isAuthenticated() || !hasRole('admin')) {
    return null;
  }

  if (loading && funciones.length === 0) {
    return <Loading mensaje="Cargando funciones..." />;
  }

  // Obtener fecha mínima (hoy)
  const hoy = new Date().toISOString().split('T')[0];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.titulo}>🎭 Administrar Funciones</h1>
        <button
          onClick={() => setMostrarForm(true)}
          style={styles.botonNuevo}
        >
          ➕ Nueva Función
        </button>
      </div>

      {funciones.length === 0 ? (
        <div style={styles.vacio}>
          <p style={styles.vacioIcono}>📅</p>
          <p style={styles.vacioTexto}>No hay funciones programadas</p>
        </div>
      ) : (
        <div style={styles.tabla}>
          <div style={styles.tablaHeader}>
            <div style={styles.columna}>Película</div>
            <div style={styles.columna}>Fecha</div>
            <div style={styles.columna}>Hora</div>
            <div style={styles.columna}>Sala</div>
            <div style={styles.columna}>Asientos</div>
            <div style={styles.columna}>Acciones</div>
          </div>

          {funciones.map((funcion) => {
            const vendidos = funcion.asientosTotales - funcion.asientosDisponibles;
            const porcentajeVendido = (vendidos / funcion.asientosTotales * 100).toFixed(0);

            return (
              <motion.div
                key={funcion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={styles.fila}
              >
                <div style={styles.celda}>
                  <img 
                    src={funcion.pelicula.imagen}
                    alt={funcion.pelicula.titulo}
                    style={styles.miniatura}
                  />
                  <div>
                    <div style={styles.peliculaTitulo}>
                      {funcion.pelicula.titulo}
                    </div>
                    <div style={styles.peliculaInfo}>
                      {funcion.pelicula.genero} • {funcion.pelicula.duracion} min
                    </div>
                  </div>
                </div>

                <div style={styles.celda}>
                  📅 {funcion.fecha}
                </div>

                <div style={styles.celda}>
                  ⏰ {funcion.hora}
                </div>

                <div style={styles.celda}>
                  🎭 {funcion.sala}
                </div>

                <div style={styles.celda}>
                  <div style={styles.asientosInfo}>
                    <div style={styles.asientosTexto}>
                      💺 {funcion.asientosDisponibles} / {funcion.asientosTotales}
                    </div>
                    <div style={styles.barraProgreso}>
                      <div 
                        style={{
                          ...styles.barraProgresoFill,
                          width: `${porcentajeVendido}%`,
                          backgroundColor: porcentajeVendido > 80 ? '#ef4444' : 
                                         porcentajeVendido > 50 ? '#f59e0b' : '#10b981'
                        }}
                      />
                    </div>
                    <div style={styles.porcentaje}>
                      {porcentajeVendido}% vendido
                    </div>
                  </div>
                </div>

                <div style={styles.celda}>
                  <div style={styles.botones}>
                    <button
                      onClick={() => handleEditar(funcion)}
                      style={styles.botonEditar}
                      title="Editar función"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleEliminar(funcion)}
                      disabled={vendidos > 0}
                      style={{
                        ...styles.botonEliminar,
                        ...(vendidos > 0 && styles.botonDeshabilitado)
                      }}
                      title={vendidos > 0 ? 'No se puede eliminar con entradas vendidas' : 'Eliminar función'}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

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
                  {editando ? '✏️ Editar Función' : '➕ Nueva Función'}
                </h2>
                <button onClick={resetForm} style={styles.botonCerrar}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.campo}>
                  <label style={styles.label}>Película *</label>
                  <select
                    value={form.peliculaId}
                    onChange={(e) => setForm({...form, peliculaId: e.target.value})}
                    required
                    disabled={editando !== null}
                    style={styles.select}
                  >
                    <option value="">Seleccionar película...</option>
                    {peliculas.map((pelicula) => (
                      <option key={pelicula.id} value={pelicula.id}>
                        {pelicula.titulo} ({pelicula.genero})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.campoGrid}>
                  <div style={styles.campo}>
                    <label style={styles.label}>Fecha *</label>
                    <input
                      type="date"
                      value={form.fecha}
                      onChange={(e) => setForm({...form, fecha: e.target.value})}
                      required
                      min={hoy}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.campo}>
                    <label style={styles.label}>Hora *</label>
                    <input
                      type="time"
                      value={form.hora}
                      onChange={(e) => setForm({...form, hora: e.target.value})}
                      required
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.campoGrid}>
                  <div style={styles.campo}>
                    <label style={styles.label}>Sala *</label>
                    <input
                      type="text"
                      value={form.sala}
                      onChange={(e) => setForm({...form, sala: e.target.value})}
                      required
                      style={styles.input}
                      placeholder="Sala 7"
                    />
                  </div>

                  <div style={styles.campo}>
                    <label style={styles.label}>Asientos Totales *</label>
                    <input
                      type="number"
                      value={form.asientosTotales}
                      onChange={(e) => setForm({...form, asientosTotales: e.target.value})}
                      required
                      min="1"
                      style={styles.input}
                      placeholder="100"
                    />
                  </div>
                </div>

                {editando && (
                  <div style={styles.alerta}>
                    ℹ️ Si reduces los asientos totales, asegúrate de que no sea menor que los ya vendidos.
                  </div>
                )}

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
  tabla: {
    backgroundColor: '#1f2937',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '2rem'
  },
  tablaHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr 0.8fr',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#374151',
    fontWeight: 'bold',
    color: 'white',
    fontSize: '0.875rem'
  },
  columna: {
    padding: '0.5rem'
  },
  fila: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr 0.8fr',
    gap: '1rem',
    padding: '1rem',
    borderBottom: '1px solid #374151',
    alignItems: 'center'
  },
  celda: {
    color: 'white',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  miniatura: {
    width: '50px',
    height: '75px',
    objectFit: 'cover',
    borderRadius: '4px'
  },
  peliculaTitulo: {
    fontWeight: '500',
    marginBottom: '0.25rem'
  },
  peliculaInfo: {
    color: '#9ca3af',
    fontSize: '0.75rem'
  },
  asientosInfo: {
    width: '100%'
  },
  asientosTexto: {
    marginBottom: '0.25rem',
    fontSize: '0.875rem'
  },
  barraProgreso: {
    width: '100%',
    height: '8px',
    backgroundColor: '#374151',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '0.25rem'
  },
  barraProgresoFill: {
    height: '100%',
    transition: 'width 0.3s'
  },
  porcentaje: {
    fontSize: '0.75rem',
    color: '#9ca3af'
  },
  botones: {
    display: 'flex',
    gap: '0.5rem'
  },
  botonEditar: {
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  botonEliminar: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  botonDeshabilitado: {
    backgroundColor: '#6b7280',
    cursor: 'not-allowed',
    opacity: 0.5
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
    fontSize: '1.25rem'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 1000
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#1f2937',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
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
  select: {
    padding: '0.75rem',
    backgroundColor: '#374151',
    border: '1px solid #4b5563',
    borderRadius: '6px',
    color: 'white',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  alerta: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid #3b82f6',
    color: '#93c5fd',
    padding: '0.75rem',
    borderRadius: '6px',
    fontSize: '0.875rem'
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

export default AdminFunciones;