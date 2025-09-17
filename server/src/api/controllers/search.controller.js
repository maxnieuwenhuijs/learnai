const { Course, Lesson, Module, User, Company } = require('../../models');
const { Op } = require('sequelize');

const searchAll = async (req, res) => {
    try {
        const { q: query } = req.query;
        const userId = req.user.id;
        const userRole = req.user.role;
        const companyId = req.user.company_id;

        if (!query || query.trim().length < 2) {
            return res.json({
                success: true,
                results: {
                    courses: [],
                    lessons: [],
                    users: [],
                    companies: []
                }
            });
        }

        const searchTerm = `%${query.trim()}%`;

        // Search courses (only accessible to user)
        let coursesQuery = {
            [Op.or]: [
                { title: { [Op.like]: searchTerm } },
                { description: { [Op.like]: searchTerm } }
            ],
            is_published: true
        };

        // For non-super-admin users, only show assigned courses
        if (userRole !== 'super_admin') {
            coursesQuery = {
                ...coursesQuery,
                [Op.or]: [
                    { company_id: companyId },
                    { is_global: true }
                ]
            };
        }

        const courses = await Course.findAll({
            where: coursesQuery,
            attributes: ['id', 'title', 'description', 'category'],
            limit: 5
        });

        // Search lessons (only from accessible courses)
        const accessibleCourseIds = courses.map(c => c.id);
        const lessons = accessibleCourseIds.length > 0 ? await Lesson.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.like]: searchTerm } }
                ]
            },
            include: [{
                model: Module,
                as: 'module',
                where: {
                    course_id: { [Op.in]: accessibleCourseIds }
                },
                attributes: ['id', 'title', 'course_id']
            }],
            attributes: ['id', 'title', 'content_type'],
            limit: 10
        }) : [];

        // Search users (only for super admin and managers)
        let users = [];
        if (userRole === 'super_admin' || userRole === 'manager') {
            const userQuery = {
                [Op.or]: [
                    { name: { [Op.like]: searchTerm } },
                    { email: { [Op.like]: searchTerm } }
                ]
            };

            // Managers can only see users from their company
            if (userRole === 'manager') {
                userQuery.company_id = companyId;
            }

            users = await User.findAll({
                where: userQuery,
                attributes: ['id', 'name', 'email', 'role'],
                include: [{
                    model: Company,
                    as: 'company',
                    attributes: ['id', 'name']
                }],
                limit: 5
            });
        }

        // Search companies (only for super admin)
        let companies = [];
        if (userRole === 'super_admin') {
            companies = await Company.findAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: searchTerm } },
                        { industry: { [Op.like]: searchTerm } }
                    ]
                },
                attributes: ['id', 'name', 'industry', 'country'],
                limit: 5
            });
        }

        res.json({
            success: true,
            results: {
                courses: courses.map(course => ({
                    id: course.id,
                    title: course.title,
                    description: course.description,
                    category: course.category,
                    type: 'course',
                    url: `/course/${course.id}`
                })),
                lessons: lessons.map(lesson => ({
                    id: lesson.id,
                    title: lesson.title,
                    type: 'lesson',
                    content_type: lesson.content_type,
                    course_title: lesson.module?.title,
                    course_id: lesson.module?.course_id,
                    url: `/course/${lesson.module?.course_id}?lesson=${lesson.id}`
                })),
                users: users.map(user => ({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    company_name: user.company?.name,
                    type: 'user',
                    url: `/admin/users/${user.id}`
                })),
                companies: companies.map(company => ({
                    id: company.id,
                    name: company.name,
                    industry: company.industry,
                    country: company.country,
                    type: 'company',
                    url: `/admin/companies/${company.id}`
                }))
            }
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing search'
        });
    }
};

module.exports = {
    searchAll
};
