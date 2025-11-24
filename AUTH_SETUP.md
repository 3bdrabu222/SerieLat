# 🔐 Authentication System Setup Guide

Complete authentication system has been added to your SerieLat project.

---

## 📁 Project Structure

```
SerieLat/
├── server/                    # Backend (Node.js + Express + MongoDB)
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js # Auth logic (register, login, etc.)
│   │   └── userController.js # User management
│   ├── models/
│   │   ├── User.js           # User schema
│   │   ├── RefreshToken.js   # Refresh token schema
│   │   └── PasswordResetToken.js
│   ├── routes/
│   │   ├── authRoutes.js     # Auth endpoints
│   │   └── userRoutes.js     # User endpoints
│   ├── middlewares/
│   │   ├── authMiddleware.js # JWT verification
│   │   └── roleMiddleware.js # Role-based access
│   ├── scripts/
│   │   └── createAdmin.js    # Create admin user
│   ├── server.js             # Main server file
│   ├── package.json
│   └── .env                  # Backend environment variables
│
├── src/                       # Frontend (React + TypeScript)
│   ├── api/
│   │   └── axiosClient.ts    # API client with auto-refresh
│   ├── context/
│   │   └── AuthContext.tsx   # Auth state management
│   ├── components/
│   │   ├── ProtectedRoute.tsx
│   │   ├── AdminRoute.tsx
│   │   └── Navbar.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Profile.tsx
│   │   └── AdminDashboard.tsx
│   └── App.tsx               # Updated with auth routes
│
└── .env                       # Frontend environment variables
```

---

## 🚀 Installation & Setup

### Step 1: Install MongoDB

You need MongoDB running locally or use MongoDB Atlas (cloud).

**Option A: Local MongoDB**
- Download from: https://www.mongodb.com/try/download/community
- Install and start MongoDB service

**Option B: MongoDB Atlas (Cloud)**
- Create free account at: https://www.mongodb.com/cloud/atlas
- Create a cluster and get connection string
- Update `MONGO_URI` in `server/.env`

### Step 2: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd ..
npm install
```

### Step 4: Configure Environment Variables

**Backend (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/serielat
JWT_ACCESS_SECRET=your-super-secret-access-token-key
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key
CLIENT_URL=http://localhost:5173
```

**Frontend (`.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 5: Create Admin User

```bash
cd server
npm run create-admin
```

**Default Admin Credentials:**
- Email: `admin@serielat.com`
- Password: `admin123456`

⚠️ **IMPORTANT:** Change the password after first login!

---

## 🏃 Running the Project

### Terminal 1: Start Backend Server

```bash
cd server
npm run dev
```

Server will run on: `http://localhost:5000`

### Terminal 2: Start Frontend

```bash
npm run dev
```

Frontend will run on: `http://localhost:5173`

---

## 🔑 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh-token` | Refresh access token | Cookie |
| POST | `/auth/logout` | Logout user | Cookie |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password/:token` | Reset password | No |

### User Routes (`/api/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user/profile` | Get user profile | Yes (User) |
| PUT | `/user/profile` | Update profile | Yes (User) |
| GET | `/user/admin/users` | Get all users | Yes (Admin) |
| DELETE | `/user/admin/users/:id` | Delete user | Yes (Admin) |

---

## 🧪 Testing with Postman

### 1. Register User

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Login

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response includes `accessToken`. Copy it for next requests.

### 3. Get Profile (Protected)

```http
GET http://localhost:5000/api/user/profile
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

### 4. Admin Dashboard (Admin Only)

```http
GET http://localhost:5000/api/user/admin/users
Authorization: Bearer ADMIN_ACCESS_TOKEN_HERE
```

---

## 🔐 Security Features

✅ **Password Hashing** - bcrypt with salt rounds  
✅ **JWT Authentication** - Access tokens (15 min) + Refresh tokens (7 days)  
✅ **HttpOnly Cookies** - Refresh tokens stored securely  
✅ **Role-Based Access** - User and Admin roles  
✅ **Token Refresh** - Automatic token renewal  
✅ **Protected Routes** - Frontend route guards  
✅ **CORS Protection** - Configured for your domain  

---

## 🎨 Frontend Features

### Pages

1. **Login** (`/login`) - User login form
2. **Register** (`/register`) - User registration
3. **Profile** (`/profile`) - User profile page (protected)
4. **Admin Dashboard** (`/admin`) - User management (admin only)

### Components

- **ProtectedRoute** - Wraps routes requiring authentication
- **AdminRoute** - Wraps routes requiring admin role
- **Navbar** - Shows auth status and user info

### Auth Context

The `AuthContext` provides:
- `user` - Current user object
- `loading` - Loading state
- `login(email, password)` - Login function
- `register(name, email, password)` - Register function
- `logout()` - Logout function
- `isAuthenticated` - Boolean auth status
- `isAdmin` - Boolean admin status

---

## 🐛 Troubleshooting

### MongoDB Connection Error

**Error:** `MongoNetworkError: connect ECONNREFUSED`

**Solution:**
- Make sure MongoDB is running
- Check `MONGO_URI` in `server/.env`
- For Windows: Start MongoDB service from Services

### CORS Error

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
- Check `CLIENT_URL` in `server/.env` matches your frontend URL
- Restart backend server after changing `.env`

### Token Expired

**Error:** `Token expired`

**Solution:**
- The system auto-refreshes tokens
- If refresh fails, you'll be redirected to login
- This is normal behavior for security

### Axios Module Not Found

**Error:** `Cannot find module 'axios'`

**Solution:**
```bash
npm install
```

---

## 📝 Notes

1. **Access Token**: Stored in memory (localStorage), expires in 15 minutes
2. **Refresh Token**: Stored in httpOnly cookie, expires in 7 days
3. **Auto-Refresh**: Axios interceptor automatically refreshes expired tokens
4. **Logout**: Clears tokens from both client and database

---

## 🔄 Password Reset Flow

1. User clicks "Forgot Password"
2. Enters email
3. Backend generates reset token
4. In development, token URL is logged to console
5. In production, send email with reset link
6. User clicks link and enters new password

---

## 🚀 Production Deployment

Before deploying to production:

1. **Change JWT Secrets** in `server/.env`
2. **Set NODE_ENV=production**
3. **Use MongoDB Atlas** (cloud database)
4. **Enable HTTPS** for secure cookies
5. **Configure email service** for password reset
6. **Remove debug logs**
7. **Set strong admin password**

---

## 📧 Support

For issues or questions:
- Email: alshrafi1999@gmail.com
- Check server logs for errors
- Check browser console for frontend errors

---

**Authentication system is ready to use! 🎉**
