# 🎬 Sala 7 - Sistema de Cine con Transacciones y Keycloak

Sistema completo de gestión de cine con compra de entradas, autenticación mediante Keycloak y transacciones seguras.

## 📋 Requisitos Previos

- Node.js 18+ y npm
- PostgreSQL 14+
- Keycloak 23.0.0
- Git

## 🗂️ Estructura del Proyecto

```
sala7/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── keycloak.js
│   ├── models/
│   │   ├── Usuario.js
│   │   ├── Pelicula.js
│   │   ├── Funcion.js
│   │   ├── Entrada.js
│   │   ├── Resena.js
│   │   └── index.js
│   ├── routes/
│   │   ├── peliculas.routes.js
│   │   ├── funciones.routes.js
│   │   ├── entradas.routes.js
│   │   └── resenas.routes.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── config/
│   │   └── keycloak.js
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Carrito.jsx
│   │   ├── Loading.jsx
│   │   └── Pagination.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── PeliculaDetalle.jsx
│   │   ├── MisEntradas.jsx
│   │   ├── AdminPeliculas.jsx
│   │   └── AdminFunciones.jsx
│   ├── services/
│   │   └── api.js
│   ├── public/
│   │   └── silent-check-sso.html
│   ├── App.jsx
│   ├── App.css
│   └── package.json
└── README.md
```

## 🚀 Instalación Paso a Paso

### 1. Configurar Base de Datos

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE sala7_db;

# Salir
\q
```

### 2. Configurar Keycloak

Sigue las instrucciones detalladas en el archivo `KEYCLOAK_SETUP.md`

**Resumen rápido:**
- Descargar e iniciar Keycloak 23.0.0
- Crear realm "sala7"
- Crear roles: `admin` y `user`
- Crear clientes: `sala7-backend` y `sala7-frontend`
- Crear usuarios de prueba

### 3. Configurar Backend

```bash
# Ir al directorio backend
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
# Editar .env con tus configuraciones
```

**Archivo .env:**
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sala7_db
DB_USER=postgres
DB_PASSWORD=tu_password

PORT=4000

KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=sala7
KEYCLOAK_CLIENT_ID=sala7-backend
KEYCLOAK_CLIENT_SECRET=tu_client_secret

SESSION_SECRET=tu_session_secret_muy_seguro
```

### 4. Configurar Frontend

```bash
# Ir al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Crear archivo public/silent-check-sso.html
```

**Contenido de silent-check-sso.html:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Silent SSO Check</title>
</head>
<body>
    <script>
        parent.postMessage(location.href, location.origin);
    </script>
</body>
</html>
```

### 5. Iniciar Servicios

**Terminal 1 - Keycloak:**
```bash
cd keycloak-23.0.0
./bin/kc.sh start-dev
# Windows: bin\kc.bat start-dev
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

## 🔑 Credenciales de Prueba

### Usuario Administrador
- **Username:** admin
- **Password:** admin123
- **Permisos:** Gestión completa de películas, funciones y visualización de todas las entradas

### Usuario Regular
- **Username:** usuario1
- **Password:** usuario123
- **Permisos:** Ver cartelera, comprar entradas, gestionar sus propias entradas

## 📚 Endpoints del Backend

### Películas (Públicas)
```
GET    /api/peliculas              # Listar películas con paginación
GET    /api/peliculas/:id          # Detalle de película
POST   /api/peliculas              # Crear película (admin)
PUT    /api/peliculas/:id          # Actualizar película (admin)
DELETE /api/peliculas/:id          # Eliminar película (admin)
```

### Funciones (Públicas para ver, admin para gestionar)
```
GET    /api/funciones              # Listar funciones
GET    /api/funciones/:id          # Detalle de función
POST   /api/funciones              # Crear función (admin)
PUT    /api/funciones/:id          # Actualizar función (admin)
DELETE /api/funciones/:id          # Eliminar función (admin)
```

### Entradas (Requiere autenticación)
```
GET    /api/entradas               # Mis entradas
POST   /api/entradas/comprar       # Comprar entradas (TRANSACCIÓN)
DELETE /api/entradas/:id           # Cancelar entrada
```

### Reseñas (Requiere autenticación)
```
POST   /api/resenas                # Crear reseña
PUT    /api/resenas/:id            # Actualizar reseña
DELETE /api/resenas/:id            # Eliminar reseña
```

## 💳 Flujo de Compra con Transacciones

```javascript
// El usuario agrega funciones al carrito
// Al confirmar compra:

POST /api/entradas/comprar
Body: {
  "items": [
    {
      "funcionId": 1,
      "cantidadAsientos": 2
    },
    {
      "funcionId": 3,
      "cantidadAsientos": 1
    }
  ]
}

// El backend ejecuta una TRANSACCIÓN que:
// 1. Verifica disponibilidad de asientos
// 2. Crea las entradas
// 3. Actualiza asientos disponibles
// 4. Si algo falla, hace ROLLBACK
```

## 🎨 Características Principales

### Para Usuarios
- ✅ Ver cartelera de películas
- ✅ Ver detalles de películas y funciones
- ✅ Agregar entradas al carrito
- ✅ Modificar cantidad de asientos
- ✅ Comprar múltiples entradas en una transacción
- ✅ Ver historial de entradas
- ✅ Cancelar entradas
- ✅ Dejar reseñas de películas

### Para Administradores
- ✅ Crear/Editar/Eliminar películas
- ✅ Crear/Editar/Eliminar funciones
- ✅ Gestionar capacidad de salas
- ✅ Ver todas las transacciones

## 🔒 Seguridad

- **Autenticación:** Keycloak con OpenID Connect
- **Autorización:** Roles (user, admin)
- **Tokens:** JWT con renovación automática
- **Transacciones:** ACID en PostgreSQL
- **Validaciones:** En modelos y rutas
- **CORS:** Configurado para desarrollo

## 🧪 Probar el Sistema

### 1. Crear Películas (como admin)
```bash
# Login como admin
# Ir a Admin > Películas > Crear Película
```

### 2. Crear Funciones (como admin)
```bash
# Ir a Admin > Funciones > Crear Función
# Asociar con una película
```

### 3. Comprar Entradas (como usuario)
```bash
# Login como usuario1
# Ver cartelera
# Agregar funciones al carrito
# Confirmar compra
# Ver en "Mis Entradas"
```

### 4. Verificar Transacción
```bash
# Intentar comprar más asientos de los disponibles
# El sistema debe rechazar la transacción
# Los asientos disponibles no deben cambiar
```

## 📊 Base de Datos

### Tablas Principales

**usuarios**
- id (UUID, PK)
- keycloakId (String, Unique)
- username
- email
- roles (Array)

**peliculas**
- id (Integer, PK)
- titulo
- descripcion
- genero
- duracion
- imagen
- precio

**funciones**
- id (Integer, PK)
- peliculaId (FK)
- fecha
- hora
- sala
- asientosDisponibles
- asientosTotales

**entradas**
- id (Integer, PK)
- usuarioId (FK)
- funcionId (FK)
- cantidadAsientos
- precioTotal
- estado (confirmada/cancelada)

**resenas**
- id (Integer, PK)
- usuarioId (FK)
- peliculaId (FK)
- calificacion (1-5)
- comentario

## 🐛 Solución de Problemas

### Error: Cannot connect to database
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar credenciales en .env
```

### Error: Keycloak connection refused
```bash
# Verificar que Keycloak esté corriendo en puerto 8080
netstat -an | grep 8080

# Reiniciar Keycloak si es necesario
```

### Error: CORS
```bash
# Verificar Web Origins en Keycloak:
# - sala7-backend: http://localhost:4000
# - sala7-frontend: http://localhost:5173
```

### Error: Token expired
```bash
# El sistema renueva automáticamente
# Si persiste, volver a hacer login
```

## 📝 Datos de Prueba

### Script para Poblar BD (opcional)

```sql
-- Insertar películas de prueba
INSERT INTO peliculas (titulo, descripcion, genero, duracion, imagen, precio, "createdAt", "updatedAt") VALUES
('Oppenheimer', 'La historia de J. Robert Oppenheimer y la bomba atómica', 'Drama/Historia', 180, 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', 2500, NOW(), NOW()),
('Barbie', 'Barbie vive en Barbieland y descubre el mundo real', 'Comedia/Fantasía', 114, 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', 2500, NOW(), NOW()),
('Dune: Part Two', 'Paul Atreides se une con Chani y los Fremen', 'Ciencia Ficción', 166, 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', 3000, NOW(), NOW());

-- Insertar funciones de prueba
INSERT INTO funciones ("peliculaId", fecha, hora, sala, "asientosDisponibles", "asientosTotales", "createdAt", "updatedAt") VALUES
(1, '2025-01-15', '18:00:00', 'Sala 7', 100, 100, NOW(), NOW()),
(1, '2025-01-15', '21:00:00', 'Sala 7', 100, 100, NOW(), NOW()),
(2, '2025-01-16', '19:00:00', 'Sala 7', 80, 80, NOW(), NOW()),
(3, '2025-01-17', '20:00:00', 'Sala 7', 120, 120, NOW(), NOW());
```

## 🎓 Conceptos Implementados

- **Transacciones ACID:** Compra de entradas
- **Autenticación/Autorización:** Keycloak + JWT
- **Roles y Permisos:** user y admin
- **Relaciones de BD:** One-to-Many, Many-to-One
- **Validaciones:** En modelos Sequelize
- **Manejo de Errores:** Try-catch y middlewares
- **Estado Global:** React Context (Carrito)
- **Paginación:** Backend y Frontend
- **Animaciones:** Framer Motion

## 📞 Contacto y Soporte

Si tienes dudas sobre la implementación:
1. Revisa los logs del backend y frontend
2. Verifica la configuración de Keycloak
3. Comprueba las conexiones de BD

---

## ✅ Checklist de Entrega

- [ ] Backend corriendo en puerto 4000
- [ ] Frontend corriendo en puerto 5173
- [ ] Keycloak configurado con realm "sala7"
- [ ] Base de datos PostgreSQL creada
- [ ] Usuarios de prueba creados (admin y usuario1)
- [ ] Transacciones funcionando correctamente
- [ ] Carrito de compras operativo
- [ ] Autenticación con Keycloak funcionando
- [ ] Roles y permisos aplicados
- [ ] Paginación implementada

¡Buena suerte con tu trabajo práctico! 🎬🍿