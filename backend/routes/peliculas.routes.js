import express from 'express';
import { Pelicula, Funcion, Resena, Usuario } from '../models/index.js';
import { protect, adminOnly, extractUser } from '../config/keycloak.js';
import { Op, Sequelize } from 'sequelize';

const router = express.Router();

// GET /api/peliculas - Listar películas (público)
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, titulo, genero } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    // --- CAMBIO --
    if (titulo) {
      where.titulo = Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("titulo")),
        {
          [Op.like]: `%${titulo.toLowerCase()}%`
        }
      );
    }

    if (genero) {
      where.genero = Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("genero")),
        {
          [Op.like]: `%${genero.toLowerCase()}%`
        }
      );
    }
    // ----------------------------------------------------

    const { count, rows } = await Pelicula.findAndCountAll({
      where,
      include: [{
        model: Funcion,
        as: 'funciones',
        where: {
          fecha: { [Op.gte]: new Date().toISOString().split('T')[0] }
        },
        required: false,
        order: [['fecha', 'ASC'], ['hora', 'ASC']]
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: count,
      pagina: parseInt(page),
      limite: parseInt(limit),
      totalPaginas: Math.ceil(count / limit),
      peliculas: rows
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/peliculas/:id - Detalle de película (público)
router.get('/:id', async (req, res, next) => {
  try {
    const pelicula = await Pelicula.findByPk(req.params.id, {
      include: [
        {
          model: Funcion,
          as: 'funciones',
          where: {
            fecha: { [Op.gte]: new Date().toISOString().split('T')[0] }
          },
          required: false,
          order: [['fecha', 'ASC'], ['hora', 'ASC']]
        },
        {
          model: Resena,
          as: 'resenas',
          include: [{
            model: Usuario,
            as: 'usuario',
            attributes: ['username']
          }],
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!pelicula) {
      return res.status(404).json({
        error: true,
        mensaje: 'Película no encontrada'
      });
    }

    res.json(pelicula);
  } catch (error) {
    next(error);
  }
});

// POST /api/peliculas - Crear película (solo admin)
router.post('/', protect, adminOnly, extractUser, async (req, res, next) => {
  try {
    const { titulo, descripcion, genero, duracion, imagen, precio } = req.body;

    if (!titulo || !genero || !duracion || !precio) {
      return res.status(400).json({
        error: true,
        mensaje: 'Título, género, duración y precio son obligatorios'
      });
    }

    const pelicula = await Pelicula.create({
      titulo,
      descripcion,
      genero,
      duracion,
      imagen,
      precio
    });

    res.status(201).json(pelicula);
  } catch (error) {
    next(error);
  }
});

// PUT /api/peliculas/:id - Actualizar película (solo admin)
router.put('/:id', protect, adminOnly, extractUser, async (req, res, next) => {
  try {
    const pelicula = await Pelicula.findByPk(req.params.id);

    if (!pelicula) {
      return res.status(404).json({
        error: true,
        mensaje: 'Película no encontrada'
      });
    }

    const { titulo, descripcion, genero, duracion, imagen, precio } = req.body;

    await pelicula.update({
      ...(titulo && { titulo }),
      ...(descripcion !== undefined && { descripcion }),
      ...(genero && { genero }),
      ...(duracion && { duracion }),
      ...(imagen !== undefined && { imagen }),
      ...(precio && { precio })
    });

    res.json(pelicula);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/peliculas/:id - Eliminar película (solo admin)
router.delete('/:id', protect, adminOnly, extractUser, async (req, res, next) => {
  try {
    const pelicula = await Pelicula.findByPk(req.params.id);

    if (!pelicula) {
      return res.status(404).json({
        error: true,
        mensaje: 'Película no encontrada'
      });
    }

    await pelicula.destroy();

    res.json({
      mensaje: 'Película eliminada correctamente'
    });
  } catch (error) {
    next(error);
  }
});

export default router;