# Codezyng Fullstack Application - Quick Start Guide

This document provides step-by-step instructions to get your fullstack application running.

## Prerequisites

Before you start, make sure you have installed:
- **Node.js** (v14+) - [Download](https://nodejs.org/)
- **MongoDB** - Either:
  - Local installation: [MongoDB Community](https://www.mongodb.com/try/download/community)
  - Or use MongoDB Atlas (cloud): [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** (optional)

## Step 1: Setup MongoDB

### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   - **Windows**: MongoDB should start automatically or run `mongod` in terminal
   - **Mac**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

### Option B: MongoDB Atlas (Recommended for beginners)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update your `.env` file with the connection string

## Step 2: Backend Setup

1. Open PowerShell and navigate to backend folder:
   ```powershell
   cd c:\Projects\codezyng\backend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Create `.env` file from template:
   ```powershell
   Copy-Item .env.example .env
   ```

4. Edit `.env` file (use Notepad or VS Code):
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/codezyng
   JWT_SECRET=your_super_secret_key_12345
   NODE_ENV=development
   ```

5. Start the backend server:
   ```powershell
   npm run dev
   ```
   
   You should see: `Server running on port 5000`

## Step 3: Frontend Setup

1. Open a NEW PowerShell terminal and navigate to frontend:
   ```powershell
   cd c:\Projects\codezyng\frontend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Start the frontend development server:
   ```powershell
   npm run dev
   ```

   Your browser will automatically open at `http://localhost:3000`

   **Vite provides:**
   - Lightning-fast dev server (starts in <1 second)
   - Instant HMR (Hot Module Replacement)
   - Optimized production builds
   - Better performance overall

## Step 4: Test the Application

1. **Register a new account**:
   - Go to the Register page
   - Fill in the form and create an account
   - You'll be automatically logged in

2. **Browse Products**:
   - Click on "Products" in the navbar
   - Use filters to search for products
   - Click on a product to see details

3. **Add a Product (Admin)**:
   - First, make one user an admin:
     - Open MongoDB and update the user's role to "admin"
     - Or restart and modify the register function temporarily
   - Click "Dashboard" in navbar
   - Click "Add Product" and fill in the form
   - Your product will appear in the products list

4. **Add Review**:
   - Click on any product
   - Scroll down to the reviews section
   - Add a review with rating and comment

## API Testing (Optional)

You can test the API using tools like:
- **Postman**: [Download](https://www.postman.com/downloads/)
- **Insomnia**: [Download](https://insomnia.rest/download)
- **VS Code REST Client**: Install the extension

Example API request:
```
POST http://localhost:5000/api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

## Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Make sure MongoDB is running: `mongod` in terminal
- Check `.env` file has correct MONGODB_URI
- Try: `npm install` again

### Frontend won't start
- Check if port 3000 is available
- Delete `node_modules` folder and run `npm install` again
- Try: `npm start` again

### MongoDB connection error
- If using local MongoDB, start it with `mongod`
- If using MongoDB Atlas, check your connection string in `.env`
- Make sure database credentials are correct

### Can't see products after creating
- Make sure you're logged in as an admin
- Check if you have the "Dashboard" link in navbar
- Try refreshing the page

## File Structure

```
codezyng/
├── backend/          ← Node.js/Express API
│   ├── models/      ← Database schemas
│   ├── routes/      ← API endpoints
│   ├── controllers/ ← Business logic
│   ├── server.js    ← Main file
│   └── package.json
│
└── frontend/         ← React + Vite (Lightning Fast!)
    ├── src/
    │   ├── pages/   ← Page components
    │   ├── components/ ← Reusable components
    │   ├── services/   ← API calls
    │   └── App.js   ← Main app
    ├── public/      ← Static assets
    ├── vite.config.js    ← Vite configuration
    └── package.json
```

## Development Tips

1. **Keep both terminals open** - One for backend, one for frontend
2. **Frontend will auto-reload** when you save files
3. **Backend needs restart** - Stop with Ctrl+C and run `npm run dev` again
4. **Check browser console** - F12 to see errors
5. **Check terminal console** - Look at backend terminal for API errors

## Useful Commands

**Backend**:
```powershell
npm install              # Install dependencies
npm start               # Run production server
npm run dev            # Run development with auto-reload
```

**Frontend**:
```powershell
npm install              # Install dependencies
npm start               # Start development server
npm run build           # Build for production
npm test                # Run tests
```

## Next Steps

Once everything is running:
1. Explore the codebase
2. Try modifying the UI in the pages
3. Add new features
4. Deploy to production

## Additional Resources

- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Express.js Documentation](https://expressjs.com/)

## Support

If you encounter issues:
1. Check the error messages in the terminal
2. Look at browser console (F12)
3. Verify all prerequisites are installed
4. Try restarting both servers

Good luck! 🚀
