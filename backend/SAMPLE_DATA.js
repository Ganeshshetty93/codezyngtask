// Sample data to seed your MongoDB database
// Run this in MongoDB shell or Atlas terminal

db.users.insertMany([
  {
    name: "Admin User",
    email: "admin@codezyng.com",
    password: "$2a$10$...", // Password hash for 'admin123'
    role: "admin",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "$2a$10$...", // Password hash for 'user123'
    role: "user",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

db.products.insertMany([
  {
    title: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 199.99,
    category: "Electronics",
    image: "https://via.placeholder.com/300?text=Wireless+Headphones",
    stock: 50,
    rating: 4.5,
    reviews: [
      {
        user: "Sarah",
        comment: "Great sound quality!",
        rating: 5,
        date: new Date()
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Casual T-Shirt",
    description: "Comfortable and stylish casual t-shirt for everyday wear",
    price: 29.99,
    category: "Clothing",
    image: "https://via.placeholder.com/300?text=T-Shirt",
    stock: 100,
    rating: 4.0,
    reviews: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Coffee Maker",
    description: "Automatic coffee maker with programmable timer",
    price: 79.99,
    category: "Home",
    image: "https://via.placeholder.com/300?text=Coffee+Maker",
    stock: 30,
    rating: 4.3,
    reviews: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Programming Book",
    description: "Complete guide to web development with modern frameworks",
    price: 49.99,
    category: "Books",
    image: "https://via.placeholder.com/300?text=Programming+Book",
    stock: 20,
    rating: 4.7,
    reviews: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Yoga Mat",
    description: "Non-slip yoga mat perfect for home or gym workouts",
    price: 39.99,
    category: "Sports",
    image: "https://via.placeholder.com/300?text=Yoga+Mat",
    stock: 45,
    rating: 4.2,
    reviews: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
