# Architecture & Data Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT SIDE (Frontend)                       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React Components                                         │  │
│  │  ┌─────────┬─────────┬──────────┬──────────┬──────────┐  │  │
│  │  │  Home   │Products │ Product  │ Login    │Register  │  │  │
│  │  │         │ Grid    │ Detail   │          │          │  │  │
│  │  └─────────┴─────────┴──────────┴──────────┴──────────┘  │  │
│  │                     ↓                                      │  │
│  │  ┌──────────────────────────────────────────────────────┐  │
│  │  │  Navigation Bar with Auth Links                      │  │
│  │  └──────────────────────────────────────────────────────┘  │
│  │                                                             │  │
│  │  ┌──────────────────────────────────────────────────────┐  │
│  │  │  API Service (axios)                                 │  │
│  │  │  - Auto adds JWT token to requests                  │  │
│  │  │  - Handles errors                                    │  │
│  │  └──────────────────────────────────────────────────────┘  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↓ HTTPS ↓                              │
└──────────────────────────────────────────────────────────────────┘
                           ↓ ↓ ↓
                    HTTP Requests
                           ↓ ↓ ↓
┌──────────────────────────────────────────────────────────────────┐
│                     SERVER SIDE (Backend)                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express Router                                          │  │
│  │  /api/users/register → POST                             │  │
│  │  /api/users/login    → POST                             │  │
│  │  /api/products       → GET, POST                        │  │
│  │  /api/products/:id   → GET, PUT, DELETE                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↓                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Middleware                                              │  │
│  │  - CORS Handler                                          │  │
│  │  - JWT Authentication                                   │  │
│  │  - Error Handler                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↓                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Controllers                                             │  │
│  │  ┌────────────────────┐  ┌────────────────────────────┐ │  │
│  │  │ userController     │  │ productController          │ │  │
│  │  │ - register()       │  │ - getAllProducts()         │ │  │
│  │  │ - login()          │  │ - getProductById()         │ │  │
│  │  │ - updateUser()     │  │ - createProduct()          │ │  │
│  │  │ - deleteUser()     │  │ - deleteProduct()          │ │  │
│  │  │                    │  │ - addReview()              │ │  │
│  │  └────────────────────┘  └────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↓                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Models (Mongoose Schemas)                               │  │
│  │  ┌────────────────┐        ┌────────────────────────┐   │  │
│  │  │ User Model     │        │ Product Model          │   │  │
│  │  │ - name         │        │ - title                │   │  │
│  │  │ - email        │        │ - description          │   │  │
│  │  │ - password     │        │ - price                │   │  │
│  │  │ - role         │        │ - category             │   │  │
│  │  │ - isActive     │        │ - stock                │   │  │
│  │  │                │        │ - reviews              │   │  │
│  │  │ Methods:       │        │ - rating               │   │  │
│  │  │ hashPassword() │        │ - createdBy (ref: User)│   │  │
│  │  │ matchPassword()│        │                        │   │  │
│  │  └────────────────┘        └────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↓                                       │
└──────────────────────────────────────────────────────────────────┘
                           ↓
                    MongoDB Driver
                           ↓
           ┌───────────────────────────────┐
           │     MongoDB Database          │
           │   (Collections & Documents)   │
           │                               │
           │  [Users Collection]           │
           │  ├─ User Document 1           │
           │  ├─ User Document 2           │
           │  └─ ...                       │
           │                               │
           │  [Products Collection]        │
           │  ├─ Product Document 1        │
           │  ├─ Product Document 2        │
           │  └─ ...                       │
           │                               │
           └───────────────────────────────┘
```

## User Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│              USER REGISTRATION & LOGIN FLOW              │
└─────────────────────────────────────────────────────────┘

REGISTRATION:
┌─────────────────┐
│  User fills     │
│  Register Form  │
└────────┬────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Frontend validates input             │
│ - Email format                       │
│ - Password match                     │
│ - All fields filled                  │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ POST /api/users/register             │
│ {name, email, password}              │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Backend validation                   │
│ - Check if user exists               │
│ - Validate email format              │
│ - Validate password strength         │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Hash password with bcryptjs          │
│ Save user to MongoDB                 │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Generate JWT Token                   │
│ Sign: {userId, role, expiresIn: 30d} │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Return token + user info             │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Frontend saves token to localStorage │
│ Redirects to home page               │
└──────────────────────────────────────┘

---

LOGIN:
┌──────────────────┐
│  User enters     │
│  credentials     │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ POST /api/users/login                │
│ {email, password}                    │
│ Authorization: Bearer <token> (none) │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Backend finds user by email          │
│ Compares password with hash          │
└────────┬─────────────────────────────┘
         │
         ├─ No Match → 401 Unauthorized
         │
         ↓
┌──────────────────────────────────────┐
│ Generate JWT Token                   │
│ Return token + user info             │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ Frontend saves token to localStorage │
│ Sets user info in state              │
│ Redirects to home page               │
└──────────────────────────────────────┘

---

PROTECTED API CALLS:
┌────────────────────────────────────────┐
│ Any subsequent request                 │
│ Authorization header auto-added        │
│ Authorization: Bearer <token>          │
└────────┬───────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────┐
│ Backend Auth Middleware                │
│ - Extract token from header            │
│ - Verify token signature & expiration  │
│ - Attach user data to request          │
└────────┬───────────────────────────────┘
         │
         ├─ Invalid/Expired → 401
         │
         ↓
┌────────────────────────────────────────┐
│ Route handler executes                 │
│ req.user contains user information     │
└────────┬───────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────┐
│ Check authorization level (admin/user) │
└────────┬───────────────────────────────┘
         │
         ├─ Not authorized → 403 Forbidden
         │
         ↓
┌────────────────────────────────────────┐
│ Process request and return response    │
└────────────────────────────────────────┘
```

## Product Management Flow

```
┌──────────────────────────────────────────────────────────┐
│            PRODUCT MANAGEMENT FLOW                       │
└──────────────────────────────────────────────────────────┘

ADMIN CREATES PRODUCT:
┌──────────────────┐
│  Admin clicks    │
│  Add Product     │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Admin Dashboard Form appears        │
│  - Title                             │
│  - Description                       │
│  - Price                             │
│  - Category                          │
│  - Stock                             │
│  - Image URL                         │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Frontend validates form             │
│  Sends: POST /api/products           │
│  Headers: Authorization: Bearer xyz  │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Backend authenticates admin         │
│  Validates product data              │
│  Creates product in MongoDB          │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Returns product with _id            │
│  Appears in products list            │
└──────────────────────────────────────┘

---

USER BROWSES PRODUCTS:
┌──────────────────┐
│  User visits     │
│  /products       │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  GET /api/products?category=...      │
│  (Optional filters)                  │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Backend queries MongoDB             │
│  Applies filters                     │
│  Returns array of products           │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Frontend displays product cards     │
│  Grid layout with Tailwind CSS       │
└──────────────────────────────────────┘

---

USER ADDS REVIEW:
┌──────────────────┐
│  User reads      │
│  product and     │
│  adds review     │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Review Form                         │
│  - Name (user)                       │
│  - Rating (1-5)                      │
│  - Comment                           │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  POST /api/products/:id/reviews      │
│  {user, rating, comment}             │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Backend adds review to product      │
│  Recalculates average rating         │
│  Saves to MongoDB                    │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Returns updated product             │
│  Reviews section refreshes           │
└──────────────────────────────────────┘
```

## State Management Flow

```
┌────────────────────────────────────────┐
│      REACT COMPONENT STATE FLOW         │
└────────────────────────────────────────┘

Component Mounted:
┌─────────────────────────────────────┐
│  useEffect runs on mount            │
│  Call API to fetch data             │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  setState(loading = true)           │
│  Fetch data from backend            │
└────────────┬────────────────────────┘
             │
             ├─ Success → setState(data)
             │
             ├─ Error → setState(error)
             │
             ↓
┌─────────────────────────────────────┐
│  setState(loading = false)          │
│  Component re-renders with data     │
└─────────────────────────────────────┘

User Interacts:
┌─────────────────────────────────────┐
│  User clicks button / fills form    │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  onChange event updates state       │
│  Form state = {field: value}        │
│  Component re-renders               │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  User submits form                  │
│  Calls API with state data          │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  setState(loading = true)           │
│  Show loading state to user         │
└────────────┬────────────────────────┘
             │
             ├─ Success → Update state
             │          → Show success
             │          → Redirect
             │
             ├─ Error → setState(error)
             │        → Show error message
             │
             ↓
┌─────────────────────────────────────┐
│  setState(loading = false)          │
│  Component displays result          │
└─────────────────────────────────────┘
```

---

**This architecture ensures:**
- ✅ Clean separation of concerns
- ✅ Secure authentication
- ✅ Scalable API design
- ✅ Responsive user experience
- ✅ Proper error handling
- ✅ Efficient data management
