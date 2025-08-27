# Node.js Backend Blueprint: "The Agency" E-learning Platform

## 1. Vision & Tech Stack

**Vision:** The backend is the backbone of the platform. It is a secure, scalable, and efficient API that handles all business logic, data management, and user authentication. The API serves as the single source of truth for the React frontend.

**Tech Stack:**

- **Runtime:** Node.js (v20.x or higher)
- **Framework:** Express.js
- **Database:** MySQL 8.x (with an ORM like Sequelize for robust database modeling and interaction)
- **Authentication:** JSON Web Tokens (JWT)
- **Process Management:** PM2

## 2. Architecture & Responsibilities

The Node.js application functions as the API layer in our 3-tier architecture. The responsibilities are strictly separated:

- **Define API Endpoints:** Providing a clear and logical RESTful API for the frontend.
- **Authentication & Authorization:** Validating user credentials, issuing and verifying JWTs, and securing endpoints based on user roles (participant, manager, admin).
- **Execute Business Logic:** Processing all logic that does not belong in the database or frontend. For example:
  - Calculating the progress of a course based on completed lessons.
  - Determining if a user has earned a certificate.
  - Processing the logic behind the `POST /api/progress/event` calls.
- **Database Communication:** Performing all CRUD (Create, Read, Update, Delete) operations on the MySQL database via the ORM layer (Sequelize). The backend is the only component that communicates directly with the database.

## 3. Project Structure (Suggestion)

A scalable folder structure is crucial for maintainability.

```
/src
├── api/
│   ├── routes/         # Defines all API routes (e.g., auth.routes.js, courses.routes.js)
│   └── controllers/    # The logic that is executed when a route is called
├── config/             # Configuration files (database, JWT secret, etc.)
├── middleware/         # Express middleware (e.g., auth.middleware.js for JWT validation)
├── models/             # Sequelize database models (user.model.js, course.model.js)
├── services/           # Reusable business logic (e.g., progress.service.js)
├── utils/              # Helper functions (e.g., error.handler.js)
└── server.js           # The application's starting point
```

## 4. Authentication Flow (JWT)

### Traditional Email/Password Authentication

1. **Login:** User sends email and password to `POST /api/auth/login`.
2. **Validation:** The server verifies the credentials against the `password_hash` in the users table.
3. **Token Creation:** On success, a JWT is generated. The payload contains `userId`, `companyId`, and `role`.
4. **Send Token:** The server sends the JWT back to the client.
5. **Token Storage:** The React frontend stores the token securely (e.g., in localStorage or an httpOnly cookie).
6. **Secured Requests:** For every subsequent request to a protected endpoint, the frontend sends the token in the Authorization header (e.g., `Authorization: Bearer <token>`).
7. **Middleware Validation:** An `auth.middleware.js` on the server intercepts each request, validates the JWT, and attaches the payload (e.g., `req.user`) to the request object. If the token is invalid, a 401 Unauthorized error is returned.

### Social Login (OAuth 2.0)

The platform supports OAuth 2.0 authentication with Google and Microsoft accounts for enhanced security and user convenience.

#### OAuth Providers
- **Google OAuth 2.0** - Using Google Identity Services
- **Microsoft OAuth 2.0** - Using Microsoft Identity Platform (Azure AD)

#### Social Login Flow

1. **Frontend Initiation:** User clicks "Sign in with Google" or "Sign in with Microsoft" button.
2. **OAuth Redirect:** Frontend redirects user to the respective OAuth provider's authorization URL.
3. **User Authorization:** User authenticates with their Google/Microsoft account and grants permissions.
4. **Authorization Code:** OAuth provider redirects back to our callback URL with an authorization code.
5. **Token Exchange:** Backend exchanges the authorization code for access tokens using the provider's token endpoint.
6. **User Profile Fetch:** Backend fetches user profile information (email, name, profile picture) using the access token.
7. **User Lookup/Creation:** Backend checks if a user with the OAuth email exists:
   - If exists: Link the OAuth account to the existing user
   - If new: Create a new user account with OAuth information
8. **JWT Generation:** Backend generates a JWT token (same format as traditional login).
9. **Response:** User is authenticated and redirected to the dashboard.

#### Implementation Requirements

**Dependencies:**
```bash
npm install passport passport-google-oauth20 passport-microsoft
npm install express-session
```

**Configuration:**
```javascript
// OAuth credentials from Google Cloud Console and Azure Portal
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
```

**Database Schema Updates:**
```sql
-- Add OAuth-related fields to users table
ALTER TABLE users ADD COLUMN oauth_provider VARCHAR(20) NULL;
ALTER TABLE users ADD COLUMN oauth_id VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN oauth_email VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN profile_picture_url TEXT NULL;

-- Create unique constraint for OAuth accounts
CREATE UNIQUE INDEX idx_oauth_account ON users(oauth_provider, oauth_id);
```

**New API Endpoints:**
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - Google OAuth callback handler
- `GET /api/auth/microsoft` - Initiate Microsoft OAuth flow  
- `GET /api/auth/microsoft/callback` - Microsoft OAuth callback handler
- `POST /api/auth/link-oauth` - Link OAuth account to existing user
- `POST /api/auth/unlink-oauth` - Unlink OAuth account from user

## 5. MVP API Endpoints

Below are the core endpoints required for the initial version of the platform.

### Authentication (`/api/auth`)
- `POST /login` - Logs in a user, returns a JWT.
- `POST /register` - Registers a new user (initially may only be available to admins).
- `GET /me` - Retrieves the data of the logged-in user based on the JWT.

**OAuth Endpoints:**
- `GET /google` - Initiate Google OAuth flow
- `GET /google/callback` - Google OAuth callback handler
- `GET /microsoft` - Initiate Microsoft OAuth flow  
- `GET /microsoft/callback` - Microsoft OAuth callback handler
- `POST /link-oauth` - Link OAuth account to existing user
- `POST /unlink-oauth` - Unlink OAuth account from user

#### OAuth Security Considerations

**State Parameter:** Always include a random state parameter in OAuth requests to prevent CSRF attacks.

**Scope Limitation:** Request only necessary scopes:
- Google: `openid email profile`
- Microsoft: `openid email profile`

**Token Validation:** Verify OAuth tokens on the server side before processing requests.

**Account Linking:** Implement secure account linking to prevent unauthorized account takeovers.

**Session Management:** Use secure, httpOnly cookies for session management in OAuth flows.

### Courses & Content (`/api/courses`)
- `GET /` - Fetches all courses assigned to the logged-in user's company/department.
- `GET /:courseId` - Fetches the complete structure of a specific course, including modules and lessons.

### Progress (`/api/progress`)
- `GET /me` - Fetches the complete progress data for the logged-in user (see "Participant Dashboard" in the frontend context).
- `POST /event` - The central tracking endpoint. Processes various `eventTypes` to update the `user_progress` table.

**Request Body Examples:**
```json
{
  "lessonId": 123,
  "eventType": "LESSON_STARTED"
}
```

```json
{
  "lessonId": 123,
  "eventType": "TIME_SPENT_UPDATE",
  "details": {
    "seconds": 60
  }
}
```

```json
{
  "lessonId": 123,
  "eventType": "LESSON_COMPLETED",
  "details": {
    "quizScore": 90.00
  }
}
```

### Deliverables (`/api/deliverables`)
- `POST /` - Saves a submitted deliverable (`user_deliverables`) for the logged-in user.

### Reports (`/api/reports`) - For Managers
- `GET /team` - Fetches aggregated progress data for the logged-in manager's team. Requires role-based authorization.

## 6. In-Depth: The Logic of `POST /api/progress/event`

This is the most critical endpoint for the compliance promise. The controller handling this route must perform the following steps:

1. **Authentication:** Extract `userId` from the validated JWT.
2. **Validation:** Check if the `lessonId` from the request body exists and if the user has access to this lesson.
3. **Find/Create Record:** Find the `user_progress` record for the `userId` and `lessonId` combination.
   - If it doesn't exist, create a new record.
4. **Process Event (Switch Statement):**
   - **Case `'LESSON_STARTED':**
     - Update status to `'in_progress'`.
     - Set `started_at` to the current timestamp (only if it is `NULL`).
   - **Case `'TIME_SPENT_UPDATE':`**
     - Add the `details.seconds` to the `time_spent_seconds` field.
   - **Case `'LESSON_COMPLETED':`**
     - Update status to `'completed'`.
     - Set `completed_at` to the current timestamp.
     - If present, update `quiz_score` with the value from `details.quizScore`.
5. **Save:** Save the changes to the `user_progress` record in the database.
6. **Response:** Send a 200 OK or 204 No Content response to confirm that the event has been processed.

---

This blueprint provides a solid and detailed guide for building a robust and scalable Node.js backend that perfectly aligns with the needs of the frontend and the overall project vision.