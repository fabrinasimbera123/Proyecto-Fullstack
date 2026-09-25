import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Funcion = sequelize.define('Funcion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La fecha es requerida' },
      isDate: { msg: 'Debe ser una fecha válida' }
    }
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La hora es requerida' }
    }
  },
  sala: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Sala 7',
    validate: {
      notEmpty: { msg: 'La sala es requerida' }
    }
  },
  asientosDisponibles: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Los asientos disponibles no pueden ser negativos' }
    }
  },
  asientosTotales: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Debe haber al menos 1 asiento total' }
    }
  }
}, {
  tableName: 'funciones',
  timestamps: true,
  hooks: {
    beforeCreate: (funcion) => {
      if (funcion.asientosDisponibles === undefined) {
        funcion.asientosDisponibles = funcion.asientosTotales;
      }
    }
  }
});

export default Funcion;