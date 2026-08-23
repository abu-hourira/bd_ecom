const db = require('../config/database');

exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, sort, minPrice, maxPrice } = req.query;
    let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.status = "active"';
    const params = [];

    if (category) {
      query += ' AND (c.slug = ? OR p.category_id = ?)';
      params.push(category, category);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (minPrice) {
      query += ' AND p.price >= ?';
      params.push(minPrice);
    }

    if (maxPrice) {
      query += ' AND p.price <= ?';
      params.push(maxPrice);
    }

    if (sort === 'price_low') {
      query += ' ORDER BY p.price ASC';
    } else if (sort === 'price_high') {
      query += ' ORDER BY p.price DESC';
    } else {
      query += ' ORDER BY p.id DESC';
    }

    const [products] = await db.query(query, params);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching products.' });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const [products] = await db.query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ?',
      [req.params.slug]
    );
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(products[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product details.' });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const [reviews] = await db.query(
      'SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.id DESC',
      [req.params.id]
    );
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews.' });
  }
};

exports.addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    await db.query(
      'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
      [req.user.id, productId, rating, comment]
    );
    res.status(201).json({ message: 'Review added successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding review.' });
  }
};
