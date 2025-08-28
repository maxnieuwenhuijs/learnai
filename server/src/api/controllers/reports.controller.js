const reportService = require('../../services/report.service');
const { User, UserProgress, Lesson, Module, Course, Department, Certificate, Company } = require('../../models');
const { Op } = require('sequelize');

// Keep existing getTeamProgress function
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

// New: Get EU AI Act compliance report
const getComplianceReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        // Get compliance data based on user's role and access level
        const complianceData = await reportService.getComplianceStatus({
            userId: req.user.id,
            userRole: req.user.role,
            companyId: req.user.company_id,
            departmentId: req.user.department_id,
            startDate,
            endDate
        });

        res.status(200).json({
            success: true,
            data: complianceData
        });
    } catch (error) {
        console.error('Error fetching compliance report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch compliance report',
            error: error.message
        });
    }
};

// New: Get department-wide analytics
const getDepartmentAnalytics = async (req, res) => {
    try {
        const { departmentId, period = '30d' } = req.query;
        
        // Verify admin has access to the department
        let targetDepartmentId = departmentId;
        if (req.user.role === 'admin' && departmentId) {
            // Verify department belongs to admin's company
            const dept = await Department.findOne({
                where: {
                    id: departmentId,
                    company_id: req.user.company_id
                }
            });
            if (!dept) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied to this department'
                });
            }
        } else if (req.user.role === 'admin') {
            // Get all departments in company
            targetDepartmentId = null; // Will fetch all company departments
        }

        const analytics = await reportService.getDepartmentAnalytics({
            companyId: req.user.company_id,
            departmentId: targetDepartmentId,
            period
        });

        res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Error fetching department analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch department analytics',
            error: error.message
        });
    }
};

// New: Export reports
const exportReport = async (req, res) => {
    try {
        const { type } = req.params;
        const { format = 'pdf', reportType = 'team', ...filters } = req.query;

        // Validate export format
        if (!['pdf', 'csv', 'excel'].includes(format)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid export format. Use pdf, csv, or excel.'
            });
        }

        // Generate the report based on type
        const reportData = await reportService.generateReport({
            reportType: type,
            userRole: req.user.role,
            userId: req.user.id,
            companyId: req.user.company_id,
            departmentId: req.user.department_id,
            filters
        });

        // Export the report
        const exportResult = await reportService.exportReport({
            data: reportData,
            format,
            reportType: type
        });

        // Set appropriate headers
        const contentTypes = {
            pdf: 'application/pdf',
            csv: 'text/csv',
            excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };

        const fileExtensions = {
            pdf: 'pdf',
            csv: 'csv',
            excel: 'xlsx'
        };

        res.setHeader('Content-Type', contentTypes[format]);
        res.setHeader('Content-Disposition', `attachment; filename="report-${type}-${Date.now()}.${fileExtensions[format]}"`);
        
        // Send the file
        res.send(exportResult);
    } catch (error) {
        console.error('Error exporting report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export report',
            error: error.message
        });
    }
};

// New: Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const { period = '7d' } = req.query;
        
        // Get customized dashboard stats based on user role
        const stats = await reportService.getDashboardStats({
            userId: req.user.id,
            userRole: req.user.role,
            companyId: req.user.company_id,
            departmentId: req.user.department_id,
            period
        });

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
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
    getTeamProgress,
    getComplianceReport,
    getDepartmentAnalytics,
    exportReport,
    getDashboardStats
};