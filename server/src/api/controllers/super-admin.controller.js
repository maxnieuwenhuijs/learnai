const { User, Company, Department, Course, UserProgress } = require('../../models');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

// Get all companies
const getCompanies = async (req, res) => {
    try {
        const companies = await Company.findAll({
            include: [
                {
                    model: User,
                    as: 'users',
                    attributes: ['id', 'name', 'email', 'role'],
                    where: { role: 'admin' },
                    required: false,
                    limit: 1
                },
                {
                    model: Department,
                    as: 'departments',
                    attributes: ['id', 'name']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Calculate stats for each company
        const companiesWithStats = await Promise.all(
            companies.map(async (company) => {
                const userCount = await User.count({ where: { company_id: company.id } });
                const courseCount = await Course.count({ where: { company_id: company.id } });
                const lastActivity = await User.findOne({
                    where: { company_id: company.id },
                    order: [['updated_at', 'DESC']],
                    attributes: ['updated_at']
                });

                return {
                    id: company.id,
                    name: company.name,
                    industry: company.industry,
                    country: company.country,
                    size: company.size,
                    description: company.description,
                    status: company.status,
                    created_at: company.created_at,
                    user_count: userCount,
                    course_count: courseCount,
                    admin_email: company.users?.[0]?.email,
                    last_activity: lastActivity?.updated_at || company.created_at
                };
            })
        );

        res.json({
            success: true,
            companies: companiesWithStats
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

        // Create company
        const company = await Company.create({
            name,
            industry,
            country,
            size,
            description,
            status: 'active'
        });

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

        res.status(201).json({
            success: true,
            message: 'Company and admin user created successfully',
            company: {
                id: company.id,
                name: company.name,
                admin_user_id: adminUser.id
            }
        });
    } catch (error) {
        console.error('Error creating company:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating company'
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
            message: 'Error deleting company'
        });
    }
};

// Get company details with full stats
const getCompanyDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const company = await Company.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'users',
                    attributes: ['id', 'name', 'email', 'role', 'created_at']
                },
                {
                    model: Department,
                    as: 'departments',
                    attributes: ['id', 'name']
                },
                {
                    model: Course,
                    as: 'courses',
                    attributes: ['id', 'title', 'status', 'created_at']
                }
            ]
        });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Get additional statistics
        const totalProgress = await UserProgress.count({
            include: [{
                model: User,
                where: { company_id: id }
            }]
        });

        const completedCourses = await UserProgress.count({
            where: { completion_percentage: 100 },
            include: [{
                model: User,
                where: { company_id: id }
            }]
        });

        res.json({
            success: true,
            company: {
                ...company.toJSON(),
                stats: {
                    total_progress_records: totalProgress,
                    completed_courses: completedCourses,
                    completion_rate: totalProgress > 0 ? Math.round((completedCourses / totalProgress) * 100) : 0
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

        // Delete all data in correct order (respecting foreign key constraints)
        await UserProgress.destroy({ where: {} });
        await User.destroy({ where: {} });
        await Course.destroy({ where: {} });
        await Department.destroy({ where: {} });
        await Company.destroy({ where: {} });

        res.json({
            success: true,
            message: 'Database has been completely reset'
        });
    } catch (error) {
        console.error('Error resetting database:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting database'
        });
    }
};

// Create seed data for demo purposes
const createSeedData = async (req, res) => {
    try {
        // Create seed companies
        const seedCompanies = [
            {
                name: 'Demo Company 1',
                industry: 'Software Development',
                country: 'Netherlands',
                size: '50-100',
                description: 'Demo company for testing purposes',
                status: 'active'
            }
        ];

        const companies = await Company.bulkCreate(seedCompanies);
        
        // Create departments for each company
        const departments = [];
        for (const company of companies) {
            departments.push(
                { name: 'Engineering', company_id: company.id },
                { name: 'HR', company_id: company.id },
                { name: 'Legal', company_id: company.id }
            );
        }
        await Department.bulkCreate(departments);

        res.json({
            success: true,
            message: 'Seed data created successfully',
            companies: companies
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
        // Get overall platform statistics
        const totalCompanies = await Company.count();
        const totalUsers = await User.count();
        const totalCourses = await Course.count();
        
        const activeCompanies = await Company.count({ where: { status: 'active' } });
        const trialCompanies = await Company.count({ where: { status: 'trial' } });
        
        // Get recent activity (simplified for now)
        const recentUsers = await User.findAll({
            include: [{ model: Company, as: 'company', attributes: ['name'] }],
            order: [['created_at', 'DESC']],
            limit: 10,
            attributes: ['id', 'name', 'email', 'role', 'created_at']
        });

        const recentActivity = recentUsers.map(user => ({
            id: user.id,
            type: 'user_created',
            description: `${user.name} joined ${user.company?.name || 'Unknown Company'}`,
            timestamp: user.created_at,
            company: user.company?.name || 'Unknown Company'
        }));

        res.json({
            success: true,
            stats: {
                totalCompanies,
                totalUsers,
                totalCourses,
                totalCertificates: 0, // TODO: implement when certificates are working
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

module.exports = {
    getCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    getCompanyDetails,
    getDashboardStats,
    resetDatabase,
    createSeedData
};