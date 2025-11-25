# ✅ Render Setup Checklist

## Environment Variables to Add:

Copy each line and add as separate environment variable in Render:

### 1. NODE_ENV
```
production
```

### 2. PORT
```
5000
```

### 3. MONGO_URI
```
mongodb+srv://serielatwebsite_db_user:5eBoWDN69mzZVwg7@serielat.ousddhz.mongodb.net/serielat?retryWrites=true&w=majority
```

### 4. JWT_ACCESS_SECRET
```
your-super-secret-access-token-key-change-this-in-production-min-32-chars
```

### 5. JWT_REFRESH_SECRET
```
your-super-secret-refresh-token-key-change-this-in-production-min-32-chars
```

### 6. CLIENT_URL
```
https://YOUR-VERCEL-URL.vercel.app
```
⚠️ **Replace with your actual Vercel URL!**

### 7. EMAIL_USER
```
serielat.website@gmail.com
```

### 8. EMAIL_PASSWORD
```
jflk bkis fkjk rkhv
```

### 9. FRONTEND_URL
```
https://YOUR-VERCEL-URL.vercel.app
```
⚠️ **Replace with your actual Vercel URL!**

---

## Configuration Summary:

- **Name**: serielat-backend
- **Region**: Choose closest to you
- **Branch**: master
- **Root Directory**: server ⚠️ IMPORTANT
- **Build Command**: npm install
- **Start Command**: npm start
- **Instance Type**: Free

---

## After Deployment:

1. Wait 5-10 minutes
2. Copy your Render URL (e.g., https://serielat-backend.onrender.com)
3. Update Vercel environment variable:
   - VITE_API_URL = https://serielat-backend.onrender.com/api
4. Redeploy Vercel
5. Update CLIENT_URL and FRONTEND_URL in Render with actual Vercel URL

---

## Your Vercel URL:

Write it here: ___________________________________

(You'll need this for CLIENT_URL and FRONTEND_URL)
