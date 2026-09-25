import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Resena = sequelize.define('Resena', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  calificacion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'La calificación mínima es 1' },
      max: { args: [5], msg: 'La calificación máxima es 5' }
    }
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: { args: [0, 1000], msg: 'El comentario no puede exceder 1000 caracteres' }
    }
  }
}, {
  tableName: 'resenas',
  timestamps: true
});

export default Resena;