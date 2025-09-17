const { UserProgress, Lesson, Module, Course, Certificate } = require('../../models');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

const trackEvent = async (req, res) => {
    try {
        const { lessonId, eventType, details } = req.body;
        
        // Handle super admin case - they shouldn't track progress
        if (req.user.standalone && req.user.role === 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Super admin users cannot track progress'
            });
        }
        
        const userId = req.user.id;

        // Validate lesson exists
        const lesson = await Lesson.findByPk(lessonId);
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        // Find or create progress record (using findOrCreate to avoid race conditions)
        const [progress, created] = await UserProgress.findOrCreate({
            where: {
                user_id: userId,
                lesson_id: lessonId
            },
            defaults: {
                user_id: userId,
                lesson_id: lessonId,
                status: 'not_started'
            }
        });

        // Process event based on type
        switch (eventType) {
            case 'LESSON_STARTED':
                if (progress.status === 'not_started') {
                    progress.status = 'in_progress';
                    progress.started_at = progress.started_at || new Date();
                }
                break;

            case 'TIME_SPENT_UPDATE':
                if (details && details.seconds) {
                    progress.time_spent_seconds = (progress.time_spent_seconds || 0) + details.seconds;
                }
                break;

            case 'LESSON_COMPLETED':
                progress.status = 'completed';
                progress.completed_at = new Date();
                if (details && details.quizScore !== undefined) {
                    progress.quiz_score = details.quizScore;
                }
                
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid event type'
                });
        }

        await progress.save();

        // Check if all lessons in the course are completed (after saving progress)
        if (eventType === 'LESSON_COMPLETED') {
            console.log(`🔍 LESSON_COMPLETED event for user ${userId}, lesson ${lessonId}`);
            const certificateResult = await checkCourseCompletion(userId, lesson);
            
            // Send feedback about certificate status
            if (certificateResult) {
                res.json({
                    success: true,
                    certificateCreated: certificateResult.created,
                    message: certificateResult.message,
                    score: certificateResult.score,
                    requiredScore: certificateResult.requiredScore
                });
                return;
            }
        }

        res.status(204).send();
    } catch (error) {
        console.error('Track event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error tracking progress event'
        });
    }
};

const getUserProgress = async (req, res) => {
    try {
        // Handle super admin case - they shouldn't have progress
        if (req.user.standalone && req.user.role === 'super_admin') {
            return res.json({
                success: true,
                progress: [],
                certificates: []
            });
        }
        
        const userId = req.user.id;

        // Get all user progress records - no includes to avoid association issues
        const progressRecords = await UserProgress.findAll({
            where: { user_id: userId },
            raw: true
        });

        if (progressRecords.length === 0) {
            return res.json({
                success: true,
                progress: [],
                certificates: []
            });
        }

        // Get lesson IDs
        const lessonIds = progressRecords.map(record => record.lesson_id);
        
        // Get lessons with their modules
        const lessons = await Lesson.findAll({
            where: { id: { [Op.in]: lessonIds } },
            include: [{
                model: Module,
                as: 'module',
                attributes: ['id', 'title']
            }],
            raw: false
        });

        // Get all modules and their courses
        const moduleIds = [...new Set(lessons.map(lesson => lesson.module_id))];
        const modules = await Module.findAll({
            where: { id: { [Op.in]: moduleIds } },
            include: [{
                model: Course,
                as: 'courses',
                attributes: ['id', 'title']
            }],
            raw: false
        });

        // Organize progress by course
        const progressByCourse = {};
        
        progressRecords.forEach(record => {
            const lesson = lessons.find(l => l.id === record.lesson_id);
            if (lesson && lesson.module) {
                const module = modules.find(m => m.id === lesson.module_id);
                if (module && module.courses) {
                    module.courses.forEach(course => {
                        if (!progressByCourse[course.id]) {
                            progressByCourse[course.id] = {
                                courseId: course.id,
                                courseTitle: course.title,
                                lessons: [],
                                totalLessons: 0,
                                completedLessons: 0,
                                totalTimeSpent: 0,
                                averageQuizScore: null
                            };
                        }
                        
                        progressByCourse[course.id].lessons.push({
                            lessonId: record.lesson_id,
                            lessonTitle: lesson.title,
                            moduleId: lesson.module_id,
                            moduleTitle: lesson.module.title,
                            status: record.status,
                            startedAt: record.started_at,
                            completedAt: record.completed_at,
                            timeSpentSeconds: record.time_spent_seconds,
                            quizScore: record.quiz_score
                        });
                        
                        progressByCourse[course.id].totalLessons++;
                        if (record.status === 'completed') {
                            progressByCourse[course.id].completedLessons++;
                        }
                        progressByCourse[course.id].totalTimeSpent += record.time_spent_seconds || 0;
                    });
                }
            }
        });

        // Calculate average quiz scores and progress percentage
        Object.values(progressByCourse).forEach(course => {
            const quizScores = course.lessons
                .filter(l => l.quizScore !== null)
                .map(l => parseFloat(l.quizScore));
            
            if (quizScores.length > 0) {
                course.averageQuizScore = 
                    quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length;
            }
            
            course.progressPercentage = course.totalLessons > 0
                ? Math.round((course.completedLessons / course.totalLessons) * 100)
                : 0;
        });

        // Get certificates
        const certificates = await Certificate.findAll({
            where: { user_id: userId },
            include: [{
                model: Course,
                as: 'course',
                attributes: ['id', 'title']
            }]
        });

        res.json({
            success: true,
            progress: Object.values(progressByCourse),
            certificates: certificates.map(cert => ({
                id: cert.id,
                courseId: cert.course_id,
                course: {
                    id: cert.course ? cert.course.id : null,
                    title: cert.course ? cert.course.title : 'Unknown Course',
                    description: cert.course ? cert.course.description : '',
                    duration: cert.course ? cert.course.duration_hours : null
                },
                certificateUid: cert.certificate_uid,
                verificationCode: cert.verification_code,
                issuedAt: cert.issued_at,
                validUntil: cert.valid_until,
                finalScore: cert.final_score,
                completionTime: cert.completion_time,
                status: cert.status || 'active'
            }))
        });
    } catch (error) {
        console.error('Get user progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user progress',
            error: error.message
        });
    }
};

// Helper function to check if user has completed all lessons in a course
async function checkCourseCompletion(userId, lesson) {
    try {
        console.log(`🔍 BACKEND: Checking course completion for user ${userId}, lesson ${lesson.id}`);
        
        // Get the module this lesson belongs to
        const module = await Module.findByPk(lesson.module_id);
        if (!module) {
            console.log(`❌ BACKEND: Module not found for lesson ${lesson.id}`);
            return null;
        }
        console.log(`📚 BACKEND: Found module ${module.id}: ${module.title}`);

        // Get all courses that contain this module
        const courses = await Course.findAll({
            include: [{
                model: Module,
                as: 'modules',
                where: { id: module.id },
                through: { attributes: ['module_order'] },
                include: [{
                    model: Lesson,
                    as: 'lessons'
                }]
            }]
        });

        console.log(`📚 BACKEND: Found ${courses.length} courses containing module ${module.id}`);

        for (const course of courses) {
            console.log(`🔍 BACKEND: Checking course ${course.id}: ${course.title}`);
            
            // Get all lesson IDs for this course
            const allLessonIds = [];
            course.modules.forEach(m => {
                m.lessons.forEach(l => {
                    allLessonIds.push(l.id);
                });
            });

            console.log(`📚 BACKEND: Course ${course.id} has ${allLessonIds.length} lessons:`, allLessonIds);

            // Check if all lessons are completed
            const completedCount = await UserProgress.count({
                where: {
                    user_id: userId,
                    lesson_id: { [Op.in]: allLessonIds },
                    status: 'completed'
                }
            });

            console.log(`User ${userId} completed ${completedCount}/${allLessonIds.length} lessons in course ${course.id}`);

            // If all lessons are completed, check for certificate generation
            if (completedCount === allLessonIds.length) {
                console.log(`✅ User ${userId} completed all lessons in course ${course.id}!`);
                
                const existingCert = await Certificate.findOne({
                    where: {
                        user_id: userId,
                        course_id: course.id
                    }
                });

                if (existingCert) {
                    console.log(`Certificate already exists for user ${userId} in course ${course.id}`);
                    return {
                        created: false,
                        message: `Je hebt al een certificaat voor deze cursus!`,
                        score: 100,
                        requiredScore: 0
                    };
                }

                // Check if certificates are enabled for this course
                const certificateSettings = course.certificate_settings ? 
                    JSON.parse(course.certificate_settings) : null;

                console.log(`Course ${course.id} certificate settings:`, certificateSettings);

                if (certificateSettings && certificateSettings.enabled) {
                    console.log(`Creating certificate for user ${userId} in course ${course.id}`);
                    
                    // Calculate final score if required
                    let finalScore = null;
                    if (certificateSettings.requireQuiz) {
                        const quizScores = await UserProgress.findAll({
                            where: {
                                user_id: userId,
                                lesson_id: { [Op.in]: allLessonIds },
                                status: 'completed',
                                quiz_score: { [Op.not]: null }
                            },
                            attributes: ['quiz_score']
                        });

                        if (quizScores.length > 0) {
                            finalScore = quizScores.reduce((sum, progress) => sum + (progress.quiz_score || 0), 0) / quizScores.length;
                            console.log(`📊 BACKEND: User ${userId} has quiz scores: ${quizScores.length} scores, average: ${finalScore}`);
                        } else {
                            console.log(`📊 BACKEND: User ${userId} has no quiz scores. Quiz required for certificate.`);
                            finalScore = 0; // No quiz scores = 0%
                        }

                        // Only create certificate if passing score is met
                        if (finalScore >= certificateSettings.passingScore) {
                            console.log(`✅ BACKEND: User ${userId} meets passing score requirement: ${finalScore} >= ${certificateSettings.passingScore}`);
                            await createCertificate(userId, course.id, certificateSettings, finalScore, allLessonIds);
                            return {
                                created: true,
                                message: `Gefeliciteerd! Je hebt het certificaat verdiend met een score van ${finalScore}%`,
                                score: finalScore,
                                requiredScore: certificateSettings.passingScore
                            };
                        } else {
                            console.log(`❌ BACKEND: User ${userId} did not meet passing score requirement: ${finalScore} < ${certificateSettings.passingScore}. Certificate not created.`);
                            return {
                                created: false,
                                message: `Je hebt alle lessen voltooid, maar je quiz score (${finalScore}%) is te laag. Je hebt minimaal ${certificateSettings.passingScore}% nodig voor het certificaat. Doe de quiz opnieuw!`,
                                score: finalScore,
                                requiredScore: certificateSettings.passingScore
                            };
                        }
                    } else {
                        // No quiz requirement, create certificate
                        console.log(`📊 BACKEND: No quiz requirement, creating certificate for user ${userId}`);
                        await createCertificate(userId, course.id, certificateSettings, null, allLessonIds);
                        return {
                            created: true,
                            message: `Gefeliciteerd! Je hebt het certificaat verdiend!`,
                            score: 100,
                            requiredScore: 0
                        };
                    }
                } else {
                    console.log(`Certificates not enabled for course ${course.id}`);
                }
            }
        }
    } catch (error) {
        console.error('Error checking course completion:', error);
    }
}

// Helper function to create a certificate
async function createCertificate(userId, courseId, certificateSettings, finalScore, lessonIds) {
    try {
        // Calculate completion time
        const completionTimes = await UserProgress.findAll({
            where: {
                user_id: userId,
                lesson_id: { [Op.in]: lessonIds },
                status: 'completed',
                time_spent_seconds: { [Op.not]: null }
            },
            attributes: ['time_spent_seconds']
        });

        const completionTime = completionTimes.reduce((sum, progress) => sum + (progress.time_spent_seconds || 0), 0);

        // Generate unique certificate UID and verification code
        const certificateUid = uuidv4();
        const verificationCode = `CERT-${courseId}-${userId}-${Date.now()}`;

        // Create certificate
        const certificate = await Certificate.create({
            user_id: userId,
            course_id: courseId,
            certificate_uid: certificateUid,
            verification_code: verificationCode,
            valid_until: certificateSettings.validityPeriod ? 
                new Date(Date.now() + (certificateSettings.validityPeriod * 24 * 60 * 60 * 1000)) : null,
            settings: JSON.stringify(certificateSettings),
            final_score: finalScore,
            completion_time: Math.round(completionTime / 60) // Convert to minutes
        });

        console.log(`Certificate created for user ${userId} in course ${courseId} with UID ${certificateUid}`);
        return certificate;
    } catch (error) {
        console.error('Error creating certificate:', error);
        throw error;
    }
}

module.exports = {
    trackEvent,
    getUserProgress
};