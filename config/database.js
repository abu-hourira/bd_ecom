const mysql = require('mysql2');
const redis = require('redis');
require('dotenv').config();

// Database pool with optimized settings
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bd_ecommerce',
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 15,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Redis client for caching
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  password: process.env.REDIS_PASSWORD || undefined
});

redisClient.on('error', (err) => console.error('Redis error:', err));
redisClient.connect().catch(err => console.error('Redis connection failed:', err));

module.exports = {
  pool: pool.promise(),
  redisClient,
  query: (text, params) => pool.promise().query(text, params)
};
