const { Prompt, PromptUsage, PromptCategory, User, Company, Department } = require('../../models');
const { Op } = require('sequelize');

// Get analytics data for prompts
const getPromptAnalytics = async (req, res) => {
    try {
        const { company_id, department_id, start_date, end_date, period = '30d' } = req.query;
        const user = req.user;

        // Set default date range based on period
        let dateRange = {};
        const now = new Date();

        switch (period) {
            case '7d':
                dateRange.start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                dateRange.start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                dateRange.start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                dateRange.start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                dateRange.start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        dateRange.end = now;

        // Override with custom dates if provided
        if (start_date) dateRange.start = new Date(start_date);
        if (end_date) dateRange.end = new Date(end_date);

        // Build where clause for company/department filtering
        const whereClause = {};
        if (company_id) whereClause.company_id = company_id;
        if (department_id) whereClause.department_id = department_id;

        // If user is not super admin, filter by their company
        if (user.role !== 'super_admin' && user.company_id) {
            whereClause.company_id = user.company_id;
        }

        // Get basic stats
        const totalPrompts = await Prompt.count({ where: whereClause });
        const totalTemplates = await Prompt.count({
            where: { ...whereClause, is_template: true }
        });
        const totalCompanyPrompts = await Prompt.count({
            where: { ...whereClause, is_company_prompt: true }
        });

        // Get usage stats
        const usageStats = await PromptUsage.findAll({
            where: {
                used_at: {
                    [Op.between]: [dateRange.start, dateRange.end]
                }
            },
            include: [{
                model: Prompt,
                as: 'prompt',
                where: whereClause,
                include: [{
                    model: PromptCategory,
                    as: 'category',
                    attributes: ['name', 'color', 'icon']
                }]
            }, {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }]
        });

        // Calculate usage metrics
        const totalUsage = usageStats.length;
        const uniqueUsers = new Set(usageStats.map(u => u.user_id)).size;
        const uniquePrompts = new Set(usageStats.map(u => u.prompt_id)).size;

        // Get daily usage data for charts
        const dailyUsage = {};
        usageStats.forEach(usage => {
            const date = usage.used_at.toISOString().split('T')[0];
            if (!dailyUsage[date]) {
                dailyUsage[date] = 0;
            }
            dailyUsage[date]++;
        });

        // Convert to array and fill missing dates
        const dailyUsageArray = [];
        const currentDate = new Date(dateRange.start);
        while (currentDate <= dateRange.end) {
            const dateStr = currentDate.toISOString().split('T')[0];
            dailyUsageArray.push({
                date: dateStr,
                usage: dailyUsage[dateStr] || 0
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Get top prompts by usage
        const promptUsageCount = {};
        usageStats.forEach(usage => {
            const promptId = usage.prompt_id;
            if (!promptUsageCount[promptId]) {
                promptUsageCount[promptId] = {
                    prompt: usage.prompt,
                    count: 0
                };
            }
            promptUsageCount[promptId].count++;
        });

        const topPrompts = Object.values(promptUsageCount)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Get usage by category
        const categoryUsage = {};
        usageStats.forEach(usage => {
            const categoryName = usage.prompt.category?.name || 'Uncategorized';
            if (!categoryUsage[categoryName]) {
                categoryUsage[categoryName] = {
                    name: categoryName,
                    count: 0,
                    color: usage.prompt.category?.color || '#6366f1'
                };
            }
            categoryUsage[categoryName].count++;
        });

        const categoryUsageArray = Object.values(categoryUsage)
            .sort((a, b) => b.count - a.count);

        // Get usage by user
        const userUsage = {};
        usageStats.forEach(usage => {
            const userId = usage.user_id;
            if (!userUsage[userId]) {
                userUsage[userId] = {
                    user: usage.user,
                    count: 0
                };
            }
            userUsage[userId].count++;
        });

        const topUsers = Object.values(userUsage)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Get recent activity
        const recentActivity = usageStats
            .sort((a, b) => new Date(b.used_at) - new Date(a.used_at))
            .slice(0, 20)
            .map(usage => ({
                id: usage.id,
                prompt_title: usage.prompt.title,
                user_name: usage.user.name,
                used_at: usage.used_at,
                context: usage.context
            }));

        // Calculate growth metrics
        const previousPeriodStart = new Date(dateRange.start.getTime() - (dateRange.end.getTime() - dateRange.start.getTime()));
        const previousPeriodUsage = await PromptUsage.count({
            where: {
                used_at: {
                    [Op.between]: [previousPeriodStart, dateRange.start]
                }
            },
            include: [{
                model: Prompt,
                as: 'prompt',
                where: whereClause
            }]
        });

        const usageGrowth = previousPeriodUsage > 0
            ? ((totalUsage - previousPeriodUsage) / previousPeriodUsage * 100)
            : totalUsage > 0 ? 100 : 0;

        res.json({
            success: true,
            data: {
                overview: {
                    totalPrompts,
                    totalTemplates,
                    totalCompanyPrompts,
                    totalUsage,
                    uniqueUsers,
                    uniquePrompts,
                    usageGrowth: Math.round(usageGrowth * 100) / 100
                },
                charts: {
                    dailyUsage: dailyUsageArray,
                    categoryUsage: categoryUsageArray
                },
                topPrompts,
                topUsers,
                recentActivity,
                dateRange: {
                    start: dateRange.start,
                    end: dateRange.end
                }
            }
        });
    } catch (error) {
        console.error('Error getting prompt analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics data',
            error: error.message
        });
    }
};

// Get company-level analytics
const getCompanyAnalytics = async (req, res) => {
    try {
        const { start_date, end_date, period = '30d' } = req.query;
        const user = req.user;

        // Set default date range
        let dateRange = {};
        const now = new Date();

        switch (period) {
            case '7d':
                dateRange.start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                dateRange.start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                dateRange.start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                dateRange.start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                dateRange.start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        dateRange.end = now;

        if (start_date) dateRange.start = new Date(start_date);
        if (end_date) dateRange.end = new Date(end_date);

        // Get company data
        const companies = await Company.findAll({
            attributes: ['id', 'name', 'created_at'],
            include: [{
                model: Department,
                as: 'departments',
                attributes: ['id', 'name']
            }]
        });

        // Get usage by company
        const companyUsage = {};
        for (const company of companies) {
            const usage = await PromptUsage.count({
                where: {
                    used_at: {
                        [Op.between]: [dateRange.start, dateRange.end]
                    }
                },
                include: [{
                    model: Prompt,
                    as: 'prompt',
                    where: { company_id: company.id }
                }]
            });

            companyUsage[company.id] = {
                company: company,
                usage: usage
            };
        }

        const companyUsageArray = Object.values(companyUsage)
            .sort((a, b) => b.usage - a.usage);

        // Get department usage
        const departmentUsage = {};
        for (const company of companies) {
            for (const department of company.departments) {
                const usage = await PromptUsage.count({
                    where: {
                        used_at: {
                            [Op.between]: [dateRange.start, dateRange.end]
                        }
                    },
                    include: [{
                        model: Prompt,
                        as: 'prompt',
                        where: {
                            company_id: company.id,
                            department_id: department.id
                        }
                    }]
                });

                if (usage > 0) {
                    departmentUsage[department.id] = {
                        department: department,
                        company: company,
                        usage: usage
                    };
                }
            }
        }

        const departmentUsageArray = Object.values(departmentUsage)
            .sort((a, b) => b.usage - a.usage);

        res.json({
            success: true,
            data: {
                companyUsage: companyUsageArray,
                departmentUsage: departmentUsageArray,
                dateRange: {
                    start: dateRange.start,
                    end: dateRange.end
                }
            }
        });
    } catch (error) {
        console.error('Error getting company analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching company analytics',
            error: error.message
        });
    }
};

module.exports = {
    getPromptAnalytics,
    getCompanyAnalytics
};
