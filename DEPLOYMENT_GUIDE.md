# 🚀 Complete Deployment Guide - GitHub + Render

## ⚠️ **IMPORTANT: Chatbot Configuration for Deployment**

Your chatbot currently runs on `localhost:3001`, which **won't work** when deployed. You need to deploy both:
1. **Frontend** (React app) - on Render/Vercel/Netlify
2. **Backend** (Chat server) - on Render as a separate service

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### **Files to Update Before Deployment:**

#### **1️⃣ Environment Variables**
Create `.env` file for sensitive data:

```env
# .env (DO NOT COMMIT THIS FILE)
VITE_GEMINI_API_KEY=AIzaSyAErJI9xz33X-2vW7GuMaII5L7n-PygPi8
VITE_TMDB_API_KEY=be6a15cd5e66f9474ea44c6f4bdf41bd
```

#### **2️⃣ Update .gitignore**
Make sure these are in `.gitignore`:

```
# .gitignore
node_modules/
dist/
.env
.env.local
.env.production
*.log
.DS_Store
```

#### **3️⃣ Update ChatBot API Endpoint**
The chatbot needs to point to your deployed backend URL.

---

## 🔧 **DEPLOYMENT OPTIONS**

### **Option 1: Deploy Both Frontend + Backend on Render (Recommended)**

#### **Step 1: Prepare Backend for Render**

Create `server/package.json`:
```json
{
  "name": "serielat-chat-server",
  "version": "1.0.0",
  "type": "module",
  "main": "chatServer.js",
  "scripts": {
    "start": "node chatServer.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "node-fetch": "^3.3.2"
  }
}
```

#### **Step 2: Update Chat Server for Production**

Update `server/chatServer.js` to use environment variables:
```javascript
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_KEY_HERE';
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'YOUR_KEY_HERE';

// Update CORS for production
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

#### **Step 3: Update Frontend to Use Backend URL**

Update `src/components/ChatBot.tsx`:
```typescript
const API_URL = import.meta.env.VITE_CHAT_API_URL || '/api/chat';

// In handleSend function:
const response = await fetch(API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: input,
    history: messages.slice(-10),
  }),
});
```

---

## 📦 **GITHUB SETUP**

### **Step 1: Initialize Git Repository**

```bash
cd "c:\Users\Admin\Desktop\desk top\gp 2\SerieLat V11\SerieLat"

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - SerieLat website with AI chatbot"
```

### **Step 2: Create GitHub Repository**

1. Go to https://github.com
2. Click "New Repository"
3. Name: `serielat`
4. Description: "Movie & TV show discovery platform with AI chatbot"
5. **Don't** initialize with README (you already have one)
6. Click "Create Repository"

### **Step 3: Push to GitHub**

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/serielat.git

# Push
git branch -M main
git push -u origin main
```

---

## 🌐 **RENDER DEPLOYMENT**

### **Deploy Backend (Chat Server)**

#### **Step 1: Create Web Service on Render**

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `serielat-chat-server`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

#### **Step 2: Add Environment Variables**

In Render dashboard, add:
```
GEMINI_API_KEY=AIzaSyAErJI9xz33X-2vW7GuMaII5L7n-PygPi8
TMDB_API_KEY=be6a15cd5e66f9474ea44c6f4bdf41bd
FRONTEND_URL=https://serielat.onrender.com
```

#### **Step 3: Deploy**

Click "Create Web Service" - Render will deploy automatically!

Your backend URL will be: `https://serielat-chat-server.onrender.com`

---

### **Deploy Frontend (React App)**

#### **Step 1: Create Static Site on Render**

1. Click "New +" → "Static Site"
2. Connect same GitHub repository
3. Configure:
   - **Name**: `serielat`
   - **Root Directory**: Leave empty
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

#### **Step 2: Add Environment Variables**

```
VITE_CHAT_API_URL=https://serielat-chat-server.onrender.com/api/chat
VITE_TMDB_API_KEY=be6a15cd5e66f9474ea44c6f4bdf41bd
```

#### **Step 3: Deploy**

Click "Create Static Site" - Done!

Your website URL: `https://serielat.onrender.com`

---

## 🔄 **ALTERNATIVE: Deploy on Vercel (Frontend) + Render (Backend)**

### **Frontend on Vercel:**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to GitHub
# - Set environment variables
# - Deploy
```

Add environment variables in Vercel dashboard:
```
VITE_CHAT_API_URL=https://serielat-chat-server.onrender.com/api/chat
VITE_TMDB_API_KEY=be6a15cd5e66f9474ea44c6f4bdf41bd
```

---

## ⚡ **IMPORTANT NOTES**

### **Free Tier Limitations:**

#### **Render Free Plan:**
- ⚠️ **Spins down after 15 minutes of inactivity**
- ⚠️ **First request after sleep takes 30-60 seconds**
- ✅ **750 hours/month free**
- ✅ **Automatic HTTPS**

**Solution for Cold Starts:**
- Use a service like [UptimeRobot](https://uptimerobot.com) to ping your backend every 14 minutes
- Or upgrade to paid plan ($7/month) for always-on

#### **Vercel Free Plan:**
- ✅ **Always on**
- ✅ **100GB bandwidth/month**
- ✅ **Automatic deployments from GitHub**

---

## 🔐 **SECURITY BEST PRACTICES**

### **1. Never Commit API Keys**

```bash
# Check what will be committed
git status

# If you accidentally added .env
git rm --cached .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Remove .env from tracking"
```

### **2. Use Environment Variables**

- ✅ Store keys in Render/Vercel dashboard
- ✅ Access via `process.env` or `import.meta.env`
- ❌ Never hardcode in source files

### **3. Enable CORS Properly**

```javascript
// Only allow your frontend domain
app.use(cors({
  origin: ['https://serielat.onrender.com', 'https://serielat.vercel.app'],
  credentials: true
}));
```

---

## 📱 **TESTING DEPLOYMENT**

### **After Deployment:**

1. **Test Frontend**: Visit your Render/Vercel URL
2. **Test Chatbot**: 
   - Click chat bubble
   - Send a message
   - First message might be slow (cold start)
   - Subsequent messages should be fast

3. **Test on Mobile**:
   - Open on your phone
   - Test all features
   - Check responsive design

---

## 🐛 **TROUBLESHOOTING**

### **Chatbot Not Working:**

**Problem**: "Connection error" in chat

**Solutions**:
1. Check backend is running: Visit `https://your-backend.onrender.com`
2. Check CORS settings in `chatServer.js`
3. Verify environment variables in Render dashboard
4. Check browser console for errors

### **Backend Slow to Respond:**

**Problem**: First message takes 30+ seconds

**Cause**: Render free tier spins down after inactivity

**Solutions**:
1. Use UptimeRobot to keep it awake
2. Upgrade to paid plan
3. Add loading message: "Waking up server..."

### **Build Fails:**

**Problem**: Deployment fails on Render/Vercel

**Solutions**:
1. Check build logs
2. Verify `package.json` is correct
3. Make sure all dependencies are listed
4. Test build locally: `npm run build`

---

## 📊 **DEPLOYMENT CHECKLIST**

- [ ] Create `.gitignore` with `.env`
- [ ] Remove API keys from source code
- [ ] Create `server/package.json`
- [ ] Update chat server for production
- [ ] Update ChatBot component with env variable
- [ ] Push to GitHub
- [ ] Deploy backend on Render
- [ ] Add environment variables to Render
- [ ] Deploy frontend on Render/Vercel
- [ ] Add environment variables to frontend
- [ ] Test chatbot functionality
- [ ] Test on mobile devices
- [ ] Set up UptimeRobot (optional)

---

## 🎉 **FINAL RESULT**

After deployment, you'll have:

✅ **Live Website**: `https://serielat.onrender.com`  
✅ **Working Chatbot**: Powered by Gemini AI  
✅ **Mobile Responsive**: Works on all devices  
✅ **Automatic Deployments**: Push to GitHub → Auto-deploy  
✅ **HTTPS Enabled**: Secure by default  
✅ **Global Access**: Available worldwide  

---

## 💡 **NEXT STEPS**

1. Follow the deployment steps above
2. Test thoroughly
3. Share your website URL!
4. Monitor usage and performance
5. Consider upgrading if you get high traffic

---

**Need help with deployment? Let me know which step you're on!** 🚀
