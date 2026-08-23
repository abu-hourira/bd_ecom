const db = require('../config/database');

exports.createOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { shipping_address, phone, payment_method } = req.body;

    if (!shipping_address || !phone || !payment_method) {
      return res.status(400).json({ message: 'Please provide shipping address, phone, and payment method.' });
    }

    // Get cart items
    const [cartItems] = await connection.query(
      'SELECT c.quantity, p.id, p.price, p.discount_price, p.stock FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?',
      [req.user.id]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    let totalAmount = 0;
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ID ${item.id}`);
      }
      const price = item.discount_price > 0 ? item.discount_price : item.price;
      totalAmount += price * item.quantity;
    }

    // Create order
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, status, payment_method, payment_status, shipping_address, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, totalAmount, 'Pending', payment_method, 'Pending', shipping_address, phone]
    );

    const orderId = orderResult.insertId;

    // Insert order items & update stock
    for (const item of cartItems) {
      const price = item.discount_price > 0 ? item.discount_price : item.price;
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, price]
      );
      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.id]
      );
    }

    // Clear cart
    await connection.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

    await connection.commit();

    // bKash / Nagad payment gateway integration simulation
    let paymentUrl = null;
    if (payment_method === 'bKash' || payment_method === 'Nagad') {
      paymentUrl = `/checkout.html?gateway=${payment_method}&orderId=${orderId}&amount=${totalAmount}`;
    }

    res.status(201).json({
      message: 'Order placed successfully!',
      orderId,
      paymentUrl,
      totalAmount
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message || 'Error placing order.' });
  } finally {
    connection.release();
  }
};

exports.getOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC',
      [req.user.id]
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders.' });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const [items] = await db.query(
      'SELECT oi.*, p.name, p.images FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
      [req.params.id]
    );

    res.json({ order: orders[0], items });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order details.' });
  }
};
