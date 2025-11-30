// Simple Express server for handling chat API requests
// Run this with: node server/chatServer.js

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const TMDB_API_KEY = 'be6a15cd5e66f9474ea44c6f4bdf41bd';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAErJI9xz33X-2vW7GuMaII5L7n-PygPi8';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    // Detect intent
    const intent = detectIntent(message);

    // Handle search intent
    if (intent.type === 'search') {
      const result = await handleSearchIntent(intent.query);
      return res.json(result);
    }

    // Handle navigation intent
    if (intent.type === 'navigate') {
      const result = handleNavigationIntent(intent.target);
      return res.json(result);
    }

    // Handle recommendation intent
    if (intent.type === 'recommend') {
      const result = await handleRecommendationIntent(intent.genre, intent.year, intent.mediaType);
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

WEBSITE FEATURES:
- /discover/movies - Browse all movies
- /discover/tv - Browse TV shows  
- /best-100 - Top 100 movies and shows
- /genres - Browse by genre (action, comedy, drama, etc.)
- /years - Browse by release year
- /popular-people - Discover popular actors and actresses
- /search - Universal search for movies, TV, people

EXAMPLE INTERACTIONS:
User: "dark knight"
You: "The Dark Knight (2008) is an incredible superhero film! Directed by Christopher Nolan, it features Heath Ledger's legendary Joker performance. Would you like me to search for it or recommend similar movies?"

User: "recommend something"  
You: "I'd love to help! What kind of mood are you in? Action-packed thrillers, heartwarming dramas, laugh-out-loud comedies, or mind-bending sci-fi? 🎬"

User: "action movies"
You: "Great choice! I can show you popular action movies, recent releases, or classics. Would you like recommendations from a specific year or featuring a particular actor?"

Remember: Be helpful, knowledgeable, and make discovering entertainment exciting!`;

    const conversationHistory = history.slice(-10).map(msg => ({
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

// Helper functions
function detectIntent(message) {
  const lowerMessage = message.toLowerCase();

  // Search intent - improved to catch movie title queries
  if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('look for') ||
      lowerMessage.includes('get') || lowerMessage.includes('watch') || lowerMessage.includes('movie') ||
      lowerMessage.includes('show') || lowerMessage.includes('series')) {
    
    // Extract the actual query
    let query = message.replace(/how to|how do i|can you|please|search|find|look for|get|the|a|an/gi, '').trim();
    query = query.replace(/movie|show|series|tv/gi, '').trim();
    
    // If query is meaningful, search for it
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

async function handleSearchIntent(query) {
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

function handleNavigationIntent(target) {
  const pageNames = {
    '/genres': 'Genres page',
    '/best-100': 'Best 100 page',
    '/popular-people': 'Popular People page',
    '/discover/movies': 'Movies page',
    '/discover/tv': 'TV Shows page'
  };

  return {
    message: `Taking you to the ${pageNames[target] || 'page'} now! 🎬`,
    navigation: target,
    suggestions: []
  };
}

async function handleRecommendationIntent(genre, year, mediaType = 'movie') {
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
  return yearMatch ? yearMatch[0] : undefined;
}

function generateSuggestions(userMessage, aiResponse) {
  const suggestions = [];
  
  if (aiResponse.toLowerCase().includes('movie')) {
    suggestions.push("Show me popular movies");
  }
  if (aiResponse.toLowerCase().includes('tv') || aiResponse.toLowerCase().includes('show')) {
    suggestions.push("Browse TV shows");
  }
  if (aiResponse.toLowerCase().includes('actor') || aiResponse.toLowerCase().includes('actress')) {
    suggestions.push("Search for actors");
  }
  
  if (suggestions.length === 0) {
    suggestions.push("Recommend movies", "Browse genres", "Search actors");
  }
  
  return suggestions.slice(0, 3);
}

// Start server
app.listen(PORT, () => {
  console.log(`Chat server running on http://localhost:${PORT}`);
  console.log(`Make sure to set GEMINI_API_KEY environment variable`);
});
