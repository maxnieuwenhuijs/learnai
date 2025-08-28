const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const {
    User,
    Course,
    CourseAssignment,
    UserProgress,
    Certificate,
    Department,
    Company,
    Lesson,
    Module
} = require('../models');

class ReportService {
    /**
     * Get EU AI Act compliance status
     */
    async getComplianceStatus({ userId, userRole, companyId, departmentId, startDate, endDate }) {
        // Define compliance requirements
        const complianceRequirements = {
            mandatoryCourses: ['EU AI Act Fundamentals', 'AI Ethics & Compliance', 'Risk Management in AI'],
            minimumPassScore: 80,
            requiredCertifications: 2
        };

        let userFilter = {};
        
        // Build filter based on user role
        if (userRole === 'participant') {
            userFilter = { id: userId };
        } else if (userRole === 'manager') {
            userFilter = { department_id: departmentId };
        } else if (userRole === 'admin') {
            userFilter = { company_id: companyId };
        }
        // Super admin sees everything (no filter)

        // Get users for compliance check
        const users = await User.findAll({
            where: userFilter,
            attributes: ['id', 'name', 'email', 'department_id'],
            include: [{
                model: Department,
                as: 'department',
                attributes: ['name']
            }]
        });

        // Check compliance for each user
        const complianceData = await Promise.all(users.map(async (user) => {
            // Get mandatory course completions
            const mandatoryCompletions = await this.getMandatoryCourseCompletions(
                user.id,
                complianceRequirements.mandatoryCourses,
                startDate,
                endDate
            );

            // Get certifications
            const certifications = await Certificate.count({
                where: {
                    user_id: user.id,
                    ...(startDate && endDate && {
                        issued_date: { [Op.between]: [new Date(startDate), new Date(endDate)] }
                    })
                }
            });

            // Get average quiz scores
            const quizScores = await UserProgress.findAll({
                where: {
                    user_id: user.id,
                    quiz_score: { [Op.ne]: null }
                },
                attributes: [
                    [sequelize.fn('AVG', sequelize.col('quiz_score')), 'avgScore']
                ],
                raw: true
            });

            const avgScore = parseFloat(quizScores[0]?.avgScore || 0);

            // Calculate compliance status
            const isCompliant = 
                mandatoryCompletions.completed === mandatoryCompletions.total &&
                certifications >= complianceRequirements.requiredCertifications &&
                avgScore >= complianceRequirements.minimumPassScore;

            return {
                userId: user.id,
                name: user.name,
                email: user.email,
                department: user.department?.name || 'N/A',
                complianceStatus: isCompliant ? 'Compliant' : 'Non-Compliant',
                details: {
                    mandatoryCourses: {
                        completed: mandatoryCompletions.completed,
                        total: mandatoryCompletions.total,
                        courses: mandatoryCompletions.courses
                    },
                    certifications: {
                        earned: certifications,
                        required: complianceRequirements.requiredCertifications
                    },
                    averageQuizScore: Math.round(avgScore),
                    minimumRequired: complianceRequirements.minimumPassScore
                }
            };
        }));

        // Calculate overall compliance rate
        const compliantUsers = complianceData.filter(u => u.complianceStatus === 'Compliant').length;
        const complianceRate = users.length > 0 
            ? Math.round((compliantUsers / users.length) * 100)
            : 0;

        return {
            summary: {
                totalUsers: users.length,
                compliantUsers,
                nonCompliantUsers: users.length - compliantUsers,
                complianceRate
            },
            requirements: complianceRequirements,
            users: complianceData
        };
    }

    /**
     * Get mandatory course completions for a user
     */
    async getMandatoryCourseCompletions(userId, mandatoryCourses, startDate, endDate) {
        const courseData = await Promise.all(mandatoryCourses.map(async (courseTitle) => {
            // Find the course
            const course = await Course.findOne({
                where: { title: courseTitle }
            });

            if (!course) {
                return {
                    title: courseTitle,
                    status: 'Not Available',
                    completed: false
                };
            }

            // Check if user has completed this course
            const certificate = await Certificate.findOne({
                where: {
                    user_id: userId,
                    course_id: course.id,
                    ...(startDate && endDate && {
                        issued_date: { [Op.between]: [new Date(startDate), new Date(endDate)] }
                    })
                }
            });

            return {
                title: courseTitle,
                status: certificate ? 'Completed' : 'Incomplete',
                completed: !!certificate,
                completionDate: certificate?.issued_date || null
            };
        }));

        return {
            completed: courseData.filter(c => c.completed).length,
            total: mandatoryCourses.length,
            courses: courseData
        };
    }

    /**
     * Get department analytics
     */
    async getDepartmentAnalytics({ companyId, departmentId, period }) {
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        switch (period) {
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(startDate.getDate() - 90);
                break;
            default:
                startDate.setDate(startDate.getDate() - 30);
        }

        // Get departments to analyze
        let departmentFilter = { company_id: companyId };
        if (departmentId) {
            departmentFilter.id = departmentId;
        }

        const departments = await Department.findAll({
            where: departmentFilter,
            include: [{
                model: User,
                as: 'users',
                attributes: ['id']
            }]
        });

        // Analyze each department
        const departmentAnalytics = await Promise.all(departments.map(async (dept) => {
            const userIds = dept.users.map(u => u.id);

            if (userIds.length === 0) {
                return {
                    departmentId: dept.id,
                    departmentName: dept.name,
                    metrics: {
                        totalUsers: 0,
                        activeUsers: 0,
                        coursesCompleted: 0,
                        averageProgress: 0,
                        totalLearningTime: 0
                    }
                };
            }

            // Get active users
            const activeUsers = await UserProgress.count({
                where: {
                    user_id: { [Op.in]: userIds },
                    last_accessed: { [Op.gte]: startDate }
                },
                distinct: true,
                col: 'user_id'
            });

            // Get courses completed
            const coursesCompleted = await Certificate.count({
                where: {
                    user_id: { [Op.in]: userIds },
                    issued_date: { [Op.gte]: startDate }
                }
            });

            // Get average progress
            const progressData = await UserProgress.findAll({
                where: { user_id: { [Op.in]: userIds } },
                attributes: [
                    [sequelize.fn('AVG', sequelize.col('progress_percentage')), 'avgProgress'],
                    [sequelize.fn('SUM', sequelize.col('time_spent')), 'totalTime']
                ],
                raw: true
            });

            return {
                departmentId: dept.id,
                departmentName: dept.name,
                metrics: {
                    totalUsers: userIds.length,
                    activeUsers,
                    coursesCompleted,
                    averageProgress: Math.round(progressData[0]?.avgProgress || 0),
                    totalLearningTime: progressData[0]?.totalTime || 0,
                    activityRate: userIds.length > 0 
                        ? Math.round((activeUsers / userIds.length) * 100)
                        : 0
                }
            };
        }));

        // Calculate company-wide metrics
        const companyMetrics = {
            totalDepartments: departments.length,
            totalUsers: departmentAnalytics.reduce((sum, d) => sum + d.metrics.totalUsers, 0),
            totalActiveUsers: departmentAnalytics.reduce((sum, d) => sum + d.metrics.activeUsers, 0),
            totalCoursesCompleted: departmentAnalytics.reduce((sum, d) => sum + d.metrics.coursesCompleted, 0),
            averageProgress: departmentAnalytics.length > 0
                ? Math.round(
                    departmentAnalytics.reduce((sum, d) => sum + d.metrics.averageProgress, 0) / 
                    departmentAnalytics.length
                )
                : 0
        };

        return {
            period,
            companyMetrics,
            departments: departmentAnalytics,
            topPerformingDepartment: this.getTopPerformingDepartment(departmentAnalytics)
        };
    }

    /**
     * Identify top performing department
     */
    getTopPerformingDepartment(departmentAnalytics) {
        if (departmentAnalytics.length === 0) return null;

        return departmentAnalytics.reduce((best, current) => {
            const currentScore = 
                current.metrics.activityRate * 0.3 +
                current.metrics.averageProgress * 0.4 +
                (current.metrics.coursesCompleted / Math.max(current.metrics.totalUsers, 1)) * 100 * 0.3;
            
            const bestScore = 
                best.metrics.activityRate * 0.3 +
                best.metrics.averageProgress * 0.4 +
                (best.metrics.coursesCompleted / Math.max(best.metrics.totalUsers, 1)) * 100 * 0.3;

            return currentScore > bestScore ? current : best;
        });
    }

    /**
     * Generate report data based on type
     */
    async generateReport({ reportType, userRole, userId, companyId, departmentId, filters }) {
        switch (reportType) {
            case 'compliance':
                return await this.getComplianceStatus({
                    userId,
                    userRole,
                    companyId,
                    departmentId,
                    ...filters
                });

            case 'team':
                return await this.getTeamProgressReport({
                    userRole,
                    companyId,
                    departmentId,
                    ...filters
                });

            case 'department':
                return await this.getDepartmentAnalytics({
                    companyId,
                    departmentId,
                    period: filters.period || '30d'
                });

            case 'individual':
                return await this.getIndividualProgressReport(userId, filters);

            default:
                throw new Error(`Unknown report type: ${reportType}`);
        }
    }

    /**
     * Get team progress report
     */
    async getTeamProgressReport({ userRole, companyId, departmentId, startDate, endDate }) {
        let userFilter = {};
        
        if (userRole === 'manager') {
            userFilter = { department_id: departmentId };
        } else if (userRole === 'admin') {
            userFilter = { company_id: companyId };
        }

        const users = await User.findAll({
            where: userFilter,
            attributes: ['id', 'name', 'email']
        });

        const teamData = await Promise.all(users.map(async (user) => {
            const progressRecords = await UserProgress.findAll({
                where: {
                    user_id: user.id,
                    ...(startDate && endDate && {
                        last_accessed: { [Op.between]: [new Date(startDate), new Date(endDate)] }
                    })
                },
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('id')), 'totalLessons'],
                    [sequelize.fn('SUM', sequelize.literal('CASE WHEN completed = true THEN 1 ELSE 0 END')), 'completedLessons'],
                    [sequelize.fn('SUM', sequelize.col('time_spent')), 'totalTime'],
                    [sequelize.fn('AVG', sequelize.col('quiz_score')), 'avgQuizScore']
                ],
                raw: true
            });

            const stats = progressRecords[0] || {};
            
            return {
                userId: user.id,
                name: user.name,
                email: user.email,
                progress: {
                    totalLessons: parseInt(stats.totalLessons || 0),
                    completedLessons: parseInt(stats.completedLessons || 0),
                    completionRate: stats.totalLessons > 0
                        ? Math.round((stats.completedLessons / stats.totalLessons) * 100)
                        : 0,
                    totalTimeSpent: stats.totalTime || 0,
                    averageQuizScore: Math.round(stats.avgQuizScore || 0)
                }
            };
        }));

        return {
            reportDate: new Date(),
            period: { startDate, endDate },
            teamSize: users.length,
            teamMembers: teamData
        };
    }

    /**
     * Get individual progress report
     */
    async getIndividualProgressReport(userId, filters) {
        const user = await User.findByPk(userId, {
            attributes: ['name', 'email'],
            include: [{
                model: Department,
                as: 'department',
                attributes: ['name']
            }]
        });

        // Get course assignments
        const assignments = await CourseAssignment.findAll({
            where: { user_id: userId },
            include: [{
                model: Course,
                as: 'course',
                attributes: ['id', 'title', 'description']
            }]
        });

        // Get progress for each course
        const courseProgress = await Promise.all(assignments.map(async (assignment) => {
            const lessons = await Lesson.findAll({
                include: [{
                    model: Module,
                    as: 'module',
                    where: { course_id: assignment.course_id },
                    attributes: []
                }],
                attributes: ['id', 'title']
            });

            const progressData = await UserProgress.findAll({
                where: {
                    user_id: userId,
                    lesson_id: { [Op.in]: lessons.map(l => l.id) }
                },
                attributes: ['lesson_id', 'completed', 'quiz_score', 'time_spent']
            });

            const completedLessons = progressData.filter(p => p.completed).length;

            return {
                courseId: assignment.course_id,
                courseTitle: assignment.course.title,
                totalLessons: lessons.length,
                completedLessons,
                progressPercentage: lessons.length > 0
                    ? Math.round((completedLessons / lessons.length) * 100)
                    : 0,
                status: completedLessons === lessons.length ? 'Completed' : 'In Progress',
                lessons: lessons.map(lesson => {
                    const progress = progressData.find(p => p.lesson_id === lesson.id);
                    return {
                        lessonId: lesson.id,
                        lessonTitle: lesson.title,
                        completed: progress?.completed || false,
                        quizScore: progress?.quiz_score || null,
                        timeSpent: progress?.time_spent || 0
                    };
                })
            };
        }));

        // Get certificates
        const certificates = await Certificate.findAll({
            where: { user_id: userId },
            include: [{
                model: Course,
                as: 'course',
                attributes: ['title']
            }],
            attributes: ['certificate_number', 'issued_date']
        });

        return {
            user: {
                name: user.name,
                email: user.email,
                department: user.department?.name || 'N/A'
            },
            courses: courseProgress,
            certificates: certificates.map(cert => ({
                courseTitle: cert.course.title,
                certificateNumber: cert.certificate_number,
                issuedDate: cert.issued_date
            })),
            summary: {
                totalCourses: assignments.length,
                completedCourses: courseProgress.filter(c => c.status === 'Completed').length,
                totalCertificates: certificates.length,
                overallProgress: assignments.length > 0
                    ? Math.round(
                        courseProgress.reduce((sum, c) => sum + c.progressPercentage, 0) / 
                        assignments.length
                    )
                    : 0
            }
        };
    }

    /**
     * Export report in various formats
     */
    async exportReport({ data, format, reportType }) {
        switch (format) {
            case 'pdf':
                return this.exportToPDF(data, reportType);
            case 'csv':
                return this.exportToCSV(data, reportType);
            case 'excel':
                return this.exportToExcel(data, reportType);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Export to PDF
     */
    async exportToPDF(data, reportType) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // Header
            doc.fontSize(20).text(`${reportType.toUpperCase()} REPORT`, { align: 'center' });
            doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown();

            // Add content based on report type
            switch (reportType) {
                case 'compliance':
                    this.addComplianceToPDF(doc, data);
                    break;
                case 'team':
                    this.addTeamProgressToPDF(doc, data);
                    break;
                case 'department':
                    this.addDepartmentAnalyticsToPDF(doc, data);
                    break;
                default:
                    doc.text(JSON.stringify(data, null, 2));
            }

            doc.end();
        });
    }

    /**
     * Add compliance data to PDF
     */
    addComplianceToPDF(doc, data) {
        // Summary
        doc.fontSize(14).text('COMPLIANCE SUMMARY', { underline: true });
        doc.fontSize(10);
        doc.text(`Total Users: ${data.summary.totalUsers}`);
        doc.text(`Compliant Users: ${data.summary.compliantUsers}`);
        doc.text(`Compliance Rate: ${data.summary.complianceRate}%`);
        doc.moveDown();

        // Requirements
        doc.fontSize(14).text('COMPLIANCE REQUIREMENTS', { underline: true });
        doc.fontSize(10);
        doc.text(`Mandatory Courses: ${data.requirements.mandatoryCourses.join(', ')}`);
        doc.text(`Minimum Pass Score: ${data.requirements.minimumPassScore}%`);
        doc.text(`Required Certifications: ${data.requirements.requiredCertifications}`);
        doc.moveDown();

        // User Details
        doc.fontSize(14).text('USER COMPLIANCE STATUS', { underline: true });
        doc.fontSize(10);
        data.users.forEach(user => {
            doc.text(`${user.name} (${user.email})`);
            doc.text(`  Status: ${user.complianceStatus}`);
            doc.text(`  Department: ${user.department}`);
            doc.text(`  Mandatory Courses: ${user.details.mandatoryCourses.completed}/${user.details.mandatoryCourses.total}`);
            doc.text(`  Certifications: ${user.details.certifications.earned}/${user.details.certifications.required}`);
            doc.text(`  Average Quiz Score: ${user.details.averageQuizScore}%`);
            doc.moveDown(0.5);
        });
    }

    /**
     * Add team progress to PDF
     */
    addTeamProgressToPDF(doc, data) {
        doc.fontSize(14).text('TEAM OVERVIEW', { underline: true });
        doc.fontSize(10);
        doc.text(`Report Date: ${new Date(data.reportDate).toLocaleDateString()}`);
        doc.text(`Team Size: ${data.teamSize}`);
        doc.moveDown();

        doc.fontSize(14).text('TEAM MEMBER PROGRESS', { underline: true });
        doc.fontSize(10);
        data.teamMembers.forEach(member => {
            doc.text(`${member.name} (${member.email})`);
            doc.text(`  Completed: ${member.progress.completedLessons}/${member.progress.totalLessons} lessons`);
            doc.text(`  Completion Rate: ${member.progress.completionRate}%`);
            doc.text(`  Time Spent: ${Math.round(member.progress.totalTimeSpent / 60)} minutes`);
            doc.text(`  Average Quiz Score: ${member.progress.averageQuizScore}%`);
            doc.moveDown(0.5);
        });
    }

    /**
     * Add department analytics to PDF
     */
    addDepartmentAnalyticsToPDF(doc, data) {
        doc.fontSize(14).text('COMPANY METRICS', { underline: true });
        doc.fontSize(10);
        doc.text(`Period: ${data.period}`);
        doc.text(`Total Departments: ${data.companyMetrics.totalDepartments}`);
        doc.text(`Total Users: ${data.companyMetrics.totalUsers}`);
        doc.text(`Active Users: ${data.companyMetrics.totalActiveUsers}`);
        doc.text(`Courses Completed: ${data.companyMetrics.totalCoursesCompleted}`);
        doc.text(`Average Progress: ${data.companyMetrics.averageProgress}%`);
        doc.moveDown();

        doc.fontSize(14).text('DEPARTMENT BREAKDOWN', { underline: true });
        doc.fontSize(10);
        data.departments.forEach(dept => {
            doc.text(`${dept.departmentName}`);
            doc.text(`  Users: ${dept.metrics.totalUsers}`);
            doc.text(`  Active: ${dept.metrics.activeUsers} (${dept.metrics.activityRate}%)`);
            doc.text(`  Courses Completed: ${dept.metrics.coursesCompleted}`);
            doc.text(`  Average Progress: ${dept.metrics.averageProgress}%`);
            doc.moveDown(0.5);
        });

        if (data.topPerformingDepartment) {
            doc.fontSize(14).text('TOP PERFORMING DEPARTMENT', { underline: true });
            doc.fontSize(10);
            doc.text(data.topPerformingDepartment.departmentName);
        }
    }

    /**
     * Export to CSV
     */
    async exportToCSV(data, reportType) {
        let csvContent = '';

        switch (reportType) {
            case 'compliance':
                csvContent = this.complianceToCSV(data);
                break;
            case 'team':
                csvContent = this.teamProgressToCSV(data);
                break;
            case 'department':
                csvContent = this.departmentAnalyticsToCSV(data);
                break;
            default:
                csvContent = 'No data available';
        }

        return Buffer.from(csvContent, 'utf-8');
    }

    /**
     * Convert compliance data to CSV
     */
    complianceToCSV(data) {
        let csv = 'Name,Email,Department,Status,Mandatory Courses,Certifications,Quiz Score\n';
        
        data.users.forEach(user => {
            csv += `"${user.name}","${user.email}","${user.department}","${user.complianceStatus}",`;
            csv += `"${user.details.mandatoryCourses.completed}/${user.details.mandatoryCourses.total}",`;
            csv += `"${user.details.certifications.earned}/${user.details.certifications.required}",`;
            csv += `"${user.details.averageQuizScore}%"\n`;
        });

        return csv;
    }

    /**
     * Convert team progress to CSV
     */
    teamProgressToCSV(data) {
        let csv = 'Name,Email,Completed Lessons,Total Lessons,Completion Rate,Time Spent (min),Avg Quiz Score\n';
        
        data.teamMembers.forEach(member => {
            csv += `"${member.name}","${member.email}",`;
            csv += `${member.progress.completedLessons},${member.progress.totalLessons},`;
            csv += `${member.progress.completionRate}%,`;
            csv += `${Math.round(member.progress.totalTimeSpent / 60)},`;
            csv += `${member.progress.averageQuizScore}%\n`;
        });

        return csv;
    }

    /**
     * Convert department analytics to CSV
     */
    departmentAnalyticsToCSV(data) {
        let csv = 'Department,Total Users,Active Users,Activity Rate,Courses Completed,Avg Progress\n';
        
        data.departments.forEach(dept => {
            csv += `"${dept.departmentName}",${dept.metrics.totalUsers},`;
            csv += `${dept.metrics.activeUsers},${dept.metrics.activityRate}%,`;
            csv += `${dept.metrics.coursesCompleted},${dept.metrics.averageProgress}%\n`;
        });

        return csv;
    }

    /**
     * Export to Excel
     */
    async exportToExcel(data, reportType) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(reportType);

        switch (reportType) {
            case 'compliance':
                this.addComplianceToExcel(worksheet, data);
                break;
            case 'team':
                this.addTeamProgressToExcel(worksheet, data);
                break;
            case 'department':
                this.addDepartmentAnalyticsToExcel(worksheet, data);
                break;
        }

        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    }

    /**
     * Add compliance data to Excel
     */
    addComplianceToExcel(worksheet, data) {
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Department', key: 'department', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Mandatory Courses', key: 'courses', width: 20 },
            { header: 'Certifications', key: 'certs', width: 15 },
            { header: 'Quiz Score', key: 'quiz', width: 12 }
        ];

        data.users.forEach(user => {
            worksheet.addRow({
                name: user.name,
                email: user.email,
                department: user.department,
                status: user.complianceStatus,
                courses: `${user.details.mandatoryCourses.completed}/${user.details.mandatoryCourses.total}`,
                certs: `${user.details.certifications.earned}/${user.details.certifications.required}`,
                quiz: `${user.details.averageQuizScore}%`
            });
        });
    }

    /**
     * Add team progress to Excel
     */
    addTeamProgressToExcel(worksheet, data) {
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Completed', key: 'completed', width: 12 },
            { header: 'Total', key: 'total', width: 10 },
            { header: 'Rate', key: 'rate', width: 10 },
            { header: 'Time (min)', key: 'time', width: 12 },
            { header: 'Quiz Score', key: 'quiz', width: 12 }
        ];

        data.teamMembers.forEach(member => {
            worksheet.addRow({
                name: member.name,
                email: member.email,
                completed: member.progress.completedLessons,
                total: member.progress.totalLessons,
                rate: `${member.progress.completionRate}%`,
                time: Math.round(member.progress.totalTimeSpent / 60),
                quiz: `${member.progress.averageQuizScore}%`
            });
        });
    }

    /**
     * Add department analytics to Excel
     */
    addDepartmentAnalyticsToExcel(worksheet, data) {
        worksheet.columns = [
            { header: 'Department', key: 'dept', width: 25 },
            { header: 'Total Users', key: 'total', width: 12 },
            { header: 'Active Users', key: 'active', width: 12 },
            { header: 'Activity Rate', key: 'rate', width: 12 },
            { header: 'Courses Completed', key: 'courses', width: 18 },
            { header: 'Avg Progress', key: 'progress', width: 12 }
        ];

        data.departments.forEach(dept => {
            worksheet.addRow({
                dept: dept.departmentName,
                total: dept.metrics.totalUsers,
                active: dept.metrics.activeUsers,
                rate: `${dept.metrics.activityRate}%`,
                courses: dept.metrics.coursesCompleted,
                progress: `${dept.metrics.averageProgress}%`
            });
        });
    }

    /**
     * Get dashboard statistics
     */
    async getDashboardStats({ userId, userRole, companyId, departmentId, period }) {
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        const periodDays = {
            '24h': 1,
            '7d': 7,
            '30d': 30,
            '90d': 90
        };
        startDate.setDate(startDate.getDate() - (periodDays[period] || 7));

        // Base stats for all users
        const baseStats = await this.getUserDashboardStats(userId, startDate, endDate);

        // Additional stats based on role
        let roleSpecificStats = {};

        if (userRole === 'manager' || userRole === 'admin' || userRole === 'super_admin') {
            roleSpecificStats = await this.getManagerDashboardStats(
                userRole,
                companyId,
                departmentId,
                startDate,
                endDate
            );
        }

        if (userRole === 'admin' || userRole === 'super_admin') {
            roleSpecificStats.companyStats = await this.getCompanyDashboardStats(
                companyId,
                startDate,
                endDate
            );
        }

        return {
            period,
            personal: baseStats,
            ...roleSpecificStats
        };
    }

    /**
     * Get user dashboard statistics
     */
    async getUserDashboardStats(userId, startDate, endDate) {
        // Get active courses
        const activeCourses = await CourseAssignment.count({
            where: {
                user_id: userId,
                status: { [Op.in]: ['assigned', 'in_progress'] }
            }
        });

        // Get completed courses
        const completedCourses = await Certificate.count({
            where: { user_id: userId }
        });

        // Get recent activity
        const recentActivity = await UserProgress.count({
            where: {
                user_id: userId,
                last_accessed: { [Op.gte]: startDate }
            }
        });

        // Get total learning time in period
        const learningTime = await UserProgress.sum('time_spent', {
            where: {
                user_id: userId,
                last_accessed: { [Op.gte]: startDate }
            }
        });

        // Get upcoming deadlines
        const upcomingDeadlines = await CourseAssignment.findAll({
            where: {
                user_id: userId,
                due_date: { 
                    [Op.gte]: new Date(),
                    [Op.lte]: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                },
                status: { [Op.ne]: 'completed' }
            },
            include: [{
                model: Course,
                as: 'course',
                attributes: ['title']
            }],
            limit: 5,
            order: [['due_date', 'ASC']]
        });

        return {
            activeCourses,
            completedCourses,
            recentActivity,
            learningTimeMinutes: Math.round((learningTime || 0) / 60),
            upcomingDeadlines: upcomingDeadlines.map(d => ({
                courseTitle: d.course.title,
                dueDate: d.due_date
            }))
        };
    }

    /**
     * Get manager dashboard statistics
     */
    async getManagerDashboardStats(role, companyId, departmentId, startDate, endDate) {
        let userFilter = {};
        
        if (role === 'manager') {
            userFilter = { department_id: departmentId };
        } else if (role === 'admin') {
            userFilter = { company_id: companyId };
        }

        // Get team size
        const teamSize = await User.count({ where: userFilter });

        // Get active team members
        const activeMembers = await UserProgress.count({
            where: {
                last_accessed: { [Op.gte]: startDate }
            },
            include: [{
                model: User,
                as: 'user',
                where: userFilter,
                attributes: []
            }],
            distinct: true,
            col: 'user_id'
        });

        // Get team completion rate
        const teamAssignments = await CourseAssignment.count({
            include: [{
                model: User,
                as: 'user',
                where: userFilter,
                attributes: []
            }]
        });

        const teamCompletions = await Certificate.count({
            where: {
                issued_date: { [Op.gte]: startDate }
            },
            include: [{
                model: User,
                as: 'user',
                where: userFilter,
                attributes: []
            }]
        });

        const completionRate = teamAssignments > 0
            ? Math.round((teamCompletions / teamAssignments) * 100)
            : 0;

        return {
            team: {
                size: teamSize,
                activeMembers,
                completionRate,
                recentCompletions: teamCompletions
            }
        };
    }

    /**
     * Get company dashboard statistics
     */
    async getCompanyDashboardStats(companyId, startDate, endDate) {
        // Get total departments
        const totalDepartments = await Department.count({
            where: { company_id: companyId }
        });

        // Get total employees
        const totalEmployees = await User.count({
            where: { company_id: companyId }
        });

        // Get compliance rate
        const compliantUsers = await this.getComplianceStatus({
            userRole: 'admin',
            companyId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });

        return {
            departments: totalDepartments,
            employees: totalEmployees,
            complianceRate: compliantUsers.summary.complianceRate
        };
    }
}

module.exports = new ReportService();