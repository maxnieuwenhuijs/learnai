# LearnAI - E-Learning Platform for EU AI Act Compliance

A modern, full-stack e-learning platform designed to deliver EU AI Act compliance training with multi-tenant architecture, role-based access control, and comprehensive learning management features.

## Features

### Core Functionality
- **Multi-tenant Architecture** - Support for multiple companies and departments
- **Role-Based Access Control** - Four user roles: Participant, Manager, Admin, Super Admin
- **Course Management** - Video lessons, text content, quizzes, and interactive labs
- **Progress Tracking** - Real-time progress monitoring with time tracking
- **Mobile Responsive** - Fully optimized for mobile, tablet, and desktop devices
- **Dark Mode** - Theme switching with system preference detection
- **Dashboard Analytics** - Role-specific dashboards with charts and metrics

### User Roles
- **Participants** - Access courses, track progress, earn certificates
- **Managers** - Monitor team progress, assign courses, generate reports
- **Admins** - Manage courses, users, and company settings
- **Super Admins** - Full platform administration across all tenants

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Recharts** - Data visualization
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Sequelize** - ORM for MySQL
- **JWT** - Secure authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### Database
- **MySQL 8.x** - Relational database
- **Sequelize ORM** - Database abstraction layer

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- MySQL 8.x
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/maxnieuwenhuijs/learnai.git
cd learnai
```

2. Install backend dependencies:
```bash
cd server
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Configuration

1. Create backend environment file:
```bash
cd server
cp .env.example .env
```

2. Update `.env` with your database credentials:
```env
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASS=your-database-password
DB_NAME=your-database-name
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
```

### Database Setup

1. Create the database:
```sql
CREATE DATABASE your_database_name;
```

2. Run the server to create tables automatically:
```bash
cd server
npm run dev
```

3. Seed test data (optional):
```bash
node seed-test-data.js
```

### Running the Application

1. Start the backend server:
```bash
cd server
npm run dev
```
Server will run on http://localhost:5000

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:5173

### Test Accounts

For testing purposes, use these credentials:
- **Participant**: participant@test.com / password123
- **Manager**: manager@test.com / password123  
- **Admin**: admin@test.com / password123

## Project Structure

```
learnai/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── api/           # API client modules
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth, Theme)
│   │   ├── features/      # Feature-specific components
│   │   ├── pages/         # Route page components
│   │   └── lib/           # Utility functions
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
│
├── server/                # Node.js backend application
│   ├── src/
│   │   ├── api/          # API routes and controllers
│   │   ├── config/       # Configuration files
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Sequelize models
│   │   └── server.js     # Express server setup
│   └── package.json      # Backend dependencies
│
└── context/              # Documentation files
    └── IMPLEMENTATION_CONTEXT.md  # Detailed implementation guide
```

## API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (admin)
- `PUT /api/courses/:id` - Update course (admin)

### Progress
- `GET /api/progress` - Get user progress
- `POST /api/progress/start` - Start lesson
- `POST /api/progress/complete` - Complete lesson
- `POST /api/progress/heartbeat` - Update time spent

### Reports
- `GET /api/reports/compliance` - Compliance status
- `GET /api/reports/team` - Team analytics
- `GET /api/reports/export` - Export reports

## Development Roadmap

### Phase 1 - Core Features ✅
- User authentication and authorization
- Basic course player
- Progress tracking
- Dashboard layouts

### Phase 2 - In Progress 🚧
- Certificate generation
- Team management
- Calendar integration
- Advanced reporting

### Phase 3 - Planned 📋
- Email notifications
- OAuth integration (Google, Microsoft)
- Search functionality
- Content management system

### Phase 4 - Future 🔮
- Real-time collaboration
- AI-powered recommendations
- Mobile applications
- Multi-language support

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security

- All passwords are hashed using bcrypt
- JWT tokens for stateless authentication
- Environment variables for sensitive data
- SQL injection prevention with parameterized queries
- XSS protection with input sanitization

## Performance

- Lazy loading for code splitting
- Image optimization
- Database query optimization
- Caching strategies
- CDN integration ready

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is proprietary and confidential. All rights reserved.

## Support

For issues and questions:
- Create an issue on [GitHub](https://github.com/maxnieuwenhuijs/learnai/issues)
- Contact the development team

## Acknowledgments

- Built with modern web technologies
- Designed for scalability and performance
- Optimized for user experience
- Compliant with EU regulations

---

**Version:** 1.0.0  
**Last Updated:** August 2025  
**Status:** Active Development