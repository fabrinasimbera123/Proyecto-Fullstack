import { Pelicula, Funcion, Usuario, Resena, Entrada, sequelize } from './models/index.js';

export const seedDatabase = async () => {
  try {
    console.log("🌱 Ejecutando seed...");

    // Limpiar tablas (opcional)
    await sequelize.sync({ force: true });
    console.log("🧹 Tablas recreadas");

    // Crear películas
    const peliculas = await Pelicula.bulkCreate([
      {
        titulo: "Dune: Parte 2",
        descripcion: "Paul Atreides une fuerzas con Chani y los Fremen...",
        genero: "Ciencia Ficción",
        duracion: 165,
        imagen: "https://image.tmdb.org/t/p/w500/yourimage1.jpg",
        precio: 2500
      },
      {
        titulo: "Oppenheimer",
        descripcion: "La historia del padre de la bomba atómica.",
        genero: "Drama",
        duracion: 180,
        imagen: "https://image.tmdb.org/t/p/w500/yourimage2.jpg",
        precio: 2200
      },
      {
        titulo: "Kung Fu Panda 4",
        descripcion: "Po regresa para otra aventura épica.",
        genero: "Animación",
        duracion: 95,
        imagen: "https://image.tmdb.org/t/p/w500/yourimage3.jpg",
        precio: 2000
      }
    ]);

    console.log("🎬 Películas creadas:", peliculas.length);

    // Crear funciones
    const funciones = await Funcion.bulkCreate([
      {
        peliculaId: peliculas[0].id,
        fecha: "2025-12-01",
        hora: "20:00",
        sala: "Sala 7",
        asientosTotales: 80,
        asientosDisponibles: 80
      },
      {
        peliculaId: peliculas[1].id,
        fecha: "2025-12-02",
        hora: "18:00",
        sala: "Sala 3",
        asientosTotales: 100,
        asientosDisponibles: 100
      },
      {
        peliculaId: peliculas[2].id,
        fecha: "2025-12-03",
        hora: "16:00",
        sala: "Sala 1",
        asientosTotales: 120,
        asientosDisponibles: 120
      }
    ]);

    console.log("🎭 Funciones creadas:", funciones.length);

    // Crear usuario dummy
    const usuario = await Usuario.create({
      keycloakId: "dummy-user-id",
      username: "testuser",
      email: "test@example.com",
      roles: ["user"]
    });

    console.log("👤 Usuario dummy creado");

    // Crear una reseña
    await Resena.create({
      usuarioId: usuario.id,
      peliculaId: peliculas[0].id,
      calificacion: 5,
      comentario: "Excelente película, impresionante."
    });

    console.log("⭐ Reseña creada");

    // Crear entrada de prueba
    await Entrada.create({
      usuarioId: usuario.id,
      funcionId: funciones[0].id,
      cantidadAsientos: 2,
      precioTotal: peliculas[0].precio * 2,
      estado: "confirmada"
    });

    console.log("🎟️ Entrada de prueba creada");

    console.log("🌱 Seed completo");
  } catch (error) {
    console.error("❌ Error ejecutando seed:", error);
  }
};
