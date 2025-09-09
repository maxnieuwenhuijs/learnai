// Load environment variables first
require('dotenv').config();

const { sequelize } = require('../config/database');
const { User, Company, Department, Course } = require('../models');
const bcrypt = require('bcrypt');

async function resetAndSeedDatabase() {
    try {
        console.log('🔄 Starting database reset and seed...');
        
        // 1. Drop all tables
        console.log('📄 Dropping all tables...');
        await sequelize.drop();
        
        // 2. Recreate all tables
        console.log('🏗️ Creating fresh database schema...');
        await sequelize.sync({ force: true });
        
        // 3. Create Super Admin Company
        console.log('🏢 Creating Super Admin company...');
        const superAdminCompany = await Company.create({
            name: 'HowToWorkWith.AI Platform',
            industry: 'E-learning Technology',
            country: 'Netherlands', 
            size: '1-10',
            description: 'Platform administration company for system management',
            status: 'active',
            subscription_type: 'enterprise',
            max_users: 999999
        });

        // 4. Create Super Admin Department
        console.log('🏭 Creating departments...');
        const adminDepartment = await Department.create({
            company_id: superAdminCompany.id,
            name: 'Platform Administration'
        });

        // 5. Create Super Admin User
        console.log('👤 Creating Super Admin user...');
        const superAdminUser = await User.create({
            company_id: superAdminCompany.id,
            department_id: adminDepartment.id,
            email: 'superadmin@howtoworkwith.ai',
            name: 'Super Administrator',
            password_hash: 'SuperAdmin123!', // Will be hashed by model hook
            role: 'super_admin'
        });

        // 6. Create some global courses
        console.log('📚 Creating global courses...');
        const globalCourses = [
            {
                company_id: null, // Global course
                title: 'EU AI Act Fundamentals',
                description: 'Complete introduction to the European AI Act regulations and compliance requirements',
                category: 'compliance',
                difficulty: 'beginner',
                duration_hours: 4,
                is_published: true,
                target_role: 'all',
                created_by: superAdminUser.id
            },
            {
                company_id: null,
                title: 'Risk Assessment for AI Systems',
                description: 'Learn to identify, evaluate and mitigate risks in AI implementations',
                category: 'technical',
                difficulty: 'intermediate', 
                duration_hours: 6,
                is_published: true,
                target_role: 'technical',
                created_by: superAdminUser.id
            },
            {
                company_id: null,
                title: 'Data Governance and AI Ethics',
                description: 'Comprehensive guide to ethical AI development and data management',
                category: 'ethics',
                difficulty: 'intermediate',
                duration_hours: 5,
                is_published: true,
                target_role: 'all',
                created_by: superAdminUser.id
            }
        ];

        await Course.bulkCreate(globalCourses);

        console.log('✅ Database reset and seed completed successfully!');
        console.log('');
        console.log('🎯 LOGIN CREDENTIALS:');
        console.log('Email: superadmin@howtoworkwith.ai');
        console.log('Password: SuperAdmin123!');
        console.log('Role: super_admin');
        console.log('');
        console.log('🚀 You can now:');
        console.log('1. Login with these credentials');
        console.log('2. Go to Platform Admin dashboard');
        console.log('3. Create companies and users');
        console.log('4. Manage the entire platform');
        console.log('');
        
        return {
            superAdminCompany: superAdminCompany,
            superAdminUser: superAdminUser,
            adminDepartment: adminDepartment,
            globalCourses: globalCourses
        };
    } catch (error) {
        console.error('❌ Error during database reset and seed:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    resetAndSeedDatabase()
        .then(() => {
            console.log('🎉 Setup completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Setup failed:', error);
            process.exit(1);
        });
}

module.exports = { resetAndSeedDatabase };