const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection } = require('./config/database');
const bcrypt = require('bcryptjs');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for testing
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// If in test mode, mount the routes synchronously at the top level
// because in tests DB_MODE is set to 'sqlite' and runs synchronously
if (process.env.NODE_ENV === 'test') {
  const apiRoutes = require('./routes/api');
  app.use('/api', apiRoutes);
}

// Base route status check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error occurred.'
  });
});

// Database seeding logic
const seedDatabase = async () => {
  try {
    const { User } = require('./models');
    
    // Hash password for seed users
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Seed Alice
    const [alice, aliceCreated] = await User.findOrCreate({
      where: { email: 'alice@test.com' },
      defaults: {
        name: 'Alice Smith',
        email: 'alice@test.com',
        password: hashedPassword
      }
    });
    if (aliceCreated) {
      console.log('Seeded User: alice@test.com (Alice Smith)');
    }

    // Seed Bob
    const [bob, bobCreated] = await User.findOrCreate({
      where: { email: 'bob@test.com' },
      defaults: {
        name: 'Bob Jones',
        email: 'bob@test.com',
        password: hashedPassword
      }
    });
    if (bobCreated) {
      console.log('Seeded User: bob@test.com (Bob Jones)');
    }

    // Seed Tejashree
    const [tejashree, tejashreeCreated] = await User.findOrCreate({
      where: { email: 'tejashree@gmail.com' },
      defaults: {
        name: 'Tejashree',
        email: 'tejashree@gmail.com',
        password: hashedPassword
      }
    });
    if (tejashreeCreated) {
      console.log('Seeded User: tejashree@gmail.com (Tejashree)');
    }
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
};

// Start Server & Initialize Database
const startServer = async () => {
  try {
    // 1. Authenticate connection (with fallback to SQLite built-in)
    await testConnection();

    // 2. Dynamic route mounting for development/production
    // This delays requiring routes and loading models until database state is fully resolved
    if (process.env.NODE_ENV !== 'test') {
      const apiRoutes = require('./routes/api');
      app.use('/api', apiRoutes);
    }

    // 3. Sync models (creates tables in SQLite or MySQL as active)
    const { sequelize } = require('./models');
    await sequelize.sync({ force: false });
    console.log('Database tables synchronized successfully.');

    // 4. Seed demo users
    await seedDatabase();

    // 5. Listen on PORT
    app.listen(PORT, () => {
      console.log(`[SERVER] Collaborative Document Editor running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

// Export app for testing purposes
module.exports = app;

// Only start the server if this file is run directly
if (require.main === module) {
  startServer();
}
