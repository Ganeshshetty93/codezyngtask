# Supabase Setup Guide for Codezyng

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Create a new project
4. Copy your **Project URL** and **Anon API Key**

## Step 2: Update Environment Variables

Edit `backend/.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

For server-side operations, get the **Service Role Key** from Settings > API and store as:
```
SUPABASE_SERVICE_ROLE=your-service-role-key
```

## Step 3: Create Database Tables

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `SUPABASE_SETUP.sql`
5. Click **Run**

This will create:
- `users` table with columns: id, name, email, password, role, is_active, created_at, updated_at
- `products` table with columns: id, title, description, price, category, image, stock, rating, reviews, created_by, created_at, updated_at
- Sample data for testing

## Step 4: Verify Tables

1. Go to **Table Editor** in Supabase
2. You should see `users` and `products` tables
3. Click on each to verify data was inserted

## Step 5: Start Backend Server

```bash
cd backend
npm install
npm run dev
```

Server should start on port 5000

## Step 6: Test APIs

### Get All Products
```bash
curl http://localhost:5000/api/products
```

Should return an array of products.

### Create User (Register)
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Returns JWT token to use for authenticated requests.

### Create Product (Admin Only)
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "New Product",
    "description": "Product description",
    "price": 99.99,
    "category": "Electronics",
    "stock": 100,
    "image": "https://example.com/image.jpg"
  }'
```

## Troubleshooting

### "Product.find is not a function"
- Make sure you've created the `products` table in Supabase
- Verify SUPABASE_URL and SUPABASE_KEY are correct in .env

### API returns 500 error
- Check backend console logs
- Verify database tables exist
- Ensure Supabase credentials are correct

### CORS errors
- CORS is already enabled in server.js
- Make sure frontend is running on localhost:3000

## API Endpoints

### User Endpoints
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Product Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `POST /api/products/:id/reviews` - Add review to product

## Next Steps

1. ✅ Frontend is running on http://localhost:3000
2. ✅ Backend should connect to Supabase
3. Test all API endpoints
4. Deploy to production (Vercel for frontend, Railway/Heroku for backend)
