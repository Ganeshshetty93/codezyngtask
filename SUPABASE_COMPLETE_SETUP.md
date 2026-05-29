╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                   CODEZYNG + SUPABASE SETUP INSTRUCTIONS                     ║
║                                                                               ║
║                            Complete Integration Guide                        ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝

📋 QUICK SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Frontend: Running on http://localhost:3000 (Vite + React)
⏳ Backend: Needs to connect to Supabase
⏳ Database: Supabase needs to be configured

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: CREATE SUPABASE PROJECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to https://supabase.com
2. Click "Start your project" or sign in if you have an account
3. Create a new organization (if needed)
4. Create a new project
5. Wait for project to initialize (~2 minutes)
6. Save these credentials:
   - Project URL
   - Anon Public Key (API Key)
   - Service Role Key (for admin operations)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 2: CREATE DATABASE TABLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. In Supabase Dashboard → Click "SQL Editor" (left sidebar)
2. Click "New Query"
3. Copy & paste this SQL:

------- BEGIN SQL -------

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

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_created_by ON products(created_by);
CREATE INDEX idx_products_category ON products(category);

-- Insert sample users
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

------- END SQL -------

4. Click "Run" button
5. Wait for tables to be created
6. Go to "Table Editor" and verify tables exist

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 3: UPDATE BACKEND ENVIRONMENT VARIABLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Edit: c:\Projects\codezyng\backend\.env

Replace with your Supabase credentials:

PORT=5000
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-api-key-here

(Get these from Supabase Dashboard → Settings → API)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 4: START BACKEND SERVER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Open PowerShell and run:

cd c:\Projects\codezyng\backend
npm install
npm run dev

Expected output:
  Server running on port 5000
  Supabase Connected

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 5: TEST FRONTEND-BACKEND CONNECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Frontend should already be running on http://localhost:3000

1. Open browser to http://localhost:3000
2. Click "Products" 
3. Should now see: "Laptop Pro", "Wireless Mouse", "USB-C Cable"
4. If you see products, API is working! ✅

If products don't load:
  1. Check backend console for errors
  2. Verify database tables exist in Supabase
  3. Verify .env has correct SUPABASE_URL and SUPABASE_KEY
  4. Restart backend server (stop with Ctrl+C, then npm run dev)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 6: TEST ALL APIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Open browser developer tools (F12) → Console tab while using app:

Test Register:
1. Go to http://localhost:3000/register
2. Fill in name, email, password
3. Click Register
4. Check console for response

Test Login:
1. Go to http://localhost:3000/login
2. Use registered email and password
3. Click Login
4. Should redirect to home page with token saved

Test Dashboard (Admin):
1. Login with admin@codezyng.com (if password was set)
2. Go to /dashboard
3. Should be able to create/edit/delete products

Test Products Page:
1. Go to /products
2. Should see all products
3. Click on product to see details

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

API ENDPOINTS REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

USER ENDPOINTS:
  POST   /api/users/register          Register new user
  POST   /api/users/login             Login user (returns JWT)
  GET    /api/users                   Get all users (admin)
  GET    /api/users/:id               Get user by ID
  PUT    /api/users/:id               Update user
  DELETE /api/users/:id               Delete user

PRODUCT ENDPOINTS:
  GET    /api/products                Get all products
  GET    /api/products/:id            Get product by ID
  POST   /api/products                Create product (admin)
  PUT    /api/products/:id            Update product (admin)
  DELETE /api/products/:id            Delete product (admin)
  POST   /api/products/:id/reviews    Add review to product

HEALTH CHECK:
  GET    /api/health                  Check API status

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Problem: "Failed to fetch products"
Solution: 
  1. Check if backend is running (should see "Server running on port 5000")
  2. Check if SUPABASE_URL and SUPABASE_KEY are correct
  3. Check if tables exist in Supabase Dashboard
  4. Restart backend: Ctrl+C, then npm run dev

Problem: "Cannot GET /api/products"
Solution:
  1. Make sure you're running backend from c:\Projects\codezyng\backend
  2. Check if backend dependencies are installed: npm install
  3. Check backend logs for errors

Problem: "Unauthorized" on create product
Solution:
  1. You need to login first to get JWT token
  2. Only admin users can create products
  3. Use admin@codezyng.com to login

Problem: "Database error" on any endpoint
Solution:
  1. Verify Supabase tables exist (go to Table Editor in dashboard)
  2. Verify SUPABASE_KEY has correct permissions
  3. Check backend console for detailed error message
  4. Try running SQL script again in SQL Editor

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CURRENT STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Frontend: Fully working on localhost:3000
✅ Frontend Files: All converted to .jsx, imports fixed
✅ Backend: Ready to connect to Supabase
⏳ Supabase: Waiting for you to create project and tables
⏳ Environment: backend/.env needs your Supabase credentials

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEXT ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Create Supabase project (Step 1)
2. Create database tables (Step 2)
3. Update backend .env (Step 3)
4. Start backend server (Step 4)
5. Test in browser (Step 5)
6. Test all APIs (Step 6)

Once all steps are complete, your fullstack app will be fully functional!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
