import sequelize from '../config/database.js';
import Usuario from './Usuario.js';
import Pelicula from './Pelicula.js';
import Resena from './Resena.js';
import Funcion from './Funcion.js';
import Entrada from './Entrada.js';

// Relaciones Usuario
Usuario.hasMany(Resena, { foreignKey: 'usuarioId', as: 'resenas', onDelete: 'CASCADE' });
Usuario.hasMany(Entrada, { foreignKey: 'usuarioId', as: 'entradas', onDelete: 'CASCADE' });

// Relaciones Pelicula
Pelicula.hasMany(Resena, { foreignKey: 'peliculaId', as: 'resenas', onDelete: 'CASCADE' });
Pelicula.hasMany(Funcion, { foreignKey: 'peliculaId', as: 'funciones', onDelete: 'CASCADE' });

// Relaciones Resena
Resena.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
Resena.belongsTo(Pelicula, { foreignKey: 'peliculaId', as: 'pelicula' });

// Relaciones Funcion
Funcion.belongsTo(Pelicula, { foreignKey: 'peliculaId', as: 'pelicula' });
Funcion.hasMany(Entrada, { foreignKey: 'funcionId', as: 'entradas', onDelete: 'CASCADE' });

// Relaciones Entrada
Entrada.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
Entrada.belongsTo(Funcion, { foreignKey: 'funcionId', as: 'funcion' });

const models = {
  Usuario,
  Pelicula,
  Resena,
  Funcion,
  Entrada,
  sequelize
};

export { Usuario, Pelicula, Resena, Funcion, Entrada, sequelize };
export default models;