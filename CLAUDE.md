# Claude Code Init File - E-Learning Platform

## IMPORTANT: Session Initialization
**When starting a new session, ALWAYS read these files first:**
1. `CLAUDE_INIT.md` - Complete project context and current status
2. `context/IMPLEMENTATION_CONTEXT.md` - Detailed TODO list and requirements

## Project Overview
You are working on an e-learning platform for EU AI Act compliance training. This is a multi-tenant SaaS platform with a Node.js/Express backend API and a React frontend single-page application.

## Tech Stack

### Backend
- **Runtime**: Node.js v20.x+
- **Framework**: Express.js
- **Database**: MySQL 8.x
  - **Host**: 209.38.40.156
  - **User**: root
  - **Password**: BoomBoom10!Baby
  - **Database Name**: db (NOT elearning_platform)
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens) + OAuth 2.0 (Google, Microsoft planned)
- **Server Port**: 5000

### Frontend
- **Framework**: React v18.x with Vite
- **Language**: JavaScript (`.js` and `.jsx` files)
- **Styling**: Tailwind CSS + shadcn/ui component library (PostCSS setup, NOT @tailwindcss/vite)
- **Routing**: react-router-dom
- **State Management**: React Context API (AuthContext, ThemeContext)
- **Dev Port**: 5173
- **UI Preferences**: Clean white backgrounds, dark mode support, no emojis unless requested

## Project Structure

### Backend Structure (`/backend` or `/server`)
```
/src
├── api/
│   ├── routes/         # API route definitions
│   └── controllers/    # Route handlers and business logic
├── config/             # Configuration files
├── middleware/         # Express middleware (auth, validation)
├── models/             # Sequelize database models
├── services/           # Business logic services
├── utils/              # Helper functions
└── server.js           # Entry point
```

### Frontend Structure (`/frontend` or `/client`)
```
src/
├── api/                # Backend API client functions
├── assets/             # Static assets
├── components/
│   ├── ui/             # shadcn/ui components
│   └── shared/         # Reusable components
├── contexts/           # React Context providers
├── features/           # Feature-based modules
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard views
│   └── course-player/  # Course learning interface
├── hooks/              # Custom React hooks
├── pages/              # Route page components
└── styles/             # Global styles
```

## Key Features

### User Roles
- **Super Admin**: Platform-wide administration
- **Admin**: Company-level administration  
- **Manager**: Team/department management and reporting
- **Participant**: Course learners

### Core Functionality
1. **Multi-tenant Architecture**: Companies and departments isolation
2. **Course Management**: Courses contain modules, modules contain lessons
3. **Progress Tracking**: Real-time tracking of lesson completion, time spent, quiz scores
4. **Certificate Generation**: Automatic certificate issuance upon course completion
5. **Team Reporting**: Manager dashboards for team progress monitoring
6. **OAuth Authentication**: Support for Google and Microsoft login

## Database Schema Highlights

The system uses these core tables:
- `companies` - Multi-tenant organizations
- `departments` - Company subdivisions
- `users` - User accounts with role-based access
- `courses`, `modules`, `lessons` - Content hierarchy
- `course_assignments` - Course-to-company/department mapping
- `user_progress` - Learning progress tracking
- `certificates` - Completion certificates

## API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - Traditional email/password login
- `POST /register` - User registration
- `GET /me` - Current user profile
- OAuth endpoints for Google/Microsoft

### Courses (`/api/courses`)
- `GET /` - List assigned courses
- `GET /:courseId` - Course details with modules/lessons

### Progress (`/api/progress`)
- `GET /me` - User's complete progress data
- `POST /event` - Central tracking endpoint for learning events

### Reports (`/api/reports`)
- `GET /team` - Manager team progress report

## Development Guidelines

1. **Code Style**: Follow existing patterns in the codebase
2. **Security**: Never expose secrets, use JWT for API authentication
3. **Progress Tracking**: The `POST /api/progress/event` endpoint is critical for compliance tracking
4. **Component Architecture**: Build small, reusable components
5. **State Management**: Use Context API for global state, useState for local state
6. **Styling**: Use Tailwind utilities and shadcn/ui components

## Testing & Build Commands

Common commands (verify in package.json):
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linter
- `npm run test` - Run tests

## Important Notes

- The platform must ensure compliance tracking for EU AI Act certification
- All user activity in lessons must be tracked via the progress API
- OAuth integration planned for Google and Microsoft accounts (not yet implemented)
- The frontend uses a heartbeat mechanism to track time spent in lessons
- Manager dashboards aggregate team progress for compliance reporting
- Mobile-first responsive design is required for all components
- Test accounts available: participant@test.com, manager@test.com, admin@test.com (all use password123)

## Quick Reference
- **GitHub**: https://github.com/maxnieuwenhuijs/learnai
- **Start Backend**: `cd server && npm run dev`
- **Start Frontend**: `cd frontend && npm run dev`
- **Current Status**: See CLAUDE_INIT.md
- **TODO List**: See context/IMPLEMENTATION_CONTEXT.md