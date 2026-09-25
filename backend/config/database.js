import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Ruta del archivo SQLite
const storagePath = process.env.DB_STORAGE || path.resolve(process.cwd(), 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath,
  logging: false
});

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a SQLite exitosa:', storagePath);
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos SQLite:', error);
    return false;
  }
};

export const syncDatabase = async () => {
  try {
    await sequelize.sync({});
    console.log('✅ Base de datos SQLite sincronizada');
  } catch (error) {
    console.error('❌ Error sincronizando SQLite:', error);
  }
};

export default sequelize;
