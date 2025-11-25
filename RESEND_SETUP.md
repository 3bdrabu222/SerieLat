# 📧 Resend Email Setup Guide

## ✅ Why Resend Instead of Gmail?

**Problem with Gmail SMTP on Render:**
- ❌ Render blocks or throttles SMTP ports (465, 587)
- ❌ Gmail blocks connections from untrusted servers
- ❌ Results in ETIMEDOUT errors
- ❌ Slow and unreliable

**Benefits of Resend:**
- ✅ **Fast** - No SMTP, uses API
- ✅ **Reliable** - Works perfectly on Render/Vercel
- ✅ **Free** - 100 emails/day (3000/month)
- ✅ **Easy** - Simple API integration

---

## 🚀 Setup Steps

### **1. Create Resend Account**

1. Go to: https://resend.com/signup
2. Sign up (free account)
3. Verify your email

### **2. Get API Key**

1. Go to: https://resend.com/api-keys
2. Click **"Create API Key"**
3. Name: `SerieLat Production`
4. Permission: **"Sending access"**
5. Click **"Create"**
6. **Copy the API key** (starts with `re_...`)
   - Example: `re_123abc456def789ghi`

⚠️ **Important:** Save this key! You won't see it again.

---

## 🔧 Local Development Setup

### **Update `.env` file:**

```env
RESEND_API_KEY=re_your_actual_api_key_here
```

### **Test Locally:**

```bash
cd server
npm run dev
```

Then try registering on: http://localhost:5173

---

## ☁️ Production Setup (Render)

### **1. Update Render Environment Variables:**

1. Go to: https://dashboard.render.com/
2. Select your **SerieLat** backend service
3. Click **"Environment"** (left sidebar)
4. **Add new variable:**
   - **Key:** `RESEND_API_KEY`
   - **Value:** `re_your_actual_api_key_here`
5. Click **"Save"**

### **2. Remove Old Gmail Variables (Optional):**

You can delete these (not needed anymore):
- `EMAIL_USER`
- `EMAIL_PASSWORD`

### **3. Push Changes to GitHub:**

```bash
git add .
git commit -m "Switch to Resend for email delivery"
git push
```

Render will automatically redeploy!

---

## 🧪 Testing

### **1. Wait for Render to Redeploy** (2-3 minutes)

### **2. Test Registration:**

1. Go to: https://serielat.vercel.app
2. Click **"Sign Up"**
3. Fill in the form
4. Click **"Sign Up"**
5. **Check your email** - should arrive in seconds! ⚡

### **3. Check Render Logs:**

You should see:
```
✅ Verification email sent: [email-id]
```

**No more timeout errors!** 🎉

---

## 📊 Resend Dashboard

Monitor your emails at: https://resend.com/emails

You can see:
- ✅ Emails sent
- ✅ Delivery status
- ✅ Open rates
- ✅ Error logs

---

## 💰 Pricing

**Free Tier:**
- 100 emails/day
- 3,000 emails/month
- Perfect for development and small projects

**Paid Plans:**
- $20/month - 50,000 emails
- $80/month - 100,000 emails

---

## 🔐 Security Tips

1. **Never commit API keys** to GitHub
2. **Use environment variables** only
3. **Rotate keys** if exposed
4. **Monitor usage** in Resend dashboard

---

## 🐛 Troubleshooting

### **Error: "Invalid API key"**
- Check if `RESEND_API_KEY` is set correctly in Render
- Make sure there are no extra spaces
- Regenerate key if needed

### **Emails not arriving:**
- Check Resend dashboard for delivery status
- Check spam folder
- Verify recipient email is correct
- Check Render logs for errors

### **"Failed to send verification email"**
- Check Render logs for detailed error
- Verify API key is valid
- Check Resend account status

---

## ✅ What Changed

### **Before (Gmail SMTP):**
```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

await transporter.sendMail(mailOptions);
```

### **After (Resend API):**
```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'SerieLat <onboarding@resend.dev>',
  to: email,
  subject: 'Verify Your Email',
  html: emailTemplate
});
```

---

## 📝 Summary

✅ Installed `resend` package
✅ Updated `emailService.js` to use Resend
✅ Updated `.env` with `RESEND_API_KEY`
✅ Removed Gmail SMTP dependency
✅ Faster and more reliable email delivery

**Your email system is now production-ready!** 🚀

---

## 🔗 Useful Links

- Resend Dashboard: https://resend.com/
- Resend Docs: https://resend.com/docs
- API Reference: https://resend.com/docs/api-reference
- Status Page: https://status.resend.com/
