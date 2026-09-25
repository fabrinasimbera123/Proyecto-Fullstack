import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { initKeycloak } from './config/keycloak';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PeliculaDetalle from './pages/PeliculaDetalle';
import MisEntradas from './pages/MisEntradas';
import AdminPeliculas from './pages/AdminPeliculas';
import AdminFunciones from './pages/AdminFunciones';
import Carrito from './components/Carrito';
import Loading from './components/Loading';
import PrivateRoute from "./components/PrivateRoute";
import './App.css';

function App() {
  const [keycloakReady, setKeycloakReady] = useState(false);
  const [carrito, setCarrito] = useState([]);

   useEffect(() => {
    initKeycloak().then(() => {
      setKeycloakReady(true);
    });
  }, []);

  // 🔹 Agregar al carrito
  const agregarAlCarrito = (item) => {
    const existe = carrito.findIndex(i => i.funcionId === item.funcionId);
    if (existe !== -1) {
      alert('Esta función ya está en tu carrito');
      return;
    }
    setCarrito([...carrito, item]);
  };

  // 🔹 Remover entrada específica
  const removerDelCarrito = (index) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  // 🔹 Vaciar carrito completo
  const vaciarCarrito = () => {
    if (window.confirm('¿Vaciar el carrito?')) {
      setCarrito([]);
    }
  };

  // 🔹 Actualizar cantidad de tickets
  const actualizarCantidad = (index, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    const nuevoCarrito = [...carrito];
    nuevoCarrito[index].cantidad = nuevaCantidad;
    setCarrito(nuevoCarrito);
  };

  if (!keycloakReady) return <Loading mensaje="Inicializando seguridad..." />;

  return (
    <BrowserRouter>
      <Navbar />

      <Carrito
        items={carrito}
        onRemove={removerDelCarrito}
        onClear={vaciarCarrito}
        onUpdateCantidad={actualizarCantidad}
      />

      <Routes>
        <Route path="/" element={<Home agregarAlCarrito={agregarAlCarrito} />} />
        <Route path="/peliculas/:id" element={<PeliculaDetalle onAgregarAlCarrito={agregarAlCarrito} />} />

        {/* 🔐 Rutas protegidas para usuario logueado */}
        <Route
          path="/mis-entradas"
          element={
            <PrivateRoute>
              <MisEntradas />
            </PrivateRoute>
          }
        />

        {/* 🔐 Rutas protegidas solo admin */}
        <Route
          path="/admin/peliculas"
          element={
            <PrivateRoute adminOnly={true}>
              <AdminPeliculas />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/funciones"
          element={
            <PrivateRoute adminOnly={true}>
              <AdminFunciones />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
