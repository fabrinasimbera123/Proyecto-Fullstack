import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import { testConnection, syncDatabase } from './config/database.js';
import { keycloak, sessionConfig } from './config/keycloak.js';
import { seedDatabase } from './seed.js';


// Importar rutas
import peliculasRoutes from './routes/peliculas.routes.js';
import funcionesRoutes from './routes/funciones.routes.js';
import entradasRoutes from './routes/entradas.routes.js';
import resenasRoutes from './routes/resenas.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sesión y Keycloak
app.use(session(sessionConfig));
app.use(keycloak.middleware({ 
  logout: '/logout',
  admin: '/api/secure'  // Keycloak solo actuará sobre rutas admin si querés
}));

// Rutas
app.use('/api/peliculas', peliculasRoutes);
app.use('/api/funciones', funcionesRoutes);
app.use('/api/entradas', entradasRoutes);
app.use('/api/resenas', resenasRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Sala 7 API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: true,
      mensaje: err.errors.map(e => e.message).join(', ')
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: true,
      mensaje: 'Ya existe un registro con esos datos'
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: true,
      mensaje: 'Referencia inválida a otro registro'
    });
  }

  res.status(err.status || 500).json({
    error: true,
    mensaje: err.message || 'Error interno del servidor'
  });
});

// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    error: true,
    mensaje: 'Ruta no encontrada'
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    await testConnection();
    await syncDatabase();
    await seedDatabase();
    
    app.listen(PORT, () => {
      console.log(`🎬 Servidor Sala 7 corriendo en http://localhost:${PORT}`);
      console.log(`📡 API disponible en http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();