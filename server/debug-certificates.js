const { UserProgress, Lesson, Module, Course, Certificate } = require('./src/models');

async function debugCertificates() {
    try {
        console.log('=== DEBUGGING CERTIFICATE GENERATION ===\n');
        
        // Check user progress
        console.log('1. Checking User Progress:');
        const progressRecords = await UserProgress.findAll({
            include: [{
                model: Lesson,
                as: 'lesson',
                include: [{
                    model: Module,
                    as: 'module',
                    include: [{
                        model: Course,
                        as: 'courses'
                    }]
                }]
            }]
        });
        
        console.log(`Found ${progressRecords.length} progress records`);
        progressRecords.forEach(p => {
            console.log(`  User ${p.user_id}, Lesson ${p.lesson_id}, Status: ${p.status}`);
            if (p.lesson && p.lesson.module && p.lesson.module.courses) {
                p.lesson.module.courses.forEach(course => {
                    console.log(`    Course: ${course.id} - ${course.title}`);
                });
            }
        });
        
        // Check course 5 specifically
        console.log('\n2. Checking Course 5 (What is AI?):');
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
            console.log(`Course: ${course5.title}`);
            console.log(`Certificate settings:`, course5.certificate_settings);
            
            // Get all lesson IDs for this course
            const lessonIds = [];
            course5.modules.forEach(module => {
                module.lessons.forEach(lesson => {
                    lessonIds.push(lesson.id);
                });
            });
            console.log(`Total lessons in course: ${lessonIds.length}`);
            console.log(`Lesson IDs:`, lessonIds);
            
            // Check completed lessons for each user
            const users = [...new Set(progressRecords.map(p => p.user_id))];
            for (const userId of users) {
                const completedCount = await UserProgress.count({
                    where: {
                        user_id: userId,
                        lesson_id: { [require('sequelize').Op.in]: lessonIds },
                        status: 'completed'
                    }
                });
                console.log(`User ${userId} completed ${completedCount}/${lessonIds.length} lessons`);
                
                if (completedCount === lessonIds.length) {
                    console.log(`  ✅ User ${userId} completed course 5!`);
                    
                    // Check if certificate exists
                    const existingCert = await Certificate.findOne({
                        where: {
                            user_id: userId,
                            course_id: 5
                        }
                    });
                    
                    if (existingCert) {
                        console.log(`  ✅ Certificate already exists: ${existingCert.certificate_uid}`);
                    } else {
                        console.log(`  ❌ No certificate found for user ${userId} in course 5`);
                    }
                }
            }
        }
        
        // Check existing certificates
        console.log('\n3. Checking Existing Certificates:');
        const certificates = await Certificate.findAll();
        console.log(`Found ${certificates.length} certificates`);
        certificates.forEach(cert => {
            console.log(`  Certificate ${cert.id}: User ${cert.user_id}, Course ${cert.course_id}, UID: ${cert.certificate_uid}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

debugCertificates();
