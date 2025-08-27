const { UserProgress, Lesson, Module, Course, Certificate } = require('../../models');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

const trackEvent = async (req, res) => {
    try {
        const { lessonId, eventType, details } = req.body;
        const userId = req.user.id;

        // Validate lesson exists
        const lesson = await Lesson.findByPk(lessonId);
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        // Find or create progress record
        let progress = await UserProgress.findOne({
            where: {
                user_id: userId,
                lesson_id: lessonId
            }
        });

        if (!progress) {
            progress = await UserProgress.create({
                user_id: userId,
                lesson_id: lessonId,
                status: 'not_started'
            });
        }

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
                
                // Check if all lessons in the course are completed
                await checkCourseCompletion(userId, lesson);
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid event type'
                });
        }

        await progress.save();

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
        const userId = req.user.id;

        // Get all user progress records
        const progressRecords = await UserProgress.findAll({
            where: { user_id: userId },
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

        // Organize progress by course
        const progressByCourse = {};
        
        progressRecords.forEach(record => {
            if (record.lesson && record.lesson.module && record.lesson.module.courses) {
                record.lesson.module.courses.forEach(course => {
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
                        lessonId: record.lesson.id,
                        lessonTitle: record.lesson.title,
                        moduleId: record.lesson.module.id,
                        moduleTitle: record.lesson.module.title,
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
        });

        // Calculate average quiz scores
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
                as: 'course'
            }]
        });

        res.json({
            success: true,
            progress: Object.values(progressByCourse),
            certificates: certificates.map(cert => ({
                id: cert.id,
                courseId: cert.course_id,
                courseTitle: cert.course.title,
                certificateUid: cert.certificate_uid,
                issuedAt: cert.issued_at
            }))
        });
    } catch (error) {
        console.error('Get user progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user progress'
        });
    }
};

// Helper function to check if user has completed all lessons in a course
async function checkCourseCompletion(userId, lesson) {
    try {
        // Get the course(s) this lesson belongs to
        const module = await Module.findByPk(lesson.module_id, {
            include: [{
                model: Course,
                as: 'courses',
                include: [{
                    model: Module,
                    as: 'modules',
                    include: [{
                        model: Lesson,
                        as: 'lessons'
                    }]
                }]
            }]
        });

        if (!module || !module.courses) return;

        for (const course of module.courses) {
            // Get all lesson IDs for this course
            const allLessonIds = course.modules.flatMap(m => 
                m.lessons.map(l => l.id)
            );

            // Check if all lessons are completed
            const completedCount = await UserProgress.count({
                where: {
                    user_id: userId,
                    lesson_id: { [Op.in]: allLessonIds },
                    status: 'completed'
                }
            });

            // If all lessons are completed, issue certificate
            if (completedCount === allLessonIds.length) {
                const existingCert = await Certificate.findOne({
                    where: {
                        user_id: userId,
                        course_id: course.id
                    }
                });

                if (!existingCert) {
                    await Certificate.create({
                        user_id: userId,
                        course_id: course.id,
                        certificate_uid: uuidv4()
                    });
                    console.log(`Certificate issued for user ${userId} in course ${course.id}`);
                }
            }
        }
    } catch (error) {
        console.error('Error checking course completion:', error);
    }
}

module.exports = {
    trackEvent,
    getUserProgress
};