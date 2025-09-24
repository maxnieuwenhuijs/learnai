const { User, Company, Department, Course, Module, CourseModule, Lesson, UserProgress, Certificate, Prompt, PromptCategory, PromptUsage, CompanyCourseAssignment, UserCourseAssignment } = require('../../models');
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
            password_hash: password,
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
        const { id: courseId } = req.params;
        const { userIds, departmentIds } = req.body;

        console.log('🔍 assignCourseToTeam - courseId:', courseId);
        console.log('🔍 assignCourseToTeam - userIds:', userIds);
        console.log('🔍 assignCourseToTeam - departmentIds:', departmentIds);

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'Course ID is required'
            });
        }

        if ((!userIds || userIds.length === 0) && (!departmentIds || departmentIds.length === 0)) {
            return res.status(400).json({
                success: false,
                message: 'At least one user or department must be selected'
            });
        }

        // Verify course belongs to company
        console.log('🔍 Looking for course with id:', courseId, 'and company_id:', companyId);
        
        // Debug: Check all courses for this company
        const allCourses = await Course.findAll({
            where: { company_id: companyId },
            attributes: ['id', 'title', 'company_id']
        });
        console.log('🔍 All courses for company:', allCourses.map(c => ({ id: c.id, title: c.title, company_id: c.company_id })));
        
        // Debug: Check ALL courses in database
        const allCoursesInDB = await Course.findAll({
            attributes: ['id', 'title', 'company_id']
        });
        console.log('🔍 ALL courses in database:', allCoursesInDB.map(c => ({ id: c.id, title: c.title, company_id: c.company_id })));
        
        const course = await Course.findOne({
            where: { 
                id: courseId,
                [Op.or]: [
                    { company_id: companyId },
                    { company_id: null, is_published: 1 }
                ]
            }
        });

        console.log('🔍 Course found:', course ? 'YES' : 'NO');
        if (course) {
            console.log('🔍 Course details:', {
                id: course.id,
                title: course.title,
                company_id: course.company_id
            });
        }

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found or does not belong to your company'
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
                    // Check if user is already enrolled
                    const existingEnrollment = await UserCourseAssignment.findOne({
                        where: {
                            user_id: userId,
                            course_id: courseId
                        }
                    });

                    if (!existingEnrollment) {
                        const assignment = await UserCourseAssignment.create({
                            user_id: userId,
                            course_id: courseId,
                            company_id: companyId,
                            assigned_by: req.user.id,
                            status: 'assigned'
                        });
                        assignments.push(assignment);
                    }
                }
            }
        }

        // Assign to departments (enroll all users in the department)
        if (departmentIds && departmentIds.length > 0) {
            for (const departmentId of departmentIds) {
                const department = await Department.findOne({
                    where: { id: departmentId, company_id: companyId }
                });
                
                if (department) {
                    // Get all users in this department
                    const departmentUsers = await User.findAll({
                        where: { 
                            department_id: departmentId, 
                            company_id: companyId 
                        }
                    });

                    // Enroll each user in the course
                    for (const user of departmentUsers) {
                        const existingEnrollment = await UserCourseAssignment.findOne({
                            where: {
                                user_id: user.id,
                                course_id: courseId
                            }
                        });

                        if (!existingEnrollment) {
                            const assignment = await UserCourseAssignment.create({
                                user_id: user.id,
                                course_id: courseId,
                                company_id: companyId,
                                assigned_by: req.user.id,
                                status: 'assigned'
                            });
                            assignments.push(assignment);
                        }
                    }
                }
            }
        }

        res.json({
            success: true,
            message: `Course assigned successfully to ${assignments.length} users`,
            data: { 
                assignments,
                totalAssignments: assignments.length
            }
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

// User Course Enrollment Functions

// Enroll a user in a course
const enrollUserInCourse = async (req, res) => {
    try {
        const { userId, courseId, dueDate, notes } = req.body;
        const adminId = req.user.id;
        const companyId = req.user.company_id;

        // Validate required fields
        if (!userId || !courseId) {
            return res.status(400).json({
                success: false,
                message: 'User ID and Course ID are required'
            });
        }

        // Check if user exists and belongs to the same company
        const user = await User.findOne({
            where: { 
                id: userId, 
                company_id: companyId 
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found or does not belong to your company'
            });
        }

        // Check if course exists and is eligible for this company (company course or published global)
        const course = await Course.findOne({
            where: {
                id: courseId,
                [Op.or]: [
                    { company_id: companyId },
                    { company_id: null, is_published: true }
                ]
            }
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found or does not belong to your company'
            });
        }

        // Check if user is already enrolled
        const existingEnrollment = await UserCourseAssignment.findOne({
            where: {
                user_id: userId,
                course_id: courseId
            }
        });

        if (existingEnrollment) {
            // If enrollment exists but is inactive, reactivate it instead of creating a new one
            if (existingEnrollment.is_active === false) {
                await existingEnrollment.update({
                    is_active: true,
                    status: 'assigned',
                    assigned_by: adminId,
                    assigned_at: new Date(),
                    due_date: dueDate ? new Date(dueDate) : null,
                    notes: notes || null,
                    completed_at: null,
                    completion_percentage: 0.0
                });

                const updatedEnrollmentWithDetails = await UserCourseAssignment.findByPk(existingEnrollment.id, {
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'name', 'email', 'role']
                        },
                        {
                            model: Course,
                            as: 'course',
                            attributes: ['id', 'title', 'description', 'difficulty', 'duration_hours']
                        },
                        {
                            model: User,
                            as: 'assigner',
                            attributes: ['id', 'name', 'email']
                        }
                    ]
                });

                return res.json({
                    success: true,
                    message: 'User re-enrolled in course',
                    enrollment: updatedEnrollmentWithDetails
                });
            }

            return res.status(400).json({
                success: false,
                message: 'User is already enrolled in this course'
            });
        }

        // Create enrollment
        const enrollment = await UserCourseAssignment.create({
            user_id: userId,
            course_id: courseId,
            company_id: companyId,
            assigned_by: adminId,
            due_date: dueDate ? new Date(dueDate) : null,
            notes: notes || null,
            status: 'assigned'
        });

        // Fetch the enrollment with related data
        const enrollmentWithDetails = await UserCourseAssignment.findByPk(enrollment.id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'role']
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'description', 'difficulty', 'duration_hours']
                },
                {
                    model: User,
                    as: 'assigner',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        res.json({
            success: true,
            message: 'User successfully enrolled in course',
            enrollment: enrollmentWithDetails
        });

    } catch (error) {
        console.error('Error enrolling user in course:', error);
        res.status(500).json({
            success: false,
            message: 'Error enrolling user in course'
        });
    }
};

// Unenroll a user from a course
const unenrollUserFromCourse = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const companyId = req.user.company_id;

        // Find enrollment and verify it belongs to the admin's company
        const enrollment = await UserCourseAssignment.findOne({
            where: {
                id: enrollmentId,
                company_id: companyId
            }
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found or does not belong to your company'
            });
        }

        // Soft delete by setting is_active to false
        await enrollment.update({
            is_active: false,
            status: 'cancelled'
        });

        res.json({
            success: true,
            message: 'User successfully unenrolled from course'
        });

    } catch (error) {
        console.error('Error unenrolling user from course:', error);
        res.status(500).json({
            success: false,
            message: 'Error unenrolling user from course'
        });
    }
};

// Get all enrollments for the company
const getUserEnrollments = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const { page = 1, limit = 10, status = 'all', search = '', courseId } = req.query;

        console.log('🔍 Admin getUserEnrollments - companyId:', companyId);
        console.log('🔍 Admin getUserEnrollments - query params:', { page, limit, status, search, courseId });

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: 'Admin user must be associated with a company'
            });
        }

        const where = { company_id: companyId, is_active: true };
        
        if (status !== 'all') where.status = status;
        if (courseId) where.course_id = courseId;

        // Add search functionality
        if (search) {
            where[Op.or] = [
                { '$user.name$': { [Op.like]: `%${search}%` } },
                { '$course.title$': { [Op.like]: `%${search}%` } },
                { '$user.email$': { [Op.like]: `%${search}%` } }
            ];
        }

        console.log('🔍 Where clause for enrollments:', where);

        const enrollments = await UserCourseAssignment.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'role', 'department_id']
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'description', 'difficulty', 'duration_hours']
                },
                {
                    model: User,
                    as: 'assigner',
                    attributes: ['id', 'name', 'email']
                }
            ],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['assigned_at', 'DESC']]
        });

        console.log('📊 Found enrollments:', enrollments.count, 'total');
        console.log('📊 Enrollments data:', enrollments.rows.map(e => ({
            id: e.id,
            user: e.user?.name,
            course: e.course?.title,
            status: e.status
        })));

        res.json({
            success: true,
            enrollments: enrollments.rows,
            totalEnrollments: enrollments.count,
            totalPages: Math.ceil(enrollments.count / parseInt(limit)),
            currentPage: parseInt(page),
            pagination: {
                total: enrollments.count,
                page: parseInt(page),
                pages: Math.ceil(enrollments.count / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error fetching user enrollments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user enrollments'
        });
    }
};

// Update enrollment status
const updateEnrollmentStatus = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const { status, completionPercentage, notes } = req.body;
        const companyId = req.user.company_id;

        // Validate status
        const validStatuses = ['assigned', 'in_progress', 'completed', 'overdue', 'cancelled'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        // Find enrollment and verify it belongs to the admin's company
        const enrollment = await UserCourseAssignment.findOne({
            where: {
                id: enrollmentId,
                company_id: companyId
            }
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found or does not belong to your company'
            });
        }

        // Prepare update data
        const updateData = {};
        if (status) updateData.status = status;
        if (completionPercentage !== undefined) updateData.completion_percentage = completionPercentage;
        if (notes !== undefined) updateData.notes = notes;

        // If status is completed, set completed_at
        if (status === 'completed') {
            updateData.completed_at = new Date();
            updateData.completion_percentage = 100;
        }

        await enrollment.update(updateData);

        // Fetch updated enrollment with related data
        const updatedEnrollment = await UserCourseAssignment.findByPk(enrollment.id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'role']
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'description', 'difficulty', 'duration_hours']
                },
                {
                    model: User,
                    as: 'assigner',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        res.json({
            success: true,
            message: 'Enrollment status updated successfully',
            enrollment: updatedEnrollment
        });

    } catch (error) {
        console.error('Error updating enrollment status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating enrollment status'
        });
    }
};

// Get enrollment statistics
const getEnrollmentStatistics = async (req, res) => {
    try {
        const companyId = req.user.company_id;

        const [
            totalEnrollments,
            activeEnrollments,
            completedEnrollments,
            overdueEnrollments,
            inProgressEnrollments
        ] = await Promise.all([
            UserCourseAssignment.count({
                where: { company_id: companyId, is_active: true }
            }),
            UserCourseAssignment.count({
                where: { 
                    company_id: companyId, 
                    is_active: true,
                    status: ['assigned', 'in_progress']
                }
            }),
            UserCourseAssignment.count({
                where: { 
                    company_id: companyId, 
                    is_active: true,
                    status: 'completed'
                }
            }),
            UserCourseAssignment.count({
                where: { 
                    company_id: companyId, 
                    is_active: true,
                    status: 'overdue'
                }
            }),
            UserCourseAssignment.count({
                where: { 
                    company_id: companyId, 
                    is_active: true,
                    status: 'in_progress'
                }
            })
        ]);

        res.json({
            success: true,
            statistics: {
                totalEnrollments,
                activeEnrollments,
                completedEnrollments,
                overdueEnrollments,
                inProgressEnrollments
            }
        });

    } catch (error) {
        console.error('Error fetching enrollment statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching enrollment statistics'
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
    getCourseStatistics,
    // User Course Enrollment Functions
    enrollUserInCourse,
    unenrollUserFromCourse,
    getUserEnrollments,
    updateEnrollmentStatus,
    getEnrollmentStatistics
};
