import { motion } from 'framer-motion';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];

  // Calcular qué páginas mostrar
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (totalPages <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={styles.container}
    >
      {/* Botón anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          ...styles.boton,
          ...(currentPage === 1 ? styles.botonDeshabilitado : styles.botonSecundario)
        }}
      >
        ← Anterior
      </button>

      {/* Primera página */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            style={styles.botonPagina}
          >
            1
          </button>
          {startPage > 2 && <span style={styles.puntos}>...</span>}
        </>
      )}

      {/* Páginas visibles */}
      {pages.map((page) => (
        <motion.button
          key={page}
          onClick={() => onPageChange(page)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            ...styles.botonPagina,
            ...(page === currentPage && styles.botonActivo)
          }}
        >
          {page}
        </motion.button>
      ))}

      {/* Última página */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span style={styles.puntos}>...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            style={styles.botonPagina}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Botón siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          ...styles.boton,
          ...(currentPage === totalPages ? styles.botonDeshabilitado : styles.botonSecundario)
        }}
      >
        Siguiente →
      </button>
    </motion.div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    margin: '2rem 0',
    flexWrap: 'wrap'
  },
  boton: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '0.875rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit'
  },
  botonSecundario: {
    backgroundColor: '#f59e0b',
    color: '#1f2937',
  },
  botonDeshabilitado: {
    backgroundColor: '#374151',
    color: '#6b7280',
    cursor: 'not-allowed',
    opacity: 0.6
  },
  botonPagina: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s',
    minWidth: '45px',
    fontFamily: 'inherit'
  },
  botonActivo: {
    backgroundColor: '#f59e0b',
    color: '#1f2937',
    fontWeight: 'bold'
  },
  puntos: {
    color: '#6b7280',
    padding: '0 0.5rem',
    fontSize: '1rem'
  }
};

export default Pagination;