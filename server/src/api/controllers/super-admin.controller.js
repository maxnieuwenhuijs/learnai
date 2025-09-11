const { User, Company, Department, Course, UserProgress, Prompt, PromptCategory, PromptVersion, PromptApproval, PromptUsage, AuditLog, Certificate } = require('../../models');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const auditLogger = require('../../middleware/audit.middleware');
const systemMonitoring = require('../../services/system-monitoring.service');
const { processCompanyLogo, deleteCompanyLogo, validateImageSpecs } = require('../../services/file-upload.service');

// Get all companies
const getCompanies = async (req, res) => {
    try {
        // Simple query first to test basic functionality
        const companies = await Company.findAll({
            order: [['created_at', 'DESC']]
        });

        // Return basic company data without complex relationships for now
        const companiesData = companies.map(company => ({
            id: company.id,
            name: company.name,
            industry: company.industry,
            country: company.country,
            size: company.size,
            description: company.description,
            status: company.status,
            created_at: company.created_at,
            user_count: 0, // Default for now
            course_count: 0, // Default for now
            admin_email: null, // Default for now
            last_activity: company.created_at,
            logo_url: company.logo_url,
            logo_filename: company.logo_filename
        }));

        res.json({
            success: true,
            companies: companiesData
        });
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching companies'
        });
    }
};

// Create new company with admin user
const createCompany = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const {
            name,
            industry,
            country,
            size,
            description,
            admin_name,
            admin_email,
            admin_password
        } = req.body;

        // Check if company name already exists
        const existingCompany = await Company.findOne({ where: { name } });
        if (existingCompany) {
            return res.status(400).json({
                success: false,
                message: 'Company with this name already exists'
            });
        }

        // Check if admin email already exists
        const existingUser = await User.findOne({ where: { email: admin_email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create company first (without logo)
        const company = await Company.create({
            name,
            industry,
            country,
            size,
            description,
            status: 'active'
        });

        // Process logo if uploaded
        let logoData = null;
        if (req.file) {
            try {
                // Validate image specs
                const validation = await validateImageSpecs(req.file.buffer);
                if (!validation.valid) {
                    // Delete the company if logo processing fails
                    await company.destroy();
                    return res.status(400).json({
                        success: false,
                        message: validation.error || 'Invalid logo image'
                    });
                }

                // Process and save logo
                logoData = await processCompanyLogo(req.file.buffer, req.file.originalname, company.id);

                // Update company with logo information
                await company.update({
                    logo_url: logoData.url,
                    logo_filename: logoData.filename
                });
            } catch (logoError) {
                console.error('Error processing company logo:', logoError);
                // Delete the company if logo processing fails
                await company.destroy();
                return res.status(400).json({
                    success: false,
                    message: 'Failed to process company logo. Please try again with a different image.'
                });
            }
        }

        // Create default departments
        const defaultDepartments = [
            { name: 'Management', company_id: company.id },
            { name: 'HR', company_id: company.id },
            { name: 'IT', company_id: company.id },
            { name: 'General', company_id: company.id }
        ];

        const departments = await Department.bulkCreate(defaultDepartments);
        const hrDepartment = departments.find(d => d.name === 'HR');

        // Create admin user
        const adminUser = await User.create({
            company_id: company.id,
            department_id: hrDepartment.id,
            email: admin_email,
            name: admin_name,
            password_hash: admin_password, // Will be hashed by model hook
            role: 'admin'
        });

        // Log company creation
        await auditLogger.logCompanyCreated(req.user.id, company, req);

        res.status(201).json({
            success: true,
            message: 'Company and admin user created successfully',
            company: {
                id: company.id,
                name: company.name,
                admin_user_id: adminUser.id,
                logo_url: company.logo_url,
                logo_filename: company.logo_filename,
                logo_specs: logoData ? {
                    width: logoData.width,
                    height: logoData.height,
                    size: logoData.size,
                    format: logoData.format,
                    thumbnail_url: logoData.thumbnailUrl
                } : null
            }
        });
    } catch (error) {
        console.error('Error creating company:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating company',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update company
const updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, industry, country, size, description } = req.body;

        const company = await Company.findByPk(id);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        await company.update({
            name,
            industry,
            country,
            size,
            description
        });

        res.json({
            success: true,
            message: 'Company updated successfully',
            company: company
        });
    } catch (error) {
        console.error('Error updating company:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating company'
        });
    }
};

// Delete company (and all associated data)
const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;

        const company = await Company.findByPk(id);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Log company deletion before destroying
        await auditLogger.logCompanyDeleted(req.user.id, company, req);

        // Delete company (cascade will handle related data)
        await company.destroy();

        res.json({
            success: true,
            message: 'Company and all associated data deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting company:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting company',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Create any type of user for any company (Super Admin only)
const createUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const {
            name,
            email,
            password,
            role,
            company_id,
            department_id
        } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // If company_id is provided, verify company exists
        let company = null;
        if (company_id) {
            company = await Company.findByPk(company_id);
            if (!company) {
                return res.status(400).json({
                    success: false,
                    message: 'Company not found'
                });
            }

            // If department_id is provided, verify it belongs to the company
            if (department_id) {
                const department = await Department.findOne({
                    where: { id: department_id, company_id: company_id }
                });
                if (!department) {
                    return res.status(400).json({
                        success: false,
                        message: 'Department not found in this company'
                    });
                }
            }
        } else if (role !== 'super_admin') {
            // Non-super admin users must be assigned to a company
            return res.status(400).json({
                success: false,
                message: 'Company assignment is required for non-super admin users'
            });
        }

        // Create user
        const newUser = await User.create({
            company_id: company_id || null,
            department_id: department_id || null,
            email: email,
            name: name,
            password_hash: password, // Will be hashed by model hook
            role: role
        });

        // Log user creation
        await auditLogger.logUserCreated(req.user.id, newUser, req);

        res.status(201).json({
            success: true,
            message: `${role.charAt(0).toUpperCase() + role.slice(1)} user created successfully`,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                company_id: newUser.company_id,
                department_id: newUser.department_id,
                company_name: company?.name || null
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Create manager user for a company
const createCompanyManager = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { companyId } = req.params;
        const {
            name,
            email,
            password,
            department_id
        } = req.body;

        // Check if company exists
        const company = await Company.findByPk(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // If department_id is provided, verify it belongs to the company
        if (department_id) {
            const department = await Department.findOne({
                where: { id: department_id, company_id: companyId }
            });
            if (!department) {
                return res.status(400).json({
                    success: false,
                    message: 'Department not found in this company'
                });
            }
        }

        // Create manager user
        const managerUser = await User.create({
            company_id: companyId,
            department_id: department_id || null,
            email: email,
            name: name,
            password_hash: password, // Will be hashed by model hook
            role: 'manager'
        });

        // Log manager creation
        await auditLogger.logUserCreated(req.user.id, managerUser, req);

        res.status(201).json({
            success: true,
            message: 'Manager user created successfully',
            user: {
                id: managerUser.id,
                name: managerUser.name,
                email: managerUser.email,
                role: managerUser.role,
                company_id: managerUser.company_id,
                department_id: managerUser.department_id
            }
        });
    } catch (error) {
        console.error('Error creating manager user:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating manager user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get company details with full stats
const getCompanyDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Simple query without complex relationships
        const company = await Company.findByPk(id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Get basic statistics with simple queries
        let userCount = 0;
        let departmentCount = 0;
        let courseCount = 0;
        let users = [];
        let departments = [];

        try {
            userCount = await User.count({ where: { company_id: id } });
            users = await User.findAll({
                where: { company_id: id },
                attributes: ['id', 'name', 'email', 'role', 'created_at'],
                limit: 10
            });
        } catch (e) {
            console.log('Users query failed, using defaults');
        }

        try {
            departmentCount = await Department.count({ where: { company_id: id } });
            departments = await Department.findAll({
                where: { company_id: id },
                attributes: ['id', 'name']
            });
        } catch (e) {
            console.log('Departments query failed, using defaults');
        }

        try {
            courseCount = await Course.count({ where: { company_id: id } });
        } catch (e) {
            console.log('Courses query failed, using defaults');
        }

        res.json({
            success: true,
            company: {
                ...company.toJSON(),
                users: users,
                departments: departments,
                courses: [],
                stats: {
                    user_count: userCount,
                    department_count: departmentCount,
                    course_count: courseCount,
                    total_progress_records: 0,
                    completed_courses: 0,
                    completion_rate: 0
                }
            }
        });
    } catch (error) {
        console.error('Error fetching company details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching company details'
        });
    }
};

// Reset entire database (DANGER - only for development/testing)
const resetDatabase = async (req, res) => {
    try {
        // Only allow in development environment
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                success: false,
                message: 'Database reset is not allowed in production'
            });
        }

        // Log database reset action before performing it
        await auditLogger.logDatabaseReset(req.user.id, req);

        // Delete all data in correct order (respecting foreign key constraints)
        await Promise.all([
            UserProgress.destroy({ where: {} }),
            Certificate.destroy({ where: {} }),
            PromptUsage.destroy({ where: {} }),
            PromptApproval.destroy({ where: {} }),
            PromptVersion.destroy({ where: {} }),
            Prompt.destroy({ where: {} }),
            PromptCategory.destroy({ where: {} })
        ]);

        await User.destroy({ where: {} });
        await Course.destroy({ where: {} });
        await Department.destroy({ where: {} });
        await Company.destroy({ where: {} });

        // Clear audit logs except for this reset action
        const resetLogId = await AuditLog.max('id');
        await AuditLog.destroy({
            where: {
                id: { [Op.lt]: resetLogId }
            }
        });

        res.json({
            success: true,
            message: 'Database has been completely reset'
        });
    } catch (error) {
        console.error('Error resetting database:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting database',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Create seed data for demo purposes
const createSeedData = async (req, res) => {
    try {
        // Create platform admin company first
        const platformCompany = await Company.create({
            name: 'Platform Administration',
            industry: 'Technology',
            country: 'Global',
            size: '1-10',
            description: 'System administration company',
            status: 'active',
            subscription_type: 'enterprise'
        });

        // Create admin department
        const adminDepartment = await Department.create({
            name: 'Administration',
            company_id: platformCompany.id
        });

        // Create super admin user
        const superAdmin = await User.create({
            company_id: platformCompany.id,
            department_id: adminDepartment.id,
            email: 'admin@example.com',
            name: 'Super Admin',
            password_hash: 'admin123', // Will be hashed by model hook
            role: 'super_admin'
        });

        // Create seed demo company
        const demoCompany = await Company.create({
            name: 'Demo Company 1',
            industry: 'Software Development',
            country: 'Netherlands',
            size: '50-100',
            description: 'Demo company for testing purposes',
            status: 'active',
            subscription_type: 'premium'
        });

        // Create departments for demo company
        const departments = await Department.bulkCreate([
            { name: 'Engineering', company_id: demoCompany.id },
            { name: 'HR', company_id: demoCompany.id },
            { name: 'Legal', company_id: demoCompany.id }
        ]);

        res.json({
            success: true,
            message: 'Seed data created successfully',
            superAdmin: {
                email: superAdmin.email,
                password: 'admin123',
                role: superAdmin.role
            },
            companies: [platformCompany, demoCompany]
        });
    } catch (error) {
        console.error('Error creating seed data:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating seed data'
        });
    }
};

// Get platform dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        // Get overall platform statistics with error handling
        let totalCompanies = 0;
        let totalUsers = 0;
        let totalCourses = 0;
        let totalCertificates = 0;
        let activeCompanies = 0;
        let trialCompanies = 0;

        try {
            totalCompanies = await Company.count();
            activeCompanies = await Company.count({ where: { status: 'active' } });
            trialCompanies = await Company.count({ where: { status: 'trial' } });
        } catch (e) {
            console.log('Company queries failed, using defaults');
        }

        try {
            totalUsers = await User.count();
        } catch (e) {
            console.log('User query failed, using defaults');
        }

        try {
            totalCourses = await Course.count();
        } catch (e) {
            console.log('Course query failed, using defaults');
        }

        try {
            totalCertificates = await Certificate.count();
        } catch (e) {
            console.log('Certificate query failed, using defaults');
        }

        // Get recent activity (simplified without relationships)
        let recentActivity = [];
        try {
            const recentUsers = await User.findAll({
                order: [['created_at', 'DESC']],
                limit: 10,
                attributes: ['id', 'name', 'email', 'role', 'created_at', 'company_id']
            });

            recentActivity = recentUsers.map(user => ({
                id: user.id,
                type: 'user_created',
                description: `${user.name} joined company`,
                timestamp: user.created_at,
                company: 'Unknown Company'
            }));
        } catch (e) {
            console.log('Recent activity query failed, using defaults');
        }

        res.json({
            success: true,
            data: {
                totalCompanies,
                totalUsers,
                totalCourses,
                totalCertificates,
                activeCompanies,
                trialCompanies,
                recentActivity
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    }
};

// Super Admin Prompt Management
const getAllPrompts = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        // Return default/mock data since prompt tables don't exist yet
        res.json({
            success: true,
            data: {
                prompts: [],
                pagination: {
                    total: 0,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: 0
                }
            }
        });
    } catch (error) {
        console.error('Error fetching all prompts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch prompts',
            error: error.message
        });
    }
};

const getPromptAnalytics = async (req, res) => {
    try {
        // Return default/mock data since prompt tables don't exist yet
        res.json({
            success: true,
            data: {
                totalPrompts: 0,
                totalCategories: 0,
                totalUsage: 0,
                companiesWithPrompts: 0,
                globalPrompts: 0,
                companySpecificPrompts: 0,
                topCategories: [],
                recentPrompts: []
            }
        });
    } catch (error) {
        console.error('Error fetching prompt analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch prompt analytics',
            error: error.message
        });
    }
};

const getPromptsByCompany = async (req, res) => {
    try {
        // Get companies with basic info
        const companies = await Company.findAll({
            attributes: ['id', 'name']
        });

        // Add companies with default prompt data
        const companiesWithStats = companies.map(company => ({
            id: company.id,
            name: company.name,
            prompt_count: 0,
            usage_count: 0,
            prompts: []
        }));

        // Add global templates
        companiesWithStats.unshift({
            id: 0,
            name: 'Global Templates',
            prompt_count: 0,
            usage_count: 0,
            prompts: []
        });

        res.json({
            success: true,
            data: companiesWithStats
        });
    } catch (error) {
        console.error('Error fetching prompts by company:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch prompts by company',
            error: error.message
        });
    }
};

const deletePrompt = async (req, res) => {
    try {
        // Since prompt tables don't exist yet, return 404
        res.status(404).json({
            success: false,
            message: 'Prompt not found'
        });
    } catch (error) {
        console.error('Error deleting prompt:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete prompt',
            error: error.message
        });
    }
};

const updatePromptStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const validStatuses = ['draft', 'pending_review', 'approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        // Since prompt tables don't exist yet, return 404
        res.status(404).json({
            success: false,
            message: 'Prompt not found'
        });
    } catch (error) {
        console.error('Error updating prompt status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update prompt status',
            error: error.message
        });
    }
};

// Super Admin User Management
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, role, company_id } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }
        if (role && role !== 'all') {
            whereClause.role = role;
        }
        if (company_id && company_id !== 'all') {
            whereClause.company_id = company_id;
        }

        // Simplified query without complex relationships for now
        const users = await User.findAndCountAll({
            where: whereClause,
            attributes: ['id', 'name', 'email', 'role', 'company_id', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Add basic company info manually if needed
        const usersWithCompany = users.rows.map(user => ({
            ...user.toJSON(),
            company: { id: user.company_id, name: 'Unknown Company' },
            status: 'active',
            last_login: null
        }));

        res.json({
            success: true,
            data: {
                users: usersWithCompany,
                pagination: {
                    total: users.count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(users.count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};

const getUserAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const superAdmins = await User.count({ where: { role: 'super_admin' } });
        const companyAdmins = await User.count({ where: { role: 'admin' } });
        const managers = await User.count({ where: { role: 'manager' } });
        const participants = await User.count({ where: { role: 'participant' } });

        // Recent users (simplified query)
        const recentUsers = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'created_at', 'company_id'],
            order: [['created_at', 'DESC']],
            limit: 10
        });

        // Add basic company info
        const recentUsersWithCompany = recentUsers.map(user => ({
            ...user.toJSON(),
            company: { name: 'Unknown Company' }
        }));

        // Role distribution
        const roleDistribution = [
            { role: 'super_admin', count: superAdmins, percentage: (superAdmins / totalUsers * 100).toFixed(1) },
            { role: 'admin', count: companyAdmins, percentage: (companyAdmins / totalUsers * 100).toFixed(1) },
            { role: 'manager', count: managers, percentage: (managers / totalUsers * 100).toFixed(1) },
            { role: 'participant', count: participants, percentage: (participants / totalUsers * 100).toFixed(1) }
        ];

        res.json({
            success: true,
            data: {
                totalUsers,
                superAdmins,
                companyAdmins,
                managers,
                participants,
                activeThisMonth: 0, // Default since last_login may not exist
                recentUsers: recentUsersWithCompany,
                usersByCompany: [], // Default empty array
                roleDistribution
            }
        });
    } catch (error) {
        console.error('Error fetching user analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user analytics',
            error: error.message
        });
    }
};

// Super Admin Analytics
const getAnalyticsOverview = async (req, res) => {
    try {
        let totalUsers = 0;
        let totalCompanies = 0;
        let totalCourses = 0;

        try {
            totalUsers = await User.count();
        } catch (e) {
            console.log('User count failed, using default');
        }

        try {
            totalCompanies = await Company.count();
        } catch (e) {
            console.log('Company count failed, using default');
        }

        try {
            totalCourses = await Course.count();
        } catch (e) {
            console.log('Course count failed, using default');
        }

        res.json({
            success: true,
            data: {
                totalUsers,
                totalCompanies,
                totalCourses,
                totalPrompts: 0, // Default since prompt tables don't exist
                monthlyActiveUsers: 0, // Default since last_login may not exist
                courseCompletions: 0, // Default since UserProgress may not exist
                certificatesIssued: 0, // Default
                promptUsage: 0 // Default since prompt usage tables don't exist
            }
        });
    } catch (error) {
        console.error('Error fetching analytics overview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics overview',
            error: error.message
        });
    }
};

const getAnalyticsTrends = async (req, res) => {
    try {
        // Simple user growth with error handling
        const userGrowth = [];
        for (let i = 3; i >= 0; i--) {
            let userCount = 0;
            try {
                const weekEnd = new Date();
                weekEnd.setDate(weekEnd.getDate() - (i * 7));

                userCount = await User.count({
                    where: {
                        created_at: {
                            [Op.lt]: weekEnd
                        }
                    }
                });
            } catch (e) {
                console.log('User growth query failed, using defaults');
            }

            userGrowth.push({
                period: `Week ${4 - i}`,
                users: userCount
            });
        }

        res.json({
            success: true,
            data: {
                userGrowth,
                courseEngagement: [], // Default empty since complex relationships may not exist
                promptUsage: [], // Default empty since prompt tables don't exist
                companyActivity: [] // Default empty
            }
        });
    } catch (error) {
        console.error('Error fetching analytics trends:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics trends',
            error: error.message
        });
    }
};

const getPerformanceMetrics = async (req, res) => {
    try {
        // Get real performance metrics from system monitoring service
        const performanceData = await systemMonitoring.getPerformanceMetrics();

        res.json({
            success: true,
            data: performanceData
        });
    } catch (error) {
        console.error('Error fetching performance metrics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch performance metrics',
            error: error.message
        });
    }
};

// Get audit logs for Super Admin monitoring
const getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50, action, entity_type, severity, company_id } = req.query;
        const offset = (page - 1) * limit;

        // Simplified query without relationships
        const whereClause = {};
        if (action) whereClause.action = action;
        if (entity_type) whereClause.entity_type = entity_type;
        if (severity) whereClause.severity = severity;
        if (company_id) whereClause.company_id = company_id;

        let auditLogs = { rows: [], count: 0 };
        
        try {
            auditLogs = await AuditLog.findAndCountAll({
                where: whereClause,
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        } catch (e) {
            console.log('Audit logs query failed, returning empty results');
        }

        res.json({
            success: true,
            data: {
                logs: auditLogs.rows,
                pagination: {
                    total: auditLogs.count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(auditLogs.count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch audit logs',
            error: error.message
        });
    }
};

// Get system metrics
const getSystemMetrics = async (req, res) => {
    try {
        const { metric_name, hours = 24, category } = req.query;

        if (metric_name) {
            // Try to get specific metric history from monitoring service
            try {
                const metrics = await systemMonitoring.getHistoricalMetrics(metric_name, parseInt(hours));
                res.json({
                    success: true,
                    data: {
                        metric_name,
                        values: metrics
                    }
                });
            } catch (e) {
                console.log('System monitoring service failed, returning empty metrics');
                res.json({
                    success: true,
                    data: {
                        metric_name,
                        values: []
                    }
                });
            }
        } else {
            // Try to get metrics from database with fallback
            let groupedMetrics = {};
            
            try {
                const startTime = new Date(Date.now() - (parseInt(hours) * 60 * 60 * 1000));
                const whereClause = {
                    recorded_at: {
                        [Op.gte]: startTime
                    }
                };
                if (category) whereClause.category = category;

                const metrics = await SystemMetrics.findAll({
                    where: whereClause,
                    order: [['recorded_at', 'DESC']],
                    limit: 1000
                });

                // Group by metric name
                groupedMetrics = metrics.reduce((acc, metric) => {
                    if (!acc[metric.metric_name]) {
                        acc[metric.metric_name] = [];
                    }
                    acc[metric.metric_name].push({
                        value: parseFloat(metric.metric_value),
                        unit: metric.metric_unit,
                        timestamp: metric.recorded_at
                    });
                    return acc;
                }, {});
            } catch (e) {
                console.log('SystemMetrics table query failed, returning empty results');
            }

            res.json({
                success: true,
                data: groupedMetrics
            });
        }
    } catch (error) {
        console.error('Error fetching system metrics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch system metrics',
            error: error.message
        });
    }
};

// Get system health status
const getSystemHealth = async (req, res) => {
    try {
        const performanceData = await systemMonitoring.getPerformanceMetrics();

        // Determine health status based on metrics
        const health = {
            status: 'healthy',
            uptime: performanceData.uptime,
            memory: performanceData.memory,
            cpu: performanceData.cpu,
            response_time: performanceData.avgResponseTime,
            error_rate: performanceData.errorRate,
            timestamp: new Date().toISOString()
        };

        // Determine overall health status
        if (performanceData.errorRate > 5 ||
            parseFloat(performanceData.memory.used) > 90 ||
            performanceData.avgResponseTime > 1000) {
            health.status = 'degraded';
        }

        if (performanceData.errorRate > 10 ||
            parseFloat(performanceData.memory.used) > 95 ||
            performanceData.avgResponseTime > 5000) {
            health.status = 'unhealthy';
        }

        res.json({
            success: true,
            data: health
        });
    } catch (error) {
        console.error('Error fetching system health:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch system health',
            error: error.message
        });
    }
};

module.exports = {
    getCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    getCompanyDetails,
    createUser,
    createCompanyManager,
    getDashboardStats,
    resetDatabase,
    createSeedData,
    // Super Admin Prompt Management
    getAllPrompts,
    getPromptAnalytics,
    getPromptsByCompany,
    deletePrompt,
    updatePromptStatus,
    // Super Admin User Management
    getAllUsers,
    getUserAnalytics,
    // Super Admin Analytics
    getAnalyticsOverview,
    getAnalyticsTrends,
    getPerformanceMetrics,
    // Super Admin Audit & Monitoring
    getAuditLogs,
    getSystemMetrics,
    getSystemHealth
};