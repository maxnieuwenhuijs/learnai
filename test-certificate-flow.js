const { Certificate, User, Course, UserProgress, Lesson, Module } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function testCertificateFlow() {
    try {
        console.log('🔍 Testing Certificate Flow...\n');
        
        // Test database connection first
        console.log('0. Testing database connection...');
        await sequelize.authenticate();
        console.log('   ✅ Database connected successfully\n');
        
        // 1. Check if courses have certificate settings enabled
        console.log('1. Checking course certificate settings...');
        const courses = await Course.findAll({
            where: { is_published: 1 },
            attributes: ['id', 'title', 'certificate_settings']
        });
        
        courses.forEach(course => {
            const settings = course.certificate_settings ? JSON.parse(course.certificate_settings) : null;
            console.log(`   Course ${course.id}: "${course.title}"`);
            console.log(`   - Certificates enabled: ${settings?.enabled ? '✅ Yes' : '❌ No'}`);
            if (settings?.enabled) {
                console.log(`   - Title: ${settings.title}`);
                console.log(`   - Quiz required: ${settings.requireQuiz ? 'Yes' : 'No'}`);
                console.log(`   - Passing score: ${settings.passingScore || 'N/A'}`);
            }
            console.log('');
        });
        
        // 2. Check existing certificates
        console.log('2. Checking existing certificates...');
        const certCount = await Certificate.count();
        console.log(`   Total certificates in database: ${certCount}`);
        
        if (certCount > 0) {
            const recentCerts = await Certificate.findAll({
                limit: 5,
                order: [['issued_at', 'DESC']],
                include: [
                    { model: User, as: 'user', attributes: ['name', 'email'] },
                    { model: Course, as: 'course', attributes: ['title'] }
                ]
            });
            
            console.log('   Recent certificates:');
            recentCerts.forEach(cert => {
                console.log(`   - ${cert.user.name} completed "${cert.course.title}" on ${cert.issued_at}`);
            });
        }
        
        // 3. Check user progress for course 5
        console.log('\n3. Checking user progress for course 5...');
        const course5 = await Course.findByPk(5, {
            include: [{
                model: Module,
                as: 'modules',
                include: [{
                    model: Lesson,
                    as: 'lessons'
                }]
            }]
        });
        
        if (course5) {
            console.log(`   Course: "${course5.title}"`);
            console.log(`   Modules: ${course5.modules.length}`);
            
            let totalLessons = 0;
            course5.modules.forEach(module => {
                totalLessons += module.lessons.length;
                console.log(`   - Module "${module.title}": ${module.lessons.length} lessons`);
            });
            
            console.log(`   Total lessons: ${totalLessons}`);
            
            // Check if any users have completed this course
            const allLessonIds = course5.modules.flatMap(m => m.lessons.map(l => l.id));
            
            if (allLessonIds.length > 0) {
                const completedUsers = await UserProgress.findAll({
                    where: {
                        lesson_id: { [require('sequelize').Op.in]: allLessonIds },
                        status: 'completed'
                    },
                    attributes: ['user_id'],
                    group: ['user_id'],
                    having: require('sequelize').literal(`COUNT(DISTINCT lesson_id) = ${allLessonIds.length}`)
                });
                
                console.log(`   Users who completed all lessons: ${completedUsers.length}`);
                
                // Check if they have certificates
                for (const userProgress of completedUsers) {
                    const existingCert = await Certificate.findOne({
                        where: {
                            user_id: userProgress.user_id,
                            course_id: 5
                        }
                    });
                    
                    if (existingCert) {
                        console.log(`   ✅ User ${userProgress.user_id} has certificate`);
                    } else {
                        console.log(`   ❌ User ${userProgress.user_id} completed course but NO certificate found!`);
                    }
                }
            }
        }
        
        console.log('\n✅ Certificate flow test completed!');
        
    } catch (error) {
        console.error('❌ Error testing certificate flow:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testCertificateFlow();
