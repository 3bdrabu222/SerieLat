import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Tv, Search, ListFilter, Calendar, X, User, Shield, LogOut, Heart, Clock, Trophy, Film, Menu, Users, Mail, Phone, MapPin, Sparkles, ChevronDown, TrendingUp, DollarSign, Play, Cake } from 'lucide-react';
import { cn, TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';
import { TVSeries } from '../types';
import { useAuth } from '../context/AuthContext';
import { ChatBot } from './ChatBot';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  media_type: 'movie';
}

interface PersonResult {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  media_type: 'person';
}

type SearchResult = (TVSeries | Movie | PersonResult) & { media_type: 'tv' | 'movie' | 'person' };

export function Layout() {
  const [darkMode, setDarkMode] = React.useState(() => {
    // Check localStorage first, if not available default to true (dark mode)
    const savedMode = localStorage.getItem('darkMode');
    return savedMode !== null ? JSON.parse(savedMode) : true;
  });
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchExpanded, setSearchExpanded] = React.useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = React.useState(false);
  const searchDebounceRef = React.useRef<ReturnType<typeof setTimeout>>();
  const searchResultsRef = React.useRef<HTMLDivElement>(null);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const moreMenuRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save preference to localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchExpanded(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchExpanded(false);
        setIsSearching(false);
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(false);
      setSearchExpanded(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleSearch = () => {
    setSearchExpanded(!searchExpanded);
    if (!searchExpanded) {
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('#desktop-search-input');
        input?.focus();
      }, 100);
    }
  };

  const handleSearchInput = async (value: string) => {
    setSearchQuery(value);
    setIsSearching(true);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!value.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      try {
        // Search TV shows, movies, and people
        const [tvResponse, movieResponse, peopleResponse] = await Promise.all([
          fetch(`${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(value)}&page=1`),
          fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(value)}&page=1&include_adult=false`),
          fetch(`${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(value)}&page=1&include_adult=false`)
        ]);

        const [tvData, movieData, peopleData] = await Promise.all([
          tvResponse.json(),
          movieResponse.json(),
          peopleResponse.json()
        ]);

        // Combine and mark results with media type
        const tvResults = tvData.results.slice(0, 2).map((item: any) => ({ ...item, media_type: 'tv' as const }));
        const movieResults = movieData.results.slice(0, 2).map((item: any) => ({ ...item, media_type: 'movie' as const }));
        const peopleResults = peopleData.results.slice(0, 2).map((item: any) => ({ ...item, media_type: 'person' as const }));
        
        // Interleave results for better UX
        const combined: SearchResult[] = [];
        const maxLength = Math.max(tvResults.length, movieResults.length, peopleResults.length);
        for (let i = 0; i < maxLength; i++) {
          if (movieResults[i]) combined.push(movieResults[i]);
          if (tvResults[i]) combined.push(tvResults[i]);
          if (peopleResults[i]) combined.push(peopleResults[i]);
        }
        
        setSearchResults(combined.slice(0, 6));
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    }, 300);
  };

  const toggleDarkMode = () => {
    setDarkMode((prevMode: boolean) => !prevMode);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={cn(
      "min-h-screen bg-gray-50 text-gray-900 flex flex-col",
      "dark:bg-gray-900 dark:text-gray-100"
    )}>
      <header className="sticky top-0 z-50 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Header Row */}
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo - Modern Minimal with Beautiful Hover */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0 transition-all duration-300">
              <div className="relative">
                {/* Animated glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500 scale-150"></div>
                <div className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:shadow-red-500/60 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Tv className="w-5 h-5 lg:w-6 lg:h-6 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent group-hover:from-red-500 group-hover:to-rose-600 transition-all duration-300 tracking-tight">SerieLat</span>
                <span className="hidden sm:block text-[10px] text-gray-500 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400 font-medium tracking-wide transition-colors duration-300">Movies & TV Shows</span>
              </div>
            </Link>
          
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3 lg:gap-4 flex-1 justify-end">
              {/* Modern Search Bar */}
              <div ref={searchContainerRef} className="relative flex items-center">
                <button
                  onClick={toggleSearch}
                  className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 z-10"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>

                <div
                  className={`absolute right-0 top-0 transition-all duration-300 ease-in-out ${
                    searchExpanded ? 'opacity-100 w-72 lg:w-96' : 'opacity-0 w-0 pointer-events-none'
                  }`}
                >
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      id="desktop-search-input"
                      type="search"
                      value={searchQuery}
                      onChange={(e) => handleSearchInput(e.target.value)}
                      onFocus={() => setIsSearching(true)}
                      placeholder="Search movies, series, people..."
                      className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-lg text-sm placeholder:text-gray-400"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSearchResults([]);
                          setIsSearching(false);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-1"
                      >
                        <X className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    )}
                  </form>

                  {/* Search Results Dropdown */}
                  {isSearching && searchResults.length > 0 && searchExpanded && (
                    <div
                      ref={searchResultsRef}
                      className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl"
                    >
                      {searchResults.map((result) => {
                        const isPerson = result.media_type === 'person';
                        const isMovie = result.media_type === 'movie';
                        const title = isPerson ? (result as any).name : (isMovie ? (result as any).title : (result as any).name);
                        const subtitle = isPerson 
                          ? (result as any).known_for_department 
                          : (isMovie ? (result as any).release_date : (result as any).first_air_date)?.split('-')[0] || 'N/A';
                        const imagePath = isPerson ? (result as any).profile_path : (result as any).poster_path;
                        const linkTo = isPerson ? `/person/${result.id}` : (isMovie ? `/movie/${result.id}` : `/series/${result.id}`);
                        
                        return (
                          <Link
                            key={`${result.media_type}-${result.id}`}
                            to={linkTo}
                            className="flex items-start p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                            onClick={() => {
                              setIsSearching(false);
                              setSearchQuery('');
                              setSearchExpanded(false);
                            }}
                          >
                            {imagePath ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w92${imagePath}`}
                                alt={title}
                                className={`w-10 object-cover rounded ${isPerson ? 'h-10 rounded-full' : 'h-15'}`}
                              />
                            ) : (
                              <div className={`w-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center ${isPerson ? 'h-10 rounded-full' : 'h-15'}`}>
                                {isPerson ? <User className="w-5 h-5 text-gray-400" /> : (isMovie ? <Film className="w-5 h-5 text-gray-400" /> : <Tv className="w-5 h-5 text-gray-400" />)}
                              </div>
                            )}
                            <div className="ml-3 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">{title}</h4>
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                                  isPerson
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                    : (isMovie 
                                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300')
                                }`}>
                                  {isPerson ? 'Person' : (isMovie ? 'Movie' : 'TV')}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {subtitle}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Modern Navigation Pills with Active State */}
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/best-100"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      location.pathname.startsWith('/best-')
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400'
                    }`}
                  >
                    <Trophy className="w-4 h-4" />
                    <span className="hidden lg:inline">Best 100</span>
                  </Link>

                  <Link
                    to="/genres"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      location.pathname.startsWith('/genre')
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400'
                    }`}
                  >
                    <ListFilter className="w-4 h-4" />
                    <span className="hidden lg:inline">Genres</span>
                  </Link>

                  <Link
                    to="/years"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      location.pathname.startsWith('/year')
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="hidden lg:inline">Years</span>
                  </Link>

                  <Link
                    to="/popular-people"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      location.pathname === '/popular-people'
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden lg:inline">People</span>
                  </Link>

                  {/* More Dropdown */}
                  <div ref={moreMenuRef} className="relative">
                    <button
                      onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Menu className="w-4 h-4" />
                      <span className="hidden lg:inline">More</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {moreMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                        <Link
                          to="/trending"
                          onClick={() => setMoreMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Trending</span>
                        </Link>
                        <Link
                          to="/release-calendar"
                          onClick={() => setMoreMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Release Calendar</span>
                        </Link>
                        <Link
                          to="/latest-trailers"
                          onClick={() => setMoreMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Play className="w-4 h-4 text-purple-600 dark:text-purple-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Latest Trailers</span>
                        </Link>
                        <Link
                          to="/whats-on-tv"
                          onClick={() => setMoreMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Tv className="w-4 h-4 text-indigo-600 dark:text-indigo-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">What's on TV</span>
                        </Link>
                        <Link
                          to="/top-box-office"
                          onClick={() => setMoreMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <DollarSign className="w-4 h-4 text-green-600 dark:text-green-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Now in Cinema</span>
                        </Link>
                        <Link
                          to="/born-today"
                          onClick={() => setMoreMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Cake className="w-4 h-4 text-pink-600 dark:text-pink-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Born Today</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  <Link
                    to="/serielat-ai"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 ${
                      location.pathname === '/serielat-ai'
                        ? 'bg-gradient-to-r from-red-600 to-rose-700 shadow-lg shadow-red-500/30'
                        : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden lg:inline">AI</span>
                  </Link>
                </div>
              
                
                

                {/* Separator */}
                <div className="hidden lg:block w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>

                {/* User Actions - Modern Icons with Active State */}
                {isAuthenticated ? (
                  <div className="flex items-center gap-1.5">
                    <Link
                      to="/favorites"
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        location.pathname === '/favorites'
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
                      }`}
                      title="Favorites"
                    >
                      <Heart className={`w-5 h-5 ${location.pathname === '/favorites' ? 'fill-current' : ''}`} />
                    </Link>

                    <Link
                      to="/watch-later"
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        location.pathname === '/watch-later'
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                      title="Watch Later"
                    >
                      <Clock className="w-5 h-5" />
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200"
                        title="Admin"
                      >
                        <Shield className="w-5 h-5" />
                      </Link>
                    )}

                    {/* User Menu */}
                    <div className="hidden lg:flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                      >
                        <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name}</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                        title="Logout"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Mobile Logout */}
                    <button
                      onClick={handleLogout}
                      className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/login"
                      className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-medium hover:from-red-600 hover:to-rose-700 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center gap-2">
              {/* Mobile Search Icon */}
              <button
                onClick={() => {
                  setMobileMenuOpen(true);
                  setTimeout(() => {
                    const input = document.querySelector<HTMLInputElement>('input[type="search"]');
                    input?.focus();
                  }, 100);
                }}
                className="p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-700/50 transition-all duration-300 shadow-sm hover:shadow-md group active:scale-95"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors duration-300" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-700/50 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-gray-700 dark:text-gray-300" /> : <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t dark:border-gray-800 py-4 space-y-3">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative px-2">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onFocus={() => setIsSearching(true)}
                  placeholder="Search movies & series..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm border-2 border-transparent focus:border-red-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setIsSearching(false);
                    }}
                    className="absolute right-5 top-1/2 -translate-y-1/2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-1"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </form>

              {/* Mobile Search Results */}
              {isSearching && searchResults.length > 0 && (
                <div className="px-2 max-h-96 overflow-y-auto">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    {searchResults.map((result) => {
                      const isMovie = result.media_type === 'movie';
                      const title = isMovie ? (result as any).title : (result as any).name;
                      const releaseDate = isMovie ? (result as any).release_date : (result as any).first_air_date;
                      const linkTo = isMovie ? `/movie/${result.id}` : `/series/${result.id}`;
                      
                      return (
                        <Link
                          key={`${result.media_type}-${result.id}`}
                          to={linkTo}
                          className="flex items-start p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                          onClick={() => {
                            setIsSearching(false);
                            setSearchQuery('');
                            setMobileMenuOpen(false);
                          }}
                        >
                          {(result as any).poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${(result as any).poster_path}`}
                              alt={title}
                              className="w-10 h-15 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-15 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                              {isMovie ? <Film className="w-5 h-5 text-gray-400" /> : <Tv className="w-5 h-5 text-gray-400" />}
                            </div>
                          )}
                          <div className="ml-3 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">{title}</h4>
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                                isMovie 
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              }`}>
                                {isMovie ? 'Movie' : 'TV'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {releaseDate?.split('-')[0] || 'N/A'}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mobile Navigation Links with Active State */}
              <div className="space-y-1 px-2">
                <Link
                  to="/best-100"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname.startsWith('/best-')
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>Best 100</span>
                </Link>

                <Link
                  to="/genres"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname.startsWith('/genre')
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <ListFilter className="w-4 h-4" />
                  <span>Genres</span>
                </Link>

                <Link
                  to="/years"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname.startsWith('/year')
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Years</span>
                </Link>

                <Link
                  to="/popular-people"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === '/popular-people'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>People</span>
                </Link>

                <div className="border-t dark:border-gray-700 my-2"></div>
                
                <Link
                  to="/trending"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === '/trending'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Trending</span>
                </Link>

                <Link
                  to="/release-calendar"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === '/release-calendar'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Release Calendar</span>
                </Link>

                <Link
                  to="/latest-trailers"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === '/latest-trailers'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span>Latest Trailers</span>
                </Link>

                <Link
                  to="/whats-on-tv"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === '/whats-on-tv'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Tv className="w-4 h-4" />
                  <span>What's on TV</span>
                </Link>

                <Link
                  to="/top-box-office"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === '/top-box-office'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Now in Cinema</span>
                </Link>

                <Link
                  to="/born-today"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === '/born-today'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Cake className="w-4 h-4" />
                  <span>Born Today</span>
                </Link>

                <div className="border-t dark:border-gray-700 my-2"></div>

                <Link
                  to="/serielat-ai"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === '/serielat-ai'
                      ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg shadow-red-500/30'
                      : 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>SerieLat AI</span>
                </Link>

                {isAuthenticated && (
                  <>
                    <div className="border-t dark:border-gray-700 my-2"></div>
                    
                    <Link
                      to="/favorites"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                        location.pathname === '/favorites'
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${location.pathname === '/favorites' ? 'fill-current' : ''}`} />
                      <span>Favorites</span>
                    </Link>

                    <Link
                      to="/watch-later"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                        location.pathname === '/watch-later'
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>Watch Later</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                        location.pathname === '/profile'
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        <span className="text-sm">Admin</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </>
                )}

                {!isAuthenticated && (
                  <>
                    <div className="border-t dark:border-gray-700 my-2"></div>
                    
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="text-sm">Login</span>
                    </Link>

                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center px-3 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                    >
                      <span className="text-sm font-medium">Sign Up</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex-grow">
        <Outlet />
      </main>

      <footer className="border-t bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 dark:border-gray-700">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Tv className="w-8 h-8 text-red-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                  SerieLat
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your Gateway to Movies & TV Magic. Discover, explore, and enjoy the best entertainment content.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://x.com/3bdurabu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/3bdurabu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-600 hover:text-white transition-all duration-300"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://github.com/3bdrabu222"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-900 hover:text-white transition-all duration-300"
                  aria-label="GitHub"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/abdurabu-saleh-ba7a7531a"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-700 hover:text-white transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/best-100" className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                    Best 100
                  </Link>
                </li>
                <li>
                  <Link to="/genres" className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                    Browse Genres
                  </Link>
                </li>
                <li>
                  <Link to="/years" className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                    Browse by Year
                  </Link>
                </li>
                <li>
                  <Link to="/popular-people" className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                    Popular People
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account</h3>
              <ul className="space-y-2">
                {isAuthenticated ? (
                  <>
                    <li>
                      <Link to="/favorites" className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                        My Favorites
                      </Link>
                    </li>
                    <li>
                      <Link to="/watch-later" className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                        Watch Later
                      </Link>
                    </li>
                    <li>
                      <Link to="/profile" className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/settings" className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                        Settings
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                        Login
                      </Link>
                    </li>
                    <li>
                      <Link to="/register" className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                        Sign Up
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4 text-red-600" />
                  <a href="mailto:alshrafi1999@gmail.com" className="hover:text-red-600 dark:hover:text-red-500 transition-colors">
                    alshrafi1999@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4 text-red-600" />
                  <a href="tel:+966552445377" className="hover:text-red-600 dark:hover:text-red-500 transition-colors">
                    +966 552 445 377
                  </a>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span>Saudi Arabia — Riyadh</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                2024 SerieLat. All rights reserved to AUSH.
              </p>
              <div className="flex gap-6 text-sm">
                <Link to="/settings" className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/settings" className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <ChatBot />
    </div>
  );
}