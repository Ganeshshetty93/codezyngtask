-- Supabase Setup Script for Codezyng
-- Run these SQL commands in your Supabase project's SQL editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  image VARCHAR(500),
  stock INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  reviews JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_created_by ON products(created_by);
CREATE INDEX idx_products_category ON products(category);

-- Insert sample users (passwords should be hashed in production)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@codezyng.com', '$2b$10$sample_hashed_password_here', 'admin'),
('Test User', 'user@codezyng.com', '$2b$10$sample_hashed_password_here', 'user')
ON CONFLICT (email) DO NOTHING;

-- Insert sample products
INSERT INTO products (title, description, price, category, stock, created_by) 
SELECT 
  'Laptop Pro',
  'High-performance laptop for professionals',
  1299.99,
  'Electronics',
  50,
  (SELECT id FROM users WHERE email = 'admin@codezyng.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = 'Laptop Pro');

INSERT INTO products (title, description, price, category, stock, created_by) 
SELECT
  'Wireless Mouse',
  'Ergonomic wireless mouse',
  29.99,
  'Accessories',
  150,
  (SELECT id FROM users WHERE email = 'admin@codezyng.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = 'Wireless Mouse');

INSERT INTO products (title, description, price, category, stock, created_by) 
SELECT
  'USB-C Cable',
  'Fast charging USB-C cable',
  9.99,
  'Accessories',
  500,
  (SELECT id FROM users WHERE email = 'admin@codezyng.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = 'USB-C Cable');

-- Enable Row Level Security (optional but recommended)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
