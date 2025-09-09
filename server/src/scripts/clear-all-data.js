// Load environment variables first
require('dotenv').config();

const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { User, Company, Department, Course, UserProgress, Certificate, Notification, CalendarEvent, CourseAssignment, Lesson, Module, CourseModule } = require('../models');

async function clearAllData() {
    try {
        console.log('🗑️  Clearing all data from database...');
        
        // Delete all data in correct order (respecting foreign key constraints)
        // Start with most dependent tables first
        
        console.log('📄 Deleting user progress...');
        await UserProgress.destroy({ where: {}, force: true });
        
        console.log('📋 Deleting certificates...');
        await Certificate.destroy({ where: {}, force: true });
        
        console.log('🔔 Deleting notifications...');
        await Notification.destroy({ where: {}, force: true });
        
        console.log('📅 Deleting calendar events...');
        await CalendarEvent.destroy({ where: {}, force: true });
        
        console.log('📝 Deleting course assignments...');
        await CourseAssignment.destroy({ where: {}, force: true });
        
        console.log('📖 Deleting lessons...');
        await Lesson.destroy({ where: {}, force: true });
        
        console.log('📚 Deleting course modules...');
        await CourseModule.destroy({ where: {}, force: true });
        
        console.log('📦 Deleting modules...');
        await Module.destroy({ where: {}, force: true });
        
        console.log('🎓 Deleting courses...');
        await Course.destroy({ where: {}, force: true });
        
        console.log('👥 Deleting all users except Super Admin...');
        await User.destroy({ 
            where: { 
                email: { [Op.ne]: 'superadmin@howtoworkwith.ai' } 
            }, 
            force: true 
        });
        
        console.log('🏭 Deleting all departments except Super Admin department...');
        const superAdminCompany = await Company.findOne({ 
            where: { name: 'HowToWorkWith.AI Platform' } 
        });
        
        if (superAdminCompany) {
            await Department.destroy({ 
                where: { 
                    company_id: { [Op.ne]: superAdminCompany.id } 
                }, 
                force: true 
            });
        }
        
        console.log('🏢 Deleting all companies except Super Admin company...');
        await Company.destroy({ 
            where: { 
                name: { [Op.ne]: 'HowToWorkWith.AI Platform' } 
            }, 
            force: true 
        });

        console.log('✅ All data cleared successfully!');
        console.log('');
        console.log('🎯 REMAINING DATA:');
        console.log('- Super Admin company: HowToWorkWith.AI Platform');
        console.log('- Super Admin user: superadmin@howtoworkwith.ai');
        console.log('- Super Admin department: Platform Administration');
        console.log('');
        console.log('🚀 Database is now completely empty and ready for fresh data!');
        console.log('');
        
        return {
            success: true,
            message: 'All data cleared except Super Admin'
        };
    } catch (error) {
        console.error('❌ Error clearing data:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    clearAllData()
        .then(() => {
            console.log('🎉 Data clearing completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Data clearing failed:', error);
            process.exit(1);
        });
}

module.exports = { clearAllData };