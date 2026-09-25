import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  keycloakId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El keycloakId es requerido' }
    }
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El username es requerido' }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Debe ser un email válido' }
    }
  },
  roles: {
    type: DataTypes.JSON,   // ←  CAMBIO NECESARIO
    allowNull: false,
    defaultValue: ['user']
  }
}, {
  tableName: 'usuarios',
  timestamps: true
});

export default Usuario;