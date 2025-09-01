require('dotenv').config();
const { sequelize } = require('./src/config/database');
const { PromptCategory } = require('./src/models');

const defaultCategories = [
    {
        name: 'Educatief',
        description: 'Prompts voor het uitleggen van concepten of het onboarden van gebruikers',
        color: '#3b82f6', // Blue
        icon: '🎓 GraduationCap'
    },
    {
        name: 'Beslissingsondersteuning',
        description: 'Helpt gebruikers bij het maken van keuzes met duidelijke voor- en nadelen',
        color: '#10b981', // Green  
        icon: '⚖️ Scale'
    },
    {
        name: 'Creatieve Inspiratie',
        description: 'Biedt aanzetten voor brainstorming en creatieve taken',
        color: '#f59e0b', // Yellow
        icon: '💡 Lightbulb'
    },
    {
        name: 'Taakgericht',
        description: 'Specifieke instructies voor het uitvoeren van een bepaalde actie',
        color: '#ef4444', // Red
        icon: '✅ CheckSquare'
    },
    {
        name: 'Communicatie',
        description: 'Templates voor e-mails, berichten en andere communicatie',
        color: '#8b5cf6', // Purple
        icon: '💬 MessageSquare'
    },
    {
        name: 'Analyse',
        description: 'Prompts voor data-analyse en rapportage taken',
        color: '#06b6d4', // Cyan
        icon: '📊 BarChart'
    }
];

async function seedPromptCategories() {
    try {
        console.log('🔄 Starting prompt categories seeding...');
        
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established.');
        
        // Sync database (create tables if they don't exist)
        await sequelize.sync();
        console.log('✅ Database synced.');
        
        // Clear existing system-wide categories (company_id is null)
        await PromptCategory.destroy({
            where: {
                company_id: null
            }
        });
        console.log('🧹 Cleared existing system categories.');
        
        // Create default categories
        const createdCategories = await PromptCategory.bulkCreate(
            defaultCategories.map(category => ({
                ...category,
                company_id: null, // System-wide category
                is_active: true
            })),
            {
                returning: true
            }
        );
        
        console.log(`✅ Created ${createdCategories.length} default prompt categories:`);
        createdCategories.forEach(category => {
            console.log(`   - ${category.name} (${category.color})`);
        });
        
        console.log('\n🎉 Prompt categories seeding completed successfully!');
        
    } catch (error) {
        console.error('❌ Error seeding prompt categories:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        // Close database connection
        await sequelize.close();
        console.log('🔒 Database connection closed.');
    }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
    seedPromptCategories();
}

module.exports = seedPromptCategories;