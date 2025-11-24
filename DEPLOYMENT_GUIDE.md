# 🚀 Deployment Guide - SerieLat

## Overview

Your SerieLat app has two parts:
1. **Frontend (React)** → Deploy to **Vercel**
2. **Backend (Node.js + MongoDB)** → Deploy to **Render** or **Railway**

---

## 📊 Architecture

```
Frontend (Vercel)
    ↓
Backend API (Render/Railway)
    ↓
MongoDB Atlas (Cloud Database)
```

---

## Part 1: Setup MongoDB Atlas (Free Cloud Database)

### Step 1: Create Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for **FREE**
3. Choose **M0 FREE** tier (512MB storage)

### Step 2: Create Cluster
1. Click **"Build a Database"**
2. Choose **FREE** tier (M0)
3. Select cloud provider: **AWS** (recommended)
4. Choose region closest to your users
5. Cluster name: `SerieLat` (or keep default)
6. Click **"Create"**

### Step 3: Create Database User
1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Username: `serielat-admin`
5. Password: Generate secure password (save it!)
6. User Privileges: **Read and write to any database**
7. Click **"Add User"**

### Step 4: Whitelist IP Addresses
1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### Step 5: Get Connection String
1. Go to **Database** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**
5. Copy the connection string:
   ```
   mongodb+srv://serielat-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name: `serielat`
   ```
   mongodb+srv://serielat-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/serielat?retryWrites=true&w=majority
   ```

---

## Part 2: Deploy Backend to Render (Free)

### Why Render?
- ✅ Free tier available
- ✅ Supports Node.js
- ✅ Easy deployment
- ✅ Automatic HTTPS
- ✅ Environment variables

### Step 1: Prepare Backend for Deployment

1. **Create `.gitignore` in server folder** (if not exists):
```
node_modules/
.env
.DS_Store
```

2. **Update `server/package.json`** - ensure you have:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Step 2: Push to GitHub

1. Create a new repository on GitHub
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/serielat-backend.git
git push -u origin main
```

### Step 3: Deploy on Render

1. Go to: https://render.com/
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure:
   - **Name**: `serielat-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `server` (if backend is in server folder)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**

6. **Add Environment Variables**:
   Click **"Advanced"** → **"Add Environment Variable"**
   
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://serielat-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/serielat?retryWrites=true&w=majority
   JWT_ACCESS_SECRET=your-super-secret-access-token-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production
   CLIENT_URL=https://your-frontend-app.vercel.app
   EMAIL_USER=serielat.website@gmail.com
   EMAIL_PASSWORD=jflk bkis fkjk rkhv
   FRONTEND_URL=https://your-frontend-app.vercel.app
   ```

7. Click **"Create Web Service"**

8. Wait for deployment (5-10 minutes)

9. Your backend URL will be: `https://serielat-backend.onrender.com`

---

