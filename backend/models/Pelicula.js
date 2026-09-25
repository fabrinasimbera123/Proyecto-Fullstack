import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Pelicula = sequelize.define('Pelicula', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El título es requerido' },
      len: { args: [1, 200], msg: 'El título debe tener entre 1 y 200 caracteres' }
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  genero: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El género es requerido' }
    }
  },
  duracion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'La duración debe ser mayor a 0' }
    }
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'https://via.placeholder.com/300x450?text=Sin+Imagen'
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'El precio debe ser mayor o igual a 0' }
    }
  }
}, {
  tableName: 'peliculas',
  timestamps: true
});

export default Pelicula;