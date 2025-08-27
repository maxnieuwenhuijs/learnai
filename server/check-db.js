const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 3306
        });

        const [databases] = await connection.execute('SHOW DATABASES');
        console.log('Available databases:');
        databases.forEach(db => console.log('-', db.Database));

        // Check if we can find an e-learning related database
        const elearningDbs = databases.filter(db => 
            db.Database.toLowerCase().includes('elearn') || 
            db.Database.toLowerCase().includes('learning')
        );
        
        if (elearningDbs.length > 0) {
            console.log('\nFound e-learning database:', elearningDbs[0].Database);
            
            // Switch to that database and show tables
            await connection.changeUser({ database: elearningDbs[0].Database });
            const [tables] = await connection.execute('SHOW TABLES');
            console.log('\nTables in', elearningDbs[0].Database + ':');
            tables.forEach(table => console.log('-', Object.values(table)[0]));
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkDatabase();