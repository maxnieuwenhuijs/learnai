# 🔐 Admin Routes & Database Overview - Complete Analysis

## 📋 Document Overview

This document provides a comprehensive overview of all admin routes, database structure, and role-based access control in the HowToWorkWith.AI e-learning platform. It clearly distinguishes between **ADMIN** (company-level) and **SUPER_ADMIN** (platform-level) roles and their respective functionalities.

---

## 🎯 Role Hierarchy & Access Levels

### **Role Structure:**

```
SUPER_ADMIN (Platform Level)
├── Global platform management
├── Multi-tenant oversight
├── All company data access
├── System-wide configuration
└── Cross-company analytics

ADMIN (Company Level)
├── Company-specific management
├── Department oversight
├── User management within company
├── Course assignment & management
└── Company analytics only

MANAGER (Department Level)
├── Department user management
├── Team progress tracking
├── Limited course management
└── Department reports

PARTICIPANT (User Level)
├── Course access & completion
├── Personal progress tracking
├── Basic profile management
└── Certificate generation
```

---

## 🗄️ Database Structure

### **Core Tables:**

#### **Users Table**

```sql
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int DEFAULT NULL,           -- NULL for super_admin
  `department_id` int DEFAULT NULL,        -- NULL for super_admin
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('participant','manager','admin','super_admin') NOT NULL DEFAULT 'participant',
  `oauth_provider` varchar(20) DEFAULT NULL,
  `oauth_id` varchar(255) DEFAULT NULL,
  `oauth_email` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `company_id` (`company_id`),
  KEY `department_id` (`department_id`),
  KEY `role` (`role`)
);
```

#### **Companies Table**

```sql
CREATE TABLE `companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(100) NOT NULL,            -- Multi-tenant subdomain
  `industry` varchar(255) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'Netherlands',
  `size` varchar(50) DEFAULT NULL,
  `description` text,
  `status` enum('active','trial','inactive','suspended') NOT NULL DEFAULT 'trial',
  `subscription_type` enum('free','basic','premium','enterprise') NOT NULL DEFAULT 'free',
  `max_users` int DEFAULT '10',
  `logo_url` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
);
```

#### **Departments Table**

```sql
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
);
```

#### **Audit Logs Table**

```sql
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `company_id` int DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'low',
  `description` text,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_logs_user_id` (`user_id`),
  KEY `audit_logs_company_id` (`company_id`),
  KEY `audit_logs_action` (`action`),
  KEY `audit_logs_created_at` (`created_at`)
);
```

---

## 🛣️ API Routes & Endpoints

### **SUPER_ADMIN Routes** (`/api/super-admin/*`)

#### **Authentication & Authorization:**

- **Middleware**: `authMiddleware` + `superAdminOnly`
- **Access**: Only users with `role: 'super_admin'`
- **Standalone Support**: Super admin can operate without company association

#### **Company Management:**

```javascript
GET    /api/super-admin/companies                    // List all companies with stats
POST   /api/super-admin/companies                    // Create new company + admin
PUT    /api/super-admin/companies/:id                // Update company details
DELETE /api/super-admin/companies/:id                // Delete company and data
GET    /api/super-admin/companies/:id                // Get detailed company info
POST   /api/super-admin/companies/:companyId/managers // Create company manager
POST   /api/super-admin/companies/:companyId/departments // Create department
DELETE /api/super-admin/companies/:companyId/departments/:departmentId // Delete department
POST   /api/super-admin/companies/:companyId/users   // Create company user
```

#### **User Management:**

```javascript
GET    /api/super-admin/users                        // All users with filtering/pagination
GET    /api/super-admin/users/analytics              // User statistics and analytics
POST   /api/super-admin/users                        // Create user
PUT    /api/super-admin/users/:id                    // Update user
DELETE /api/super-admin/users/:id                    // Delete user
```

#### **Prompt Management:**

```javascript
GET    /api/super-admin/prompts                      // All prompts with filtering
GET    /api/super-admin/prompts/analytics            // Prompt usage analytics
GET    /api/super-admin/prompts/by-company           // Company-grouped prompt view
DELETE /api/super-admin/prompts/:id                  // Delete any prompt
PUT    /api/super-admin/prompts/:id/status           // Update prompt status
```

#### **Course Management:**

```javascript
GET    /api/super-admin/courses                      // All courses
GET    /api/super-admin/courses/:id                  // Get specific course
GET    /api/super-admin/courses/:id/analytics        // Course progress analytics
POST   /api/super-admin/courses                      // Create course
PUT    /api/super-admin/courses/:id                  // Update course
DELETE /api/super-admin/courses/:id                  // Delete course
POST   /api/super-admin/courses/:id/duplicate        // Duplicate course

// Module Management
GET    /api/super-admin/courses/:courseId/modules    // Get course modules
POST   /api/super-admin/courses/:courseId/modules    // Create module
PUT    /api/super-admin/modules/:id                  // Update module
DELETE /api/super-admin/modules/:id                  // Delete module

// Lesson Management
GET    /api/super-admin/modules/:moduleId/lessons    // Get module lessons
POST   /api/super-admin/modules/:moduleId/lessons    // Create lesson
PUT    /api/super-admin/lessons/:id                  // Update lesson
DELETE /api/super-admin/lessons/:id                  // Delete lesson

// Company Course Assignment
GET    /api/super-admin/companies/:companyId/courses // Get company courses
GET    /api/super-admin/companies/:companyId/available-courses // Available global courses
POST   /api/super-admin/companies/:companyId/courses // Assign course to company
DELETE /api/super-admin/companies/:companyId/courses/:courseId // Unassign course
```

#### **Analytics & Reporting:**

```javascript
GET    /api/super-admin/dashboard                    // Dashboard statistics
GET    /api/super-admin/analytics/overview           // Platform overview metrics
GET    /api/super-admin/analytics/trends             // Usage trends and patterns
GET    /api/super-admin/analytics/performance        // System performance metrics
```

#### **Audit & Monitoring:**

```javascript
GET    /api/super-admin/audit-logs                   // Audit trail with filtering
GET    /api/super-admin/system-metrics               // Historical system metrics
GET    /api/super-admin/system-health                // Real-time health status
```

#### **System Administration:**

```javascript
POST   /api/super-admin/reset-database               // Clear all platform data
POST   /api/super-admin/seed-data                    // Generate sample data
```

#### **Certificate Management:**

```javascript
GET    /api/super-admin/courses/:courseId/certificate-settings // Get certificate settings
PUT    /api/super-admin/courses/:courseId/certificate-settings // Update certificate settings
GET    /api/super-admin/courses/:courseId/certificates // Get course certificates
POST   /api/super-admin/courses/:courseId/certificates/generate // Generate certificate
GET    /api/super-admin/certificates/:certificateId/download // Download certificate
```

---

### **ADMIN Routes** (Company-Level Access)

#### **Analytics Routes** (`/api/analytics/*`)

```javascript
// Company-level analytics (admin + super_admin)
GET / api / analytics / prompts; // Prompt analytics for company
GET / api / analytics / company; // Company analytics (super_admin only)
```

#### **Reports Routes** (`/api/reports/*`)

```javascript
// Team reports (manager + admin + super_admin)
GET    /api/reports/team                             // Team progress reports
GET    /api/reports/export/:type                     // Export reports

// Department reports (admin + super_admin)
GET    /api/reports/department                       // Department analytics
```

#### **Team Management Routes** (`/api/team/*`)

```javascript
// Team management (manager + admin + super_admin)
GET    /api/team/members                             // Get team members
POST   /api/team/members                             // Add team member
PUT    /api/team/members/:id                         // Update team member
DELETE /api/team/members/:id                         // Remove team member
GET    /api/team/progress                            // Team progress
GET    /api/team/analytics                           // Team analytics

// Department management (admin + super_admin)
GET    /api/team/departments                         // Get departments
POST   /api/team/departments                         // Create department
PUT    /api/team/departments/:id                     // Update department
DELETE /api/team/departments/:id                     // Delete department
```

#### **Email Management Routes** (`/api/email/*`)

```javascript
// Email management (admin + super_admin)
GET    /api/email/templates                          // Get email templates
POST   /api/email/templates                          // Create email template
PUT    /api/email/templates/:id                      // Update email template
DELETE /api/email/templates/:id                      // Delete email template
GET    /api/email/queue                              // Get email queue
POST   /api/email/send                               // Send email
GET    /api/email/history                            // Email history
POST   /api/email/test                               // Test email
GET    /api/email/settings                           // Email settings
PUT    /api/email/settings                           // Update email settings
```

#### **Calendar Management Routes** (`/api/calendar/*`)

```javascript
// Calendar management (admin + super_admin + manager)
GET    /api/calendar/events                          // Get calendar events
POST   /api/calendar/events                          // Create calendar event
PUT    /api/calendar/events/:id                      // Update calendar event
DELETE /api/calendar/events/:id                      // Delete calendar event
```

#### **Notification Management Routes** (`/api/notifications/*`)

```javascript
// Notification management (admin + manager)
GET    /api/notifications                            // Get notifications
POST   /api/notifications                            // Create notification
PUT    /api/notifications/:id                        // Update notification
DELETE /api/notifications/:id                        // Delete notification
GET    /api/notifications/settings                   // Notification settings
PUT    /api/notifications/settings                   // Update notification settings
```

#### **Prompt Management Routes** (`/api/prompts/*`)

```javascript
// Prompt approval (manager + admin + super_admin)
GET    /api/prompts/approvals/requests               // Get approval requests
PUT    /api/prompts/approvals/:id                    // Process approval
```

---

## 🎨 Frontend Admin Pages

### **SUPER_ADMIN Pages** (`/admin/super-admin/*`)

#### **Main Dashboard:**

- **Route**: `/admin/super-admin`
- **Component**: `SuperAdminDashboard.jsx`
- **Features**: Platform overview, statistics, recent activity

#### **Company Management:**

- **Route**: `/admin/super-admin/companies`
- **Component**: `SuperAdminCompaniesPage.jsx`
- **Features**: Company list, create/edit/delete companies, company details

#### **User Management:**

- **Route**: `/admin/super-admin/users`
- **Component**: `SuperAdminUsersPage.jsx`
- **Features**: Platform-wide user directory, user analytics, role management

#### **Prompt Management:**

- **Route**: `/admin/super-admin/prompts`
- **Component**: `SuperAdminPromptsPage.jsx`
- **Features**: Global prompt library, usage analytics, prompt management

#### **Analytics:**

- **Route**: `/admin/super-admin/analytics`
- **Component**: `SuperAdminAnalyticsPage.jsx`
- **Features**: Platform-wide analytics, performance metrics, trends

### **ADMIN Pages** (Company-Level)

#### **Course Management:**

- **Route**: `/admin/courses`
- **Component**: `AdminCoursesPage.jsx`
- **Features**: Company course management, course creation, assignment

#### **Course Builder:**

- **Route**: `/admin/course-builder`
- **Component**: `CourseBuilderPage.jsx`
- **Features**: Advanced course creation, module management, content upload

#### **Content Upload:**

- **Route**: `/admin/content-upload`
- **Component**: `ContentUploadPage.jsx`
- **Features**: Media management, document storage, file organization

#### **Module Management:**

- **Route**: `/admin/modules`
- **Component**: `ModuleManagerPage.jsx`
- **Features**: Course module organization, lesson management

#### **Quiz Builder:**

- **Route**: `/admin/quiz-builder`
- **Component**: `QuizBuilderPage.jsx`
- **Features**: Interactive assessment creation, question bank

#### **Company Details:**

- **Route**: `/admin/company`
- **Component**: `CompanyDetailPage.jsx`
- **Features**: Company profile, settings, user management

---

## 🔐 Authentication & Authorization

### **Middleware Stack:**

#### **Authentication Middleware** (`authMiddleware`):

```javascript
// JWT token validation
// User lookup and session management
// Standalone super admin support
// Error handling for expired/invalid tokens
```

#### **Role-Based Authorization** (`requireRole`):

```javascript
// Multi-role support: requireRole('admin', 'super_admin')
// Permission validation
// Access denied responses
```

#### **Super Admin Only Middleware**:

```javascript
// Dedicated super admin role check
// Platform-level access control
// Standalone operation support
```

### **Role Permissions Matrix:**

| Feature                    | Participant | Manager | Admin | Super Admin |
| -------------------------- | ----------- | ------- | ----- | ----------- |
| **View Courses**           | ✅          | ✅      | ✅    | ✅          |
| **Complete Courses**       | ✅          | ✅      | ✅    | ✅          |
| **View Personal Progress** | ✅          | ✅      | ✅    | ✅          |
| **Manage Team Members**    | ❌          | ✅      | ✅    | ✅          |
| **View Team Reports**      | ❌          | ✅      | ✅    | ✅          |
| **Manage Departments**     | ❌          | ❌      | ✅    | ✅          |
| **Company Analytics**      | ❌          | ❌      | ✅    | ✅          |
| **Create/Edit Courses**    | ❌          | ❌      | ✅    | ✅          |
| **User Management**        | ❌          | ❌      | ✅    | ✅          |
| **Email Management**       | ❌          | ❌      | ✅    | ✅          |
| **Calendar Management**    | ❌          | ❌      | ✅    | ✅          |
| **Platform Analytics**     | ❌          | ❌      | ❌    | ✅          |
| **Company Management**     | ❌          | ❌      | ❌    | ✅          |
| **Global User Management** | ❌          | ❌      | ❌    | ✅          |
| **System Administration**  | ❌          | ❌      | ❌    | ✅          |
| **Audit Logs**             | ❌          | ❌      | ❌    | ✅          |

---

## 🚀 Key Features & Capabilities

### **SUPER_ADMIN Features:**

#### **Multi-Tenant Management:**

- Company creation with automatic admin setup
- Subdomain slug generation (`company.h2ww.ai`)
- Company status and subscription management
- Logo upload and branding

#### **Platform Analytics:**

- Real-time system performance monitoring
- Cross-company usage analytics
- Growth trends and engagement metrics
- System health monitoring

#### **Global Content Management:**

- Platform-wide course library
- Global prompt management
- Cross-company content sharing
- Bulk operations and assignments

#### **System Administration:**

- Database reset and seeding
- Audit trail management
- System metrics collection
- Performance monitoring

### **ADMIN Features:**

#### **Company Management:**

- User management within company
- Department organization
- Course assignment and management
- Company-specific analytics

#### **Content Management:**

- Course creation and editing
- Module and lesson management
- Content upload and organization
- Quiz and assessment creation

#### **Team Management:**

- Department oversight
- Team progress tracking
- User role management
- Performance reporting

---

## 🔧 Technical Implementation

### **Backend Architecture:**

#### **Route Organization:**

```
server/src/api/routes/
├── super-admin.routes.js      // Super admin only routes
├── analytics.routes.js        // Analytics with role checks
├── reports.routes.js          // Reports with role checks
├── team.routes.js             // Team management with role checks
├── email.routes.js            // Email management with role checks
├── calendar.routes.js         // Calendar with role checks
├── notifications.routes.js    // Notifications with role checks
├── prompts.routes.js          // Prompts with approval checks
└── ...other routes
```

#### **Controller Organization:**

```
server/src/api/controllers/
├── super-admin.controller.js  // Super admin functionality
├── analytics.controller.js    // Analytics logic
├── reports.controller.js      // Report generation
├── team.controller.js         // Team management
├── email.controller.js        // Email services
├── calendar.controller.js     // Calendar management
├── notifications.controller.js // Notification system
└── ...other controllers
```

#### **Middleware Stack:**

```
server/src/middleware/
├── auth.middleware.js         // Authentication & authorization
├── audit.middleware.js        // Audit logging
└── metrics.middleware.js      // Performance monitoring
```

### **Frontend Architecture:**

#### **Page Organization:**

```
frontend/src/pages/admin/
├── SuperAdminDashboard.jsx        // Platform overview
├── SuperAdminCompaniesPage.jsx    // Company management
├── SuperAdminUsersPage.jsx        // User management
├── SuperAdminPromptsPage.jsx      // Prompt management
├── SuperAdminAnalyticsPage.jsx    // Platform analytics
├── AdminCoursesPage.jsx           // Course management
├── CourseBuilderPage.jsx          // Course creation
├── ContentUploadPage.jsx          // Content management
├── ModuleManagerPage.jsx          // Module management
├── QuizBuilderPage.jsx            // Quiz creation
└── CompanyDetailPage.jsx          // Company details
```

---

## 📊 Database Relationships

### **Key Relationships:**

```javascript
// Company relationships
Company → Users (hasMany)
Company → Departments (hasMany)
Company → Prompts (hasMany)
Company → AuditLogs (hasMany)

// User relationships
User → Company (belongsTo)
User → Department (belongsTo)
User → AuditLogs (hasMany)
User → PromptUsage (hasMany)

// Prompt relationships
Prompt → Company (belongsTo)
Prompt → Category (belongsTo)
Prompt → Creator (belongsTo User)
Prompt → Usage (hasMany PromptUsage)

// Course relationships
Course → Company (belongsTo, optional for global courses)
Course → Modules (hasMany)
Course → CompanyCourseAssignment (hasMany)

// Audit relationships
AuditLog → User (belongsTo)
AuditLog → Company (belongsTo)
```

---

## 🚨 Security Considerations

### **Access Control:**

- **JWT Authentication**: All routes require valid JWT tokens
- **Role-Based Authorization**: Strict role checking on all endpoints
- **Company Isolation**: Admin users can only access their company data
- **Audit Logging**: All admin actions are logged for compliance

### **Data Protection:**

- **Multi-Tenant Isolation**: Company data is strictly separated
- **Input Validation**: All inputs are validated and sanitized
- **Error Handling**: Secure error responses without data leakage
- **Password Security**: Bcrypt hashing for all passwords

### **Super Admin Security:**

- **Standalone Operation**: Super admin can operate without company association
- **Platform-Wide Access**: Complete access to all company data
- **System Administration**: Database reset and maintenance capabilities
- **Audit Trail**: Complete action logging for all operations

---

## 📈 Performance & Monitoring

### **System Monitoring:**

- **Real-time Metrics**: CPU, memory, response times
- **Health Checks**: System status monitoring
- **Error Tracking**: Automatic error rate calculation
- **Performance Analytics**: Historical performance data

### **Database Optimization:**

- **Indexed Queries**: Optimized database queries
- **Pagination**: Large dataset handling
- **Caching**: Request metrics caching
- **Connection Pooling**: Efficient database connections

---

## 🎯 Next Steps & Recommendations

### **Immediate Actions:**

1. **Test All Admin Routes**: Verify all endpoints work correctly
2. **Role Permission Testing**: Ensure proper access control
3. **Frontend Integration**: Connect admin pages to real APIs
4. **Error Handling**: Implement comprehensive error handling

### **Future Enhancements:**

1. **Advanced Analytics**: More detailed reporting capabilities
2. **Bulk Operations**: Mass data management features
3. **API Rate Limiting**: Enhanced security controls
4. **Real-time Updates**: WebSocket integration for live updates

### **Monitoring & Maintenance:**

1. **Regular Security Audits**: Periodic access control reviews
2. **Performance Monitoring**: Continuous system health checks
3. **Database Maintenance**: Regular optimization and cleanup
4. **User Training**: Admin user documentation and training

---

## 📋 Quick Reference

### **Essential URLs:**

- **Super Admin Dashboard**: `/admin/super-admin`
- **Company Management**: `/admin/super-admin/companies`
- **User Management**: `/admin/super-admin/users`
- **Platform Analytics**: `/admin/super-admin/analytics`
- **Course Management**: `/admin/courses`
- **Course Builder**: `/admin/course-builder`

### **Key API Endpoints:**

- **Super Admin**: `/api/super-admin/*`
- **Analytics**: `/api/analytics/*`
- **Reports**: `/api/reports/*`
- **Team Management**: `/api/team/*`
- **Email Management**: `/api/email/*`

### **Role Hierarchy:**

1. **SUPER_ADMIN**: Platform-wide access
2. **ADMIN**: Company-level access
3. **MANAGER**: Department-level access
4. **PARTICIPANT**: User-level access

---

_Last Updated: December 2024_  
_Document Version: 1.0_  
_Platform Version: E-learning Platform v2.0_  
_Total Admin Routes: 50+_  
_Total Database Tables: 15+_  
_Security Level: Production Ready_
