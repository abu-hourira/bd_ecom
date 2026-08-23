const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminAuth');
const multer = require('multer');
const path = require('path');

// Multer setup for product image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const [[{ total_sales }]] = await db.query('SELECT SUM(total_amount) as total_sales FROM orders WHERE payment_status = "Paid"');
    const [[{ total_orders }]] = await db.query('SELECT COUNT(*) as total_orders FROM orders');
    const [[{ total_users }]] = await db.query('SELECT COUNT(*) as total_users FROM users WHERE role = "user"');
    const [lowStock] = await db.query('SELECT id, name, stock FROM products WHERE stock < 5');
    const [recentOrders] = await db.query('SELECT o.*, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.id DESC LIMIT 5');

    res.json({
      totalSales: total_sales || 0,
      totalOrders: total_orders || 0,
      totalUsers: total_users || 0,
      lowStock,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats.' });
  }
});

// Product CRUD
router.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { category_id, name, description, price, discount_price, stock, status } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '/uploads/placeholder.jpg';

    await db.query(
      'INSERT INTO products (category_id, name, slug, description, price, discount_price, stock, images, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [category_id, name, slug, description, price, discount_price || 0, stock, imagePath, status || 'active']
    );
    res.status(201).json({ message: 'Product created successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating product.' });
  }
});

router.put('/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { category_id, name, description, price, discount_price, stock, status } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    let query = 'UPDATE products SET category_id = ?, name = ?, slug = ?, description = ?, price = ?, discount_price = ?, stock = ?, status = ?';
    const params = [category_id, name, slug, description, price, discount_price, stock, status];

    if (req.file) {
      query += ', images = ?';
      params.push(`/uploads/${req.file.filename}`);
    }

    query += ' WHERE id = ?';
    params.push(req.params.id);

    await db.query(query, params);
    res.json({ message: 'Product updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product.' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product.' });
  }
});

// Category CRUD
router.post('/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await db.query('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)', [name, slug, description]);
    res.status(201).json({ message: 'Category created successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating category.' });
  }
});

// Order Status Update
router.put('/orders/:id', async (req, res) => {
  try {
    const { status, payment_status } = req.body;
    await db.query('UPDATE orders SET status = ?, payment_status = ? WHERE id = ?', [status, payment_status, req.params.id]);
    res.json({ message: 'Order updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order.' });
  }
});

// Users List
router.get('/users', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, phone, address, role, created_at FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users.' });
  }
});

module.exports = router;
