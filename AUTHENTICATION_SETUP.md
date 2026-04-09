# ResuWise Authentication System - Complete Implementation Guide

## Overview
This document outlines the complete authentication system for ResuWise, including user registration (Sign Up), user login (Sign In), session management with JWT tokens, and secure password handling.

---

## Authentication Architecture

### Backend (Node.js/Express)
- **Authentication Method**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs (10-salt rounds)
- **Token Expiry**: 1 hour (configurable via `JWT_EXPIRE`)
- **Security Features**: 
  - Account locking after 5 failed login attempts (15 minutes)
  - Strong password validation
  - Password strength checking endpoint

### Frontend (React)
- **State Management**: React Context API (AuthContext)
- **Token Storage**: localStorage (authToken, authUser)
- **API Communication**: Axios with interceptors
- **Route Protection**: ProtectedRoute component

---

## Features Implemented

### 1. Sign Up Flow ✅
**Route**: `/signup`

**Features**:
- Full name, email, and password input fields
- Real-time password strength indicator
- Password confirmation matching
- Terms & conditions checkbox
- Email validation
- Comprehensive form validation
- Error handling with detailed messages
- Auto-redirect to dashboard on success (2s delay)
- Link to login for existing users

**Password Requirements**:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- No repeating characters

### 2. Sign In Flow ✅
**Route**: `/login`

**Features**:
- Email and password input fields
- Account lock warning (remaining attempts)
- Proper error messaging
- "Back to Home" navigation
- Link to sign up for new users
- Demo credentials displayed

**Security**:
- Failed attempt tracking (max 5)
- 15-minute account lockout after max attempts
- Clear error messages with attempt information

### 3. Session Management ✅
**Context**: `AuthContext` (`context/AuthContext.jsx`)

**Exports**:
- `user` - Current logged-in user object
- `token` - JWT authentication token
- `isAuthenticated` - Boolean flag
- `loading` - Loading state for auth checks
- `login()` - Login function
- `signup()` - Registration function
- `logout()` - Logout function
- `clearError()` - Clear error messages

**Storage**:
- `localStorage.authToken` - JWT token
- `localStorage.authUser` - User object (stringified JSON)

### 4. Protected Routes ✅
**Component**: `ProtectedRoute` (`components/ProtectedRoute.jsx`)

**Behavior**:
- Redirects to `/login` if user not authenticated
- Shows loading spinner while checking auth state
- Wraps dashboard and resume builder routes

### 5. API Interceptors ✅
**File**: `utils/api.js`

**Request Interceptor**:
- Automatically attaches JWT token to all API requests
- Sets `Authorization: Bearer {token}` header

**Response Interceptor**:
- Detects token expiration (401 status)
- Clears auth on token expiration
- Redirects to login automatically

### 6. Navigation & UI ✅
**Navbar Component**: `components/Navbar.jsx`

**Features**:
- Conditional rendering based on authentication state
- User welcome message with name
- Dashboard link for authenticated users
- Login/Sign Up buttons for non-authenticated users
- Logout button with confirmation
- Responsive design

---

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user account.

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "passwordConfirm": "SecurePass123!"
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2024-04-10T20:30:00.000Z",
  "expiresIn": "1h",
  "user": {
    "id": "userId123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isVerified": false,
    "createdAt": "2024-04-10T19:30:00.000Z"
  }
}
```

#### POST `/api/auth/login`
Authenticate user with email and password.

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2024-04-10T20:30:00.000Z",
  "expiresIn": "1h",
  "user": {
    "id": "userId123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isVerified": false,
    "lastLogin": "2024-04-10T19:25:00.000Z",
    "createdAt": "2024-04-10T19:30:00.000Z"
  }
}
```

**Failed Attempt Response (401)**:
```json
{
  "success": false,
  "message": "Invalid credentials - password incorrect",
  "failedAttempts": 1,
  "attemptsRemaining": 4
}
```

**Account Locked Response (423)**:
```json
{
  "success": false,
  "message": "Account is temporarily locked. Please try again in 15 minutes.",
  "locked": true,
  "lockTimeMinutes": 15
}
```

#### POST `/api/auth/check-password-strength`
Check password strength without authentication (used during signup).

**Request Body**:
```json
{
  "password": "MyPassword123!"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "strength": 85,
    "strengthLevel": "Strong",
    "message": "Password meets requirements"
  }
}
```

#### GET `/api/auth/me` (Protected)
Get current authenticated user profile.

**Headers**:
```
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "userId123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isVerified": false
  }
}
```

#### PUT `/api/auth/updateprofile` (Protected)
Update user profile information.

**Request Body**:
```json
{
  "name": "John Updated",
  "email": "newemail@example.com"
}
```

#### PUT `/api/auth/updatepassword` (Protected)
Change user password.

**Request Body**:
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!",
  "newPasswordConfirm": "NewPass456!"
}
```

#### GET `/api/auth/logout` (Protected)
Logout user (client-side token cleanup recommended).

---

## Environment Variables

### `.env` Configuration

```env
# Backend Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/resuwise

# JWT Configuration (1 hour expiry)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-chars
JWT_EXPIRE=1h

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# API Configuration
API_BASE_URL=http://localhost:5000

# File Upload
MAX_FILE_SIZE=10485760

# Email Configuration (Optional - for future use)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend `.env` (Vite)
```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## Project Structure

### Backend Auth Files
```
backend/
├── controllers/auth/
│   └── authController.js          # Auth endpoints logic
├── routes/
│   └── auth.js                    # Auth route definitions
├── models/
│   └── User.js                    # User schema with security methods
├── middleware/
│   ├── auth.js                    # JWT verification, token generation
│   └── validators.js              # Form validation rules
├── utils/
│   └── passwordValidator.js       # Password strength checking
└── server.js                      # Main server file (auth routes added)
```

### Frontend Auth Files
```
frontend/src/
├── pages/
│   ├── Login.jsx                  # Login page component
│   ├── Signup.jsx                 # Signup page component
│   ├── Dashboard.jsx              # Protected dashboard
│   └── ResumeBuilderPage.jsx      # Protected resume builder with nav button
├── components/
│   ├── Navbar.jsx                 # Nav with auth UI
│   ├── HomePage.jsx               # Home page
│   └── ProtectedRoute.jsx         # Route protection wrapper
├── context/
│   └── AuthContext.jsx            # Auth state management
├── utils/
│   └── api.js                     # Axios instance with interceptors
└── App.jsx                        # Routes setup
```

---

## User Flow Diagram

### Registration Flow
```
User visits /signup
    ↓
Fills form (name, email, password)
    ↓ (Real-time password strength check)
Password validation feedback displayed
    ↓
User confirms password & agrees to terms
    ↓
Submit signup
    ↓
Backend: Validate all fields
    ↓
Backend: Hash password with bcryptjs
    ↓
Backend: Create user in MongoDB
    ↓
Backend: Generate JWT token
    ↓
Frontend: Store token & user in localStorage
    ↓
Frontend: Update AuthContext
    ↓
Redirect to /dashboard (2s auto-redirect)
```

### Login Flow
```
User visits /login
    ↓
Enters email & password
    ↓
Submit credentials
    ↓
Backend: Find user by email
    ↓
Backend: Verify password with bcryptjs
    ↓
Backend: Check account lock status
    ↓
If locked: Return lock time (423 status)
If invalid: Increment failed attempts (max 5)
If valid: Reset attempts, generate JWT
    ↓
Frontend: Store token & user in localStorage
    ↓
Frontend: Update AuthContext
    ↓
Redirect to /dashboard
```

### Protected Route Flow
```
User accesses /dashboard or /resume-builder
    ↓
ProtectedRoute component checks isAuthenticated
    ↓
If loading: Show loading spinner
    ↓
If not authenticated: Redirect to /login
    ↓
If authenticated: Render component
    ↓
All API calls automatically attach JWT token
    ↓
If token expired: Interceptor clears auth & redirects to /login
```

---

## Security Best Practices Implemented

1. **Password Security**
   - Bcryptjs hashing with 10 salt rounds
   - Strong password requirements enforced
   - Password confirmation matching
   - Password strength indicator

2. **Token Security**
   - JWT tokens with 1-hour expiry
   - Tokens stored in localStorage (XSS consideration in future: use HttpOnly cookies)
   - Automatic token refresh on expired (currently requires manual login)
   - Bearer token in Authorization header

3. **Account Security**
   - Account locking after 5 failed login attempts
   - 15-minute lockout period
   - Failed attempt tracking
   - Last login timestamp

4. **API Security**
   - Request validation with express-validator
   - Protected routes require valid JWT
   - CORS enabled for frontend domain only
   - Error messages don't leak sensitive information

5. **Input Validation**
   - Email format validation
   - Password strength validation
   - Name length constraints (2-100 characters)
   - All inputs sanitized and trimmed

---

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String (2-100 chars),
  email: String (unique, lowercase),
  password: String (hashed, BCrypt),
  role: String (default: 'user', enum: ['user', 'admin', 'premium']),
  isVerified: Boolean (default: false),
  failedLoginAttempts: Number (default: 0),
  lockUntil: Date (null by default),
  verificationToken: String (optional),
  verificationTokenExpire: Date (optional),
  passwordResetToken: String (optional),
  passwordResetExpire: Date (optional),
  lastLogin: Date (null by default),
  profilePicture: String (optional),
  createdAt: DateTime (auto),
  updatedAt: DateTime (auto)
}
```

---

## Testing Credentials

**Demo Account**:
- Email: `demo@example.com`
- Password: `Demo@123456`

---

## Troubleshooting

### Issue: Token not attaching to requests
**Solution**: Check that API interceptor is running and token exists in localStorage

### Issue: Automatic redirect to login not working
**Solution**: Ensure API interceptor response handler is checking for 401 status and token errors

### Issue: Password strength endpoint 404
**Solution**: Verify auth routes are registered in server.js with `app.use('/api/auth', authRoutes)`

### Issue: Account locked error
**Solution**: Wait 15 minutes or clear `lockUntil` field in MongoDB for testing

### Issue: CORS errors
**Solution**: Ensure `CORS_ORIGIN` in .env matches frontend URL (default: http://localhost:5173)

---

## Starting the Application

### Backend
```bash
cd backend
npm install
# Configure .env file
npm start
# Server runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
# Configure .env file
npm run dev
# App runs on http://localhost:5173
```

---

## Next Steps & Future Enhancements

1. **Email Verification**
   - Send verification email on signup
   - Verify email before account activation

2. **Password Reset**
   - Implement "Forgot Password" flow
   - Send password reset link via email

3. **OAuth Integration**
   - Google OAuth
   - GitHub OAuth

4. **Enhanced Security**
   - HttpOnly cookies for tokens (replace localStorage)
   - Refresh token mechanism
   - CSRF protection
   - Rate limiting on auth endpoints

5. **Multi-factor Authentication (MFA)**
   - Two-factor authentication
   - Biometric login

6. **Administration**
   - User management dashboard
   - Role-based access control
   - Audit logging

---

## Support & Documentation

For more information:
- Backend: See individual controller and middleware files for detailed comments
- Frontend: Check component documentation and AuthContext usage
- API: Test endpoints using Postman or similar tools

