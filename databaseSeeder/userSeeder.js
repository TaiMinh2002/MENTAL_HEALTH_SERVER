const db = require('../config/db');
const bcrypt = require('bcrypt');

async function runSeeder() {
    try {
        const hashedPassword = await bcrypt.hash('Admin@2024', 10);

        const adminUser = {
            avatar: null,
            username: 'admin',
            email: 'admin@example.com',
            password: hashedPassword,
            status: 1,
            role: 1,
            gender: null,
            age: null,
            mood: null,
            sleep: null,
            stress: null,
            email_verified_at: null,
            created_at: new Date(),
            updated_at: new Date()
        };

        const query = `
            INSERT INTO users (avatar, username, email, password, status, role, gender, age, mood, sleep, stress, email_verified_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(query, Object.values(adminUser), (error, results) => {
            if (error) {
                throw error;
            }
            console.log('Admin user created successfully:', results.insertId);
        });
    } catch (error) {
        console.error('Error running seeder:', error);
    } finally {
        db.end();
    }
}

runSeeder();
