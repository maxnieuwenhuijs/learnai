const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');

// Load environment variables
dotenv.config();

// Import database configuration
const { sequelize } = require('./config/database');

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
            // In production, use the environment variable
            if (origin === process.env.FRONTEND_URL) {
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/reports', reportsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'E-learning Platform API is running',
        timestamp: new Date().toISOString()
    });
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

// 404 handler
app.use((req, res) => {
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