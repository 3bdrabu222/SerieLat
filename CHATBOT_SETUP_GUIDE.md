# 🤖 SerieLat AI Chatbot - Complete Setup Guide

## ✅ What's Been Created

I've integrated a fully-featured AI chatbot into your SerieLat website with the following components:

### 📁 Files Created:
1. **`src/components/ChatBot.tsx`** - Main chatbot UI component
2. **`server/chatServer.js`** - Express server for handling chat API requests
3. **`src/api/chatHandler.ts`** - TypeScript handler (reference implementation)

### 🎯 Features Implemented:
- ✅ Floating chat bubble in bottom-right corner
- ✅ Elegant chat window with glass/blur effect
- ✅ Dark mode support (matches Serielat theme)
- ✅ Voice input capability
- ✅ Quick action buttons
- ✅ Conversation memory (last 10 messages)
- ✅ TMDB API integration for search
- ✅ Smart intent detection (search, navigate, recommend)
- ✅ Media results with images in chat
- ✅ Auto-navigation to pages
- ✅ Mobile responsive
- ✅ Clear chat history
- ✅ Smooth animations with Framer Motion

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
# Install required packages
npm install express cors node-fetch

# Or if using yarn
yarn add express cors node-fetch
```

### Step 2: Get Free Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key (it's FREE!)
4. Copy the API key

### Step 3: Configure the Chat Server

Open `server/chatServer.js` and replace:
```javascript
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
```

With your actual API key:
```javascript
const GEMINI_API_KEY = 'AIzaSy...your-actual-key';
```

### Step 4: Start the Chat Server

```bash
# Navigate to your project root
cd "c:\Users\Admin\Desktop\desk top\gp 2\SerieLat V11\SerieLat"

# Start the chat server
node server/chatServer.js
```

You should see:
```
Chat server running on http://localhost:3001
Make sure to set GEMINI_API_KEY environment variable
```

### Step 5: Update Frontend API Endpoint

The chatbot component (`src/components/ChatBot.tsx`) is already configured to call `/api/chat`.

You need to proxy this to your chat server. Add this to your `vite.config.ts`:

```typescript
export default defineConfig({
  // ... existing config
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
```

### Step 6: Start Your Development Server

```bash
npm run dev
```

---

## 🎨 Chatbot Capabilities

### 1️⃣ **Search Movies, TV Shows & People**
User: "Search for Inception"
→ Shows movie results with posters and ratings

### 2️⃣ **Get Recommendations**
User: "Recommend action movies"
→ Displays popular action movies with images

### 3️⃣ **Navigate Website**
User: "Show me genres"
→ Redirects to `/genres` page

User: "Take me to popular people"
→ Redirects to `/popular-people` page

### 4️⃣ **General Conversation**
User: "What's the best movie of 2024?"
→ AI responds with recommendations

### 5️⃣ **Voice Input**
Click the microphone icon and speak your query

---

## 🧠 How It Works

### Intent Detection System:
```javascript
// Search Intent
"search for", "find", "look for" → Triggers TMDB search

// Navigation Intent  
"show me", "go to", "take me" → Navigates to pages

// Recommendation Intent
"recommend", "suggest", "what should i watch" → Shows recommendations

// General Intent
Everything else → Handled by Gemini AI
```

### API Flow:
```
User Input → ChatBot Component → /api/chat → Chat Server → Gemini AI / TMDB API → Response → ChatBot UI
```

---

## 🎯 Quick Actions

The chatbot includes 4 quick action buttons:
1. **Recommend action movies** - Shows action movie recommendations
2. **Popular TV shows** - Displays trending TV shows
3. **Search actors** - Helps find movies by actors
4. **Best of 2024** - Shows top 2024 movies

---

## 📱 Mobile Support

The chatbot is fully responsive:
- Floating bubble scales appropriately
- Chat window adapts to screen size
- Touch-friendly buttons
- Smooth animations on mobile

---

## 🔧 Customization

### Change Chatbot Position:
Edit `src/components/ChatBot.tsx`:
```tsx
// Change from bottom-right to bottom-left
className="fixed bottom-6 left-6 ..." // instead of right-6
```

### Modify Colors:
```tsx
// Change gradient colors
className="bg-gradient-to-br from-red-600 to-red-700" 
// Change to blue:
className="bg-gradient-to-br from-blue-600 to-blue-700"
```

### Adjust AI Temperature:
Edit `server/chatServer.js`:
```javascript
generationConfig: {
  temperature: 0.7, // 0.0 = more focused, 1.0 = more creative
  maxOutputTokens: 500,
}
```

---

## 🐛 Troubleshooting

### Issue: Chatbot doesn't appear
**Solution**: Check that `<ChatBot />` is added to `Layout.tsx` (line 640)

### Issue: "Connection error" in chat
**Solution**: 
1. Make sure chat server is running (`node server/chatServer.js`)
2. Check Vite proxy configuration
3. Verify GEMINI_API_KEY is set correctly

### Issue: Voice input not working
**Solution**: Voice input only works in HTTPS or localhost. Some browsers don't support it.

### Issue: No search results
**Solution**: Verify TMDB_API_KEY in `server/chatServer.js` is correct

---

## 🌟 Advanced Features

### Add Custom Intents:
Edit `server/chatServer.js` → `detectIntent()` function:
```javascript
// Add new intent
if (lowerMessage.includes('trending')) {
  return { type: 'trending' };
}
```

### Add More Quick Actions:
Edit `src/components/ChatBot.tsx`:
```tsx
const quickActions = [
  // Add new action
  { icon: Star, text: "Top Rated", query: "Show me top rated movies" },
  // ... existing actions
];
```

### Customize Welcome Message:
Edit `src/components/ChatBot.tsx` → `useEffect`:
```tsx
content: "Your custom welcome message here!",
```

---

## 📊 Performance

- **Debounced search**: 300ms delay prevents spam
- **Conversation memory**: Only last 10 messages sent to AI
- **Optimized images**: Uses w200 size from TMDB
- **Lazy loading**: Chat window only renders when open

---

## 🔐 Security Notes

1. **Never expose API keys in frontend code**
2. The chat server acts as a proxy to hide keys
3. Consider rate limiting in production
4. Add authentication if needed

---

## 🎉 You're All Set!

The chatbot is now fully integrated into your SerieLat website!

### Test it out:
1. Click the floating red bubble in bottom-right
2. Try: "Search for The Matrix"
3. Try: "Recommend comedy movies"
4. Try: "Show me genres"

Enjoy your new AI assistant! 🚀

---

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the chat server terminal for logs
3. Verify all API keys are correct
4. Ensure all dependencies are installed

**Happy coding!** 🎬✨
