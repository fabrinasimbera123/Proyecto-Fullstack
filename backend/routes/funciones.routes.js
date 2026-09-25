import express from 'express';
import { Funcion, Pelicula } from '../models/index.js';
import { protect, extractUser, adminOnly } from '../config/keycloak.js';
import { Op } from 'sequelize';

const router = express.Router();

// GET /api/funciones - Listar funciones (público)
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, peliculaId, fecha } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      fecha: { [Op.gte]: new Date().toISOString().split('T')[0] }
    };
    
    if (peliculaId) {
      where.peliculaId = peliculaId;
    }
    
    if (fecha) {
      where.fecha = fecha;
    }

    const { count, rows } = await Funcion.findAndCountAll({
      where,
      include: [{
        model: Pelicula,
        as: 'pelicula',
        attributes: ['id', 'titulo', 'imagen', 'duracion', 'genero', 'precio']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha', 'ASC'], ['hora', 'ASC']]
    });

    res.json({
      total: count,
      pagina: parseInt(page),
      limite: parseInt(limit),
      totalPaginas: Math.ceil(count / limit),
      funciones: rows
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/funciones/:id - Detalle de función (público)
router.get('/:id', async (req, res, next) => {
  try {
    const funcion = await Funcion.findByPk(req.params.id, {
      include: [{
        model: Pelicula,
        as: 'pelicula'
      }]
    });

    if (!funcion) {
      return res.status(404).json({
        error: true,
        mensaje: 'Función no encontrada'
      });
    }

    res.json(funcion);
  } catch (error) {
    next(error);
  }
});

// POST /api/funciones - Crear función (solo admin)
router.post('/', protect, extractUser, adminOnly, async (req, res, next) => {
  try {
    const { peliculaId, fecha, hora, sala, asientosTotales } = req.body;

    if (!peliculaId || !fecha || !hora || !asientosTotales) {
      return res.status(400).json({
        error: true,
        mensaje: 'peliculaId, fecha, hora y asientosTotales son obligatorios'
      });
    }

    // Verificar que la película existe
    const pelicula = await Pelicula.findByPk(peliculaId);
    if (!pelicula) {
      return res.status(400).json({
        error: true,
        mensaje: 'La película especificada no existe'
      });
    }

    const funcion = await Funcion.create({
      peliculaId,
      fecha,
      hora,
      sala: sala || 'Sala 7',
      asientosTotales,
      asientosDisponibles: asientosTotales
    });

    const funcionCompleta = await Funcion.findByPk(funcion.id, {
      include: [{ model: Pelicula, as: 'pelicula' }]
    });

    res.status(201).json(funcionCompleta);
  } catch (error) {
    next(error);
  }
});

// PUT /api/funciones/:id - Actualizar función (solo admin)
router.put('/:id', protect, extractUser, adminOnly, async (req, res, next) => {
  try {
    const funcion = await Funcion.findByPk(req.params.id);

    if (!funcion) {
      return res.status(404).json({
        error: true,
        mensaje: 'Función no encontrada'
      });
    }

    const { fecha, hora, sala, asientosTotales } = req.body;
    
    const updates = {};
    if (fecha) updates.fecha = fecha;
    if (hora) updates.hora = hora;
    if (sala) updates.sala = sala;
    
    // Si se actualiza asientosTotales, ajustar disponibles
    if (asientosTotales) {
      const vendidos = funcion.asientosTotales - funcion.asientosDisponibles;
      updates.asientosTotales = asientosTotales;
      updates.asientosDisponibles = asientosTotales - vendidos;
      
      if (updates.asientosDisponibles < 0) {
        return res.status(400).json({
          error: true,
          mensaje: 'No se puede reducir el total de asientos por debajo de los ya vendidos'
        });
      }
    }

    await funcion.update(updates);

    const funcionActualizada = await Funcion.findByPk(funcion.id, {
      include: [{ model: Pelicula, as: 'pelicula' }]
    });

    res.json(funcionActualizada);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/funciones/:id - Eliminar función (solo admin)
router.delete('/:id', protect, extractUser, adminOnly, async (req, res, next) => {
  try {
    const funcion = await Funcion.findByPk(req.params.id);

    if (!funcion) {
      return res.status(404).json({
        error: true,
        mensaje: 'Función no encontrada'
      });
    }

    // Verificar si hay entradas vendidas
    const vendidos = funcion.asientosTotales - funcion.asientosDisponibles;
    if (vendidos > 0) {
      return res.status(400).json({
        error: true,
        mensaje: 'No se puede eliminar una función con entradas vendidas'
      });
    }

    await funcion.destroy();

    res.json({
      mensaje: 'Función eliminada correctamente'
    });
  } catch (error) {
    next(error);
  }
});

export default router;