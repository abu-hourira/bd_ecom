const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Access denied. Please login first.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bd_ecommerce_super_secret_key_2024_secure');
    req.user = decoded;
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.status(401).json({ message: 'Invalid or expired session. Please login again.' });
  }
};
