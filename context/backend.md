# Backend Architecture - HowToWorkWith.AI

## 🏗️ Backend Overzicht

De backend is gebouwd met Node.js en Express.js, met MySQL als database en Sequelize als ORM. Het systeem ondersteunt multi-tenant architectuur en role-based toegang.

## 📁 Project Structuur

```
server/
├── src/
│   ├── api/
│   │   ├── controllers/     # Business logic
│   │   └── routes/         # API endpoints
│   ├── config/
│   │   ├── database.js     # Database configuratie
│   │   └── passport.js     # OAuth configuratie
│   ├── middleware/
│   │   └── auth.middleware.js  # Authentication middleware
│   ├── models/             # Sequelize modellen
│   ├── services/           # Business services
│   └── server.js           # Express server setup
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - User login
- `POST /register` - User registration
- `GET /me` - Get current user
- `GET /google` - Google OAuth
- `GET /google/callback` - Google OAuth callback
- `GET /microsoft` - Microsoft OAuth
- `GET /microsoft/callback` - Microsoft OAuth callback
- `POST /logout` - User logout

### Courses (`/api/courses`)
- `GET /` - Get assigned courses
- `GET /:courseId` - Get course details

### Progress (`/api/progress`)
- `GET /me` - Get user progress
- `POST /event` - Track learning events

### Prompts (`/api/prompts`)
- `GET /` - Get prompts with filtering
- `GET /:id` - Get prompt by ID
- `POST /` - Create prompt
- `PUT /:id` - Update prompt
- `DELETE /:id` - Delete prompt
- `GET /categories` - Get categories
- `POST /categories` - Create category
- `GET /analytics/usage` - Get analytics
- `GET /approvals/requests` - Get approval requests
- `PUT /approvals/:id` - Update approval status

### Reports (`/api/reports`)
- `GET /compliance` - Compliance report
- `GET /team` - Team progress report
- `GET /department` - Department analytics
- `GET /export/:type` - Export reports
- `GET /dashboard` - Dashboard statistics

### Team (`/api/team`)
- `GET /members` - Get team members
- `GET /members/:userId` - Get team member details
- `POST /assign-course` - Assign course to team
- `GET /progress` - Get team progress
- `GET /analytics` - Get team analytics
- `PUT /members/:userId/department` - Update member department
- `DELETE /members/:userId/courses/:courseId` - Remove course assignment

### Calendar (`/api/calendar`)
- `GET /events` - Get calendar events
- `GET /upcoming` - Get upcoming events
- `GET /stats` - Get calendar statistics
- `POST /events` - Create event
- `PUT /events/:eventId` - Update event
- `DELETE /events/:eventId` - Delete event
- `POST /course-events` - Create course events

### Certificates (`/api/certificates`)
- `GET /verify/:code` - Verify certificate (public)
- `GET /` - Get user certificates
- `GET /:id` - Get certificate
- `GET /:id/download` - Download certificate PDF
- `POST /generate` - Generate certificate

### Notifications (`/api/notifications`)
- `GET /` - Get notifications
- `POST /:notificationId/read` - Mark as read
- `POST /mark-all-read` - Mark all as read
- `DELETE /:notificationId` - Delete notification
- `GET /stats` - Get notification stats
- `POST /` - Create notification
- `POST /bulk` - Bulk create notifications

### Email (`/api/email`)
- `GET /test-connection` - Test email connection
- `POST /send-test` - Send test email
- `GET /queue-status` - Get queue status
- `POST /queue-clear` - Clear queue
- `POST /send-welcome/:userId` - Send welcome email
- `POST /send-certificate` - Send certificate email
- `POST /send-deadline-reminders` - Send deadline reminders
- `POST /send-team-reports` - Send team reports

## 🗄️ Database Schema

### Core Tables
- `users` - Gebruikers informatie
- `companies` - Bedrijfs informatie
- `departments` - Afdelingen
- `courses` - Cursussen
- `modules` - Cursus modules
- `lessons` - Cursus lessen
- `user_progress` - Gebruiker voortgang
- `certificates` - Certificaten

### Prompt System
- `prompts` - Prompt templates
- `prompt_categories` - Prompt categorieën
- `prompt_versions` - Prompt versies
- `prompt_usage` - Prompt gebruik tracking
- `prompt_approvals` - Prompt goedkeuringen

### Calendar & Notifications
- `calendar_events` - Kalender events
- `notifications` - Notificaties
- `report_schedules` - Rapport planning

## 🔐 Authentication & Authorization

### JWT Implementation
- Access tokens (7 dagen geldig)
- Refresh token mechanism
- Token blacklisting voor logout

### OAuth Integration
- Google OAuth 2.0
- Microsoft OAuth 2.0
- Automatic user creation
- Role assignment

### Role-Based Access Control
- `participant` - Basis gebruiker
- `manager` - Team beheer
- `admin` - Platform beheer
- `super_admin` - Volledige toegang

## 🛡️ Security Features

### Input Validation
- Express-validator middleware
- SQL injection preventie
- XSS protection
- CSRF protection

### Rate Limiting
- API rate limiting
- Login attempt limiting
- Request throttling

### Data Protection
- Password hashing (bcrypt)
- Sensitive data encryption
- GDPR compliance features

## 📊 Performance Optimizations

### Database
- Connection pooling
- Query optimization
- Indexing strategy
- Caching layer

### API
- Response compression
- Request batching
- Pagination
- Caching headers

### Monitoring
- PM2 process monitoring
- Error logging
- Performance metrics
- Health checks

## 🔧 Configuration

### Environment Variables
```env
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_USER=username
DB_PASSWORD=password
DB_NAME=database_name
JWT_SECRET=secret_key
SESSION_SECRET=session_secret
FRONTEND_URL=https://app.howtoworkwith.ai
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=email@domain.com
EMAIL_PASS=app_password
```

### PM2 Configuration
- Process management
- Auto-restart on crash
- Memory monitoring
- Log rotation
- Cluster mode support

## 🚀 Deployment

### Production Setup
- Ubuntu server
- Nginx reverse proxy
- PM2 process manager
- MySQL database
- SSL certificates

### Monitoring
- PM2 monitoring
- Nginx access logs
- Application logs
- Error tracking
- Performance metrics

## 🔄 Development Workflow

### Code Structure
- MVC pattern
- Service layer
- Repository pattern
- Middleware composition

### Testing
- Unit tests
- Integration tests
- API testing
- Database testing

### Documentation
- API documentation
- Code comments
- Database schema docs
- Deployment guides
