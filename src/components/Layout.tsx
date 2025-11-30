import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Tv, Search, Moon, Sun, ListFilter, Calendar, X, User, Shield, LogOut, Heart, Clock, Trophy, Film, Menu, Users } from 'lucide-react';
import { cn, TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';
import { TVSeries, Movie } from '../types';
import { useAuth } from '../context/AuthContext';
import { ChatBot } from './ChatBot';

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
  const searchDebounceRef = React.useRef<ReturnType<typeof setTimeout>>();
  const searchResultsRef = React.useRef<HTMLDivElement>(null);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchExpanded(false);
        setIsSearching(false);
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
      <header className="sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/90 backdrop-blur-xl dark:bg-gray-900/90 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Header Row */}
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-red-600/20 blur-xl group-hover:bg-red-600/30 transition-all duration-300 rounded-full"></div>
                <Tv className="relative w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-red-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" />
              </div>
              <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent group-hover:from-red-500 group-hover:to-red-400 transition-all duration-300">SerieLat</span>
            </Link>
          
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-1 justify-end">
              {/* Expandable Search */}
              <div ref={searchContainerRef} className="relative flex items-center">
                {/* Search Icon Button */}
                <button
                  onClick={toggleSearch}
                  className="p-2.5 rounded-xl hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-800/50 transition-all duration-300 z-10 group"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors duration-300" />
                </button>

                {/* Expandable Search Input */}
                <div
                  className={`absolute right-0 top-0 transition-all duration-300 ease-in-out ${
                    searchExpanded ? 'opacity-100 w-64 lg:w-80' : 'opacity-0 w-0 pointer-events-none'
                  }`}
                >
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      id="desktop-search-input"
                      type="search"
                      value={searchQuery}
                      onChange={(e) => handleSearchInput(e.target.value)}
                      onFocus={() => setIsSearching(true)}
                      placeholder="Search movies & series..."
                      className="w-full pl-11 pr-10 py-2.5 rounded-2xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
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
                {/* Main Navigation - 3 Clean Buttons */}
                <div className="flex items-center gap-2">
                  <Link
                    to="/best-100"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 text-white transition-all duration-300 text-sm font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/50 hover:scale-105"
                  >
                    <Trophy className="w-4 h-4" />
                    <span className="hidden lg:inline">Best 100</span>
                  </Link>

                  <Link
                    to="/genres"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white transition-all duration-300 text-sm font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105"
                  >
                    <ListFilter className="w-4 h-4" />
                    <span className="hidden lg:inline">Genres</span>
                  </Link>

                  <Link
                    to="/years"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-400 hover:via-cyan-400 hover:to-teal-400 text-white transition-all duration-300 text-sm font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/50 hover:scale-105"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="hidden lg:inline">Years</span>
                  </Link>

                  <Link
                    to="/popular-people"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 hover:from-green-400 hover:via-emerald-400 hover:to-teal-400 text-white transition-all duration-300 text-sm font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/50 hover:scale-105"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden lg:inline">People</span>
                  </Link>
                </div>
              
                {/* Separator */}
                <div className="hidden lg:block w-px h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-700"></div>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2.5 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-700/50 transition-all duration-300 shadow-sm hover:shadow-md group"
                  aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                  title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? <Sun className="w-4 h-4 text-yellow-500 group-hover:rotate-45 transition-transform duration-300" /> : <Moon className="w-4 h-4 text-indigo-600 group-hover:rotate-12 transition-transform duration-300" />}
                </button>

                {/* Separator */}
                <div className="hidden lg:block w-px h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-700"></div>

                {/* User Section */}
                {isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/favorites"
                      className="p-2.5 rounded-xl bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 group"
                      title="My Favorites"
                    >
                      <Heart className="w-4 h-4 group-hover:fill-current transition-all duration-300" />
                    </Link>

                    <Link
                      to="/watch-later"
                      className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 group"
                      title="Watch Later"
                    >
                      <Clock className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                    </Link>

                    <Link
                      to="/profile"
                      className="p-2.5 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-700/50 transition-all duration-300 shadow-sm hover:shadow-md group"
                      title={user?.name}
                    >
                      <User className="w-4 h-4 text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform duration-300" />
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="p-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 group"
                        title="Admin Panel"
                      >
                        <Shield className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="p-2.5 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 hover:from-gray-700 hover:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl group"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/login"
                      className="px-4 py-2 rounded-xl hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-800/50 transition-all duration-300 text-xs font-medium text-gray-700 dark:text-gray-300"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 rounded-xl bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white transition-all duration-300 text-xs font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105"
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
                className="p-2.5 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-700/50 transition-all duration-300 shadow-sm hover:shadow-md group"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors duration-300" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-700/50 transition-all duration-300 shadow-sm hover:shadow-md"
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

              {/* Mobile Navigation Links */}
              <div className="space-y-1 px-2">
                <Link
                  to="/best-100"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white transition-colors"
                >
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm font-medium">Best 100</span>
                </Link>

                <Link
                  to="/genres"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white transition-colors"
                >
                  <ListFilter className="w-4 h-4" />
                  <span className="text-sm font-medium">Genres</span>
                </Link>

                <Link
                  to="/years"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Years</span>
                </Link>

                <Link
                  to="/popular-people"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">People</span>
                </Link>

                {isAuthenticated && (
                  <>
                    <div className="border-t dark:border-gray-700 my-2"></div>
                    
                    <Link
                      to="/favorites"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">Favorites</span>
                    </Link>

                    <Link
                      to="/watch-later"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Watch Later</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">Profile</span>
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

      <main className="container mx-auto px-4 py-8 flex-grow">
        <Outlet />
      </main>

      <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 dark:border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p className="transition-colors duration-300 hover:text-gray-900 dark:hover:text-gray-200">All rights reserved to AUSH.</p>
            <a 
              href="mailto:alshrafi1999@gmail.com"
              className="transition-colors duration-300 hover:text-red-600"
            >
              alshrafi1999@gmail.com
            </a>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <ChatBot />
    </div>
  );
}