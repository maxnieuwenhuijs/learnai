const { Course, Module, Lesson, CourseAssignment, CourseModule, UserProgress } = require('../../models');
const { Op } = require('sequelize');

const getAssignedCourses = async (req, res) => {
    try {
        const userId = req.user.id;
        const companyId = req.user.company_id;
        const departmentId = req.user.department_id;

        // Find courses assigned to user's company or department (only published courses)
        const courseAssignments = await CourseAssignment.findAll({
            where: {
                [Op.or]: [
                    { company_id: companyId, department_id: null },
                    { company_id: companyId, department_id: departmentId }
                ]
            },
            include: [{
                model: Course,
                as: 'course',
                where: {
                    is_published: true
                }
            }]
        });

        // Get progress for each course
        const coursesWithProgress = await Promise.all(
            courseAssignments.map(async (assignment) => {
                const course = assignment.course;
                
                // Get all lessons for this course
                const modules = await Module.findAll({
                    include: [
                        {
                            model: Course,
                            as: 'courses',
                            where: { id: course.id },
                            through: { attributes: ['module_order'] }
                        },
                        {
                            model: Lesson,
                            as: 'lessons'
                        }
                    ]
                });

                // Calculate total lessons
                const totalLessons = modules.reduce((sum, module) => 
                    sum + module.lessons.length, 0
                );

                // Get user's progress for these lessons
                const lessonIds = modules.flatMap(m => m.lessons.map(l => l.id));
                const completedLessons = await UserProgress.count({
                    where: {
                        user_id: userId,
                        lesson_id: { [Op.in]: lessonIds },
                        status: 'completed'
                    }
                });

                const progressPercentage = totalLessons > 0 
                    ? Math.round((completedLessons / totalLessons) * 100)
                    : 0;

                return {
                    id: course.id,
                    title: course.title,
                    description: course.description,
                    target_role: course.target_role,
                    totalLessons,
                    completedLessons,
                    progressPercentage
                };
            })
        );

        res.json({
            success: true,
            courses: coursesWithProgress
        });
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching courses'
        });
    }
};

const getCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        // Verify user has access to this course and it's published
        const hasAccess = await CourseAssignment.findOne({
            where: {
                course_id: courseId,
                [Op.or]: [
                    { company_id: req.user.company_id, department_id: null },
                    { company_id: req.user.company_id, department_id: req.user.department_id }
                ]
            },
            include: [{
                model: Course,
                as: 'course',
                where: {
                    is_published: true
                }
            }]
        });

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this course or course not published'
            });
        }

        // Get course with modules and lessons
        const course = await Course.findByPk(courseId, {
            include: [{
                model: Module,
                as: 'modules',
                through: { attributes: ['module_order'] },
                include: [{
                    model: Lesson,
                    as: 'lessons',
                    attributes: ['id', 'title', 'content_type', 'content_data', 'lesson_order']
                }]
            }]
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Sort modules and lessons by their order
        course.modules.sort((a, b) => 
            a.CourseModule.module_order - b.CourseModule.module_order
        );
        
        course.modules.forEach(module => {
            module.lessons.sort((a, b) => a.lesson_order - b.lesson_order);
        });

        // Get user's progress for all lessons
        const lessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id));
        const userProgress = await UserProgress.findAll({
            where: {
                user_id: userId,
                lesson_id: { [Op.in]: lessonIds }
            }
        });

        // Create progress map
        const progressMap = {};
        userProgress.forEach(progress => {
            progressMap[progress.lesson_id] = {
                status: progress.status,
                started_at: progress.started_at,
                completed_at: progress.completed_at,
                time_spent_seconds: progress.time_spent_seconds,
                quiz_score: progress.quiz_score
            };
        });

        // Format response
        const formattedCourse = {
            id: course.id,
            title: course.title,
            description: course.description,
            target_role: course.target_role,
            modules: course.modules.map(module => ({
                id: module.id,
                title: module.title,
                description: module.description,
                estimated_duration_minutes: module.estimated_duration_minutes,
                order: module.CourseModule.module_order,
                lessons: module.lessons.map(lesson => ({
                    id: lesson.id,
                    title: lesson.title,
                    content_type: lesson.content_type,
                    content_data: lesson.content_data,
                    order: lesson.lesson_order,
                    progress: progressMap[lesson.id] || {
                        status: 'not_started',
                        started_at: null,
                        completed_at: null,
                        time_spent_seconds: 0,
                        quiz_score: null
                    }
                }))
            }))
        };

        res.json({
            success: true,
            course: formattedCourse
        });
    } catch (error) {
        console.error('Get course details error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching course details'
        });
    }
};

module.exports = {
    getAssignedCourses,
    getCourseDetails
};