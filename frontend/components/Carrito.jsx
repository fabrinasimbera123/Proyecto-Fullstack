import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { entradasAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Carrito = ({
  items = [], // 👈 Valor por defecto para evitar undefined
  onRemove,
  onClear,
  onUpdateCantidad,
}) => {
  const [procesando, setProcesando] = useState(false);
  const [mostrar, setMostrar] = useState(false);
  const navigate = useNavigate();

  const calcularTotal = () => {
    return items.reduce(
      (sum, item) => sum + item.precio * item.cantidadAsientos,
      0
    ).toFixed(2);
  };

  const handleComprar = async () => {
    if (!items.length) {
      alert('El carrito está vacío');
      return;
    }

    const confirmar = window.confirm(
      `¿Confirmar compra de ${items.length} entrada(s) por $${calcularTotal()}?`
    );
    if (!confirmar) return;

    try {
      setProcesando(true);
      const itemsCompra = items.map((item) => ({
        funcionId: item.funcionId,
        cantidadAsientos: item.cantidadAsientos,
      }));

      await entradasAPI.comprar(itemsCompra);

      alert('✅ ¡Compra realizada exitosamente!');
      onClear();
      navigate('/mis-entradas');
    } catch (error) {
      alert(`❌ Error: ${error.mensaje || 'No se pudo completar la compra'}`);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setMostrar(!mostrar)}
        style={styles.botonFlotante}
      >
        🛒 {items.length}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {mostrar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMostrar(false)}
              style={styles.overlay}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              style={styles.panel}
            >
              <div style={styles.header}>
                <h2 style={styles.titulo}>🛒 Mi Carrito</h2>
                <button
                  onClick={() => setMostrar(false)}
                  style={styles.botonCerrar}
                >
                  ✕
                </button>
              </div>

              {/* Contenido */}
              <div style={styles.contenido}>
                {!items.length ? (
                  <div style={styles.vacio}>
                    <p>🎬</p>
                    <p>Tu carrito está vacío</p>
                  </div>
                ) : (
                  <>
                    {items.map((item, index) => (
                      <div key={index} style={styles.item}>
                        <div>
                          <h4 style={styles.itemTitulo}>{item.pelicula}</h4>
                          <p style={styles.itemFecha}>
                            📅 {item.fecha} - ⏰ {item.hora}
                          </p>
                          <p style={styles.itemSala}>🎭 {item.sala}</p>
                          <div style={styles.cantidad}>
                            <button
                              onClick={() =>
                                onUpdateCantidad(
                                  index,
                                  item.cantidadAsientos - 1
                                )
                              }
                              disabled={item.cantidadAsientos <= 1}
                              style={styles.botonCantidad}
                            >
                              -
                            </button>
                            <span>{item.cantidadAsientos} asiento(s)</span>
                            <button
                              onClick={() =>
                                onUpdateCantidad(
                                  index,
                                  item.cantidadAsientos + 1
                                )
                              }
                              disabled={item.cantidadAsientos >= item.disponibles}
                              style={styles.botonCantidad}
                            >
                              +
                            </button>
                          </div>
                          <p style={styles.itemPrecio}>
                            💵 ${(item.precio * item.cantidadAsientos).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => onRemove(index)}
                          style={styles.botonEliminar}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div style={styles.footer}>
                  <div style={styles.total}>
                    <span style={styles.totalLabel}>Total:</span>
                    <span style={styles.totalMonto}>${calcularTotal()}</span>
                  </div>
                  <button
                    onClick={onClear}
                    style={styles.botonVaciar}
                    disabled={procesando}
                  >
                    Vaciar carrito
                  </button>
                  <button
                    onClick={handleComprar}
                    style={styles.botonComprar}
                    disabled={procesando}
                  >
                    {procesando
                      ? '⏳ Procesando...'
                      : '💳 Confirmar compra'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const styles = {
  botonFlotante: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: 999,
    fontWeight: 'bold'
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
  panel: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '400px',
    maxWidth: '90vw',
    backgroundColor: '#1f2937',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1001
  },
  header: {
    padding: '1.5rem',
    borderBottom: '1px solid #374151',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  titulo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'white',
    margin: 0
  },
  botonCerrar: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.25rem'
  },
  contenido: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem'
  },
  vacio: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: '#9ca3af',
    fontSize: '3rem'
  },
  item: {
    backgroundColor: '#374151',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem'
  },
  itemTitulo: {
    color: 'white',
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem'
  },
  itemFecha: {
    color: '#9ca3af',
    fontSize: '0.875rem',
    margin: '0.25rem 0'
  },
  itemSala: {
    color: '#9ca3af',
    fontSize: '0.875rem',
    margin: '0.25rem 0'
  },
  cantidad: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    margin: '0.5rem 0',
    color: 'white',
    fontSize: '0.875rem'
  },
  botonCantidad: {
    backgroundColor: '#4b5563',
    color: 'white',
    border: 'none',
    width: '28px',
    height: '28px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  itemPrecio: {
    color: '#fbbf24',
    fontWeight: 'bold',
    fontSize: '1.125rem',
    marginTop: '0.5rem'
  },
  botonEliminar: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.25rem'
  },
  footer: {
    padding: '1.5rem',
    borderTop: '1px solid #374151',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  total: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#374151',
    borderRadius: '8px'
  },
  totalLabel: {
    color: 'white',
    fontSize: '1.25rem',
    fontWeight: 'bold'
  },
  totalMonto: {
    color: '#fbbf24',
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  botonVaciar: {
    padding: '0.75rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  botonComprar: {
    padding: '1rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold'
  }
};

export default Carrito;