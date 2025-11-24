# 🏗️ SerieLat Architecture

## 📊 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
│                    (https://serielat.vercel.app)            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTPS Requests
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│                      Hosted on VERCEL                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  • React Components                                     │ │
│  │  • React Router                                         │ │
│  │  • Axios Client                                         │ │
│  │  • Auth Context                                         │ │
│  │  • Favorites Context                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ API Calls (axios)
                           │ /api/auth/*, /api/favorites/*
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                 BACKEND API (Node.js + Express)              │
│                      Hosted on RENDER                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Routes:                                                │ │
│  │  • /api/auth/register                                   │ │
│  │  • /api/auth/login                                      │ │
│  │  • /api/auth/verify-email                               │ │
│  │  • /api/auth/resend-code                                │ │
│  │  • /api/favorites/*                                     │ │
│  │                                                          │ │
│  │  Controllers:                                            │ │
│  │  • authController.js                                    │ │
│  │  • favoritesController.js                               │ │
│  │                                                          │ │
│  │  Services:                                               │ │
│  │  • emailService.js (Nodemailer)                         │ │
│  │                                                          │ │
│  │  Middleware:                                             │ │
│  │  • authMiddleware.js (JWT verification)                 │ │
│  │  • CORS configuration                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ MongoDB Driver
                           │ Mongoose ODM
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   DATABASE (MongoDB Atlas)                   │
│                      Cloud Hosted (AWS)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Collections:                                           │ │
│  │  • users                                                │ │
│  │    - name, email, password (hashed)                     │ │
│  │    - isVerified, verificationCode                       │ │
│  │    - role (user/admin)                                  │ │
│  │                                                          │ │
│  │  • favorites                                             │ │
│  │    - user, itemId, itemType                             │ │
│  │    - title, posterPath, rating                          │ │
│  │                                                          │ │
│  │  • refreshtokens                                         │ │
│  │    - user, token, expiresAt                             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

                           │
                           │ SMTP
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    EMAIL SERVICE (Gmail)                     │
│                      SMTP Server                             │
│  • Verification emails (4-digit codes)                       │
│  • Welcome emails                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Examples

### 1. User Registration Flow

```
User fills registration form
    ↓
Frontend (React)
    ↓ POST /api/auth/register
Backend (Render)
    ↓ Hash password
    ↓ Generate 4-digit code
    ↓ Save to MongoDB Atlas
    ↓ Send email via Gmail
    ↓ Return success
Frontend
    ↓ Redirect to /verify-email
User receives email
    ↓ Enters code
    ↓ POST /api/auth/verify-email
Backend verifies code
    ↓ Update user.isVerified = true
    ↓ Send welcome email
Frontend
    ↓ Redirect to /login
```

### 2. User Login Flow

```
User enters credentials
    ↓
Frontend (React)
    ↓ POST /api/auth/login
Backend (Render)
    ↓ Check email exists
    ↓ Verify password (bcrypt)
    ↓ Check isVerified = true
    ↓ Generate JWT tokens
    ↓ Set refresh token cookie
    ↓ Return access token
Frontend
    ↓ Store token in localStorage
    ↓ Set auth context
    ↓ Redirect to home
```

### 3. Protected API Request Flow

```
User clicks "Add to Favorites"
    ↓
Frontend (React)
    ↓ POST /api/favorites/add
    ↓ Include JWT in Authorization header
Backend (Render)
    ↓ authMiddleware verifies JWT
    ↓ Extract user ID from token
    ↓ Save favorite to MongoDB
    ↓ Return success
Frontend
    ↓ Update favorites context
    ↓ Show success message
```

---

## 🌐 Hosting Platforms

### Frontend: Vercel
- **Type**: Static site hosting
- **Framework**: Vite (React)
- **Build**: `npm run build` → `dist/`
- **Deploy**: Auto from GitHub
- **URL**: `https://your-app.vercel.app`
- **Cost**: FREE (100GB bandwidth/month)

### Backend: Render
- **Type**: Web service
- **Runtime**: Node.js
- **Start**: `npm start` → `node server.js`
- **Deploy**: Auto from GitHub
- **URL**: `https://serielat-backend.onrender.com`
- **Cost**: FREE (750 hours/month)

### Database: MongoDB Atlas
- **Type**: Cloud database (DBaaS)
- **Provider**: AWS/GCP/Azure
- **Tier**: M0 (Free)
- **Storage**: 512MB
- **Connection**: MongoDB driver
- **Cost**: FREE forever

---

## 🔐 Security Layers

```
┌─────────────────────────────────────────┐
│  1. HTTPS (SSL/TLS)                     │
│     • Vercel: Auto SSL                  │
│     • Render: Auto SSL                  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  2. CORS Protection                     │
│     • Only allow frontend domain        │
│     • Credentials: true                 │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  3. JWT Authentication                  │
│     • Access token (15 min)             │
│     • Refresh token (7 days)            │
│     • HttpOnly cookies                  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  4. Password Hashing                    │
│     • bcrypt (10 rounds)                │
│     • Never store plain text            │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  5. Email Verification                  │
│     • 4-digit code (hashed)             │
│     • 10-minute expiration              │
│     • Block unverified logins           │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  6. MongoDB Security                    │
│     • User authentication               │
│     • Network IP whitelist              │
│     • Encrypted connections             │
└─────────────────────────────────────────┘
```

---

## 📦 Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (jsonwebtoken)
- **Password**: bcrypt
- **Email**: Nodemailer
- **Validation**: Express validators

### DevOps
- **Version Control**: Git + GitHub
- **Frontend Host**: Vercel
- **Backend Host**: Render
- **Database Host**: MongoDB Atlas
- **CI/CD**: Auto-deploy on push

---

## 🚀 Deployment Workflow

```
Developer
    ↓
    git push origin main
    ↓
GitHub Repository
    ↓
    ├─→ Vercel (Frontend)
    │   ├─ npm install
    │   ├─ npm run build
    │   └─ Deploy to CDN
    │
    └─→ Render (Backend)
        ├─ npm install
        ├─ npm start
        └─ Deploy to server
```

---

## 💾 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: String (user/admin),
  isVerified: Boolean,
  verificationCode: String (hashed),
  verificationCodeExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Favorites Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  itemId: Number,
  itemType: String (movie/tv),
  title: String,
  posterPath: String,
  rating: Number,
  overview: String,
  releaseDate: String,
  createdAt: Date
}
```

### RefreshTokens Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  token: String,
  expiresAt: Date,
  createdAt: Date
}
```

---

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email with code
- `POST /api/auth/resend-code` - Resend verification code
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Favorites (Protected)
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites/add` - Add to favorites
- `DELETE /api/favorites/:id` - Remove from favorites
- `GET /api/favorites/check/:itemId` - Check if favorited

### User (Protected)
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

### Admin (Protected + Admin Role)
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete user

---

## 📊 Performance

### Frontend (Vercel)
- **CDN**: Global edge network
- **Cache**: Automatic static caching
- **Compression**: Gzip/Brotli
- **Load Time**: < 2 seconds

### Backend (Render)
- **Region**: US/EU (choose closest)
- **Cold Start**: ~30 seconds (free tier)
- **Response Time**: < 500ms
- **Uptime**: 99.9%

### Database (MongoDB Atlas)
- **Region**: Multi-region
- **Latency**: < 100ms
- **Backups**: Daily (paid tier)
- **Scaling**: Auto-scaling

---

## 🎯 Best Practices Implemented

✅ Environment variables for secrets
✅ HTTPS everywhere
✅ JWT with refresh tokens
✅ Password hashing (bcrypt)
✅ Email verification
✅ CORS protection
✅ Input validation
✅ Error handling
✅ Logging
✅ Git version control
✅ CI/CD pipeline
✅ Responsive design
✅ Loading states
✅ Error messages

---

**This architecture provides a secure, scalable, and FREE full-stack application!** 🚀
