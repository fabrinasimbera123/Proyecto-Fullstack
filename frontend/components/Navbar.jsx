import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  doLogin,
  doLogout,
  getUsername,
  getKeycloak,
  hasRole,
  isAuthenticated
} from '../config/keycloak';

const Navbar = () => {
  const keycloak = getKeycloak();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      style={styles.nav}
    >
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          🎬 Sala 7
        </Link>

        <div style={styles.links}>
          <Link to="/" style={styles.link}>
            Cartelera
          </Link>

          {isAuthenticated() && (
            <>
              <Link to="/mis-entradas" style={styles.link}>
                Mis Entradas
              </Link>

              {hasRole('admin') && (
                <>
                  <Link to="/admin/peliculas" style={styles.linkAdmin}>
                    🔧 Películas
                  </Link>
                  <Link to="/admin/funciones" style={styles.linkAdmin}>
                    🔧 Funciones
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        <div style={styles.auth}>
          {isAuthenticated() ? (
            <>
              <span style={styles.username}>👤 {getUsername()}</span>
              <button onClick={doLogout} style={styles.botonLogout}>
                Cerrar Sesión
              </button>
            </>
          ) : (
            <button onClick={doLogin} style={styles.botonLogin}>
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#1f2937',
    borderBottom: '2px solid #f59e0b',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '2rem'
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#f59e0b',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  links: {
    display: 'flex',
    gap: '2rem',
    flex: 1,
    justifyContent: 'center'
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'color 0.2s'
  },
  linkAdmin: {
    color: '#fbbf24',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'color 0.2s'
  },
  auth: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  username: {
    color: '#9ca3af',
    fontSize: '0.875rem'
  },
  botonLogin: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  botonLogout: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  }
};

export default Navbar;
