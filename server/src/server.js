const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');

// Load environment variables
dotenv.config();

// Import database configuration
const { sequelize } = require('./config/database');

// Import email queue service
const emailQueueService = require('./services/emailQueue.service');

// Create Express app
const app = express();

// Middleware
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests from any localhost port during development
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://localhost:5176',
            'http://localhost:5177',
            'http://localhost:5178',
            'http://localhost:5179',
            'http://localhost:5180',
            'http://localhost:3000'
        ];
        
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);
        
        if (process.env.NODE_ENV === 'production') {
            // In production, check against allowed domains
            const allowedDomains = process.env.FRONTEND_URL ? 
                process.env.FRONTEND_URL.split(',').map(url => url.trim()) : 
                ['https://howtoworkwith.ai', 'https://h2ww.ai'];
            
            if (allowedDomains.includes(origin)) {
                return callback(null, true);
            }
        } else {
            // In development, allow any localhost origin
            if (origin.includes('localhost')) {
                return callback(null, true);
            }
        }
        
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration for OAuth
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Import routes
const authRoutes = require('./api/routes/auth.routes');
const courseRoutes = require('./api/routes/courses.routes');
const progressRoutes = require('./api/routes/progress.routes');
const reportsRoutes = require('./api/routes/reports.routes');
const promptsRoutes = require('./api/routes/prompts.routes');

// Try to import super admin routes
let superAdminRoutes;
try {
    superAdminRoutes = require('./api/routes/super-admin.routes');
    console.log('✅ Super Admin routes loaded');
} catch (err) {
    console.error('❌ Failed to load super admin routes:', err.message);
}

// Try to import optional routes with error handling
let certificatesRoutes, teamRoutes, notificationsRoutes, calendarRoutes, emailRoutes;
try {
    certificatesRoutes = require('./api/routes/certificates.routes');
    console.log('✅ Certificates routes loaded');
} catch (err) {
    console.error('❌ Failed to load certificates routes:', err.message);
}

try {
    teamRoutes = require('./api/routes/team.routes');
    console.log('✅ Team routes loaded');
} catch (err) {
    console.error('❌ Failed to load team routes:', err.message);
}

try {
    notificationsRoutes = require('./api/routes/notifications.routes');
    console.log('✅ Notifications routes loaded');
} catch (err) {
    console.error('❌ Failed to load notifications routes:', err.message);
}

try {
    calendarRoutes = require('./api/routes/calendar.routes');
    console.log('✅ Calendar routes loaded');
} catch (err) {
    console.error('❌ Failed to load calendar routes:', err.message);
}

try {
    emailRoutes = require('./api/routes/email.routes');
    console.log('✅ Email routes loaded');
} catch (err) {
    console.error('❌ Failed to load email routes:', err.message);
}


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/prompts', promptsRoutes);

// Super Admin Routes
if (superAdminRoutes) {
    app.use('/api/super-admin', superAdminRoutes);
    console.log('📌 Super Admin routes registered at /api/super-admin');
}

if (certificatesRoutes) {
    app.use('/api/certificates', certificatesRoutes);
    console.log('📌 Certificates routes registered at /api/certificates');
}

if (teamRoutes) {
    app.use('/api/team', teamRoutes);
    console.log('📌 Team routes registered at /api/team');
}

if (notificationsRoutes) {
    app.use('/api/notifications', notificationsRoutes);
    console.log('📌 Notifications routes registered at /api/notifications');
}

if (calendarRoutes) {
    app.use('/api/calendar', calendarRoutes);
    console.log('📌 Calendar routes registered at /api/calendar');
}

if (emailRoutes) {
    app.use('/api/email', emailRoutes);
    console.log('📌 Email routes registered at /api/email');
}


// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'E-learning Platform API is running',
        timestamp: new Date().toISOString()
    });
});

// Debug route to list all registered routes
app.get('/api/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                method: Object.keys(middleware.route.methods)[0].toUpperCase()
            });
        } else if (middleware.name === 'router') {
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    const path = middleware.regexp.source.replace(/\\\//g, '/').replace(/[\^$?.*+()]/g, '');
                    routes.push({
                        path: path + handler.route.path,
                        method: Object.keys(handler.route.methods)[0].toUpperCase()
                    });
                }
            });
        }
    });
    res.json(routes);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler - MUST BE LAST
app.use((req, res) => {
    console.log(`404: ${req.method} ${req.path}`);
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;

// Database connection and server start
async function startServer() {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
        
        // Sync database models (in development only)
        // Using force: false to avoid constraint issues with existing tables
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ force: false });
            console.log('✅ Database models synchronized.');
        }
        
        // Start email queue service
        emailQueueService.start();
        console.log('📧 Email queue service started');
        
        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
}

startServer();