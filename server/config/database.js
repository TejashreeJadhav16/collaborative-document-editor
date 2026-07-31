const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const dbMode = process.env.DB_MODE || 'mysql';
let sequelizeInstance;

// Determine SQLite storage path based on environment
const getSqliteStorage = () => {
  const filename = process.env.NODE_ENV === 'test' ? 'database.test.sqlite' : 'database.sqlite';
  return path.join(__dirname, '..', filename);
};

if (dbMode === 'sqlite') {
  console.log(`DB_MODE set to sqlite. Initializing local SQLite database at ${getSqliteStorage()}...`);
  sequelizeInstance = new Sequelize({
    dialect: 'sqlite',
    storage: getSqliteStorage(),
    logging: false
  });
} else {
  // MySQL connection credentials
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'collaborative_doc_editor';

  console.log(`Attempting to connect to MySQL database '${database}' on ${host}:${port}...`);

  sequelizeInstance = new Sequelize(database, user, password, {
    host: host,
    port: port,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      connectTimeout: 4000 // fail fast in 4 seconds
    }
  });
}

// We export the object containing sequelizeInstance, using a getter or direct property
// so we can modify the exported property dynamically on fallback
module.exports = {
  sequelize: sequelizeInstance,
  testConnection: async () => {
    try {
      await module.exports.sequelize.authenticate();
      console.log('Database connection has been established successfully.');
      return true;
    } catch (error) {
      if (dbMode !== 'sqlite') {
        console.warn(`\n[WARNING] Failed to connect to MySQL database. Error: ${error.message}`);
        console.warn(`Falling back to local SQLite database in ${getSqliteStorage()}...\n`);
        
        // Re-assign the exported property directly!
        module.exports.sequelize = new Sequelize({
          dialect: 'sqlite',
          storage: getSqliteStorage(),
          logging: false
        });
        
        try {
          await module.exports.sequelize.authenticate();
          console.log('SQLite database connection has been established successfully as a fallback.');
          return true;
        } catch (fallbackError) {
          console.error('Critical: Failed to initialize fallback SQLite database:', fallbackError.message);
          throw fallbackError;
        }
      } else {
        console.error('Critical: Failed to connect to SQLite database:', error.message);
        throw error;
      }
    }
  }
};
