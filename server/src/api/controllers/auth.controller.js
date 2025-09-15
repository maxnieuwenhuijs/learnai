const jwt = require('jsonwebtoken');
const { User, Company, Department } = require('../../models');
const { validationResult } = require('express-validator');

const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            companyId: user.company_id,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Check for standalone super admin login first
        if (email === process.env.SUPER_ADMIN_EMAIL && password === process.env.SUPER_ADMIN_PASSWORD) {
            const superAdminToken = jwt.sign(
                {
                    userId: 'super_admin',
                    companyId: null,
                    role: 'super_admin',
                    standalone: true
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            return res.json({
                success: true,
                token: superAdminToken,
                user: {
                    id: 'super_admin',
                    email: process.env.SUPER_ADMIN_EMAIL,
                    name: 'Super Administrator',
                    role: 'super_admin',
                    company_id: null,
                    company: null,
                    department_id: null,
                    department: null,
                    standalone: true
                }
            });
        }

        const user = await User.findOne({
            where: { email },
            include: [
                {
                    model: Company,
                    as: 'company',
                    attributes: { exclude: ['logo_url', 'logo_filename'] }
                },
                { model: Department, as: 'department' }
            ]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(user);
        const safeUser = user.toSafeObject();

        res.json({
            success: true,
            token,
            user: safeUser
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password, name, company_id, department_id, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new user
        const user = await User.create({
            email,
            password_hash: password, // Will be hashed by the model's beforeCreate hook
            name,
            company_id,
            department_id,
            role: role || 'participant'
        });

        const token = generateToken(user);
        const safeUser = user.toSafeObject();

        res.status(201).json({
            success: true,
            token,
            user: safeUser
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

const getMe = async (req, res) => {
    try {
        // Handle standalone super admin
        if (req.user.standalone && req.user.role === 'super_admin') {
            return res.json({
                success: true,
                user: {
                    id: 'super_admin',
                    email: process.env.SUPER_ADMIN_EMAIL,
                    name: 'Super Administrator',
                    role: 'super_admin',
                    company_id: null,
                    company: null,
                    department_id: null,
                    department: null,
                    standalone: true
                }
            });
        }

        const user = await User.findByPk(req.user.id, {
            include: [
                {
                    model: Company,
                    as: 'company',
                    attributes: { exclude: ['logo_url', 'logo_filename'] }
                },
                { model: Department, as: 'department' }
            ],
            attributes: { exclude: ['password_hash'] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: user.toSafeObject()
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user data'
        });
    }
};

module.exports = {
    login,
    register,
    getMe
};