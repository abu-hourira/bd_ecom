const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Admin auth middleware
const adminAuthMiddleware = require('../middleware/adminAuth');

// Wishlist controller
exports.addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;
    const userId = req.user.id;

    // Prevent duplicate wishlist items
    const [exists] = await db.query(
      'SELECT * FROM wishlists WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );

    if (exists.length > 0) {
      return res.status(400).json({ message: 'Item already in wishlist' });
    }

    await db.query(
      'INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)',
      [userId, product_id]
    );

    res.status(201).json({ message: 'Added to wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to wishlist' });
  }
};

// Get all wishlists for a user
exports.getWishlists = async (req, res) => {
  try {
    const [wishlists] = await db.query(
      'SELECT w.*, p.name as product_name, p.description, p.images, p.price, p.discount_price FROM wishlists w LEFT JOIN products p ON w.product_id = p.id ORDER BY w.created_at DESC'
    );
    res.json(wishlists);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlists' });
  }
};

// Remove a wishlist item
exports.removeFromWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;
    const userId = req.user.id;

    const [affected] = await db.query(
      'DELETE FROM wishlists WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );

    if (affected[0] === 0) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    res.status(200).json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from wishlist' });
  }
};

// Admin-only: Get all wishlists
exports.getAllWishlists = async (req, res) => {
  try {
    const [wishlists] = await db.query(
      'SELECT w.*, p.name, p.slug FROM wishlists w JOIN products p ON w.product_id = p.id'
    );
    res.json(wishlists);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlists' });
  }
};