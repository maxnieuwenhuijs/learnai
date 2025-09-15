const { sequelize } = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('Running database migration...');

        // Read the SQL file
        const sqlFile = path.join(__dirname, 'add-module-order-column.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        // Execute the SQL
        await sequelize.query(sql);

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
