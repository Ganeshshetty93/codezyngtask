# API Documentation

## Base URL
`http://localhost:5000/api`

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## User Endpoints

### Register User
- **POST** `/users/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User registered successfully",
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
  ```

### Login User
- **POST** `/users/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:** Same as register

### Get All Users (Admin Only)
- **GET** `/users`
- **Headers:** Authorization required
- **Response:**
  ```json
  {
    "users": [...]
  }
  ```

### Get User by ID
- **GET** `/users/:id`
- **Headers:** Authorization required
- **Response:**
  ```json
  {
    "user": {...}
  }
  ```

### Update User
- **PUT** `/users/:id`
- **Headers:** Authorization required
- **Body:**
  ```json
  {
    "name": "Updated Name",
    "email": "newemail@example.com"
  }
  ```

### Delete User (Admin Only)
- **DELETE** `/users/:id`
- **Headers:** Authorization required

---

## Product Endpoints

### Get All Products
- **GET** `/products`
- **Query Parameters:**
  - `search`: Search by title
  - `category`: Filter by category (Electronics, Clothing, Home, Books, Sports)
  - `minPrice`: Minimum price
  - `maxPrice`: Maximum price
- **Example:** `/products?category=Electronics&minPrice=50&maxPrice=500`
- **Response:**
  ```json
  {
    "products": [...]
  }
  ```

### Get Product by ID
- **GET** `/products/:id`
- **Response:**
  ```json
  {
    "product": {
      "_id": "product_id",
      "title": "Product Name",
      "description": "...",
      "price": 99.99,
      "category": "Electronics",
      "image": "url",
      "stock": 50,
      "rating": 4.5,
      "reviews": [...],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
  ```

### Create Product (Admin Only)
- **POST** `/products`
- **Headers:** Authorization required
- **Body:**
  ```json
  {
    "title": "Product Name",
    "description": "Product description",
    "price": 99.99,
    "category": "Electronics",
    "image": "https://example.com/image.jpg",
    "stock": 50
  }
  ```
- **Response:**
  ```json
  {
    "message": "Product created successfully",
    "product": {...}
  }
  ```

### Update Product (Admin Only)
- **PUT** `/products/:id`
- **Headers:** Authorization required
- **Body:** Any fields to update
- **Response:**
  ```json
  {
    "message": "Product updated successfully",
    "product": {...}
  }
  ```

### Delete Product (Admin Only)
- **DELETE** `/products/:id`
- **Headers:** Authorization required
- **Response:**
  ```json
  {
    "message": "Product deleted successfully"
  }
  ```

### Add Product Review
- **POST** `/products/:id/reviews`
- **Body:**
  ```json
  {
    "user": "John Doe",
    "comment": "Great product!",
    "rating": 5
  }
  ```
- **Response:**
  ```json
  {
    "message": "Review added successfully",
    "product": {...}
  }
  ```

---

## Categories
- Electronics
- Clothing
- Home
- Books
- Sports
- Other

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Please provide all required fields"
}
```

### 401 Unauthorized
```json
{
  "message": "No token, authorization denied"
}
```

### 403 Forbidden
```json
{
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "message": "Product not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error message here"
}
```

---

## Testing with Postman

1. **Register**: POST to `/users/register` with credentials
2. **Copy the token** from the response
3. **Set Authorization**: In Postman, go to Authorization tab → Bearer Token → paste token
4. **Test protected endpoints** with the token automatically added

---

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error
