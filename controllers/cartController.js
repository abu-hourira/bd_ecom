const db = require('../config/database');
const { redisClient } = require('../config/database');

// Helper function to invalidate user's cart cache
const invalidateCartCache = async (userId) => {
  const cacheKey = `cart:${userId}`;
  await redisClient.del(cacheKey);
};

// Helper to get cached cart or fetch from DB
const getCachedOrFetchCart = async (userId) => {
  const cacheKey = `cart:${userId}`;
  const cached = await redisClient.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const [items] = await db.query(
    `SELECT c.id as cart_id, c.quantity, p.* 
     FROM cart c 
     JOIN products p ON c.product_id = p.id 
     WHERE c.user_id = ?`,
    [userId]
  );
  
  // Cache for 5 minutes
  await redisClient.set(cacheKey, JSON.stringify(items), 'EX', 300);
  return items;
};

exports.getCart = async (req, res) => {
  try {
    const items = await getCachedOrFetchCart(req.user.id);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart.' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const qty = parseInt(quantity) || 1;

    const [existing] = await db.query(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id]
    );

    if (existing.length > 0) {
      await db.query(
        'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
        [qty, existing[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, product_id, qty]
      );
    }

    // Invalidate cache after modification
    await invalidateCartCache(req.user.id);
    
    res.json({ message: 'Product added to cart successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart.' });
  }
};

exports.updateCartQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartId = req.params.id;
    await db.query('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, cartId, req.user.id]);
    
    // Invalidate cache after modification
    await invalidateCartCache(req.user.id);
    
    res.json({ message: 'Cart updated.' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart.' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cartId = req.params.id;
    await db.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [cartId, req.user.id]);
    
    // Invalidate cache after modification
    await invalidateCartCache(req.user.id);
    
    res.json({ message: 'Item removed from cart.' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing item.' });
  }
};
