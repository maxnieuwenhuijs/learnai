const { User, Company, Department, Course, Module, Lesson, CourseModule, UserProgress, Prompt, PromptCategory, PromptVersion, PromptApproval, PromptUsage, AuditLog, Certificate } = require('../../models');
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
            slug: company.slug,
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
            slug,
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

        // Generate slug if not provided
        const finalSlug = slug || Company.generateSlug(name);

        // Check if slug already exists
        const existingSlug = await Company.findOne({ where: { slug: finalSlug } });
        if (existingSlug) {
            return res.status(400).json({
                success: false,
                message: `Company slug "${finalSlug}" already exists. Please choose a different slug.`
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
            slug: finalSlug,
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
        const { name, slug, industry, country, size, description } = req.body;

        const company = await Company.findByPk(id);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Handle logo upload
        let logoData = {};
        if (req.file) {
            try {
                // Delete old logo if exists
                if (company.logo_url) {
                    await deleteCompanyLogo(company.logo_url);
                }

                const logoResult = await processCompanyLogo(req.file.buffer, req.file.originalname, id);
                logoData = {
                    logo_url: logoResult.url,
                    logo_filename: logoResult.filename
                };
            } catch (logoError) {
                console.error('Logo processing error:', logoError);
                return res.status(400).json({
                    success: false,
                    message: 'Logo upload failed: ' + logoError.message
                });
            }
        }

        const oldValues = {
            name: company.name,
            slug: company.slug,
            industry: company.industry,
            country: company.country,
            size: company.size,
            description: company.description
        };

        await company.update({
            name,
            slug,
            industry,
            country,
            size,
            description,
            ...logoData
        });

        // Log company update
        await auditLogger.logCompanyUpdated(req.user?.id || 1, company.id, oldValues, { name, slug, industry, country, size, description }, req);

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
                attributes: ['id', 'name', 'email', 'role', 'department_id', 'created_at'],
                include: [{
                    model: Department,
                    as: 'department',
                    attributes: ['id', 'name'],
                    required: false
                }],
                limit: 10
            });
        } catch (e) {
            console.log('Users query failed, using defaults:', e.message);
        }

        console.log('Users found:', users.length);
        if (users.length > 0) {
            console.log('First user:', JSON.stringify(users[0], null, 2));
        }

        try {
            departmentCount = await Department.count({ where: { company_id: id } });
            departments = await Department.findAll({
                where: { company_id: id },
                attributes: ['id', 'name']
            });


            // Add user count to each department
            for (let dept of departments) {
                try {
                    const userCount = await User.count({
                        where: {
                            company_id: id,
                            department_id: dept.id
                        }
                    });
                    dept.dataValues.user_count = userCount;
                } catch (e) {
                    dept.dataValues.user_count = 0;
                }
            }
        } catch (e) {
            console.log('Departments query failed, using defaults:', e.message);
        }

        try {
            courseCount = await Course.count({ where: { company_id: id } });
        } catch (e) {
            console.log('Courses query failed, using defaults');
        }

        // Get recent activity from audit logs
        let recentActivity = [];
        try {
            const auditLogs = await AuditLog.findAll({
                where: { company_id: id },
                order: [['created_at', 'DESC']],
                limit: 10,
                attributes: ['action', 'description', 'created_at', 'entity_type']
            });

            recentActivity = auditLogs.map(log => ({
                type: log.action,
                description: log.description,
                timestamp: log.created_at,
                entity_type: log.entity_type
            }));

            console.log(`Found ${auditLogs.length} audit logs for company ${id}`);
        } catch (e) {
            console.log('Recent activity query failed, using empty array:', e.message);
        }

        res.json({
            success: true,
            company: {
                ...company.toJSON(),
                users: users,
                departments: departments,
                courses: [],
                recent_activity: recentActivity,
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

        // Clear all data in correct order (respecting foreign key constraints)
        // First clear all audit logs to avoid foreign key issues
        await AuditLog.destroy({ where: {} });

        // Then clear dependent tables first
        await Promise.all([
            UserProgress.destroy({ where: {} }),
            Certificate.destroy({ where: {} }),
            PromptUsage.destroy({ where: {} }),
            PromptApproval.destroy({ where: {} }),
            PromptVersion.destroy({ where: {} }),
        ]);

        // Then clear main tables
        await Prompt.destroy({ where: {} });
        await PromptCategory.destroy({ where: {} });
        await User.destroy({ where: {} });
        await Course.destroy({ where: {} });
        await Department.destroy({ where: {} });
        await Company.destroy({ where: {} });

        // Log database reset action after clearing (for standalone admin)
        if (req.user && req.user.standalone) {
            console.log('✅ Database completely reset by standalone super admin');
        }

        res.json({
            success: true,
            message: 'Database has been completely reset - Starting fresh!'
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

// Create department for a company
const createDepartment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { companyId } = req.params;
        const { name } = req.body;

        // Check if company exists
        const company = await Company.findByPk(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Check if department name already exists in this company
        const existingDepartment = await Department.findOne({
            where: { name, company_id: companyId }
        });
        if (existingDepartment) {
            return res.status(400).json({
                success: false,
                message: 'Department with this name already exists in this company'
            });
        }

        // Create department
        const department = await Department.create({
            name,
            company_id: companyId
        });

        // Log department creation
        await auditLogger.log({
            userId: req.user?.id || 1,
            companyId: companyId,
            action: 'department_created',
            entityType: 'department',
            entityId: department.id,
            newValues: { name: department.name },
            severity: 'medium',
            description: `Created department: ${department.name}`,
            req
        });

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            department: {
                id: department.id,
                name: department.name,
                user_count: 0
            }
        });
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating department',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete department from a company
const deleteDepartment = async (req, res) => {
    try {
        const { companyId, departmentId } = req.params;

        // Check if company exists
        const company = await Company.findByPk(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Check if department exists and belongs to this company
        const department = await Department.findOne({
            where: { id: departmentId, company_id: companyId }
        });
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found in this company'
            });
        }

        // Check if department has users
        const userCount = await User.count({
            where: { department_id: departmentId }
        });
        if (userCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete department. It has ${userCount} user(s). Please reassign users first.`
            });
        }

        // Delete department
        await department.destroy();

        res.json({
            success: true,
            message: 'Department deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting department:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting department',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Create user for a specific company
const createCompanyUser = async (req, res) => {
    console.log('createCompanyUser called with:', { companyId: req.params.companyId, body: req.body });
    try {
        const { companyId } = req.params;
        const { name, email, password, role, department_id } = req.body;

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
            console.log('Email already exists:', email);
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // If department_id is provided, verify it belongs to this company
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

        // Create user
        const user = await User.create({
            name,
            email,
            password_hash: password,
            role: role || 'participant',
            company_id: companyId,
            department_id: department_id || null
        });

        // Log the user creation
        await auditLogger.logUserCreated(req.user?.id || 1, user, req);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                company_id: user.company_id,
                department_id: user.department_id
            }
        });
    } catch (error) {
        console.error('Error creating company user:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update user
const updateUser = async (req, res) => {
    console.log('updateUser called with:', { id: req.params.id, body: req.body });
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { name, email, role, department_id } = req.body;

        // Check if user exists
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if email is already taken by another user
        if (email !== user.email) {
            const existingUser = await User.findOne({
                where: { email, id: { [Op.ne]: id } }
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already taken by another user'
                });
            }
        }

        // Update user
        await user.update({
            name,
            email,
            role,
            department_id: department_id || null
        });

        res.json({
            success: true,
            message: 'User updated successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department_id: user.department_id
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete the user
        await user.destroy();

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Course Management Functions
const getCourses = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = 'all', company_id } = req.query;

        const where = {};
        if (company_id) where.company_id = company_id;
        if (status !== 'all') where.status = status;
        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        const courses = await Course.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['created_at', 'DESC']],
            include: [{
                model: Company,
                as: 'company',
                attributes: ['id', 'name']
            }]
        });

        res.json({
            success: true,
            courses: courses.rows,
            pagination: {
                total: courses.count,
                page: parseInt(page),
                pages: Math.ceil(courses.count / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching courses'
        });
    }
};

// Get single course
const getCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findByPk(id, {
            include: [
                {
                    model: Company,
                    as: 'company',
                    attributes: ['id', 'name']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email'],
                    required: false
                },
                {
                    model: Module,
                    as: 'modules',
                    through: { attributes: [] },
                    order: [['order', 'ASC']],
                    include: [
                        {
                            model: Lesson,
                            as: 'lessons',
                            order: [['lesson_order', 'ASC']]
                        }
                    ]
                }
            ]
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.json({
            success: true,
            course
        });
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching course'
        });
    }
};

const createCourse = async (req, res) => {
    try {
        const { title, description, company_id, difficulty_level, estimated_duration } = req.body;

        const course = await Course.create({
            title,
            description,
            company_id,
            difficulty: difficulty_level || 'beginner',
            duration_hours: (estimated_duration || 60) / 60, // Convert minutes to hours
            is_published: false,
            created_by: req.user?.id === 'super_admin' ? null : (req.user?.id || 1)
        });

        // Log course creation
        await auditLogger.log({
            userId: req.user?.id === 'super_admin' ? null : (req.user?.id || 1),
            companyId: company_id,
            action: 'course_created',
            entityType: 'course',
            entityId: course.id,
            newValues: { title, description, difficulty_level, estimated_duration },
            severity: 'medium',
            description: `Created course: ${title}`,
            req
        });

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            course
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating course'
        });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, difficulty_level, difficulty, estimated_duration, duration_hours, category, is_published } = req.body;

        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const oldValues = {
            title: course.title,
            description: course.description,
            difficulty: course.difficulty,
            duration_hours: course.duration_hours,
            is_published: course.is_published
        };

        await course.update({
            title,
            description,
            category: category || course.category,
            difficulty: difficulty_level || difficulty || course.difficulty,
            duration_hours: duration_hours || (estimated_duration ? estimated_duration / 60 : course.duration_hours),
            is_published: is_published !== undefined ? is_published : course.is_published
        });

        // Log course update
        await auditLogger.log({
            userId: req.user?.id === 'super_admin' ? null : (req.user?.id || 1),
            companyId: course.company_id,
            action: 'course_updated',
            entityType: 'course',
            entityId: course.id,
            oldValues,
            newValues: { title, description, difficulty_level, estimated_duration, is_published },
            severity: 'medium',
            description: `Updated course: ${title}`,
            req
        });

        res.json({
            success: true,
            message: 'Course updated successfully',
            course
        });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating course'
        });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        await course.destroy();

        // Log course deletion
        await auditLogger.log({
            userId: req.user?.id === 'super_admin' ? null : (req.user?.id || 1),
            companyId: course.company_id,
            action: 'course_deleted',
            entityType: 'course',
            entityId: course.id,
            oldValues: { title: course.title, description: course.description },
            severity: 'high',
            description: `Deleted course: ${course.title}`,
            req
        });

        res.json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting course'
        });
    }
};

// Module Management
const getCourseModules = async (req, res) => {
    try {
        const { courseId } = req.params;

        const modules = await Module.findAll({
            include: [{
                model: Course,
                as: 'courses',
                where: { id: courseId },
                through: { attributes: [] }
            }],
            order: [['order', 'ASC']]
        });

        res.json({
            success: true,
            modules
        });
    } catch (error) {
        console.error('Error fetching modules:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching modules'
        });
    }
};

const createModule = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description, estimated_duration_minutes, order } = req.body;

        // Get current module count for ordering if order not provided
        const moduleCount = await CourseModule.count({ where: { course_id: courseId } });
        const moduleOrder = order !== undefined ? order : moduleCount + 1;

        const module = await Module.create({
            title,
            description,
            estimated_duration_minutes,
            order: moduleOrder
        });

        // Link module to course
        await CourseModule.create({
            course_id: courseId,
            module_id: module.id,
            module_order: moduleOrder
        });

        res.status(201).json({
            success: true,
            message: 'Module created successfully',
            module
        });
    } catch (error) {
        console.error('Error creating module:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating module'
        });
    }
};

const updateModule = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, estimated_duration_minutes, order } = req.body;

        const module = await Module.findByPk(id);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        await module.update({
            title,
            description,
            estimated_duration_minutes,
            order: order !== undefined ? order : module.order
        });

        res.json({
            success: true,
            message: 'Module updated successfully',
            module
        });
    } catch (error) {
        console.error('Error updating module:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating module'
        });
    }
};

const deleteModule = async (req, res) => {
    try {
        const { id } = req.params;

        const module = await Module.findByPk(id);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        await module.destroy();

        res.json({
            success: true,
            message: 'Module deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting module:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting module'
        });
    }
};

// Lesson Management
const getModuleLessons = async (req, res) => {
    try {
        const { moduleId } = req.params;

        const lessons = await Lesson.findAll({
            where: { module_id: moduleId },
            order: [['lesson_order', 'ASC']]
        });

        res.json({
            success: true,
            lessons
        });
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching lessons'
        });
    }
};

const createLesson = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { title, content_type, content_data, lesson_order } = req.body;

        const lesson = await Lesson.create({
            module_id: moduleId,
            title,
            content_type,
            content_data,
            lesson_order: lesson_order || 1
        });

        res.status(201).json({
            success: true,
            message: 'Lesson created successfully',
            lesson
        });
    } catch (error) {
        console.error('Error creating lesson:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating lesson'
        });
    }
};

const updateLesson = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content_type, content_data, lesson_order } = req.body;

        const lesson = await Lesson.findByPk(id);
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        await lesson.update({
            title,
            content_type,
            content_data,
            lesson_order
        });

        res.json({
            success: true,
            message: 'Lesson updated successfully',
            lesson
        });
    } catch (error) {
        console.error('Error updating lesson:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating lesson'
        });
    }
};

const deleteLesson = async (req, res) => {
    try {
        const { id } = req.params;

        const lesson = await Lesson.findByPk(id);
        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        await lesson.destroy();

        res.json({
            success: true,
            message: 'Lesson deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting lesson'
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
    createCompanyUser,
    createDepartment,
    deleteDepartment,
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
    updateUser,
    deleteUser,
    // Super Admin Analytics
    getAnalyticsOverview,
    getAnalyticsTrends,
    getPerformanceMetrics,
    // Super Admin Audit & Monitoring
    getAuditLogs,
    getSystemMetrics,
    getSystemHealth,
    // Course Management
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    // Module Management
    getCourseModules,
    createModule,
    updateModule,
    deleteModule,
    // Lesson Management
    getModuleLessons,
    createLesson,
    updateLesson,
    deleteLesson
};