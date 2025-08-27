# Claude Initialization Context

## Project Overview
This is an e-learning platform for EU AI Act compliance training built with React (frontend) and Node.js/Express (backend), using MySQL database.

## Key Project Information

### Database Connection
```
Host: 209.38.40.156
User: root
Password: BoomBoom10!Baby
Database: db
```

### Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui, Recharts
- **Backend**: Node.js, Express.js, Sequelize ORM, JWT auth
- **Database**: MySQL 8.x

### Project Structure
```
elearn/
├── frontend/          # React application
├── server/           # Node.js API
├── context/          # Documentation
└── README.md         # Project documentation
```

## Current Status

### ✅ Completed
- Authentication system with JWT
- Role-based access control (Participant, Manager, Admin, Super Admin)
- Dashboard layouts for all user roles
- Course player with video, text, and quiz support
- Progress tracking system
- Mobile-responsive design
- Dark mode support
- Database schema with all core tables
- Test user seeding

### 🚧 In Progress / TODO
See `context/IMPLEMENTATION_CONTEXT.md` for detailed remaining tasks:
- Certificate generation and PDF export
- Calendar and scheduling features
- Team management for managers
- Advanced reporting and analytics
- Email notifications
- OAuth integration (Google, Microsoft)
- Search functionality
- Admin course content management

## Development Commands

### Start Backend
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

### Start Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Seed Test Data
```bash
cd server
node seed-test-data.js
```

## Test Accounts
- **Participant**: participant@test.com / password123
- **Manager**: manager@test.com / password123
- **Admin**: admin@test.com / password123

## Important Design Decisions

### UI/UX Preferences
- **Color Scheme**: Clean white backgrounds (NOT yellow/cream)
- **Dark Mode**: Available with toggle in header
- **Mobile First**: Fully responsive design
- **No Emojis**: Don't use emojis in UI unless explicitly requested
- **Dashboard Style**: Modern cards with gradients (blue to indigo)

### Technical Preferences
- **Tailwind Setup**: Use PostCSS (NOT @tailwindcss/vite plugin)
- **CORS**: Allow all localhost ports in development
- **Database Sync**: Use `force: false` to preserve data
- **Component Library**: Use shadcn/ui components
- **State Management**: React Context API (Auth, Theme)

### Code Style
- Component-based architecture
- Feature-based folder structure
- Async/await over promises
- Comprehensive error handling
- JWT tokens in httpOnly cookies

## Git Repository
- **URL**: https://github.com/maxnieuwenhuijs/learnai
- **Branch**: main
- **.gitignore**: Excludes node_modules, .env files, build outputs

## API Endpoints Overview

### Authentication
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/logout
- GET /api/auth/me

### Courses
- GET /api/courses
- GET /api/courses/:id
- POST /api/courses (admin only)

### Progress
- GET /api/progress
- POST /api/progress/start
- POST /api/progress/complete
- POST /api/progress/heartbeat

### Reports
- GET /api/reports/compliance
- GET /api/reports/team

## Common Issues & Solutions

### Tailwind CSS Not Working
```bash
# Ensure correct setup:
cd frontend
npm install -D tailwindcss postcss autoprefixer
# Check postcss.config.js and tailwind.config.js
```

### Database Connection Error
- Verify database name is "db" not "elearning_platform"
- Check MySQL server is running
- Confirm network connectivity to 209.38.40.156

### CORS Issues
- Backend configured to accept any localhost port
- Credentials must be included in frontend requests

## Development Workflow

1. **Always check existing code first** - Don't recreate existing functionality
2. **Follow established patterns** - Match existing code style and structure
3. **Test with provided accounts** - Use quick login buttons on login page
4. **Mobile-first development** - Test responsive design at all breakpoints
5. **Maintain documentation** - Update context files when adding features

## File Naming Conventions
- React components: PascalCase (e.g., `CoursePlayer.jsx`)
- Utilities/hooks: camelCase (e.g., `useCourseTracking.js`)
- API routes: kebab-case (e.g., `auth.routes.js`)
- Database models: PascalCase (e.g., `User.js`)

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DB_HOST=209.38.40.156
DB_USER=root
DB_PASS=BoomBoom10!Baby
DB_NAME=db
JWT_SECRET=your-secret-key-change-in-production
SESSION_SECRET=your-session-secret-change-in-production
```

### Frontend
No .env file needed in development (Vite proxy configured)

## Debugging Tips

1. **Check server console** for backend errors
2. **Check browser console** for frontend errors
3. **Verify database tables** with `check-db.js` script
4. **Test API endpoints** with Thunder Client or Postman
5. **Clear localStorage** if authentication issues occur

## Next Session Instructions

When continuing work on this project:
1. Read this file first for context
2. Check `context/IMPLEMENTATION_CONTEXT.md` for detailed TODO list
3. Start both frontend and backend servers
4. Verify database connection
5. Continue with Phase 1 priorities from implementation context

## Contact & Support
- GitHub Issues: https://github.com/maxnieuwenhuijs/learnai/issues
- Documentation: See /context folder for detailed specs

---

**Last Updated**: August 2025
**Version**: 1.0.0
**Status**: Active Development