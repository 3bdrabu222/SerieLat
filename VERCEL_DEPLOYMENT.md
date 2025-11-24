# 🚀 Complete Deployment Guide for Vercel

## 📋 Quick Overview

Since Vercel doesn't support backend/database, here's the solution:

```
┌─────────────────────────────────────────────────┐
│  Frontend (React) → Vercel (Free)              │
│  Backend (Node.js) → Render/Railway (Free)     │
│  Database (MongoDB) → MongoDB Atlas (Free)     │
└─────────────────────────────────────────────────┘
```

**Everything is FREE!** ✅

---

## Part 1: MongoDB Atlas Setup (5 minutes)

### 1. Create Free Account
- Go to: https://www.mongodb.com/cloud/atlas/register
- Sign up (free forever)
- Choose **M0 FREE** tier (512MB)

### 2. Create Database User
1. **Database Access** → **Add New Database User**
2. Username: `serielat-admin`
3. Password: Create strong password (save it!)
4. Role: **Read and write to any database**

### 3. Allow Network Access
1. **Network Access** → **Add IP Address**
2. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
3. Confirm

### 4. Get Connection String
1. **Database** → **Connect** → **Connect your application**
2. Copy connection string:
   ```
   mongodb+srv://serielat-admin:<password>@cluster0.xxxxx.mongodb.net/serielat?retryWrites=true&w=majority
   ```
3. Replace `<password>` with your actual password

**Save this connection string!** You'll need it for backend deployment.

---

## Part 2: Backend Deployment to Render (10 minutes)

### Why Render?
- ✅ Free tier (750 hours/month)
- ✅ Supports Node.js
- ✅ Auto-deploy from GitHub
- ✅ Free SSL/HTTPS
- ✅ No credit card required

### Step 1: Prepare Backend

Create `server/.gitignore`:
```
node_modules/
.env
.DS_Store
```

Update `server/package.json` - add engines:
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Step 2: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for deployment"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/serielat.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Render

1. Go to: https://render.com/
2. Sign up with GitHub (free)
3. Click **"New +"** → **"Web Service"**
4. Select your repository
5. Configure:

**Basic Settings:**
- Name: `serielat-backend`
- Region: Choose closest to you
- Branch: `main`
- Root Directory: `server` (if backend is in server folder)
- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`

**Instance Type:**
- Select: **Free**

6. Click **"Advanced"** → Add Environment Variables:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://serielat-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/serielat?retryWrites=true&w=majority
JWT_ACCESS_SECRET=change-this-to-random-secret-key-min-32-chars
JWT_REFRESH_SECRET=change-this-to-another-random-secret-key-min-32-chars
CLIENT_URL=https://your-app.vercel.app
EMAIL_USER=serielat.website@gmail.com
EMAIL_PASSWORD=jflk bkis fkjk rkhv
FRONTEND_URL=https://your-app.vercel.app
```

**Important:** 
- Replace `YOUR_PASSWORD` with MongoDB password
- Replace `your-app.vercel.app` with your actual Vercel URL (you'll update this later)
- Generate strong secrets for JWT keys

7. Click **"Create Web Service"**

8. Wait 5-10 minutes for deployment

9. Your backend URL: `https://serielat-backend.onrender.com`

**Save this URL!** You'll need it for frontend.

---

## Part 3: Frontend Deployment to Vercel (5 minutes)

### Step 1: Create `.env.production` File

Create this file in your project root (not in src):

```env
VITE_API_URL=https://serielat-backend.onrender.com/api
```

Replace with your actual Render backend URL.

### Step 2: Update `.gitignore`

Make sure `.env.production` is NOT in `.gitignore` (or add it to git):

```bash
git add .env.production
git commit -m "Add production environment"
git push
```

### Step 3: Deploy to Vercel

**Option A: Using Vercel Dashboard (Easiest)**

1. Go to: https://vercel.com/
2. Sign up with GitHub (free)
3. Click **"Add New..."** → **"Project"**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (or leave empty)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. **Environment Variables** → Add:
   ```
   VITE_API_URL = https://serielat-backend.onrender.com/api
   ```
7. Click **"Deploy"**
8. Wait 2-3 minutes
9. Your app is live! 🎉

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: serielat
# - Directory: ./
# - Build command: npm run build
# - Output directory: dist

# Add environment variable
vercel env add VITE_API_URL production
# Enter: https://serielat-backend.onrender.com/api

# Deploy to production
vercel --prod
```

### Step 4: Update Backend CORS

Go back to Render dashboard:
1. Open your backend service
2. **Environment** → Edit `CLIENT_URL` and `FRONTEND_URL`
3. Update to your Vercel URL: `https://your-app.vercel.app`
4. Save changes (service will redeploy)

---

## Part 4: Final Configuration

### Update Backend Environment Variables on Render

Now that you have your Vercel URL, update these on Render:

```env
CLIENT_URL=https://your-actual-app.vercel.app
FRONTEND_URL=https://your-actual-app.vercel.app
```

### Test Your Deployment

1. Visit your Vercel URL
2. Try to register a new account
3. Check email for verification code
4. Verify email
5. Login
6. Test favorites feature

---

## 🎯 Architecture Summary

```
User Browser
    ↓
Frontend (Vercel)
https://serielat.vercel.app
    ↓
Backend API (Render)
https://serielat-backend.onrender.com
    ↓
MongoDB Atlas (Cloud)
mongodb+srv://...
```

---

## 💰 Cost Breakdown

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| Vercel | Hobby | **FREE** | 100GB bandwidth/month |
| Render | Free | **FREE** | 750 hours/month |
| MongoDB Atlas | M0 | **FREE** | 512MB storage |
| **TOTAL** | | **$0/month** | Perfect for production! |

---

## 🐛 Troubleshooting

### Backend not responding
- Check Render logs: Dashboard → Logs
- Verify environment variables are set
- Check MongoDB connection string

### CORS errors
- Verify `CLIENT_URL` matches your Vercel URL exactly
- Include `https://` in the URL
- No trailing slash

### Email not sending
- Verify Gmail app password is correct
- Check Render logs for email errors
- Test with different email address

### Database connection failed
- Check MongoDB Atlas IP whitelist (0.0.0.0/0)
- Verify connection string is correct
- Check database user has correct permissions

### Frontend can't reach backend
- Verify `VITE_API_URL` is set correctly in Vercel
- Check backend URL is accessible
- Open browser console for errors

---

## 🔄 Continuous Deployment

Both Vercel and Render support auto-deployment:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Update feature"
   git push
   ```

2. **Automatic Deployment**:
   - Vercel: Deploys frontend automatically
   - Render: Deploys backend automatically

3. **Check Status**:
   - Vercel: Dashboard → Deployments
   - Render: Dashboard → Events

---

## 📝 Environment Variables Checklist

### Backend (Render):
- ✅ `NODE_ENV=production`
- ✅ `PORT=5000`
- ✅ `MONGO_URI` (from Atlas)
- ✅ `JWT_ACCESS_SECRET`
- ✅ `JWT_REFRESH_SECRET`
- ✅ `CLIENT_URL` (Vercel URL)
- ✅ `FRONTEND_URL` (Vercel URL)
- ✅ `EMAIL_USER`
- ✅ `EMAIL_PASSWORD`

### Frontend (Vercel):
- ✅ `VITE_API_URL` (Render backend URL + /api)

---

## 🎉 You're Done!

Your SerieLat app is now live on:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://serielat-backend.onrender.com
- **Database**: MongoDB Atlas (cloud)

**All FREE!** No credit card required! 🚀

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## 🔐 Security Tips

1. **Never commit `.env` files** to GitHub
2. **Use strong JWT secrets** (32+ characters)
3. **Rotate secrets** periodically
4. **Enable MongoDB Atlas backups**
5. **Monitor Render logs** for suspicious activity
6. **Use HTTPS only** (both Vercel and Render provide this)

---

**Need Help?** Check the troubleshooting section or review the logs on Render/Vercel dashboards.
