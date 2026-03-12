# Frontend Authentication System - Complete Guide

## 📋 Overview

The ResuWise frontend now has a complete authentication system integrated with the backend API. This guide covers all components, setup, and usage patterns.

---

## 📁 File Structure

```
frontend/src/
├── context/
│   └── AuthContext.jsx           # Global auth state & hooks
├── components/
│   ├── ProtectedRoute.jsx        # Route protection wrapper
│   ├── Navbar.jsx                # Updated with auth state
│   ├── HomePage.jsx              # Updated with navigation logic
│   ├── AnalysisPage.jsx          # Protected from here
│   └── AnalysisHistory.jsx       # Protected from here
├── pages/
│   ├── Login.jsx                 # NEW: Login page
│   ├── Signup.jsx                # NEW: Signup page
│   └── Dashboard.jsx             # NEW: Authenticated home
├── utils/
│   └── api.js                    # NEW: Axios instance + interceptors
├── App.jsx                       # UPDATED: React Router setup
├── main.jsx                      # No change needed
├── index.css
└── .env.example                  # NEW: Environment template
```

---

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

This installs:
- `react-router-dom`: Client-side routing
- `axios`: HTTP client (already installed)

### 2. Create Environment File
```bash
cp .env.example .env
```

Edit `.env` to match your backend:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Ensure Backend is Running
Backend must be running with MongoDB connected:
```bash
cd backend
npm install          # Install express-validator if not done
npm start
```

---

## 🏗️ Component Architecture

### AuthContext.jsx
**Purpose**: Global authentication state management

**Features**:
- User data storage
- Token management (localStorage)
- Login/signup/logout functions
- Error handling
- Loading states

**Exports**:
```javascript
// Provider component
<AuthProvider>{children}</AuthProvider>

// Hook to use auth context
const { 
  user,              // Current user object
  token,             // JWT token
  loading,           // Auth state loading
  error,             // Error details
  login,             // Async login function
  signup,            // Async signup function
  logout,            // Logout function
  isAuthenticated,   // Boolean: is user logged in?
  clearError         // Clear error state
} = useAuth();
```

**Error Handling**:
```javascript
// Login can return error info with lockout details
const result = await login(email, password);
if (!result.success) {
  console.log(result.details?.attemptsRemaining);      // 3
  console.log(result.details?.lockTimeMinutes);        // 15
}
```

### ProtectedRoute.jsx
**Purpose**: Route-level access control

**Behavior**:
- Shows loading spinner if auth state is being loaded
- Redirects to `/login` if user is not authenticated
- Renders child component if authenticated

**Usage**:
```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### api.js
**Purpose**: Axios instance with smart interceptors

**Features**:
- Automatic Bearer token attachment to all requests
- Automatic 401 handling with logout and redirect
- Base URL from environment variable

**Request Interceptor**:
- Attaches `Authorization: Bearer {token}` header
- Only if token exists in localStorage

**Response Interceptor**:
- Detects 401 Unauthorized responses
- Checks error code (TOKEN_EXPIRED, TOKEN_INVALID, ACCOUNT_LOCKED)
- Auto-logs out and redirects to login on auth errors

**Usage**:
```javascript
import api from '../utils/api';

// Automatic token attachment & error handling
const response = await api.get('/api/auth/me');
const results = await api.post('/api/analyze/text', data);
```

### Login.jsx
**Purpose**: User login form

**Fields**:
- Email address
- Password

**Features**:
- Real-time validation error display
- Account lockout warning with remaining attempts
- Helpful error messages
- Link to signup page
- Loading state handling

**Error Display Examples**:
```
- Invalid credentials (4 attempts remaining)
- Account locked due to too many failed attempts
- Invalid email format
```

### Signup.jsx
**Purpose**: New user registration

**Fields**:
- Full Name (2-100 characters)
- Email address
- Password (with real-time strength feedback)
- Confirm Password

**Features**:
- Real-time password strength indicator
- Password strength levels: Weak → Fair → Moderate → Strong → Very Strong
- Validation error messages
- Field-level error reporting
- Terms acceptance checkbox
- Link to login page

**Real-time Password Feedback**:
```
Strong (95%) - Green bar
- ✓ Password meets all requirements
```

**Password Requirements**:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### Dashboard.jsx
**Purpose**: Main authenticated home (analog to old App home)

**Features**:
- Welcome message with user's name
- Feature cards explaining capabilities
- Quick stats section
- Start Analysis button
- Same analysis experience as before

**Layout**:
- If home view: Shows welcome & quick start
- If analysis view: Shows AnalysisPage component
- Maintains history sidebar functionality

### Navbar.jsx
**Purpose**: Dynamic navigation bar

**Authenticated (logged in):
```
Logo | User Name + Email | Dashboard | Logout
```

**Unauthenticated (not logged in):
```
Logo | ... | Login | Sign Up
```

**Navigation**:
- Logo click → Navigate to `/`
- Dashboard → Navigate to `/dashboard`
- Login → Navigate to `/login`
- Sign Up → Navigate to `/signup`
- Logout → Clear auth + redirect to `/login`

### HomePage.jsx (Updated)
**Purpose**: Public landing page for everyone

**Behavior**:
- **If NOT authenticated**: CTA buttons say "Analyze My Resume" → Go to /login
- **If authenticated**: CTA buttons say "Analyze My Resume" → Go to /dashboard

This gives users a chance to learn about the product before committing to signup.

---

## 🛣️ Routing Structure

### Routes

| Route | Component | Auth Required | Purpose |
|-------|-----------|---|---------|
| `/` | HomePage | No | Public landing page |
| `/login` | Login | No | User login |
| `/signup` | Signup | No | User registration |
| `/dashboard` | Dashboard | **Yes** | Authenticated home + analysis |

### Navigation Flow

```
Unauthenticated:
/ (HomePage) → Click "Analyze" → Redirects to login
             → Click "Sign Up" → /signup
             → Click "Login" → /login

login page → Submit → If success → /dashboard
           → If failure → Show error

signup page → Submit → If success → /dashboard
            → If failure → Show errors

Try to access /dashboard without token → Auto-redirect to /login

Authenticated:
/ (HomePage) → Click "Analyze" → /dashboard
              → Click "Logout" → /login

/dashboard → All analysis features available
           → Click "Logout" → / (with redirect in Navbar)
```

---

## 🔐 Authentication Flow

### Login Flow
```
1. User enters email & password on /login
2. Frontend calls POST /api/auth/login
3. Backend validates credentials
   - If valid: Returns JWT token + user data
   - If invalid: Returns error + remaining attempts
   - If locked: Returns 423 with lock info
4. Frontend saves token to localStorage
5. Frontend stores user in localStorage
6. AuthContext updates to isAuthenticated = true
7. User redirected to /dashboard
8. All API calls now include token in header
```

### Signup Flow
```
1. User enters name, email, password, confirm
2. Frontend validates password strength locally
3. User clicks "Sign Up"
4. Frontend calls POST /api/auth/signup
5. Backend validates
   - Email format, password strength, no duplicates, etc.
   - If valid: Creates user, returns JWT
   - If invalid: Returns validation errors
6. Frontend saves token & user (same as login)
7. Auto-redirects to /dashboard
```

### Protected Route Access
```
1. User tries to access /dashboard
2. ProtectedRoute component checks isAuthenticated
3. If logged in: Renders Dashboard component
4. If not logged in: Redirects to /login
   - Token is stored in localStorage
   - Persists across browser refresh
```

### Token Expiry
```
1. User gets JWT token (1 hour expiry)
2. User makes API call with expired/invalid token
3. Backend returns 401 Unauthorized
4. api.js response interceptor catches this
5. Clears localStorage
6. Redirects to /login
7. User must login again to continue
```

---

## 💻 Code Examples

### Using AuthContext in a Component

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Making Protected API Calls

```jsx
import api from '../utils/api';

async function getAnalysis() {
  try {
    // Token is automatically included in header
    const response = await api.post('/api/analyze/text', {
      resume: resumeText,
      jobDescription: jdText
    });
    
    console.log(response.data);
  } catch (error) {
    // 401 errors are handled automatically (redirect to login)
    console.error(error);
  }
}
```

### Creating a Protected Route

```jsx
<Route
  path="/protected-page"
  element={
    <ProtectedRoute>
      <MyProtectedComponent />
    </ProtectedRoute>
  }
/>
```

### Using Login from Context

```jsx
const { login, error } = useAuth();

const handleSubmit = async (e) => {
  e.preventDefault();
  const result = await login(email, password);
  
  if (result.success) {
    navigate('/dashboard');
  } else {
    console.log(result.error);
    console.log(result.details?.attemptsRemaining);
  }
};
```

---

## 🧪 Testing Authentication

### Test Case 1: Signup with Valid Data
```
1. Visit http://localhost:5000/signup
2. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Password: TestPass123!
   - Confirm: TestPass123!
3. Click "Sign Up"
✓ Should redirect to /dashboard
✓ Should show username in navbar
```

### Test Case 2: Login with Valid Credentials
```
1. Visit http://localhost:5000/login
2. Fill form:
   - Email: test@example.com
   - Password: TestPass123!
3. Click "Login"
✓ Should redirect to /dashboard
✓ Should show user info in navbar
```

### Test Case 3: Failed Login Attempts
```
1. Visit http://localhost:5000/login
2. Enter wrong password 5 times
✓ Should show error messages
✓ Should show "attempts remaining" counter
✓ On 5th attempt: "Account locked for 15 minutes"
✓ Button should show account locked state
```

### Test Case 4: Protected Route Access
```
1. Without logging in, visit http://localhost:5000/dashboard
✓ Should redirect to /login
```

### Test Case 5: Token Persistence
```
1. Log in successfully
2. Refresh page (Ctrl+R)
✓ Should stay logged in (token from localStorage)
✓ Dashboard should load without redirect
3. Check browser localStorage:
✓ Should contain "authToken"
✓ Should contain "authUser" with user data
```

### Test Case 6: Logout
```
1. Log in and access /dashboard
2. Click "Logout" button
✓ Should redirect to /login
✓ localStorage should be cleared
3. Try to access /dashboard
✓ Should redirect to /login
```

### Test Case 7: Password Strength Feedback (Signup)
```
1. Visit /signup
2. Type in password field:
   - "weak" → Red bar "Weak"
   - "Weak1!" → Orange bar "Fair"
   - "WeakPass1!" → Yellow bar "Moderate"
   - "StrongPass1!" → Green bar "Strong"
   - "VeryStrongPass123!@#" → Full green "Very Strong"
✓ Requirements list should update in real-time
✓ Confirm password validation should work
```

---

## 🚀 Running the Complete Application

### Terminal 1: Backend
```bash
cd ResuWise/backend
npm install
npm start
# Should see: "Server running on port 5000"
# Should see: "Connected to MongoDB"
```

### Terminal 2: Frontend
```bash
cd ResuWise/frontend
npm install
npm run dev
# Should see: "VITE v4.x.x ready in xxx ms"
# Should see: "➜ Local: http://localhost:5173/"
```

### Access in Browser
- Open browser to `http://localhost:5173`
- Full authentication system is now live

---

## 🔍 Debugging

### Token Not Persisting
```javascript
// Check in browser console
localStorage.getItem('authToken')
localStorage.getItem('authUser')

// Clear and re-login if corrupted
localStorage.clear()
```

### Login/Signup Not Working
```javascript
// 1. Check backend is running
curl http://localhost:5000/api/auth/login

// 2. Check frontend env variable
const baseURL = import.meta.env.VITE_API_BASE_URL
console.log(baseURL)  // Should show http://localhost:5000

// 3. Check browser Network tab for 404 or 500 errors
```

### Protected Routes Showing Login
```javascript
// 1. Check if token is being saved
const token = localStorage.getItem('authToken')
console.log(token)  // Should show JWT string

// 2. Check if AuthContext is wrapping App
// Inside App.jsx - should see <AuthProvider>

// 3. Check if ProtectedRoute is used correctly
// Should wrap the protected component
```

---

## 📊 State Persistence

### On App Load
1. AuthProvider checks localStorage for token
2. If token exists → Sets authenticated state
3. If token missing → Sets unauthenticated state
4. User remains logged in across:
   - Page refresh (F5)
   - Browser close/reopen (session persists)
   - Tab switching

### Logout
1. Logout function clears localStorage:
   - Removes authToken
   - Removes authUser
2. AuthContext state resets
3. ProtectedRoutes redirect to /login
4. All API calls will be rejected (no token)

---

## 🔐 Security Notes

✅ **Best Practices Implemented**:
- Token stored in localStorage (accessible to localStorage only, not cookies)
- Bearer token sent in Authorization header
- Automatic logout on token expiry
- Password hidden in input fields
- Account lockout after failed attempts
- HTTPS ready (change API_BASE_URL for production)

⚠️ **Production Recommendations**:
1. Use HTTPS for all URLs (not just localhost)
2. Consider storing token in httpOnly cookie instead
3. Implement token refresh mechanism for long sessions
4. Add session timeout warnings
5. Implement CORS properly with trusted domains only

---

## 📝 File Reference

| File | Status | Purpose |
|------|--------|---------|
| AuthContext.jsx | ✅ NEW | Auth state management |
| ProtectedRoute.jsx | ✅ NEW | Route protection |
| api.js | ✅ NEW | Axios + interceptors |
| Login.jsx | ✅ NEW | Login form |
| Signup.jsx | ✅ NEW | Signup form |
| Dashboard.jsx | ✅ NEW | Authenticated home |
| App.jsx | ✅ UPDATED | React Router setup |
| Navbar.jsx | ✅ UPDATED | Auth-aware navigation |
| HomePage.jsx | ✅ UPDATED | Navigation logic |
| .env.example | ✅ NEW | Environment template |
| package.json | ✅ UPDATED | Added react-router-dom |

---

## 🎯 Next Steps

1. ✅ Authentication flow is complete
2. ✅ Routes are protected
3. ✅ Token management is automatic
4. ✅ Error handling is implemented

**Ready to test!**

```bash
# Terminal 1
cd backend
npm start

# Terminal 2
cd frontend
npm run dev

# Visit http://localhost:5173
```

---

**Last Updated**: February 13, 2026
**Status**: ✅ Complete & Ready for Testing
