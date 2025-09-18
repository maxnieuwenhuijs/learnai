// Load environment variables first
require('dotenv').config();

const { sequelize } = require('../config/database');
const { User } = require('../models');
const bcrypt = require('bcrypt');

async function resetAdminPassword() {
    try {
        console.log('🔄 Resetting admin password...');
        
        // Find the admin user
        const adminUser = await User.findOne({
            where: { email: 'jh@ajax.nl' }
        });
        
        if (!adminUser) {
            console.error('❌ Admin user not found!');
            return;
        }
        
        console.log('👤 Found admin user:', adminUser.name, adminUser.email);
        
        // Reset password to 'password123'
        const newPassword = 'password123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await adminUser.update({
            password_hash: hashedPassword
        });
        
        console.log('✅ Admin password reset successfully!');
        console.log('');
        console.log('🎯 NEW LOGIN CREDENTIALS:');
        console.log('Email: jh@ajax.nl');
        console.log('Password: password123');
        console.log('Role: admin');
        console.log('');
        
    } catch (error) {
        console.error('❌ Error resetting admin password:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    resetAdminPassword()
        .then(() => {
            console.log('🎉 Password reset completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Password reset failed:', error);
            process.exit(1);
        });
}

module.exports = { resetAdminPassword };
