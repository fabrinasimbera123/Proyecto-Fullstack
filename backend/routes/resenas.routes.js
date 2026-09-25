import express from 'express';
import { Resena, Pelicula, Usuario } from '../models/index.js';
import { protect, extractUser } from '../config/keycloak.js';

const router = express.Router();

// POST /api/resenas - Crear reseña
router.post('/', protect, extractUser, async (req, res, next) => {
  try {
    const { peliculaId, calificacion, comentario } = req.body;

    if (!peliculaId || !calificacion) {
      return res.status(400).json({
        error: true,
        mensaje: 'peliculaId y calificación son obligatorios'
      });
    }

    // Verificar que la película existe
    const pelicula = await Pelicula.findByPk(peliculaId);
    if (!pelicula) {
      return res.status(404).json({
        error: true,
        mensaje: 'Película no encontrada'
      });
    }

    // Buscar o crear usuario
    let usuario = await Usuario.findOne({ where: { keycloakId: req.user.id } });
    
    if (!usuario) {
      usuario = await Usuario.create({
        keycloakId: req.user.id,
        username: req.user.username,
        email: req.user.email,
        roles: req.user.roles
      });
    }

    // Verificar si ya tiene reseña
    const resenaExistente = await Resena.findOne({
      where: { usuarioId: usuario.id, peliculaId }
    });

    if (resenaExistente) {
      return res.status(400).json({
        error: true,
        mensaje: 'Ya has reseñado esta película'
      });
    }

    const resena = await Resena.create({
      usuarioId: usuario.id,
      peliculaId,
      calificacion,
      comentario
    });

    const resenaCompleta = await Resena.findByPk(resena.id, {
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['username']
      }]
    });

    res.status(201).json(resenaCompleta);
  } catch (error) {
    next(error);
  }
});

// PUT /api/resenas/:id - Actualizar reseña
router.put('/:id', protect, extractUser, async (req, res, next) => {
  try {
    const resena = await Resena.findByPk(req.params.id);

    if (!resena) {
      return res.status(404).json({
        error: true,
        mensaje: 'Reseña no encontrada'
      });
    }

    // Verificar que sea el dueño
    const usuario = await Usuario.findOne({ where: { keycloakId: req.user.id } });
    if (resena.usuarioId !== usuario.id) {
      return res.status(403).json({
        error: true,
        mensaje: 'No tienes permiso para editar esta reseña'
      });
    }

    const { calificacion, comentario } = req.body;
    
    await resena.update({
      ...(calificacion && { calificacion }),
      ...(comentario !== undefined && { comentario })
    });

    const resenaActualizada = await Resena.findByPk(resena.id, {
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['username']
      }]
    });

    res.json(resenaActualizada);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/resenas/:id - Eliminar reseña
router.delete('/:id', protect, extractUser, async (req, res, next) => {
  try {
    const resena = await Resena.findByPk(req.params.id);

    if (!resena) {
      return res.status(404).json({
        error: true,
        mensaje: 'Reseña no encontrada'
      });
    }

    // Verificar que sea el dueño
    const usuario = await Usuario.findOne({ where: { keycloakId: req.user.id } });
    if (resena.usuarioId !== usuario.id) {
      return res.status(403).json({
        error: true,
        mensaje: 'No tienes permiso para eliminar esta reseña'
      });
    }

    await resena.destroy();

    res.json({
      mensaje: 'Reseña eliminada correctamente'
    });
  } catch (error) {
    next(error);
  }
});

export default router;