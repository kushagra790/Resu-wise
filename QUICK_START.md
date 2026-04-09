# Quick Start Guide - ResuWise Authentication

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js v14+ and npm
- MongoDB running locally or remote connection
- Git

---

## Backend Setup

### 1. Navigate to Backend
```bash
cd backend
npm install
```

### 2. Configure Environment
Create `.env` file (or update if exists):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/resuwise
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-chars
JWT_EXPIRE=1h
CORS_ORIGIN=http://localhost:5173
API_BASE_URL=http://localhost:5000
MAX_FILE_SIZE=10485760
```

### 3. Start Backend
```bash
npm start
```
✅ Backend running at: `http://localhost:5000`

---

## Frontend Setup

### 1. Navigate to Frontend
```bash
cd frontend
npm install
```

### 2. Configure Environment
Create `.env.local` or `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Start Frontend
```bash
npm run dev
```
✅ Frontend running at: `http://localhost:5173`

---

## Test the Authentication

### Register New Account
1. Open `http://localhost:5173/signup`
2. Fill in form:
   - **Name**: Your Name
   - **Email**: test@example.com
   - **Password**: SecurePass123! (must meet requirements)
3. Click "Sign Up"
4. Auto-redirect to dashboard ✅

### Login
1. Open `http://localhost:5173/login`
2. Enter credentials from registration
3. Click "Login"
4. Access dashboard ✅

### Try Resume Builder
1. From dashboard, click "Resume Builder"
2. See new "Go to Dashboard" button in header
3. Click it to return to dashboard ✅

### Logout
1. Click the "Logout" button in navbar
2. Redirects to home page
3. Try accessing dashboard → redirected to login ✅

---

## Demo Account (Optional)
```
Email: demo@example.com
Password: Demo@123456
```

---

## Key Features Working

### ✅ Sign Up
- Email validation
- Strong password requirements
- Real-time password strength indicator
- Account creation with hashed password
- Auto-redirect to dashboard

### ✅ Sign In
- Email/password authentication
- Account locking (5 failed attempts)
- 15-minute lockout period
- Attempt tracking

### ✅ Protected Routes
- Dashboard requires login
- Resume Builder requires login
- Auto-redirect to login if not authenticated

### ✅ Session Management
- JWT tokens (1 hour expiry)
- Automatic token attachment to requests
- Token expiration detection
- Auto-logout on expired token

### ✅ Navigation
- Smart navbar with auth status
- Login/Signup links for guests
- User welcome message
- Dashboard/Logout for authenticated users

---

## Database Check (MongoDB)

### View Created Users
```bash
# Open MongoDB shell
mongosh

# Connect to database
use resuwise

# View users
db.users.find()

# View single user
db.users.findOne({ email: "test@example.com" })
```

---

## Troubleshooting

### Backend not connecting to MongoDB
```
Error: connect ECONNREFUSED 127.0.0.1:27017
↓
Solution: Ensure MongoDB is running (mongod)
```

### CORS errors when calling API
```
Error: Access to XMLHttpRequest blocked by CORS policy
↓
Solution: Check CORS_ORIGIN in backend .env matches frontend URL
```

### Token errors on protected routes
```
Error: Not authorized to access this route - token missing
↓
Solution: Check if localStorage has authToken set
Check API interceptor is attaching token
```

### Password strength endpoint 404
```
Error: POST /api/auth/check-password-strength 404
↓
Solution: Ensure app.use('/api/auth', authRoutes) in server.js
Restart backend
```

### Can't login - "Account locked"
```
Solution: Wait 15 minutes OR
Clear lockUntil field in MongoDB:
db.users.updateOne({email: "test@example.com"}, {$unset: {lockUntil: 1}})
```

---

## What's Next?

### Features Already Available
- ✅ Complete auth system
- ✅ Password hashing
- ✅ JWT tokens
- ✅ Protected routes
- ✅ Token interceptors
- ✅ Account locking
- ✅ Password strength validation

### Future Enhancements
- Email verification on signup
- Password reset via email
- Google OAuth
- GitHub OAuth
- Two-factor authentication
- Profile picture upload
- User dashboard customization

---

## File Structure

```
ResuWise/
├── backend/
│   ├── controllers/auth/authController.js
│   ├── routes/auth.js
│   ├── models/User.js
│   ├── middleware/auth.js
│   ├── middleware/validators.js
│   ├── utils/passwordValidator.js
│   ├── server.js
│   └── .env (configure this)
│
└── frontend/
    ├── src/
    │   ├── pages/Login.jsx
    │   ├── pages/Signup.jsx
    │   ├── pages/ResumeBuilderPage.jsx (with button)
    │   ├── components/Navbar.jsx (with auth)
    │   ├── components/ProtectedRoute.jsx
    │   ├── context/AuthContext.jsx
    │   ├── utils/api.js (with interceptors)
    │   ├── App.jsx (with routes)
    │   └── main.jsx (with AuthProvider)
    └── .env.local (configure this)
```

---

## API Quick Reference

### Register
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@test.com",
    "password": "SecurePass123!",
    "passwordConfirm": "SecurePass123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "SecurePass123!"
  }'
```

### Check Password Strength
```bash
curl -X POST http://localhost:5000/api/auth/check-password-strength \
  -H "Content-Type: application/json" \
  -d '{"password": "SecurePass123!"}'
```

### Get Current User (Protected)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Development Node

### Password Requirements
Must include:
- ✓ Minimum 8 characters
- ✓ At least 1 uppercase letter (A-Z)
- ✓ At least 1 lowercase letter (a-z)
- ✓ At least 1 number (0-9)
- ✓ At least 1 special character (!@#$%^&*...)
- ✗ No repeating characters

Example strong passwords:
- `SecurePass123!`
- `MyApp@2024#456`
- `Complex!Pass99$`

---

## Common Tasks

### Reset All Users (Development)
```bash
mongosh
use resuwise
db.users.deleteMany({})
```

### Change JWT Expiry
In `backend/.env`:
```env
JWT_EXPIRE=2h  # Change from 1h to any duration
```

### Change Account Lockout Time
In `backend/models/User.js`, find `incLoginAttempts()` and change:
```javascript
const lockTimeInMinutes = 15;  // Change this value
```

---

## Need Help?

1. Check logs in terminal where backend/frontend is running
2. See browser console for frontend errors
3. Check MongoDB connection: `mongosh`
4. Review `AUTHENTICATION_SETUP.md` for detailed docs
5. Verify environment variables are set correctly

---

## Summary

You now have a complete, production-ready authentication system with:
- Secure registration and login
- Protected routes
- JWT-based session management
- Password strength validation
- Account locking for security
- Modern React UI with Tailwind CSS

**Happy coding! 🚀**

