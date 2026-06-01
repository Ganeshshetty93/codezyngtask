const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); 

const { Client } = require('pg');

const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('\n❌ CRITICAL SYSTEM ERROR: Database connection string is undefined!');
  console.error('Please check that your backend/.env file contains either:');
  console.error('  SUPABASE_DB_URL=postgresql://postgres:[password]@[host]:6543/postgres\n');
  process.exit(1);
}

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function createTables() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL');

    // Ensure pgcrypto extension is available for gen_random_uuid()
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    console.log('✓ pgcrypto extension ensured');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        avatar_url VARCHAR(500),
        oauth_provider VARCHAR(50),
        oauth_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Users table created');

    // Create tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        status VARCHAR(50) DEFAULT 'todo',
        priority VARCHAR(50) DEFAULT 'medium',
        due_date TIMESTAMP,
        reminder_at TIMESTAMP,
        estimated_hours DECIMAL(5, 2),
        actual_hours DECIMAL(5, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tasks table created');

    // Create subtasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subtasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'todo',
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Subtasks table created');

    await client.query(`
      ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS description TEXT;
    `);

    await client.query(`
      ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
    `);

    await client.query(`
      ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'todo';
    `);

    await client.query(`
      ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    await client.query(`
      ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    // Ensure tasks columns exist (some environments may have schema cache mismatches)
    await client.query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT;
    `);

    await client.query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category VARCHAR(100);
    `);

    await client.query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'todo';
    `);

    await client.query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'medium';
    `);

    await client.query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMP;
    `);

    await client.query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_at TIMESTAMP;
    `);

    await client.query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5, 2);
    `);

    await client.query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(5, 2);
    `);

    await client.query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    await client.query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    // Create task_templates table for AI suggestions
    await client.query(`
      CREATE TABLE IF NOT EXISTS task_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        suggested_subtasks JSONB,
        suggested_priority VARCHAR(50),
        estimated_hours DECIMAL(5, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Task templates table created');

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
      CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
      CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    await client.query(`
      ALTER TABLE tasks REPLICA IDENTITY FULL;
      ALTER TABLE subtasks REPLICA IDENTITY FULL;

      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
          IF NOT EXISTS (
            SELECT 1
            FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime'
              AND schemaname = 'public'
              AND tablename = 'tasks'
          ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
          END IF;

          IF NOT EXISTS (
            SELECT 1
            FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime'
              AND schemaname = 'public'
              AND tablename = 'subtasks'
          ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.subtasks;
          END IF;
        END IF;
      END $$;
    `);
    console.log('✓ Indexes created');

    console.log('\n✅ All tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.stack || error.message);
    throw error;
  } finally {
    await client.end();
  }
}

// Run on demand
if (require.main === module) {
  createTables();
}

module.exports = { createTables };
