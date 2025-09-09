// Load environment variables first
require('dotenv').config();

const { sequelize } = require('../config/database');
const { User, Company, Department } = require('../models');

async function createSuperAdmin() {
    try {
        console.log('🔄 Creating Super Admin account...');
        
        // First, sync database to add missing columns
        console.log('📊 Syncing database schema...');
        await sequelize.sync({ alter: true });
        
        // Check if Super Admin company already exists
        let superAdminCompany = await Company.findOne({
            where: { name: 'HowToWorkWith.AI Platform' }
        });

        if (!superAdminCompany) {
            // Create Super Admin Company
            console.log('🏢 Creating Super Admin company...');
            superAdminCompany = await Company.create({
                name: 'HowToWorkWith.AI Platform',
                industry: 'E-learning Technology',
                country: 'Netherlands', 
                size: '1-10',
                description: 'Platform administration company for system management',
                status: 'active',
                subscription_type: 'enterprise',
                max_users: 999999
            });
        }

        // Check if admin department exists
        let adminDepartment = await Department.findOne({
            where: { 
                company_id: superAdminCompany.id,
                name: 'Platform Administration' 
            }
        });

        if (!adminDepartment) {
            console.log('🏭 Creating admin department...');
            adminDepartment = await Department.create({
                company_id: superAdminCompany.id,
                name: 'Platform Administration'
            });
        }

        // Check if Super Admin user already exists
        let superAdminUser = await User.findOne({
            where: { email: 'superadmin@howtoworkwith.ai' }
        });

        if (!superAdminUser) {
            // Create Super Admin User
            console.log('👤 Creating Super Admin user...');
            superAdminUser = await User.create({
                company_id: superAdminCompany.id,
                department_id: adminDepartment.id,
                email: 'superadmin@howtoworkwith.ai',
                name: 'Super Administrator',
                password_hash: 'SuperAdmin123!', // Will be hashed by model hook
                role: 'super_admin'
            });
        } else {
            console.log('👤 Super Admin user already exists, updating...');
            await superAdminUser.update({
                company_id: superAdminCompany.id,
                department_id: adminDepartment.id,
                role: 'super_admin'
            });
        }

        console.log('✅ Super Admin setup completed successfully!');
        console.log('');
        console.log('🎯 SUPER ADMIN LOGIN CREDENTIALS:');
        console.log('Email: superadmin@howtoworkwith.ai');
        console.log('Password: SuperAdmin123!');
        console.log('Role: super_admin');
        console.log('');
        console.log('🚀 You can now login and manage the platform!');
        console.log('');
        
        return {
            superAdminCompany,
            superAdminUser,
            adminDepartment
        };
    } catch (error) {
        console.error('❌ Error creating Super Admin:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    createSuperAdmin()
        .then(() => {
            console.log('🎉 Super Admin setup completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Super Admin setup failed:', error);
            process.exit(1);
        });
}

module.exports = { createSuperAdmin };