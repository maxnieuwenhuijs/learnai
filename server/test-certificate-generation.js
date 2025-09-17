const { UserProgress, Lesson, Module, Course, Certificate } = require('./src/models');
const { Op } = require('sequelize');

async function testCertificateGeneration() {
    try {
        console.log('=== TESTING CERTIFICATE GENERATION ===\n');
        
        // First, let's manually create a test certificate for course 5
        console.log('1. Creating test certificate for course 5...');
        
        // Check if course 5 exists and has certificate settings
        const course = await Course.findByPk(5);
        if (!course) {
            console.log('❌ Course 5 not found');
            return;
        }
        
        console.log(`Course found: ${course.title}`);
        console.log(`Certificate settings:`, course.certificate_settings);
        
        // Parse certificate settings
        const certificateSettings = course.certificate_settings ? 
            JSON.parse(course.certificate_settings) : null;
            
        if (!certificateSettings || !certificateSettings.enabled) {
            console.log('❌ Certificates not enabled for this course');
            return;
        }
        
        console.log('✅ Certificates are enabled for this course');
        
        // Get all lessons for this course
        const modules = await Module.findAll({
            include: [{
                model: Course,
                as: 'courses',
                where: { id: 5 },
                through: { attributes: ['module_order'] }
            }, {
                model: Lesson,
                as: 'lessons'
            }]
        });
        
        const lessonIds = [];
        modules.forEach(module => {
            module.lessons.forEach(lesson => {
                lessonIds.push(lesson.id);
            });
        });
        
        console.log(`Found ${lessonIds.length} lessons in course 5:`, lessonIds);
        
        // Check if there are any users with completed progress
        const completedProgress = await UserProgress.findAll({
            where: {
                lesson_id: { [Op.in]: lessonIds },
                status: 'completed'
            }
        });
        
        console.log(`Found ${completedProgress.length} completed lesson records`);
        
        if (completedProgress.length === 0) {
            console.log('❌ No completed lessons found. Need to complete some lessons first.');
            return;
        }
        
        // Group by user
        const userProgress = {};
        completedProgress.forEach(progress => {
            if (!userProgress[progress.user_id]) {
                userProgress[progress.user_id] = [];
            }
            userProgress[progress.user_id].push(progress.lesson_id);
        });
        
        console.log('User progress summary:');
        for (const userId of Object.keys(userProgress)) {
            const completedLessons = userProgress[userId];
            console.log(`  User ${userId}: ${completedLessons.length}/${lessonIds.length} lessons completed`);
            
            if (completedLessons.length === lessonIds.length) {
                console.log(`  ✅ User ${userId} completed all lessons!`);
                
                // Check if certificate already exists
                const existingCert = await Certificate.findOne({
                    where: {
                        user_id: userId,
                        course_id: 5
                    }
                });
                
                if (existingCert) {
                    console.log(`  ✅ Certificate already exists: ${existingCert.certificate_uid}`);
                } else {
                    console.log(`  ❌ No certificate found - this is the problem!`);
                    
                    // Try to create certificate manually
                    try {
                        const { v4: uuidv4 } = require('uuid');
                        const certificateUid = uuidv4();
                        const verificationCode = `CERT-5-${userId}-${Date.now()}`;
                        
                        const certificate = await Certificate.create({
                            user_id: userId,
                            course_id: 5,
                            certificate_uid: certificateUid,
                            verification_code: verificationCode,
                            valid_until: certificateSettings.validityPeriod ? 
                                new Date(Date.now() + (certificateSettings.validityPeriod * 24 * 60 * 60 * 1000)) : null,
                            settings: JSON.stringify(certificateSettings),
                            final_score: null,
                            completion_time: 0
                        });
                        
                        console.log(`  ✅ Certificate created successfully: ${certificateUid}`);
                    } catch (error) {
                        console.log(`  ❌ Error creating certificate:`, error.message);
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

testCertificateGeneration();
