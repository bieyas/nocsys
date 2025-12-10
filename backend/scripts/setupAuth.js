const db = require('../src/config/database');
const UserModel = require('../src/models/userModel');

async function setupAuth() {
    try {
        console.log('Setting up Authentication...');

        // Create users table
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table created or already exists.');

        // Check if admin exists
        const adminUser = await UserModel.findByUsername('admin');
        if (!adminUser) {
            console.log('Creating default admin user...');
            await UserModel.create('admin', 'admin123'); // Default password
            console.log('Default admin user created. Username: admin, Password: admin123');
        } else {
            console.log('Admin user already exists.');
        }

        console.log('Auth setup completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error setting up auth:', error);
        process.exit(1);
    }
}

setupAuth();
