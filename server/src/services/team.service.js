const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const {
    User,
    Department,
    Company,
    Course,
    CourseAssignment,
    UserProgress,
    Lesson,
    Module,
    Certificate
} = require('../models');

class TeamService {
    /**
     * Build filters based on user role and permissions
     */
    buildTeamFilters(user, departmentId = null) {
        let filters = {};

        // Super admins can see everything
        if (user.role === 'super_admin') {
            if (departmentId) {
                filters.department_id = departmentId;
            }
            return filters;
        }

        // Company admins can see their company
        if (user.role === 'admin') {
            filters.company_id = user.company_id;
            if (departmentId) {
                filters.department_id = departmentId;
            }
            return filters;
        }

        // Managers can only see their department
        if (user.role === 'manager') {
            filters.department_id = user.department_id;
            return filters;
        }

        // Participants shouldn't reach here, but return restrictive filter
        return { id: user.id };
    }

    /**
     * Verify if a manager has access to a specific team member
     */
    async verifyTeamAccess(manager, userId) {
        const user = await User.findByPk(userId);
        if (!user) return false;

        // Super admins have access to everyone
        if (manager.role === 'super_admin') return true;

        // Company admins have access to their company members
        if (manager.role === 'admin') {
            return user.company_id === manager.company_id;
        }

        // Managers have access to their department members
        if (manager.role === 'manager') {
            return user.department_id === manager.department_id;
        }

        return false;
    }

    /**
     * Get team members with pagination and filters
     */
    async getTeamMembers({ filters, search, page, limit }) {
        const offset = (page - 1) * limit;
        
        // Build where clause
        let whereClause = { ...filters };
        
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Department,
                    as: 'department',
                    attributes: ['id', 'name']
                },
                {
                    model: Company,
                    as: 'company',
                    attributes: ['id', 'name']
                }
            ],
            attributes: [
                'id', 'name', 'email', 'role', 'created_at',
                'profile_picture_url', 'department_id', 'company_id'
            ],
            limit,
            offset,
            order: [['name', 'ASC']]
        });

        // Get basic progress stats for each member
        const membersWithStats = await Promise.all(rows.map(async (member) => {
            const stats = await this.getMemberBasicStats(member.id);
            return {
                ...member.toJSON(),
                stats
            };
        }));

        return {
            members: membersWithStats,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        };
    }

    /**
     * Get basic statistics for a team member
     */
    async getMemberBasicStats(userId) {
        // Count assigned courses
        const assignedCourses = await CourseAssignment.count({
            where: { user_id: userId }
        });

        // Count completed courses
        const completedCourses = await Certificate.count({
            where: { user_id: userId }
        });

        // Get average progress
        const progressData = await UserProgress.findAll({
            where: { user_id: userId },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('progress_percentage')), 'avgProgress']
            ],
            raw: true
        });

        // Get last activity
        const lastActivity = await UserProgress.findOne({
            where: { user_id: userId },
            order: [['last_accessed', 'DESC']],
            attributes: ['last_accessed']
        });

        return {
            assignedCourses,
            completedCourses,
            averageProgress: Math.round(progressData[0]?.avgProgress || 0),
            lastActivity: lastActivity?.last_accessed || null
        };
    }

    /**
     * Get detailed member information with full progress data
     */
    async getMemberDetailsWithProgress(userId) {
        const member = await User.findByPk(userId, {
            include: [
                {
                    model: Department,
                    as: 'department',
                    attributes: ['id', 'name']
                },
                {
                    model: Company,
                    as: 'company',
                    attributes: ['id', 'name']
                }
            ],
            attributes: { exclude: ['password_hash'] }
        });

        if (!member) return null;

        // Get all course assignments with progress
        const courseAssignments = await CourseAssignment.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'description', 'difficulty_level']
                }
            ]
        });

        // Get progress for each course
        const coursesWithProgress = await Promise.all(
            courseAssignments.map(async (assignment) => {
                const progress = await this.getCourseProgress(userId, assignment.course_id);
                return {
                    ...assignment.toJSON(),
                    progress
                };
            })
        );

        // Get certificates
        const certificates = await Certificate.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title']
                }
            ],
            order: [['issued_date', 'DESC']]
        });

        // Calculate overall stats
        const stats = await this.getMemberDetailedStats(userId);

        return {
            member: member.toJSON(),
            courses: coursesWithProgress,
            certificates: certificates,
            stats
        };
    }

    /**
     * Get course progress for a user
     */
    async getCourseProgress(userId, courseId) {
        // Get all lessons in the course
        const lessons = await Lesson.findAll({
            include: [{
                model: Module,
                as: 'module',
                where: { course_id: courseId },
                attributes: []
            }],
            attributes: ['id']
        });

        const totalLessons = lessons.length;
        if (totalLessons === 0) return { percentage: 0, completed: 0, total: 0 };

        // Count completed lessons
        const completedLessons = await UserProgress.count({
            where: {
                user_id: userId,
                lesson_id: { [Op.in]: lessons.map(l => l.id) },
                completed: true
            }
        });

        // Get total time spent
        const timeData = await UserProgress.sum('time_spent', {
            where: {
                user_id: userId,
                lesson_id: { [Op.in]: lessons.map(l => l.id) }
            }
        });

        return {
            percentage: Math.round((completedLessons / totalLessons) * 100),
            completed: completedLessons,
            total: totalLessons,
            timeSpent: timeData || 0
        };
    }

    /**
     * Get detailed statistics for a team member
     */
    async getMemberDetailedStats(userId) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Learning streak calculation
        const recentActivity = await UserProgress.findAll({
            where: {
                user_id: userId,
                last_accessed: { [Op.gte]: thirtyDaysAgo }
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('last_accessed')), 'date']
            ],
            group: ['date'],
            order: [['date', 'DESC']],
            raw: true
        });

        // Calculate current streak
        let currentStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        if (recentActivity.length > 0) {
            const lastActive = recentActivity[0].date;
            if (lastActive === today || lastActive === yesterday) {
                currentStreak = 1;
                for (let i = 1; i < recentActivity.length; i++) {
                    const prevDate = new Date(recentActivity[i - 1].date);
                    const currDate = new Date(recentActivity[i].date);
                    const diffDays = Math.floor((prevDate - currDate) / 86400000);
                    if (diffDays === 1) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }
            }
        }

        // Total learning time
        const totalTime = await UserProgress.sum('time_spent', {
            where: { user_id: userId }
        });

        // Average quiz score
        const quizScores = await UserProgress.findAll({
            where: {
                user_id: userId,
                quiz_score: { [Op.ne]: null }
            },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('quiz_score')), 'avgScore']
            ],
            raw: true
        });

        return {
            currentStreak,
            totalLearningTime: totalTime || 0,
            averageQuizScore: Math.round(quizScores[0]?.avgScore || 0),
            activeDaysLast30: recentActivity.length
        };
    }

    /**
     * Assign a course to multiple users
     */
    async assignCourseToUsers({ courseId, userIds, assignedBy, dueDate, mandatory }) {
        const assignments = [];
        
        for (const userId of userIds) {
            try {
                // Check if assignment already exists
                const existing = await CourseAssignment.findOne({
                    where: {
                        course_id: courseId,
                        user_id: userId
                    }
                });

                if (!existing) {
                    const assignment = await CourseAssignment.create({
                        course_id: courseId,
                        user_id: userId,
                        assigned_by: assignedBy,
                        assigned_date: new Date(),
                        due_date: dueDate || null,
                        is_mandatory: mandatory,
                        status: 'assigned'
                    });
                    assignments.push(assignment);
                }
            } catch (error) {
                console.error(`Error assigning course to user ${userId}:`, error);
            }
        }

        return assignments;
    }

    /**
     * Get team progress overview
     */
    async getTeamProgressOverview({ filters, startDate, endDate, courseId }) {
        let whereClause = { ...filters };
        let progressWhereClause = {};

        if (startDate && endDate) {
            progressWhereClause.last_accessed = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        // Get team members
        const members = await User.findAll({
            where: whereClause,
            attributes: ['id', 'name']
        });

        const memberIds = members.map(m => m.id);

        // Get overall completion stats
        let courseFilter = {};
        if (courseId) {
            courseFilter = { course_id: courseId };
        }

        // Get course assignments for the team
        const assignments = await CourseAssignment.findAll({
            where: {
                user_id: { [Op.in]: memberIds },
                ...courseFilter
            },
            include: [{
                model: Course,
                as: 'course',
                attributes: ['id', 'title']
            }]
        });

        // Calculate progress for each course
        const courseProgress = {};
        for (const assignment of assignments) {
            const courseId = assignment.course_id;
            if (!courseProgress[courseId]) {
                courseProgress[courseId] = {
                    courseId,
                    title: assignment.course.title,
                    assigned: 0,
                    inProgress: 0,
                    completed: 0,
                    averageProgress: 0,
                    totalTimeSpent: 0
                };
            }

            courseProgress[courseId].assigned++;

            // Get user's progress for this course
            const progress = await this.getCourseProgress(assignment.user_id, courseId);
            
            if (progress.percentage === 100) {
                courseProgress[courseId].completed++;
            } else if (progress.percentage > 0) {
                courseProgress[courseId].inProgress++;
            }

            courseProgress[courseId].averageProgress += progress.percentage;
            courseProgress[courseId].totalTimeSpent += progress.timeSpent;
        }

        // Calculate averages
        Object.values(courseProgress).forEach(course => {
            course.averageProgress = Math.round(course.averageProgress / course.assigned);
        });

        // Get team activity timeline
        const activityTimeline = await this.getTeamActivityTimeline(memberIds, 7);

        return {
            summary: {
                totalMembers: members.length,
                totalCoursesAssigned: Object.keys(courseProgress).length,
                overallCompletion: this.calculateOverallCompletion(courseProgress)
            },
            courseProgress: Object.values(courseProgress),
            activityTimeline
        };
    }

    /**
     * Calculate overall team completion rate
     */
    calculateOverallCompletion(courseProgress) {
        const totals = Object.values(courseProgress).reduce(
            (acc, course) => {
                acc.assigned += course.assigned;
                acc.completed += course.completed;
                return acc;
            },
            { assigned: 0, completed: 0 }
        );

        return totals.assigned > 0 
            ? Math.round((totals.completed / totals.assigned) * 100)
            : 0;
    }

    /**
     * Get team activity timeline
     */
    async getTeamActivityTimeline(userIds, days = 7) {
        const timeline = [];
        const today = new Date();

        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));

            const activity = await UserProgress.count({
                where: {
                    user_id: { [Op.in]: userIds },
                    last_accessed: {
                        [Op.between]: [startOfDay, endOfDay]
                    }
                },
                distinct: true,
                col: 'user_id'
            });

            timeline.unshift({
                date: startOfDay.toISOString().split('T')[0],
                activeUsers: activity
            });
        }

        return timeline;
    }

    /**
     * Get team analytics
     */
    async getTeamAnalytics({ filters, period, groupBy }) {
        const members = await User.findAll({
            where: filters,
            attributes: ['id']
        });

        const memberIds = members.map(m => m.id);

        // Calculate date range based on period
        let dateFilter = {};
        const now = new Date();
        switch (period) {
            case '7d':
                dateFilter = new Date(now.setDate(now.getDate() - 7));
                break;
            case '30d':
                dateFilter = new Date(now.setDate(now.getDate() - 30));
                break;
            case '90d':
                dateFilter = new Date(now.setDate(now.getDate() - 90));
                break;
            default:
                dateFilter = new Date(now.setDate(now.getDate() - 30));
        }

        // Get completion rates by course
        const completionRates = await this.getCompletionRatesByCourse(memberIds, dateFilter);
        
        // Get average quiz scores
        const quizPerformance = await this.getQuizPerformance(memberIds, dateFilter);
        
        // Get time spent distribution
        const timeDistribution = await this.getTimeSpentDistribution(memberIds, dateFilter);
        
        // Get top performers
        const topPerformers = await this.getTopPerformers(memberIds, 5);

        return {
            period,
            completionRates,
            quizPerformance,
            timeDistribution,
            topPerformers
        };
    }

    /**
     * Get completion rates by course
     */
    async getCompletionRatesByCourse(userIds, sinceDate) {
        const courses = await Course.findAll({
            attributes: ['id', 'title']
        });

        const rates = await Promise.all(
            courses.map(async (course) => {
                const assigned = await CourseAssignment.count({
                    where: {
                        course_id: course.id,
                        user_id: { [Op.in]: userIds },
                        assigned_date: { [Op.gte]: sinceDate }
                    }
                });

                const completed = await Certificate.count({
                    where: {
                        course_id: course.id,
                        user_id: { [Op.in]: userIds },
                        issued_date: { [Op.gte]: sinceDate }
                    }
                });

                return {
                    courseId: course.id,
                    courseTitle: course.title,
                    assigned,
                    completed,
                    completionRate: assigned > 0 ? Math.round((completed / assigned) * 100) : 0
                };
            })
        );

        return rates.filter(r => r.assigned > 0);
    }

    /**
     * Get quiz performance metrics
     */
    async getQuizPerformance(userIds, sinceDate) {
        const performance = await UserProgress.findAll({
            where: {
                user_id: { [Op.in]: userIds },
                quiz_score: { [Op.ne]: null },
                last_accessed: { [Op.gte]: sinceDate }
            },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('quiz_score')), 'avgScore'],
                [sequelize.fn('MIN', sequelize.col('quiz_score')), 'minScore'],
                [sequelize.fn('MAX', sequelize.col('quiz_score')), 'maxScore'],
                [sequelize.fn('COUNT', sequelize.col('quiz_score')), 'totalQuizzes']
            ],
            raw: true
        });

        return {
            averageScore: Math.round(performance[0]?.avgScore || 0),
            minScore: performance[0]?.minScore || 0,
            maxScore: performance[0]?.maxScore || 0,
            totalQuizzesTaken: performance[0]?.totalQuizzes || 0
        };
    }

    /**
     * Get time spent distribution
     */
    async getTimeSpentDistribution(userIds, sinceDate) {
        const distribution = await UserProgress.findAll({
            where: {
                user_id: { [Op.in]: userIds },
                last_accessed: { [Op.gte]: sinceDate }
            },
            attributes: [
                'user_id',
                [sequelize.fn('SUM', sequelize.col('time_spent')), 'totalTime']
            ],
            group: ['user_id'],
            raw: true
        });

        // Categorize time spent
        const categories = {
            'under1Hour': 0,
            '1to5Hours': 0,
            '5to10Hours': 0,
            'over10Hours': 0
        };

        distribution.forEach(d => {
            const hours = d.totalTime / 60;
            if (hours < 1) categories.under1Hour++;
            else if (hours <= 5) categories['1to5Hours']++;
            else if (hours <= 10) categories['5to10Hours']++;
            else categories.over10Hours++;
        });

        return categories;
    }

    /**
     * Get top performing team members
     */
    async getTopPerformers(userIds, limit = 5) {
        const performers = await User.findAll({
            where: { id: { [Op.in]: userIds } },
            attributes: ['id', 'name', 'email', 'profile_picture_url'],
            include: [{
                model: Certificate,
                as: 'certificates',
                attributes: ['id']
            }],
            order: [[sequelize.literal('(SELECT COUNT(*) FROM certificates WHERE user_id = User.id)'), 'DESC']],
            limit
        });

        return performers.map(p => ({
            id: p.id,
            name: p.name,
            email: p.email,
            profilePicture: p.profile_picture_url,
            certificatesEarned: p.certificates?.length || 0
        }));
    }

    /**
     * Update user's department
     */
    async updateUserDepartment(userId, departmentId) {
        const user = await User.findByPk(userId);
        if (!user) return null;

        user.department_id = departmentId;
        await user.save();

        return user;
    }

    /**
     * Remove course assignment
     */
    async removeCourseAssignment(userId, courseId) {
        const result = await CourseAssignment.destroy({
            where: {
                user_id: userId,
                course_id: courseId
            }
        });

        return result > 0;
    }
}

module.exports = new TeamService();