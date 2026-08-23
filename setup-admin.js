const db = require('./config/database');
const bcrypt = require('bcryptjs');

async function setupAdmin() {
  try {
    const email = 'admin@admin.com';
    const password = 'admin123';
    const name = 'Admin User';
    const phone = '1234567890';
    const address = 'Admin HQ';
    const role = 'admin';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if admin already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    // Insert admin user
    await db.query(
      'INSERT INTO users (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, address, role]
    );

    console.log('Admin user created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin user:', error);
    process.exit(1);
  }
}

setupAdmin();
