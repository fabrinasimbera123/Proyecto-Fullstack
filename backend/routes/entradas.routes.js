import express from 'express';
import { Entrada, Funcion, Pelicula, Usuario } from '../models/index.js';
import { protect, extractUser } from '../config/keycloak.js';
import sequelize from '../config/database.js';

const router = express.Router();

// GET /api/entradas - Obtener entradas del usuario autenticado
router.get('/', protect, extractUser, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

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

    const { count, rows } = await Entrada.findAndCountAll({
      where: { usuarioId: usuario.id },
      include: [{
        model: Funcion,
        as: 'funcion',
        include: [{
          model: Pelicula,
          as: 'pelicula',
          attributes: ['id', 'titulo', 'imagen', 'genero', 'duracion']
        }]
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
      entradas: rows
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/entradas/comprar - Comprar entradas (TRANSACCIÓN)
router.post('/comprar', protect, extractUser, async (req, res, next) => {
  const t = await sequelize.transaction();
  
  try {
    const { items } = req.body; // items: [{ funcionId, cantidadAsientos }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        mensaje: 'Debe enviar al menos un item para comprar'
      });
    }

    // Buscar o crear usuario
    let usuario = await Usuario.findOne({ 
      where: { keycloakId: req.user.id },
      transaction: t 
    });
    
    if (!usuario) {
      usuario = await Usuario.create({
        keycloakId: req.user.id,
        username: req.user.username,
        email: req.user.email,
        roles: req.user.roles
      }, { transaction: t });
    }

    const entradasCreadas = [];

    // Procesar cada item del carrito
    for (const item of items) {
      const { funcionId, cantidadAsientos } = item;

      if (!funcionId || !cantidadAsientos || cantidadAsientos < 1) {
        await t.rollback();
        return res.status(400).json({
          error: true,
          mensaje: 'Datos inválidos en el carrito'
        });
      }

      // Obtener función con lock
      const funcion = await Funcion.findByPk(funcionId, {
        include: [{ model: Pelicula, as: 'pelicula' }],
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (!funcion) {
        await t.rollback();
        return res.status(404).json({
          error: true,
          mensaje: `Función ${funcionId} no encontrada`
        });
      }

      // Verificar disponibilidad
      if (funcion.asientosDisponibles < cantidadAsientos) {
        await t.rollback();
        return res.status(400).json({
          error: true,
          mensaje: `No hay suficientes asientos disponibles para ${funcion.pelicula.titulo}. Disponibles: ${funcion.asientosDisponibles}`
        });
      }

      // Calcular precio total
      const precioTotal = funcion.pelicula.precio * cantidadAsientos;

      // Crear entrada
      const entrada = await Entrada.create({
        usuarioId: usuario.id,
        funcionId: funcion.id,
        cantidadAsientos,
        precioTotal,
        estado: 'confirmada'
      }, { transaction: t });

      // Actualizar asientos disponibles
      await funcion.update({
        asientosDisponibles: funcion.asientosDisponibles - cantidadAsientos
      }, { transaction: t });

      entradasCreadas.push(entrada);
    }

    // Commit de la transacción
    await t.commit();

    // Recargar entradas con sus relaciones
    const entradasCompletas = await Entrada.findAll({
      where: { id: entradasCreadas.map(e => e.id) },
      include: [{
        model: Funcion,
        as: 'funcion',
        include: [{
          model: Pelicula,
          as: 'pelicula'
        }]
      }]
    });

    res.status(201).json({
      mensaje: 'Compra realizada exitosamente',
      entradas: entradasCompletas
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
});

// DELETE /api/entradas/:id - Cancelar entrada
router.delete('/:id', protect, extractUser, async (req, res, next) => {
  const t = await sequelize.transaction();
  
  try {
    const entrada = await Entrada.findByPk(req.params.id, {
      include: [{ model: Funcion, as: 'funcion' }],
      transaction: t
    });

    if (!entrada) {
      await t.rollback();
      return res.status(404).json({
        error: true,
        mensaje: 'Entrada no encontrada'
      });
    }

    // Verificar que sea el dueño
    const usuario = await Usuario.findOne({ where: { keycloakId: req.user.id } });
    if (entrada.usuarioId !== usuario.id) {
      await t.rollback();
      return res.status(403).json({
        error: true,
        mensaje: 'No tienes permiso para cancelar esta entrada'
      });
    }

    if (entrada.estado === 'cancelada') {
      await t.rollback();
      return res.status(400).json({
        error: true,
        mensaje: 'La entrada ya está cancelada'
      });
    }

    // Devolver asientos a la función
    await entrada.funcion.update({
      asientosDisponibles: entrada.funcion.asientosDisponibles + entrada.cantidadAsientos
    }, { transaction: t });

    // Marcar como cancelada
    await entrada.update({ estado: 'cancelada' }, { transaction: t });

    await t.commit();

    res.json({
      mensaje: 'Entrada cancelada correctamente',
      entrada
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
});

export default router;