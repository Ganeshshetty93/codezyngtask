# Development Guide

This guide helps you understand and develop the Codezyng application.

## Project Architecture

### Backend Architecture
```
Request → Router → Middleware (Auth) → Controller → Model → Database
                          ↓
                    Error Handler
```

### Frontend Architecture
```
Component → Service (API) → State (React hooks) → DOM → User
```

## Backend Structure

### Models (Database Schemas)
Located in `backend/models/`:
- **User.js**: User account schema with password hashing
- **Product.js**: Product catalog schema with reviews

### Controllers (Business Logic)
Located in `backend/controllers/`:
- **userController.js**: User registration, login, profile management
- **productController.js**: Product CRUD operations and reviews

### Routes (API Endpoints)
Located in `backend/routes/`:
- **userRoutes.js**: User-related endpoints
- **productRoutes.js**: Product-related endpoints

### Middleware
Located in `backend/middleware/`:
- **auth.js**: JWT authentication and authorization

## Frontend Structure

### Pages (Full Screen Components)
Located in `frontend/src/pages/`:
- **Home.js**: Landing page with hero section
- **Products.js**: Product listing with filters
- **ProductDetail.js**: Single product view with reviews
- **Login.js**: User login form
- **Register.js**: User registration form
- **Dashboard.js**: Admin panel for managing products

### Components (Reusable Pieces)
Located in `frontend/src/components/`:
- **Navbar.js**: Navigation bar with auth links
- **ProductCard.js**: Product card component

### Services (API Communication)
Located in `frontend/src/services/`:
- **api.js**: Axios instance with interceptors for API calls

## Authentication Flow

### Registration
1. User fills registration form
2. Frontend sends POST to `/api/users/register`
3. Backend validates input and hashes password
4. Token generated and returned
5. Frontend stores token in localStorage
6. User redirected to home page

### Login
1. User enters credentials
2. Frontend sends POST to `/api/users/login`
3. Backend verifies credentials
4. Token generated and returned
5. Token stored in localStorage
6. User can now access protected routes

### Protected Routes
1. Component checks for token in localStorage
2. If no token, redirects to login
3. If token exists, renders component
4. API calls include token in Authorization header
5. Backend verifies token using JWT middleware

## Key Concepts

### State Management
The app uses React's built-in hooks:
- `useState`: For local component state
- `useEffect`: For side effects (API calls)
- `useContext`: Available for more complex state (future)

### API Integration
All API calls use axios configured with:
- Automatic token injection in headers
- Base URL pointing to backend
- Error handling

### Form Handling
Forms are controlled components:
- Input changes update state
- Submit calls API
- Loading state prevents double submission
- Errors displayed to user

## Common Development Tasks

### Adding a New Page
1. Create file in `frontend/src/pages/PageName.js`
2. Import in `App.js`
3. Add route in `App.js` Routes
4. Add navigation link in `Navbar.js`

### Adding a New API Endpoint
1. Create controller method in `backend/controllers/`
2. Add route in `backend/routes/`
3. Add function in `frontend/src/services/api.js`
4. Use in component with try-catch

### Adding a New Database Field
1. Update schema in `backend/models/`
2. Add form field in frontend component
3. Handle in controller
4. Test with API

### Styling with Tailwind
Use utility classes:
- Colors: `text-blue-600`, `bg-red-500`
- Spacing: `p-4`, `m-2`, `py-8`
- Layout: `flex`, `grid`, `grid-cols-3`
- Responsive: `md:grid-cols-2`, `lg:text-xl`

## Debugging

### Frontend Debugging
- Browser DevTools (F12)
- Console tab for errors
- Network tab to inspect API calls
- React DevTools extension

### Backend Debugging
- Console.log in terminal
- Network requests in terminal
- MongoDB Atlas or local MongoDB shell

### Common Issues

**CORS Error**: Backend is blocking frontend requests
- Check CORS middleware in `server.js`
- Make sure backend is running

**401 Unauthorized**: Token issues
- Check token in localStorage (DevTools → Application)
- Verify JWT_SECRET matches
- Check token expiration

**500 Server Error**: Backend issues
- Check MongoDB connection
- Look at server terminal for errors
- Verify environment variables

## Database Queries

### MongoDB Commands
```javascript
// Find all users
db.users.find()

// Find by email
db.users.findOne({ email: "user@example.com" })

// Update user role
db.users.updateOne({ _id: ObjectId("...") }, { $set: { role: "admin" } })

// Delete user
db.users.deleteOne({ _id: ObjectId("...") })
```

## Performance Tips

1. **Frontend**:
   - Use React.memo for expensive components
   - Lazy load pages with React.lazy
   - Optimize images
   - Remove unused dependencies

2. **Backend**:
   - Add database indexes for frequent queries
   - Use pagination for large datasets
   - Cache frequently accessed data
   - Optimize MongoDB queries

## Testing

### Manual Testing Checklist
- [ ] Register new user
- [ ] Login with credentials
- [ ] Browse products
- [ ] Filter products
- [ ] Search products
- [ ] View product details
- [ ] Add review
- [ ] Admin create product
- [ ] Admin delete product
- [ ] Logout

### API Testing
Use Postman or REST Client VSCode extension:
1. Create requests for each endpoint
2. Test with and without authentication
3. Test with invalid inputs
4. Check error responses

## Deployment Preparation

Before deploying:
1. Remove console.log statements
2. Add environment variables
3. Test all features
4. Optimize images
5. Build frontend: `npm run build`
6. Set NODE_ENV=production

## Resources for Learning

- [React Official Docs](https://react.dev/)
- [Express.js Docs](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [JWT Intro](https://jwt.io/introduction)

## Useful VSCode Extensions

- REST Client (for API testing)
- Thunder Client (alternative to Postman)
- MongoDB for VSCode
- Prettier (code formatting)
- ESLint (code quality)

## Git Workflow

```bash
# Create a new branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request on GitHub
```

## Next Steps for Learning

1. Add shopping cart functionality
2. Implement order management
3. Add email notifications
4. Integrate payment gateway
5. Deploy to AWS/Heroku
6. Add real-time notifications with WebSocket
7. Implement caching strategies

---

Happy coding! 🚀
