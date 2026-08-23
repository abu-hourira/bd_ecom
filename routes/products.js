const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');

router.get('/', productController.getAllProducts);
router.get('/:slug', productController.getProductBySlug);
router.get('/:id/reviews', productController.getProductReviews);
router.post('/:id/reviews', authMiddleware, productController.addProductReview);

module.exports = router;
