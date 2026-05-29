const Product = require('../models/Product');

// Get all products
exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;
    const products = await Product.getAll({ category, minPrice, maxPrice, search });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create product
exports.createProduct = async (req, res, next) => {
  try {
    const { title, description, price, category, image, stock } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const product = await Product.create({
      title,
      description,
      price,
      category,
      image,
      stock,
      created_by: req.user?.id
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res, next) => {
  try {
    const existingProduct = await Product.getById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = await Product.update(req.params.id, req.body);
    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.delete(req.params.id);
    if (!deleted || deleted.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add review to product
exports.addReview = async (req, res, next) => {
  try {
    const { user, comment, rating } = req.body;
    const review = { user, comment, rating: Number(rating), date: new Date() };

    const product = await Product.addReview(req.params.id, review);
    res.json({ message: 'Review added successfully', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
