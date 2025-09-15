const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Handle standalone super admin
        if (decoded.standalone && decoded.role === 'super_admin') {
            req.user = {
                id: 'super_admin',
                role: 'super_admin',
                email: process.env.SUPER_ADMIN_EMAIL,
                name: 'Super Administrator',
                company_id: null,
                department_id: null,
                standalone: true
            };
            return next();
        }
        
        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ['password_hash'] }
        });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
        
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication'
        });
    }
};

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
        
        next();
    };
};

module.exports = {
    authMiddleware,
    requireRole
};