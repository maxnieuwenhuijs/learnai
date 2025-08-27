# AI Coder Context: Full Stack E-learning Platform

## 1. Project High-Level Goal

Your primary task is to build a scalable, multi-tenant SaaS e-learning platform. The platform's purpose is to train and certify employees for compliance with the EU AI Act. You will build both the Node.js RESTful API backend and the React single-page application frontend.

## 2. Backend Architecture

### A. Backend Core Technologies (Tech Stack)

- **Runtime**: Node.js (v20.x or higher)
- **Framework**: Express.js
- **Database**: MySQL 8.x
- **ORM**: Sequelize
- **Authentication**: JSON Web Tokens (JWT)
- **Process Manager**: PM2 for running the application in production

### B. Foundational Database Schema

The entire application logic is built upon the following MySQL database schema. You will need to create Sequelize models for each of these tables.

#### 1. Multi-tenancy & User Management

```sql
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    department_id INT,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('participant', 'manager', 'admin', 'super_admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);
```

#### 2. Content Architecture

```sql
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_role VARCHAR(100)
);

CREATE TABLE modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_duration_minutes INT
);

CREATE TABLE course_modules (
    course_id INT NOT NULL,
    module_id INT NOT NULL,
    module_order INT NOT NULL,
    PRIMARY KEY (course_id, module_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE TABLE lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_type ENUM('video', 'text', 'quiz', 'lab_simulation') NOT NULL,
    content_data JSON,
    lesson_order INT NOT NULL,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);
```

#### 3. Assignment & Tracking

```sql
CREATE TABLE course_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    company_id INT NOT NULL,
    department_id INT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

CREATE TABLE user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lesson_id INT NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed') NOT NULL DEFAULT 'not_started',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    time_spent_seconds INT DEFAULT 0,
    quiz_score DECIMAL(5, 2) NULL,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    certificate_uid VARCHAR(255) NOT NULL UNIQUE,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

### C. Backend Project Structure

Organize the backend code using the following folder structure:

```
/src
├── api/
│   ├── routes/         # Defines all API routes (e.g., auth.routes.js)
│   └── controllers/    # Contains the logic for each route
├── config/             # Database config, JWT secret, etc.
├── middleware/         # Express middleware (e.g., JWT validation)
├── models/             # Sequelize models based on the schema above
├── services/           # Reusable business logic (e.g., progress tracking service)
├── utils/              # Helper functions
└── server.js           # Application entry point
```

### D. Backend API Endpoints to Implement

#### Authentication (`/api/auth`)

- **POST** `/login`: Authenticates a user and returns a JWT
- **POST** `/register`: Creates a new user
- **GET** `/me`: Returns the profile of the currently logged-in user

#### Content Delivery (`/api/courses`)

- **GET** `/`: Get all courses available to the user based on course_assignments
- **GET** `/:courseId`: Get the detailed structure of a single course, including its modules and lessons in the correct order

#### Progress Tracking (`/api/progress`)

- **POST** `/event`: The central endpoint for all user learning activity. It accepts a JSON body (`{ "lessonId", "eventType", "details" }`) and updates the user_progress table

#### Reporting (`/api/reports`)

- **GET** `/team`: Protected for manager roles. Aggregates progress data for all users within the manager's department_id

## 3. Frontend Architecture

### A. Frontend Core Technologies (Tech Stack)

- **Framework**: React (v18.x) using Vite for fast development and build performance
- **Language**: JavaScript (not TypeScript). Use `.js` for logic and `.jsx` for components
- **Styling**: Tailwind CSS for utility-first styling
- **Component Library**: shadcn/ui for pre-built, accessible UI components (Cards, Buttons, Tables, etc.)
- **Routing**: react-router-dom
- **State Management**: useState for local component state and the Context API for global state (e.g., authentication)
- **Build Tool**: Vite with Hot Module Replacement (HMR) and optimized build pipeline

### B. Frontend Project Structure

Organize the frontend code using the following feature-colocated structure:

```
src/
├── api/                  # Functions that call the backend API (e.g., auth.js, courses.js)
├── assets/               # Static files like images and fonts
├── components/
│   ├── ui/               # shadcn/ui components
│   └── shared/           # App-wide reusable components (Header, ProtectedRoute)
├── contexts/             # Global state (e.g., AuthContext.js)
├── features/             # Core application features
│   ├── auth/             # Login/Register components
│   ├── dashboard/        # Participant and Manager dashboards
│   └── course-player/    # The main learning interface
├── hooks/                # App-wide custom hooks (e.g., useAuth.js)
├── pages/                # Top-level components for each route
└── styles/               # Global CSS
```

### C. Key Frontend Logic & Components

#### ProtectedRoute.jsx
A wrapper component that checks the AuthContext. If the user is not authenticated, it redirects to the `/login` page. This component will wrap all secure routes.

#### DashboardPage.jsx
A smart component that checks the user's role from AuthContext.

- If role is `'participant'`, it renders the ParticipantDashboard and calls `GET /api/courses` to display their assigned courses and progress
- If role is `'manager'`, it renders the ManagerDashboard and calls `GET /api/reports/team` to display team progress

#### CoursePlayerLayout.jsx
The main view for taking a course.

- On load, it fetches all data for the course by calling `GET /api/courses/:courseId`
- It displays a two-column layout with a CourseSidebar (showing modules/lessons) and LessonContent

#### useCourseTracking.js (Custom Hook)
This hook is the frontend counterpart to the progress tracking API.

- It centralizes all calls to `POST /api/progress/event`
- It will expose functions like `startLesson(lessonId)`, `completeLesson(lessonId, details)`
- It will implement a "heartbeat" using `setInterval` to periodically call the API with the `TIME_SPENT_UPDATE` event while a lesson is active, and clear the interval on component unmount