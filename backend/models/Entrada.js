import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Entrada = sequelize.define('Entrada', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cantidadAsientos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: { args: [1], msg: 'Debe comprar al menos 1 asiento' }
    }
  },
  precioTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'El precio total debe ser mayor o igual a 0' }
    }
  },
  estado: {
    type: DataTypes.ENUM('confirmada', 'cancelada'),
    defaultValue: 'confirmada',
    allowNull: false
  }
}, {
  tableName: 'entradas',
  timestamps: true
});

export default Entrada;