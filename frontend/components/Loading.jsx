import { motion } from 'framer-motion';

const Loading = ({ mensaje = 'Cargando...' }) => {
  return (
    <div style={styles.container}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={styles.spinner}
      >
        🎬
      </motion.div>
      <p style={styles.texto}>{mensaje}</p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '1rem'
  },
  spinner: {
    fontSize: '4rem'
  },
  texto: {
    color: '#9ca3af',
    fontSize: '1.25rem'
  }
};

export default Loading;