# Full Authentication System Implementation Guide

## ✅ Features Implemented

### 1. **Signup with Strong Password Validation**
- ✅ Email format validation
- ✅ Strong password enforcement:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character
  - No repeating characters
- ✅ Password confirmation matching
- ✅ Duplicate email prevention (409 Conflict)
- ✅ Bcryptjs password hashing (10 salt rounds)

### 2. **Login with Account Locking**
- ✅ Email and password validation
- ✅ Bcryptjs password comparison
- ✅ Failed login attempt tracking
- ✅ Account locking after 5 failed attempts
- ✅ Lock duration: **15 minutes**
- ✅ JWT token generation
- ✅ Token expiry: **1 hour**
- ✅ Detailed error messages with attempt count
- ✅ Automatic unlock after 15 minutes

### 3. **JWT Authentication**
- ✅ Token-based stateless authentication
- ✅ Bearer token scheme
- ✅ 1-hour token expiration
- ✅ Token refresh capability (user logs in again)
- ✅ Expired token detection
- ✅ Invalid token detection

### 4. **Route Protection**
- ✅ Analyze endpoints protected (`/api/analyze/text`, `/api/analyze/upload`)
- ✅ History endpoints protected (all `/api/history/*`)
- ✅ Auth endpoints protected (`/api/auth/me`, `/api/auth/updateprofile`, `/api/auth/updatepassword`)
- ✅ Public endpoints: signup, login, logout, password strength check

### 5. **Express-Validator Integration**
- ✅ Signup validation with express-validator
- ✅ Login validation with express-validator
- ✅ Password strength validation rules
- ✅ Email format validation
- ✅ Name length validation (2-100 chars)
- ✅ Detailed error messages per field

### 6. **Password Management**
- ✅ Password strength indicator (score 0-100)
- ✅ Real-time password strength feedback
- ✅ Change password with old password verification
- ✅ Strong password required for new password
- ✅ Prevention of using current password as new password

### 7. **Account Security**
- ✅ Password hashing with bcryptjs
- ✅ Account locking mechanism (15 minutes)
- ✅ Failed login attempt tracking
- ✅ Last login tracking
- ✅ Sensitive field exclusion from responses

---

## 📋 API Endpoints

### Authentication Endpoints

#### Signup (Create Account)
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "passwordConfirm": "SecurePass123!"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2024-02-13T11:30:00.000Z",
  "expiresIn": "1h",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isVerified": false,
    "lastLogin": null,
    "createdAt": "2024-02-13T10:30:00.000Z"
  }
}
```

**Validation Error Response (400):**
```json
{
  "success": false,
  "message": "Password does not meet requirements",
  "details": [
    "Password must be at least 8 characters",
    "Password must contain at least 1 special character"
  ]
}
```

**Duplicate Email Response (409):**
```json
{
  "success": false,
  "message": "Email already registered. Please use a different email or login."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2024-02-13T11:30:00.000Z",
  "expiresIn": "1h",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isVerified": false,
    "lastLogin": "2024-02-13T10:30:00.000Z",
    "createdAt": "2024-02-13T10:30:00.000Z"
  }
}
```

**Failed Login (Invalid Credentials) - Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials - password incorrect",
  "failedAttempts": 1,
  "attemptsRemaining": 4
}
```

**Account Locked - Response (423):**
```json
{
  "success": false,
  "message": "Account locked due to too many failed login attempts. Please try again in 15 minutes.",
  "locked": true,
  "failedAttempts": 5,
  "attemptsRemaining": 0
}
```

#### Check Password Strength (Real-time Feedback)
```http
POST /api/auth/check-password-strength
Content-Type: application/json

{
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "strength": 95,
    "strengthLevel": "Very Strong",
    "message": "Password meets requirements"
  }
```

#### Get Current User Profile
```http
GET /api/auth/me
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isVerified": false,
    "lastLogin": "2024-02-13T10:30:00.000Z",
    "createdAt": "2024-02-13T10:30:00.000Z"
  }
}
```

#### Update Profile
```http
PUT /api/auth/updateprofile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {...}
}
```

#### Change Password
```http
PUT /api/auth/updatepassword
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecure456@",
  "newPasswordConfirm": "NewSecure456@"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2024-02-13T11:30:00.000Z",
  "user": {...}
}
```

#### Logout
```http
GET /api/auth/logout
```

**Response (200):**
```json
{
  "success": true,
  "message": "User logged out successfully. Please clear the token on client side.",
  "instruction": "Delete the JWT token from localStorage/cookies"
}
```

---

## 🔐 Password Requirements

### Minimum Requirements
- ✅ At least **8 characters**
- ✅ At least **1 UPPERCASE** letter (A-Z)
- ✅ At least **1 lowercase** letter (a-z)
- ✅ At least **1 number** (0-9)
- ✅ At least **1 special character** (!@#$%^&*()_+-=[]{};\':"|,.<>\/?)

### Examples

**Valid Passwords:**
- `Secure@Pass123`
- `MyPass#2024!`
- `StrongPwd!@#456`
- `ValidPassword2024$`

**Invalid Passwords:**
- `password123` ❌ (no uppercase, no special char)
- `PASSWORD` ❌ (no lowercase, no number, no special char)
- `Pass@123` ❌ (only 8 chars - needs special)
- `Pass123` ❌ (no special character)

---

## 🔒 Account Locking

### Locking Rules
- **Trigger**: 5 failed login attempts
- **Lock Duration**: 15 minutes
- **Reset**: Automatic after 15 minutes OR on successful login
- **User Feedback**: Clear message with remaining lock time

### Lock Expiration Timeline
```
Attempt 1: Failed ❌ → 4 attempts remaining
Attempt 2: Failed ❌ → 3 attempts remaining
Attempt 3: Failed ❌ → 2 attempts remaining
Attempt 4: Failed ❌ → 1 attempt remaining
Attempt 5: Failed ❌ → Account LOCKED for 15 minutes
     ⏰ + 15 minutes → Account UNLOCKS automatically
```

---

## 🛡️ JWT Token Management

### Token Details
- **Type**: Bearer token
- **Format**: JWT (JSON Web Token)
- **Algorithm**: HS256 (HMAC SHA-256)
- **Expiration**: 1 hour
- **Storage**: Client-side (localStorage or sessionStorage)

### Token in Requests
```http
GET /api/analyze/text
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcwNzgyNzgwMCwiZXhwIjoxNzA3ODMxNDAwfQ.X1T_3Q_5Z...
```

### Token Expiration Handling
```
Response: 401 Unauthorized
{
  "success": false,
  "message": "Token has expired. Please login again",
  "code": "TOKEN_EXPIRED"
}
```

**Action**: User must login again to get a new token

---

## 🔄 Protected Routes

### Authentication Required Routes

#### Analyze Endpoints
- `POST /api/analyze/text` - Requires valid JWT token
- `POST /api/analyze/upload` - Requires valid JWT token

#### History Endpoints
- `POST /api/history/save` - Requires valid JWT token
- `GET /api/history/all` - Requires valid JWT token
- `GET /api/history/:id` - Requires valid JWT token
- `PUT /api/history/:id` - Requires valid JWT token
- `DELETE /api/history/:id` - Requires valid JWT token
- `GET /api/history/stats` - Requires valid JWT token
- `GET /api/history/favorites` - Requires valid JWT token
- `GET /api/history/search` - Requires valid JWT token
- `GET /api/history/export` - Requires valid JWT token

#### Auth Endpoints
- `GET /api/auth/me` - Requires valid JWT token
- `PUT /api/auth/updateprofile` - Requires valid JWT token
- `PUT /api/auth/updatepassword` - Requires valid JWT token

### Public Routes (No Auth Required)
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/check-password-strength`
- `GET /api/auth/logout`

---

## 💻 Frontend Integration

### 1. Store Token After Signup/Login
```javascript
// From signup or login response
const { token, expiresAt } = response.data;
localStorage.setItem('authToken', token);
localStorage.setItem('tokenExpiry', expiresAt);
```

### 2. Send Token in Requests
```javascript
const token = localStorage.getItem('authToken');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// Using axios
axios.post('/api/analyze/text', {
  resume: '...',
  jobDescription: '...'
}, { headers });

// Or using fetch
fetch('/api/analyze/text', {
  method: 'POST',
  headers,
  body: JSON.stringify({ resume: '...', jobDescription: '...' })
});
```

### 3. Handle Token Expiration
```javascript
// Interceptor example with axios
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED') {
      // Redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 4. Check Passwords Strength in Real-Time
```javascript
const checkPasswordStrength = async (password) => {
  try {
    const response = await fetch('/api/auth/check-password-strength', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    
    const data = await response.json();
    return {
      isValid: data.data.isValid,
      strengthLevel: data.data.strengthLevel,
      errors: data.data.errors
    };
  } catch (error) {
    console.error('Error checking password strength:', error);
  }
};

// Usage
const strength = await checkPasswordStrength('MyPassword123!');
console.log(strength.strengthLevel); // "Very Strong"
console.log(strength.errors); // []
```

---

## 🔑 Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production-minimum-32-chars
JWT_EXPIRE=1h

# Database
MONGODB_URI=mongodb://localhost:27017/resuwise

# Server
PORT=5000
NODE_ENV=development
```

### JWT Secret Requirements
- Minimum 32 characters
- Mix of uppercase, lowercase, numbers, and special characters
- Never use default value in production
- Keep secret and secure

**Recommended:**
```bash
# Generate strong secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🧪 Testing with cURL

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "passwordConfirm": "SecurePass123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### Protected Route (with Token)
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:5000/api/analyze/text \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resume": "...",
    "jobDescription": "..."
  }'
```

### Check Password Strength
```bash
curl -X POST http://localhost:5000/api/auth/check-password-strength \
  -H "Content-Type: application/json" \
  -d '{
    "password": "MyPassword123!"
  }'
```

---

## ⚠️ Error Codes Reference

| Code | Status | Meaning |
|------|--------|---------|
| `NO_TOKEN` | 401 | Token missing from Authorization header |
| `TOKEN_EXPIRED` | 401 | JWT token has expired (>1 hour) |
| `TOKEN_INVALID` | 401 | JWT token is invalid or malformed |
| `USER_NOT_FOUND` | 404 | User associated with token not found |
| `ACCOUNT_LOCKED` | 423 | Account locked due to failed login attempts |
| `INSUFFICIENT_PERMISSIONS` | 403 | User role not authorized for endpoint |

---

## 🔐 Security Best Practices

1. **Never log passwords**: Passwords are hashed and not logged
2. **Use HTTPS in production**: All sensitive data should be encrypted in transit
3. **Strong JWT secret**: Use at least 32 characters with mixed case
4. **Secure token storage**: Use httpOnly cookies or secure localStorage
5. **Token rotation**: Implement refresh token mechanism for long sessions
6. **Rate limiting**: Consider implementing rate limiting on auth endpoints
7. **Account locking**: 15-minute lockout prevents brute force attacks
8. **Password expiry**: Consider implementing password expiry policies
9. **Audit logging**: Log all authentication events
10. **CORS configuration**: Only allow trusted origins

---

## 📊 Related Documentation

- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Database schemas and setup
- [MONGODB_INTEGRATION.md](MONGODB_INTEGRATION.md) - MongoDB integration details
- [TECH_STACK.md](TECH_STACK.md) - Technology stack overview

---

**Last Updated**: February 13, 2026
**Status**: ✅ Complete & Production Ready
