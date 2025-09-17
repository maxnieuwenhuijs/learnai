const { UserProgress, Lesson, Module, Course, Certificate } = require('./src/models');
const { Op } = require('sequelize');

async function debugDataCheck() {
    try {
        console.log('=== DEBUGGING DATABASE DATA ===\n');
        
        // 1. Check Course 5 (What is AI?)
        console.log('1. Checking Course 5:');
        const course5 = await Course.findByPk(5);
        if (course5) {
            console.log(`✅ Course found: ${course5.title}`);
            console.log(`Certificate settings:`, course5.certificate_settings);
        } else {
            console.log('❌ Course 5 not found');
            return;
        }
        
        // 2. Get all modules for course 5
        console.log('\n2. Getting modules for course 5:');
        const modules = await Module.findAll({
            include: [{
                model: Course,
                as: 'courses',
                where: { id: 5 },
                through: { attributes: ['module_order'] }
            }]
        });
        console.log(`Found ${modules.length} modules for course 5`);
        modules.forEach(module => {
            console.log(`  Module ${module.id}: ${module.title}`);
        });
        
        // 3. Get all lessons for course 5
        console.log('\n3. Getting lessons for course 5:');
        const lessons = await Lesson.findAll({
            include: [{
                model: Module,
                as: 'module',
                include: [{
                    model: Course,
                    as: 'courses',
                    where: { id: 5 }
                }]
            }]
        });
        console.log(`Found ${lessons.length} lessons for course 5`);
        lessons.forEach(lesson => {
            console.log(`  Lesson ${lesson.id}: ${lesson.title} (Module: ${lesson.module_id})`);
        });
        
        // 4. Check user progress
        console.log('\n4. Checking user progress:');
        const progressRecords = await UserProgress.findAll({
            include: [{
                model: Lesson,
                as: 'lesson'
            }]
        });
        console.log(`Found ${progressRecords.length} progress records`);
        
        // Group by user
        const userProgress = {};
        progressRecords.forEach(progress => {
            if (!userProgress[progress.user_id]) {
                userProgress[progress.user_id] = [];
            }
            userProgress[progress.user_id].push({
                lessonId: progress.lesson_id,
                status: progress.status,
                lessonTitle: progress.lesson ? progress.lesson.title : 'Unknown'
            });
        });
        
        Object.keys(userProgress).forEach(userId => {
            const completed = userProgress[userId].filter(p => p.status === 'completed');
            console.log(`  User ${userId}: ${completed.length}/${userProgress[userId].length} lessons completed`);
            if (completed.length > 0) {
                console.log(`    Completed lessons:`, completed.map(p => `${p.lessonId} (${p.lessonTitle})`));
            }
        });
        
        // 5. Check for course 5 specific progress
        console.log('\n5. Checking course 5 specific progress:');
        const course5LessonIds = lessons.map(l => l.id);
        console.log(`Course 5 lesson IDs:`, course5LessonIds);
        
        const course5Progress = await UserProgress.findAll({
            where: {
                lesson_id: { [Op.in]: course5LessonIds }
            },
            include: [{
                model: Lesson,
                as: 'lesson'
            }]
        });
        
        console.log(`Found ${course5Progress.length} progress records for course 5 lessons`);
        
        // Group by user for course 5
        const course5UserProgress = {};
        course5Progress.forEach(progress => {
            if (!course5UserProgress[progress.user_id]) {
                course5UserProgress[progress.user_id] = [];
            }
            course5UserProgress[progress.user_id].push({
                lessonId: progress.lesson_id,
                status: progress.status,
                lessonTitle: progress.lesson ? progress.lesson.title : 'Unknown'
            });
        });
        
        Object.keys(course5UserProgress).forEach(userId => {
            const completed = course5UserProgress[userId].filter(p => p.status === 'completed');
            console.log(`  User ${userId}: ${completed.length}/${course5LessonIds.length} course 5 lessons completed`);
            
            if (completed.length === course5LessonIds.length) {
                console.log(`    ✅ User ${userId} completed ALL lessons in course 5!`);
                
                // Check if certificate exists
                Certificate.findOne({
                    where: {
                        user_id: userId,
                        course_id: 5
                    }
                }).then(cert => {
                    if (cert) {
                        console.log(`    ✅ Certificate exists: ${cert.certificate_uid}`);
                    } else {
                        console.log(`    ❌ No certificate found for user ${userId} in course 5`);
                    }
                });
            }
        });
        
        // 6. Check existing certificates
        console.log('\n6. Checking existing certificates:');
        const certificates = await Certificate.findAll();
        console.log(`Found ${certificates.length} certificates total`);
        certificates.forEach(cert => {
            console.log(`  Certificate ${cert.id}: User ${cert.user_id}, Course ${cert.course_id}, UID: ${cert.certificate_uid}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

debugDataCheck();
