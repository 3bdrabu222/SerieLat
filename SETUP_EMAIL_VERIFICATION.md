# 🚀 Quick Setup Guide - Email Verification

## Step 1: Configure Gmail

### Enable App Password:
1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** → **2-Step Verification** (enable if not already)
3. Go to **App passwords**: https://myaccount.google.com/apppasswords
4. Select:
   - App: **Mail**
   - Device: **Other (Custom name)** → Type "SerieLat"
5. Click **Generate**
6. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

---

## Step 2: Update Environment Variables

### Edit `server/.env`:
```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Replace:**
- `your-email@gmail.com` with your Gmail address
- `abcdefghijklmnop` with your 16-character app password (no spaces)

---

## Step 3: Restart Backend Server

```bash
cd server
npm run dev
```

**Expected output:**
```
🚀 Server running on port 5000
📡 API available at http://localhost:5000/api
✅ MongoDB connected successfully
```

---

## Step 4: Test the System

### Test Registration:
1. Open: http://localhost:5173/register
2. Fill form:
   - Name: Test User
   - Email: your-test-email@gmail.com
   - Password: test123
3. Click "Sign Up"
4. **Expected**: Redirect to verification page
5. **Check your email** for 4-digit code

### Test Verification:
1. Enter the 4-digit code from email
2. Click "Verify Email"
3. **Expected**: Success message → Redirect to login

### Test Login:
1. Login with your credentials
2. **Expected**: Successful login

---

## 🎉 That's It!

Your email verification system is now working!

---

## 🐛 Troubleshooting

### "Failed to send verification email"
- ✅ Check EMAIL_USER is correct
- ✅ Check EMAIL_PASSWORD has no spaces
- ✅ Verify 2FA is enabled on Gmail
- ✅ Check internet connection

### Email not received
- ✅ Check spam folder
- ✅ Wait 1-2 minutes
- ✅ Click "Resend Code"
- ✅ Try different email address

### "Invalid verification code"
- ✅ Check you entered all 4 digits
- ✅ Code is case-sensitive (numbers only)
- ✅ Code expires after 10 minutes
- ✅ Click "Resend Code" for new one

---

## 📧 Email Preview

You'll receive an email like this:

```
Subject: Verify Your Email - SerieLat

Hi Test User! 👋

Thank you for registering with SerieLat. To complete your 
registration, please verify your email address.

Your verification code is:

    1 2 3 4

Enter this code on the verification page to activate your account.

⚠️ This code will expire in 10 minutes.
```

---

## ✅ Success!

If you received the email and verified successfully, your system is working perfectly! 🎉
