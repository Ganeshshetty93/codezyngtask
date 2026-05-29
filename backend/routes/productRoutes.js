const express = require('express');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, addReview } = require('../controllers/productController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', auth, adminAuth, createProduct);
router.put('/:id', auth, adminAuth, updateProduct);
router.delete('/:id', auth, adminAuth, deleteProduct);
router.post('/:id/reviews', addReview);

module.exports = router;
