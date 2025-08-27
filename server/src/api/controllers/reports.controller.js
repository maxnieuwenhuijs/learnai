const { User, UserProgress, Lesson, Module, Course, Department } = require('../../models');
const { Op } = require('sequelize');

const getTeamProgress = async (req, res) => {
    try {
        // Check if user is a manager or higher
        if (!['manager', 'admin', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Manager role required.'
            });
        }

        const managerId = req.user.id;
        const departmentId = req.user.department_id;
        const companyId = req.user.company_id;

        // Get users based on manager's role
        let userFilter = {};
        if (req.user.role === 'manager' && departmentId) {
            // Managers see only their department
            userFilter = { department_id: departmentId };
        } else if (req.user.role === 'admin') {
            // Admins see whole company
            userFilter = { company_id: companyId };
        } else if (req.user.role === 'super_admin') {
            // Super admins see everything (no filter)
            userFilter = {};
        }

        // Get team members
        const teamMembers = await User.findAll({
            where: userFilter,
            include: [{
                model: Department,
                as: 'department'
            }],
            attributes: ['id', 'name', 'email', 'role']
        });

        // Get progress for each team member
        const teamProgress = await Promise.all(
            teamMembers.map(async (member) => {
                // Get all progress records for the user
                const progressRecords = await UserProgress.findAll({
                    where: { user_id: member.id },
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

                // Calculate statistics
                const coursesInProgress = new Set();
                const coursesCompleted = new Set();
                let totalTimeSpent = 0;
                let totalLessonsCompleted = 0;
                let totalLessons = 0;
                const quizScores = [];

                // Group progress by course
                const courseProgress = {};
                
                progressRecords.forEach(record => {
                    if (record.lesson && record.lesson.module && record.lesson.module.courses) {
                        record.lesson.module.courses.forEach(course => {
                            if (!courseProgress[course.id]) {
                                courseProgress[course.id] = {
                                    courseId: course.id,
                                    courseTitle: course.title,
                                    totalLessons: 0,
                                    completedLessons: 0
                                };
                            }
                            
                            courseProgress[course.id].totalLessons++;
                            if (record.status === 'completed') {
                                courseProgress[course.id].completedLessons++;
                                totalLessonsCompleted++;
                            }
                            
                            if (record.status !== 'not_started') {
                                coursesInProgress.add(course.id);
                            }
                            
                            totalTimeSpent += record.time_spent_seconds || 0;
                            
                            if (record.quiz_score !== null) {
                                quizScores.push(parseFloat(record.quiz_score));
                            }
                        });
                    }
                });

                // Check which courses are completed
                Object.entries(courseProgress).forEach(([courseId, progress]) => {
                    totalLessons += progress.totalLessons;
                    if (progress.completedLessons === progress.totalLessons && progress.totalLessons > 0) {
                        coursesCompleted.add(parseInt(courseId));
                        coursesInProgress.delete(parseInt(courseId));
                    }
                });

                // Calculate average quiz score
                const averageQuizScore = quizScores.length > 0
                    ? quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length
                    : null;

                // Calculate overall progress percentage
                const overallProgress = totalLessons > 0
                    ? Math.round((totalLessonsCompleted / totalLessons) * 100)
                    : 0;

                return {
                    userId: member.id,
                    name: member.name,
                    email: member.email,
                    role: member.role,
                    department: member.department ? member.department.name : null,
                    statistics: {
                        coursesInProgress: coursesInProgress.size,
                        coursesCompleted: coursesCompleted.size,
                        totalTimeSpentSeconds: totalTimeSpent,
                        totalTimeSpentFormatted: formatTime(totalTimeSpent),
                        averageQuizScore: averageQuizScore ? averageQuizScore.toFixed(1) : null,
                        overallProgress,
                        totalLessons,
                        completedLessons: totalLessonsCompleted
                    },
                    courses: Object.values(courseProgress).map(cp => ({
                        ...cp,
                        progressPercentage: cp.totalLessons > 0
                            ? Math.round((cp.completedLessons / cp.totalLessons) * 100)
                            : 0
                    }))
                };
            })
        );

        // Calculate team aggregates
        const teamAggregates = {
            totalMembers: teamProgress.length,
            averageProgress: teamProgress.length > 0
                ? Math.round(teamProgress.reduce((sum, m) => sum + m.statistics.overallProgress, 0) / teamProgress.length)
                : 0,
            totalCoursesCompleted: teamProgress.reduce((sum, m) => sum + m.statistics.coursesCompleted, 0),
            totalTimeSpent: teamProgress.reduce((sum, m) => sum + m.statistics.totalTimeSpentSeconds, 0),
            totalTimeSpentFormatted: formatTime(teamProgress.reduce((sum, m) => sum + m.statistics.totalTimeSpentSeconds, 0))
        };

        res.json({
            success: true,
            aggregates: teamAggregates,
            members: teamProgress
        });
    } catch (error) {
        console.error('Get team progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching team progress'
        });
    }
};

// Helper function to format seconds into readable time
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

module.exports = {
    getTeamProgress
};