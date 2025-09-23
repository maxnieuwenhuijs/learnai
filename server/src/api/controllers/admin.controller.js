const { User, Company, Department, Course, Module, CourseModule, Lesson, UserProgress, Certificate, Prompt, PromptCategory, PromptUsage, CompanyCourseAssignment } = require('../../models');
const { Op } = require('sequelize');

// Admin Dashboard Stats
const getDashboardStats = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        
        console.log('🔍 Admin getDashboardStats - companyId:', companyId);
        console.log('🔍 Admin getDashboardStats - user:', req.user);
        
        if (!companyId) {
            console.log('❌ No company_id found for admin user');
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        // Get company-specific statistics
        const [
            totalUsers,
            totalCourses,
            totalCertificates,
            activeUsers,
            recentActivity
        ] = await Promise.all([
            User.count({ where: { company_id: companyId } }),
            Course.count({ where: { company_id: companyId } }),
            Certificate.count({ 
                include: [{
                    model: User,
                    where: { company_id: companyId },
                    attributes: []
                }]
            }),
            User.count({ 
                where: { 
                    company_id: companyId,
                    last_login: {
                        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                    }
                }
            }),
            User.findAll({
                where: { company_id: companyId },
                order: [['created_at', 'DESC']],
                limit: 5,
                attributes: ['id', 'name', 'email', 'role', 'created_at']
            })
        ]);

        console.log('📊 Dashboard stats:', {
            totalUsers,
            totalCourses,
            totalCertificates,
            activeUsers,
            recentActivityCount: recentActivity.length
        });

        res.json({
            success: true,
            data: {
                totalUsers,
                totalCourses,
                totalCertificates,
                activeUsers,
                recentActivity
            }
        });
    } catch (error) {
        console.error('Error getting admin dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading dashboard statistics'
        });
    }
};

// Get Analytics
const getAnalytics = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        
        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        // Get course completion rates
        const courseCompletions = await UserProgress.findAll({
            include: [{
                model: Lesson,
                include: [{
                    model: CourseModule,
                    include: [{
                        model: Course,
                        where: { company_id: companyId },
                        attributes: []
                    }]
                }]
            }],
            where: { status: 'completed' }
        });

        // Get user engagement data
        const userEngagement = await User.findAll({
            where: { company_id: companyId },
            include: [{
                model: UserProgress,
                include: [{
                    model: Lesson,
                    include: [{
                        model: CourseModule,
                        include: [{
                            model: Course,
                            where: { company_id: companyId },
                            attributes: []
                        }]
                    }]
                }]
            }]
        });

        res.json({
            success: true,
            data: {
                courseCompletions: courseCompletions.length,
                userEngagement: userEngagement.length,
                averageProgress: 0 // Will be calculated based on actual progress data
            }
        });
    } catch (error) {
        console.error('Error getting admin analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading analytics data'
        });
    }
};

// Get Company Information
const getCompany = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        
        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const company = await Company.findByPk(companyId, {
            include: [{
                model: Department,
                as: 'departments'
            }]
        });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        res.json({
            success: true,
            data: company
        });
    } catch (error) {
        console.error('Error getting company:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading company information'
        });
    }
};

// Update Company
const updateCompany = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { name, description, website, industry } = req.body;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const company = await Company.findByPk(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        await company.update({
            name: name || company.name,
            description: description || company.description,
            website: website || company.website,
            industry: industry || company.industry
        });

        res.json({
            success: true,
            message: 'Company updated successfully',
            data: company
        });
    } catch (error) {
        console.error('Error updating company:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating company'
        });
    }
};

// Get Company Users
const getCompanyUsers = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { page = 1, limit = 10, search = '', role = '' } = req.query;

        console.log('🔍 Admin getCompanyUsers - companyId:', companyId);
        console.log('🔍 Admin getCompanyUsers - user:', req.user);
        console.log('🔍 Admin getCompanyUsers - user role:', req.user.role);
        console.log('🔍 Admin getCompanyUsers - query params:', { page, limit, search, role });

        if (!companyId) {
            console.log('❌ No company_id found for admin user');
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const whereClause = { company_id: companyId };
        
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        if (role && role !== 'all') {
            whereClause.role = role;
        }

        console.log('🔍 Where clause for users query:', whereClause);
        
        // First, let's check all users in the database to debug
        const allUsers = await User.findAll({
            attributes: ['id', 'name', 'email', 'company_id', 'role'],
            limit: 10
        });
        console.log('🔍 All users in database (first 10):', allUsers);
        
        const users = await User.findAndCountAll({
            where: whereClause,
            include: [{
                model: Department,
                as: 'department'
            }],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['created_at', 'DESC']]
        });

        console.log('📊 Found users:', users.count, 'total');
        console.log('📊 Users data:', users.rows.map(u => ({ id: u.id, name: u.name, email: u.email, company_id: u.company_id })));

        res.json({
            success: true,
            data: {
                users: users.rows,
                totalUsers: users.count,
                totalPages: Math.ceil(users.count / parseInt(limit)),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        console.error('Error getting company users:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading users'
        });
    }
};

// Get User Analytics
const getUserAnalytics = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        
        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const userStats = await User.findAll({
            where: { company_id: companyId },
            attributes: [
                'role',
                [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
            ],
            group: ['role']
        });

        res.json({
            success: true,
            data: {
                roleDistribution: userStats
            }
        });
    } catch (error) {
        console.error('Error getting user analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading user analytics'
        });
    }
};

// Create User
const createUser = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { name, email, password, role, department_id } = req.body;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'participant',
            company_id: companyId,
            department_id: department_id || null
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user'
        });
    }
};

// Update User
const updateUser = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { id } = req.params;
        const { name, email, role, department_id } = req.body;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const user = await User.findOne({
            where: { id, company_id: companyId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.update({
            name: name || user.name,
            email: email || user.email,
            role: role || user.role,
            department_id: department_id !== undefined ? department_id : user.department_id
        });

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user'
        });
    }
};

// Delete User
const deleteUser = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { id } = req.params;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const user = await User.findOne({
            where: { id, company_id: companyId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.destroy();

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user'
        });
    }
};

// Get Company Courses
const getCompanyCourses = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { page = 1, limit = 10, search = '' } = req.query;

        console.log('🔍 Admin getCompanyCourses - companyId:', companyId);
        console.log('🔍 Admin getCompanyCourses - user:', req.user);
        console.log('🔍 Admin getCompanyCourses - query params:', { page, limit, search });

        if (!companyId) {
            console.log('❌ No company_id found for admin user');
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const whereClause = { 
            [Op.or]: [
                { company_id: companyId },
                { company_id: null, is_published: 1 }
            ]
        };
        
        if (search) {
            whereClause[Op.and] = [
                whereClause,
                {
                    [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { description: { [Op.like]: `%${search}%` } }
                    ]
                }
            ];
        }

        console.log('🔍 Where clause for courses query:', whereClause);
        
        const courses = await Course.findAndCountAll({
            where: whereClause,
            include: [{
                model: Module,
                as: 'modules',
                include: [{
                    model: Lesson,
                    as: 'lessons'
                }]
            }],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['created_at', 'DESC']]
        });

        console.log('📊 Found courses:', courses.count, 'total');
        console.log('📊 Courses data:', courses.rows.map(c => ({ id: c.id, title: c.title, company_id: c.company_id, is_global: c.is_global })));

        const responseData = {
            success: true,
            data: {
                courses: courses.rows,
                totalCourses: courses.count,
                totalPages: Math.ceil(courses.count / parseInt(limit)),
                currentPage: parseInt(page)
            }
        };

        console.log('📤 Sending response:', JSON.stringify(responseData, null, 2));
        res.json(responseData);
    } catch (error) {
        console.error('Error getting company courses:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading courses'
        });
    }
};

// Get Course
const getCourse = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { id } = req.params;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const course = await Course.findOne({
            where: { id, company_id: companyId },
            include: [{
                model: CourseModule,
                include: [{
                    model: Lesson
                }]
            }]
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        console.error('Error getting course:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading course'
        });
    }
};

// Create Course
const createCourse = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { title, description, difficulty_level, estimated_duration } = req.body;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const course = await Course.create({
            title,
            description,
            difficulty_level: difficulty_level || 'beginner',
            estimated_duration: estimated_duration || 60,
            company_id: companyId
        });

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: course
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating course'
        });
    }
};

// Update Course
const updateCourse = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { id } = req.params;
        const { title, description, difficulty_level, estimated_duration } = req.body;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const course = await Course.findOne({
            where: { id, company_id: companyId }
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        await course.update({
            title: title || course.title,
            description: description || course.description,
            difficulty_level: difficulty_level || course.difficulty_level,
            estimated_duration: estimated_duration || course.estimated_duration
        });

        res.json({
            success: true,
            message: 'Course updated successfully',
            data: course
        });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating course'
        });
    }
};

// Delete Course
const deleteCourse = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { id } = req.params;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const course = await Course.findOne({
            where: { id, company_id: companyId }
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        await course.destroy();

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

// Get Departments
const getDepartments = async (req, res) => {
    try {
        const companyId = req.user.company_id;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const departments = await Department.findAll({
            where: { company_id: companyId },
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: departments
        });
    } catch (error) {
        console.error('Error getting departments:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading departments'
        });
    }
};

// Create Department
const createDepartment = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { name, description } = req.body;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const department = await Department.create({
            name,
            description: description || '',
            company_id: companyId
        });

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: department
        });
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating department'
        });
    }
};

// Update Department
const updateDepartment = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { id } = req.params;
        const { name, description } = req.body;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const department = await Department.findOne({
            where: { id, company_id: companyId }
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        await department.update({
            name: name || department.name,
            description: description !== undefined ? description : department.description
        });

        res.json({
            success: true,
            message: 'Department updated successfully',
            data: department
        });
    } catch (error) {
        console.error('Error updating department:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating department'
        });
    }
};

// Delete Department
const deleteDepartment = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { id } = req.params;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const department = await Department.findOne({
            where: { id, company_id: companyId }
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        await department.destroy();

        res.json({
            success: true,
            message: 'Department deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting department:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting department'
        });
    }
};

// Get Team Reports
const getTeamReports = async (req, res) => {
    try {
        const companyId = req.user.company_id;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        // Get team progress data
        const teamData = await User.findAll({
            where: { company_id: companyId },
            include: [{
                model: UserProgress,
                include: [{
                    model: Lesson,
                    include: [{
                        model: CourseModule,
                        include: [{
                            model: Course,
                            where: { company_id: companyId },
                            attributes: []
                        }]
                    }]
                }]
            }]
        });

        res.json({
            success: true,
            data: {
                teamMembers: teamData,
                totalMembers: teamData.length
            }
        });
    } catch (error) {
        console.error('Error getting team reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading team reports'
        });
    }
};

// Get Course Reports
const getCourseReports = async (req, res) => {
    try {
        const companyId = req.user.company_id;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const courses = await Course.findAll({
            where: { company_id: companyId },
            include: [{
                model: UserProgress,
                include: [{
                    model: User,
                    where: { company_id: companyId },
                    attributes: []
                }]
            }]
        });

        res.json({
            success: true,
            data: {
                courses: courses,
                totalCourses: courses.length
            }
        });
    } catch (error) {
        console.error('Error getting course reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading course reports'
        });
    }
};

// Get User Reports
const getUserReports = async (req, res) => {
    try {
        const companyId = req.user.company_id;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const users = await User.findAll({
            where: { company_id: companyId },
            include: [{
                model: UserProgress,
                include: [{
                    model: Lesson,
                    include: [{
                        model: CourseModule,
                        include: [{
                            model: Course,
                            where: { company_id: companyId },
                            attributes: []
                        }]
                    }]
                }]
            }]
        });

        res.json({
            success: true,
            data: {
                users: users,
                totalUsers: users.length
            }
        });
    } catch (error) {
        console.error('Error getting user reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading user reports'
        });
    }
};

// Get Company Prompts
const getCompanyPrompts = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { page = 1, limit = 10, search = '', category_id = '', status = '' } = req.query;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const whereClause = { 
            company_id: companyId,
            status: {
                [Op.in]: ['approved', 'pending_review', 'draft']
            }
        };
        
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { content: { [Op.like]: `%${search}%` } }
            ];
        }

        if (category_id) {
            whereClause.category_id = category_id;
        }

        if (status) {
            whereClause.status = status;
        }

        const prompts = await Prompt.findAndCountAll({
            where: whereClause,
            include: [{
                model: PromptCategory,
                as: 'category'
            }],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['updated_at', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                prompts: prompts.rows,
                totalPrompts: prompts.count,
                totalPages: Math.ceil(prompts.count / parseInt(limit)),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        console.error('Error getting company prompts:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading prompts'
        });
    }
};

// Get Prompt
const getPrompt = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { id } = req.params;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const prompt = await Prompt.findOne({
            where: { 
                id, 
                company_id: companyId,
                status: {
                    [Op.in]: ['approved', 'pending_review', 'draft']
                }
            },
            include: [{
                model: PromptCategory,
                as: 'category'
            }]
        });

        if (!prompt) {
            return res.status(404).json({
                success: false,
                message: 'Prompt not found'
            });
        }

        res.json({
            success: true,
            data: prompt
        });
    } catch (error) {
        console.error('Error getting prompt:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading prompt'
        });
    }
};

// Create Prompt
const createPrompt = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { title, content, category_id, description, tags } = req.body;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const prompt = await Prompt.create({
            title,
            content,
            description: description || '',
            category_id: category_id || null,
            company_id: companyId,
            tags: tags || [],
            created_by: req.user.id,
            status: 'approved'
        });

        res.status(201).json({
            success: true,
            message: 'Prompt created successfully',
            data: prompt
        });
    } catch (error) {
        console.error('Error creating prompt:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating prompt'
        });
    }
};

// Update Prompt
const updatePrompt = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { id } = req.params;
        const { title, content, category_id, description, tags, status } = req.body;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const prompt = await Prompt.findOne({
            where: { 
                id, 
                company_id: companyId,
                status: {
                    [Op.in]: ['approved', 'pending_review', 'draft', 'rejected']
                }
            }
        });

        if (!prompt) {
            return res.status(404).json({
                success: false,
                message: 'Prompt not found'
            });
        }

        // If the prompt was approved, set it back to pending_review after editing
        const newStatus = prompt.status === 'approved' ? 'pending_review' : (status || prompt.status);

        await prompt.update({
            title: title || prompt.title,
            content: content || prompt.content,
            description: description !== undefined ? description : prompt.description,
            category_id: category_id !== undefined ? category_id : prompt.category_id,
            tags: tags || prompt.tags,
            status: newStatus
        });

        res.json({
            success: true,
            message: 'Prompt updated successfully',
            data: prompt
        });
    } catch (error) {
        console.error('Error updating prompt:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating prompt'
        });
    }
};

// Delete Prompt
const deletePrompt = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { id } = req.params;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const prompt = await Prompt.findOne({
            where: { id, company_id: companyId }
        });

        if (!prompt) {
            return res.status(404).json({
                success: false,
                message: 'Prompt not found'
            });
        }

        await prompt.destroy();

        res.json({
            success: true,
            message: 'Prompt deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting prompt:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting prompt'
        });
    }
};

// Get Prompt Categories
const getPromptCategories = async (req, res) => {
    try {
        const companyId = req.user.company_id;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const categories = await PromptCategory.findAll({
            where: { company_id: companyId },
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error getting prompt categories:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading prompt categories'
        });
    }
};

// Create Prompt Category
const createPromptCategory = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { name, description } = req.body;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const category = await PromptCategory.create({
            name,
            description: description || '',
            company_id: companyId
        });

        res.status(201).json({
            success: true,
            message: 'Prompt category created successfully',
            data: category
        });
    } catch (error) {
        console.error('Error creating prompt category:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating prompt category'
        });
    }
};

// Approve Prompt
const approvePrompt = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { id } = req.params;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const prompt = await Prompt.findOne({
            where: { 
                id, 
                company_id: companyId,
                status: {
                    [Op.in]: ['pending_review', 'draft']
                }
            }
        });

        if (!prompt) {
            return res.status(404).json({
                success: false,
                message: 'Prompt not found or already processed'
            });
        }

        await prompt.update({
            status: 'approved'
        });

        res.json({
            success: true,
            message: 'Prompt approved successfully',
            data: prompt
        });
    } catch (error) {
        console.error('Error approving prompt:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving prompt'
        });
    }
};

// Reject Prompt
const rejectPrompt = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { id } = req.params;
        const { reason } = req.body;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const prompt = await Prompt.findOne({
            where: { 
                id, 
                company_id: companyId,
                status: {
                    [Op.in]: ['pending_review', 'draft']
                }
            }
        });

        if (!prompt) {
            return res.status(404).json({
                success: false,
                message: 'Prompt not found or already processed'
            });
        }

        await prompt.update({
            status: 'rejected'
        });

        res.json({
            success: true,
            message: 'Prompt rejected successfully',
            data: prompt
        });
    } catch (error) {
        console.error('Error rejecting prompt:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting prompt'
        });
    }
};

// Assign Course to Team Members
const assignCourseToTeam = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { courseId, userIds, departmentIds } = req.body;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        // Verify course belongs to company
        const course = await Course.findOne({
            where: { id: courseId, company_id: companyId }
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const assignments = [];

        // Assign to specific users
        if (userIds && userIds.length > 0) {
            for (const userId of userIds) {
                const user = await User.findOne({
                    where: { id: userId, company_id: companyId }
                });
                
                if (user) {
                    const assignment = await CompanyCourseAssignment.create({
                        course_id: courseId,
                        company_id: companyId,
                        user_id: userId,
                        assigned_by: req.user.id,
                        assigned_at: new Date()
                    });
                    assignments.push(assignment);
                }
            }
        }

        // Assign to departments
        if (departmentIds && departmentIds.length > 0) {
            for (const departmentId of departmentIds) {
                const department = await Department.findOne({
                    where: { id: departmentId, company_id: companyId }
                });
                
                if (department) {
                    const assignment = await CompanyCourseAssignment.create({
                        course_id: courseId,
                        company_id: companyId,
                        department_id: departmentId,
                        assigned_by: req.user.id,
                        assigned_at: new Date()
                    });
                    assignments.push(assignment);
                }
            }
        }

        res.json({
            success: true,
            message: 'Course assigned successfully',
            data: { assignments }
        });
    } catch (error) {
        console.error('Error assigning course:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning course'
        });
    }
};

// Get Course Statistics
const getCourseStatistics = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { courseId } = req.params;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        // Get course
        const course = await Course.findOne({
            where: { id: courseId, company_id: companyId }
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Get assignments
        const assignments = await CompanyCourseAssignment.findAll({
            where: { course_id: courseId, company_id: companyId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }, {
                model: Department,
                as: 'department',
                attributes: ['id', 'name']
            }]
        });

        // Get progress data
        const progressData = await UserProgress.findAll({
            where: { course_id: courseId },
            include: [{
                model: User,
                as: 'user',
                where: { company_id: companyId },
                attributes: ['id', 'name', 'email']
            }]
        });

        // Get certificates
        const certificates = await Certificate.findAll({
            where: { course_id: courseId },
            include: [{
                model: User,
                as: 'user',
                where: { company_id: companyId },
                attributes: ['id', 'name', 'email']
            }]
        });

        // Calculate statistics
        const totalAssigned = assignments.length;
        const totalProgress = progressData.length;
        const totalCertificates = certificates.length;
        const completionRate = totalAssigned > 0 ? (totalCertificates / totalAssigned) * 100 : 0;

        res.json({
            success: true,
            data: {
                course: {
                    id: course.id,
                    title: course.title,
                    description: course.description
                },
                statistics: {
                    totalAssigned,
                    totalProgress,
                    totalCertificates,
                    completionRate: Math.round(completionRate * 100) / 100
                },
                assignments,
                progress: progressData,
                certificates
            }
        });
    } catch (error) {
        console.error('Error getting course statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading course statistics'
        });
    }
};

module.exports = {
    getDashboardStats,
    getAnalytics,
    getCompany,
    updateCompany,
    getCompanyUsers,
    getUserAnalytics,
    createUser,
    updateUser,
    deleteUser,
    getCompanyCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getTeamReports,
    getCourseReports,
    getUserReports,
    getCompanyPrompts,
    getPrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
    getPromptCategories,
    createPromptCategory,
    approvePrompt,
    rejectPrompt,
    assignCourseToTeam,
    getCourseStatistics
};
