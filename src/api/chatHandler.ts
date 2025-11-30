// Chat API Handler - This should be integrated with your backend server
// For development, you can use a simple Express server or Vite proxy

import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';

interface ChatRequest {
  message: string;
  history: Array<{ role: string; content: string }>;
}

interface ChatResponse {
  message: string;
  suggestions?: string[];
  mediaResults?: Array<{
    id: number;
    title: string;
    type: 'movie' | 'tv' | 'person';
    image: string;
    rating?: number;
    year?: string;
    department?: string;
  }>;
  navigation?: string;
}

// Google Gemini API configuration
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // Get free key from https://makersuite.google.com/app/apikey
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function handleChatRequest(req: ChatRequest): Promise<ChatResponse> {
  const { message, history } = req;

  // Build context for the AI
  const systemContext = `You are SerieLat AI, a helpful assistant for the SerieLat website - a movie and TV show discovery platform.

WEBSITE STRUCTURE:
- /discover/movies - Browse all movies
- /discover/tv - Browse all TV shows
- /best-100 - Best 100 content (movies and TV)
- /genres - Browse by genres
- /years - Browse by release year
- /popular-people - Popular actors and actresses
- /movie/:id - Movie details page
- /series/:id - TV show details page
- /person/:id - Actor/actress details page
- /search?q=... - Search results

YOUR CAPABILITIES:
1. Recommend movies and TV shows based on user preferences
2. Search for movies, TV shows, and actors using TMDB
3. Guide users to specific pages on the website
4. Answer questions about movies, TV shows, and actors
5. Help users navigate the website features

RESPONSE FORMAT:
- Be conversational and friendly
- Keep responses concise (2-3 sentences max)
- When recommending content, provide specific titles
- When guiding navigation, mention the page name
- Use emojis sparingly for personality

IMPORTANT:
- Always stay on topic (movies, TV, actors)
- If asked about unrelated topics, politely redirect to entertainment
- Provide actionable suggestions when possible`;

  try {
    // Detect intent and extract keywords
    const intent = detectIntent(message);
    
    // Handle specific intents
    if (intent.type === 'search') {
      return await handleSearchIntent(intent.query);
    }
    
    if (intent.type === 'navigate') {
      return handleNavigationIntent(intent.target);
    }

    if (intent.type === 'recommend') {
      return await handleRecommendationIntent(intent.genre, intent.year, intent.type);
    }

    // General conversation with Gemini
    const conversationHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      })
    });

    const data = await response.json();
    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble understanding. Could you rephrase that?";

    return {
      message: aiMessage,
      suggestions: generateSuggestions(message, aiMessage)
    };

  } catch (error) {
    console.error('Chat error:', error);
    return {
      message: "I'm having trouble connecting right now. Please try again in a moment.",
      suggestions: ["Try again", "Search movies", "Browse genres"]
    };
  }
}

// Intent detection
function detectIntent(message: string): any {
  const lowerMessage = message.toLowerCase();

  // Search intent
  if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('look for')) {
    const query = message.replace(/search|find|look for|me|please|can you/gi, '').trim();
    return { type: 'search', query };
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
    const type = lowerMessage.includes('tv') || lowerMessage.includes('show') ? 'tv' : 'movie';
    return { type: 'recommend', genre, year, type };
  }

  return { type: 'general' };
}

// Search handler
async function handleSearchIntent(query: string): Promise<ChatResponse> {
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
      ...movies.results.slice(0, 2).map((m: any) => ({
        id: m.id,
        title: m.title,
        type: 'movie' as const,
        image: m.poster_path ? `https://image.tmdb.org/t/p/w200${m.poster_path}` : '/placeholder.png',
        rating: m.vote_average,
        year: m.release_date?.split('-')[0]
      })),
      ...tvShows.results.slice(0, 2).map((t: any) => ({
        id: t.id,
        title: t.name,
        type: 'tv' as const,
        image: t.poster_path ? `https://image.tmdb.org/t/p/w200${t.poster_path}` : '/placeholder.png',
        rating: t.vote_average,
        year: t.first_air_date?.split('-')[0]
      })),
      ...people.results.slice(0, 2).map((p: any) => ({
        id: p.id,
        title: p.name,
        type: 'person' as const,
        image: p.profile_path ? `https://image.tmdb.org/t/p/w200${p.profile_path}` : '/placeholder.png',
        department: p.known_for_department
      }))
    ];

    const totalResults = movies.total_results + tvShows.total_results + people.total_results;

    return {
      message: totalResults > 0 
        ? `I found ${totalResults} results for "${query}". Here are some top matches:` 
        : `I couldn't find any results for "${query}". Try searching for something else!`,
      mediaResults: mediaResults.slice(0, 4),
      suggestions: ["Search something else", "Browse genres", "Popular movies"]
    };
  } catch (error) {
    return {
      message: "I had trouble searching. Please try again.",
      suggestions: ["Try again", "Browse movies", "Browse TV shows"]
    };
  }
}

// Navigation handler
function handleNavigationIntent(target: string): ChatResponse {
  const pageNames: Record<string, string> = {
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

// Recommendation handler
async function handleRecommendationIntent(genre?: string, year?: string, type: 'movie' | 'tv' = 'movie'): Promise<ChatResponse> {
  try {
    const endpoint = type === 'movie' ? 'movie/popular' : 'tv/popular';
    const response = await fetch(`${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&page=1`);
    const data = await response.json();

    const mediaResults = data.results.slice(0, 4).map((item: any) => ({
      id: item.id,
      title: type === 'movie' ? item.title : item.name,
      type,
      image: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : '/placeholder.png',
      rating: item.vote_average,
      year: type === 'movie' ? item.release_date?.split('-')[0] : item.first_air_date?.split('-')[0]
    }));

    let message = `Here are some popular ${type === 'movie' ? 'movies' : 'TV shows'}`;
    if (genre) message += ` in the ${genre} genre`;
    if (year) message += ` from ${year}`;
    message += ' that you might enjoy:';

    return {
      message,
      mediaResults,
      suggestions: ["More recommendations", "Different genre", "Browse all"]
    };
  } catch (error) {
    return {
      message: "I had trouble getting recommendations. Please try again.",
      suggestions: ["Try again", "Browse genres", "Search instead"]
    };
  }
}

// Helper functions
function extractGenre(message: string): string | undefined {
  const genres = ['action', 'comedy', 'drama', 'horror', 'thriller', 'romance', 'sci-fi', 'fantasy', 'animation'];
  return genres.find(g => message.toLowerCase().includes(g));
}

function extractYear(message: string): string | undefined {
  const yearMatch = message.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? yearMatch[0] : undefined;
}

function generateSuggestions(userMessage: string, aiResponse: string): string[] {
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
