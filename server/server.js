import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import favoritesRoutes from './routes/favoritesRoutes.js';
import watchLaterRoutes from './routes/watchLaterRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/watchlater', watchLaterRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const TMDB_API_KEY = process.env.TMDB_API_KEY || 'be6a15cd5e66f9474ea44c6f4bdf41bd';
    const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

    // Detect intent
    const intent = detectIntent(message);

    // Handle search intent
    if (intent.type === 'search') {
      const result = await handleSearchIntent(intent.query, TMDB_API_KEY, TMDB_BASE_URL);
      return res.json(result);
    }

    // Handle navigation intent
    if (intent.type === 'navigate') {
      return res.json({
        message: `Let me take you there!`,
        navigate: intent.target,
        suggestions: ["Search movies", "Recommend something", "Browse genres"]
      });
    }

    // Handle recommendation intent
    if (intent.type === 'recommend') {
      const result = await handleRecommendationIntent(intent.genre, intent.year, intent.mediaType, TMDB_API_KEY, TMDB_BASE_URL);
      return res.json(result);
    }

    // General conversation with Gemini
    const systemContext = `You are SerieLat AI, an expert movie and TV show assistant for the SerieLat streaming platform.

YOUR ROLE:
You are a knowledgeable entertainment expert who helps users discover and enjoy movies, TV shows, and learn about actors. You have deep knowledge of cinema, television, genres, directors, and entertainment industry.

CORE CAPABILITIES:
1. 🎬 Movie & TV Show Recommendations - Suggest content based on preferences, mood, genre, year, actors
2. 🔍 Content Discovery - Help users find specific movies, shows, or actors
3. 📚 Entertainment Knowledge - Answer questions about plots, cast, directors, awards, trivia
4. 🗺️ Website Navigation - Guide users to browse genres, years, best content, popular people
5. 🎯 Personalized Suggestions - Understand user preferences and provide tailored recommendations

RESPONSE GUIDELINES:
- Be enthusiastic and passionate about movies/TV
- Provide specific, actionable recommendations
- Include relevant details (year, director, genre, rating when helpful)
- Keep responses conversational but informative (2-4 sentences)
- Use emojis occasionally to add personality
- If you don't have exact information, be honest but still helpful
- Always try to understand user intent even if query is vague

Remember: Be helpful, knowledgeable, and make discovering entertainment exciting!`;

    const conversationHistory = (history || []).slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          ...conversationHistory,
          {
            role: 'user',
            parts: [{ text: `${systemContext}\n\nUser: ${message}` }]
          }
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 800,
          topP: 0.95,
          topK: 40,
        }
      })
    });

    const geminiData = await geminiResponse.json();
    const aiMessage = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 
                      "I'm having trouble understanding. Could you rephrase that?";

    res.json({
      message: aiMessage,
      suggestions: generateSuggestions(message, aiMessage)
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      message: "I'm having trouble connecting right now. Please try again.",
      suggestions: ["Try again", "Search movies", "Browse genres"]
    });
  }
});

// Helper functions for chat
function detectIntent(message) {
  const lowerMessage = message.toLowerCase();

  // Search intent - improved to catch movie title queries
  if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('look for') ||
      lowerMessage.includes('get') || lowerMessage.includes('watch') || lowerMessage.includes('movie') ||
      lowerMessage.includes('show') || lowerMessage.includes('series')) {
    
    let query = message.replace(/how to|how do i|can you|please|search|find|look for|get|the|a|an/gi, '').trim();
    query = query.replace(/movie|show|series|tv/gi, '').trim();
    
    if (query.length > 2) {
      return { type: 'search', query };
    }
  }

  // Navigation intent
  if (lowerMessage.includes('show me') || lowerMessage.includes('go to') || lowerMessage.includes('take me')) {
    if (lowerMessage.includes('genre')) return { type: 'navigate', target: '/genres' };
    if (lowerMessage.includes('best') || lowerMessage.includes('top')) return { type: 'navigate', target: '/best-100' };
    if (lowerMessage.includes('actor') || lowerMessage.includes('people')) return { type: 'navigate', target: '/popular-people' };
    if (lowerMessage.includes('movie')) return { type: 'navigate', target: '/discover/movies' };
    if (lowerMessage.includes('tv') || lowerMessage.includes('show')) return { type: 'navigate', target: '/discover/tv' };
  }

  // Recommendation intent
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('what should i watch')) {
    const genre = extractGenre(lowerMessage);
    const year = extractYear(lowerMessage);
    const mediaType = lowerMessage.includes('tv') || lowerMessage.includes('show') ? 'tv' : 'movie';
    return { type: 'recommend', genre, year, mediaType };
  }

  return { type: 'general' };
}

async function handleSearchIntent(query, TMDB_API_KEY, TMDB_BASE_URL) {
  try {
    const [movieRes, tvRes, personRes] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`),
      fetch(`${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`),
      fetch(`${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`)
    ]);

    const [movies, tvShows, people] = await Promise.all([
      movieRes.json(),
      tvRes.json(),
      personRes.json()
    ]);

    const mediaResults = [
      ...movies.results.slice(0, 2).map(m => ({
        id: m.id,
        title: m.title,
        type: 'movie',
        image: m.poster_path ? `https://image.tmdb.org/t/p/w200${m.poster_path}` : '/placeholder.png',
        rating: m.vote_average?.toFixed(1),
        year: m.release_date?.split('-')[0]
      })),
      ...tvShows.results.slice(0, 2).map(t => ({
        id: t.id,
        title: t.name,
        type: 'tv',
        image: t.poster_path ? `https://image.tmdb.org/t/p/w200${t.poster_path}` : '/placeholder.png',
        rating: t.vote_average?.toFixed(1),
        year: t.first_air_date?.split('-')[0]
      })),
      ...people.results.slice(0, 2).map(p => ({
        id: p.id,
        title: p.name,
        type: 'person',
        image: p.profile_path ? `https://image.tmdb.org/t/p/w200${p.profile_path}` : '/placeholder.png',
        department: p.known_for_department
      }))
    ];

    const totalResults = movies.total_results + tvShows.total_results + people.total_results;
    const topResult = mediaResults[0];

    let message;
    if (totalResults > 0) {
      if (topResult) {
        if (topResult.type === 'movie') {
          message = `🎬 Found "${topResult.title}"! ${topResult.year ? `Released in ${topResult.year}` : ''} ${topResult.rating ? `with a ${topResult.rating}/10 rating` : ''}. Click to view details or I can find similar movies!`;
        } else if (topResult.type === 'tv') {
          message = `📺 Found "${topResult.title}"! ${topResult.year ? `First aired in ${topResult.year}` : ''} ${topResult.rating ? `with a ${topResult.rating}/10 rating` : ''}. Click to watch or get similar recommendations!`;
        } else {
          message = `⭐ Found ${topResult.title}! ${topResult.department ? `Known for ${topResult.department}` : ''}. Click to see their movies and shows!`;
        }
      } else {
        message = `Found ${totalResults} results for "${query}"! Here are the top matches:`;
      }
    } else {
      message = `Hmm, I couldn't find "${query}" 🤔. Try searching with a different spelling, or let me recommend something similar!`;
    }

    return {
      message,
      mediaResults: mediaResults.slice(0, 4),
      suggestions: totalResults > 0 
        ? ["Find similar", "More details", "Different search"]
        : ["Browse genres", "Popular movies", "Recommend something"]
    };
  } catch (error) {
    return {
      message: "I had trouble searching. Please try again.",
      suggestions: ["Try again", "Browse movies", "Browse TV shows"]
    };
  }
}

async function handleRecommendationIntent(genre, year, mediaType, TMDB_API_KEY, TMDB_BASE_URL) {
  try {
    const endpoint = mediaType === 'movie' ? 'movie/popular' : 'tv/popular';
    const response = await fetch(`${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&page=1`);
    const data = await response.json();

    const mediaResults = data.results.slice(0, 4).map(item => ({
      id: item.id,
      title: mediaType === 'movie' ? item.title : item.name,
      type: mediaType,
      image: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : '/placeholder.png',
      rating: item.vote_average?.toFixed(1),
      year: mediaType === 'movie' ? item.release_date?.split('-')[0] : item.first_air_date?.split('-')[0]
    }));

    const contentType = mediaType === 'movie' ? 'movies' : 'TV shows';
    let message;
    
    if (genre && year) {
      message = `🎯 Perfect! Here are top-rated ${genre} ${contentType} from ${year}. These are highly recommended!`;
    } else if (genre) {
      message = `🎬 Great taste! Here are some amazing ${genre} ${contentType} you'll love. Click any to learn more!`;
    } else if (year) {
      message = `📅 Excellent choice! Here are the best ${contentType} from ${year}. Some real gems here!`;
    } else {
      message = `⭐ Here are some trending ${contentType} that are getting rave reviews! Pick one and enjoy!`;
    }

    return {
      message,
      mediaResults,
      suggestions: ["Show me more", "Different genre", "Surprise me"]
    };
  } catch (error) {
    return {
      message: "I had trouble getting recommendations. Please try again.",
      suggestions: ["Try again", "Browse genres", "Search instead"]
    };
  }
}

function extractGenre(message) {
  const genres = ['action', 'comedy', 'drama', 'horror', 'thriller', 'romance', 'sci-fi', 'fantasy', 'animation'];
  return genres.find(g => message.toLowerCase().includes(g));
}

function extractYear(message) {
  const yearMatch = message.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? yearMatch[0] : null;
}

function generateSuggestions(userMessage, aiResponse) {
  const suggestions = [];
  if (userMessage.toLowerCase().includes('recommend')) {
    suggestions.push("Show me more", "Different genre", "Browse all");
  } else if (userMessage.toLowerCase().includes('search')) {
    suggestions.push("Find similar", "More details", "Browse genres");
  } else {
    suggestions.push("Recommend movies", "Search actors", "Browse genres");
  }
  return suggestions.slice(0, 3);
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
