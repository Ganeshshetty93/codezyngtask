# 🤖 TaskMaster AI - Intelligent Task Management

An intelligent task management application with **AI-powered features** built with React 18, Express.js, PostgreSQL, and OpenAI GPT-3.5.

## ✨ Features

### Core Task Management
- ✅ Create, read, update, and delete tasks
- ✅ Set priorities (low, medium, high)
- ✅ Assign due dates and track time
- ✅ Mark status (todo → in_progress → done)
- ✅ Organize by categories (work, personal, health, etc.)

### 🤖 AI-Powered Features
- ✅ **Natural Language Task Creation**: "Plan my product launch" → Creates task + subtasks automatically
- ✅ **Smart Task Breakdown**: Automatically split epic tasks into actionable subtasks
- ✅ **Priority Suggestions**: AI analyzes and suggests appropriate priority
- ✅ **Time Estimation**: Get AI-powered time estimates for completion
- ✅ **Smart Suggestions**: Intelligent recommendations based on your task history

### Security & Authentication
- ✅ Email/password registration and login
- ✅ Secure password hashing (bcryptjs)
- ✅ JWT token authentication
- ✅ User-isolated task lists

## 🏗️ Project Structure

```
codezyng/
├── frontend/                    # React 18 + Vite
│   ├── src/
│   │   ├── main.jsx            # Entry point
│   │   ├── App.jsx             # Main component
│   │   ├── api.jsx             # Axios config
│   │   ├── pages/              # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateTask.jsx
│   │   │   ├── TaskDetail.jsx
│   │   │   └── Profile.jsx
│   │   ├── components/         # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   └── TaskCard.jsx
│   │   └── App.css
│   ├── vite.config.js
│   ├── tailwind.config.cjs
│   ├── package.json
│   └── index.html
│
├── backend/                     # Express.js API
│   ├── db/
│   │   └── initialize.js       # Database setup
│   ├── config/
│   │   ├── database.js         # PostgreSQL pool
│   │   └── supabase.js         # Supabase config
│   ├── services/
│   │   └── aiTaskService.js    # AI features
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── controllers/
│   │   ├── userController.js
│   │   └── taskController.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   └── taskRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── .env
│
└── Documentation/
    ├── GET_STARTED.md          # ← Start here!
    ├── QUICK_START.md
    ├── COMMANDS.md
    └── TASKMASTER_AI_SETUP.md
```
│   ├── package.json
│   └── .env.example
│
└── frontend/               # React + Tailwind Frontend
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/     # Reusable components
    │   │   ├── Navbar.js
    │   │   └── ProductCard.js
    │   ├── pages/          # Page components
    │   │   ├── Home.js
    │   │   ├── Products.js
    │   │   ├── ProductDetail.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   └── Dashboard.js
    │   ├── services/       # API services
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── package.json
    ├── tailwind.config.js
    └── postcss.config.js
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas connection string)
- npm or yarn

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/codezyng
   JWT_SECRET=your_secret_key_here
   NODE_ENV=development
   ```

5. Start the backend server:
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

## API Endpoints

### User Routes
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Product Routes
- `GET /api/products` - Get all products (with filters)
  - Query params: `category`, `minPrice`, `maxPrice`, `search`
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `POST /api/products/:id/reviews` - Add review to product

## Default Admin Account

After setting up, you can create an admin account by:

1. Register a user account
2. Update the user in MongoDB to have `role: "admin"`

Or modify the user registration to include admin role:
```javascript
// In backend/controllers/userController.js
const user = await User.create({
  name,
  email,
  password,
  role: 'admin' // Set to 'admin' for first user
});
```

## Technologies Used

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Axios (for API calls)
- **Vite** (Lightning-fast build tool)

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose ODM)
- JWT (Authentication)
- bcryptjs (Password hashing)

## Running the Full Application

1. Make sure MongoDB is running
2. Start the backend: `cd backend && npm start`
3. In a new terminal, start the frontend: `cd frontend && npm start`
4. Open `http://localhost:3000` in your browser

## Features Guide

### Home Page
- Welcome hero section
- Feature highlights
- Call-to-action buttons

### Products Page
- Product grid with cards
- Search functionality
- Category filtering
- Price range filtering
- Responsive design

### Product Detail Page
- Detailed product information
- Customer reviews and ratings
- Add review functionality
- Stock information

### Authentication
- User registration
- User login
- Protected routes
- JWT token management

### Admin Dashboard
- Create new products
- View all products
- Delete products
- Product management table

## Error Handling

The application includes comprehensive error handling:
- Input validation
- API error responses
- User-friendly error messages
- Try-catch blocks in async operations

## Future Enhancements

- Shopping cart functionality
- Payment integration (Stripe/PayPal)
- Order management
- User wishlist
- Product recommendations
- Advanced analytics
- Email notifications

## Contributing

Feel free to fork this project and submit pull requests for any improvements.

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please open an issue on the repository.

---

**Happy Coding! 🚀**
