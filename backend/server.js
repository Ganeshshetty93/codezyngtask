const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database on startup when direct DB use is enabled
const { createTables } = require('./db/initialize');
const db = require('./config/database');

const shouldInitDirectDb = process.env.USE_DIRECT_DB === 'true';
if (shouldInitDirectDb) {
  (async () => {
    try {
      await createTables();
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error.stack || error.message);
      // Continue anyway - direct DB init is optional when Supabase is used
    }
  })();
}

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server is running',
    database: 'Supabase PostgreSQL Connected',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════╗`);
  console.log(`║   TaskMaster AI Server Running    ║`);
  console.log(`║   Port: ${PORT}                           ║`);
  console.log(`║   Environment: ${process.env.NODE_ENV}         ║`);
  console.log(`╚════════════════════════════════════╝\n`);
});