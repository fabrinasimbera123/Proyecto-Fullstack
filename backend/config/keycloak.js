import Keycloak from 'keycloak-connect';
import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();

// STORE DE SESIÓN PARA KEYCLOAK
const memoryStore = new session.MemoryStore();

// CONFIG DE SESIÓN PARA EXPRESS
export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'sala7-secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 día
};

// CONFIGURACIÓN DE KEYCLOAK
export const keycloak = new Keycloak({ store: memoryStore }, {
  "realm": process.env.KEYCLOAK_REALM || "cine-realm",
  "auth-server-url": process.env.KEYCLOAK_URL || "http://localhost:8080",
  "ssl-required": "external",
  "resource": process.env.KEYCLOAK_CLIENT_ID || "cine-backend",
  "public-client": false,
  "confidential-port": 0,
  "credentials": { secret: process.env.KEYCLOAK_CLIENT_SECRET }
});

// PROTEGER RUTAS SOLO LOGIN
export const protect = keycloak.protect();

// EXTRAER USUARIO LOGUEADO
export const extractUser = (req, res, next) => {
  try {
    const token = req.kauth?.grant?.access_token?.content;

    if (!token) {
      return res.status(401).json({ mensaje: "No autenticado" });
    }

    req.user = {
      id: token.sub,
      username: token.preferred_username,
      email: token.email,
      roles: token.realm_access?.roles || []
    };

    next();
  } catch (error) {
    console.error("Error extractUser:", error);
    res.status(401).json({ mensaje: "Token inválido" });
  }
};

// SOLO ADMIN
export const adminOnly = keycloak.protect((token) => {
  return token.hasRealmRole('admin');
});
