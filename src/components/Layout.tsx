import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Tv, Search, Moon, Sun, ListFilter, Calendar, X, User, Shield, LogOut, Heart } from 'lucide-react';
import { cn, TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';
import { TVSeries } from '../types';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const [darkMode, setDarkMode] = React.useState(() => {
    // Check localStorage first, if not available default to true (dark mode)
    const savedMode = localStorage.getItem('darkMode');
    return savedMode !== null ? JSON.parse(savedMode) : true;
  });
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<TVSeries[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const searchDebounceRef = React.useRef<ReturnType<typeof setTimeout>>();
  const searchResultsRef = React.useRef<HTMLDivElement>(null);
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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
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
        const response = await fetch(
          `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(value)}&page=1`
        );
        const data = await response.json();
        setSearchResults(data.results.slice(0, 5));
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
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 dark:border-gray-800 transition-all duration-300">
        <div className="container mx-auto px-4 py-2 sm:py-0 h-auto sm:h-20 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <Link to="/" className="flex items-center space-x-3 group">
            <Tv className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-xl sm:text-2xl font-bold tracking-tight hover:text-red-600 transition-colors duration-300">SerieLat</span>
          </Link>
          
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full sm:w-auto">
            <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => setIsSearching(true)}
                placeholder="Search series..."
                className="w-full sm:w-72 pl-10 pr-4 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsSearching(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                </button>
              )}
              {isSearching && searchResults.length > 0 && (
                <div
                  ref={searchResultsRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50"
                >
                  {searchResults.map((result) => (
                    <Link
                      key={result.id}
                      to={`/series/${result.id}`}
                      className="flex items-start p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      onClick={() => {
                        setIsSearching(false);
                        setSearchQuery('');
                      }}
                    >
                      {result.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                          alt={result.name}
                          className="w-12 h-18 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-18 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          <Tv className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">{result.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {result.first_air_date?.split('-')[0] || 'N/A'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </form>

            <div className="flex items-center space-x-4 sm:space-x-6">
              <Link
                to="/genres"
                className="flex items-center px-4 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 text-gray-900 dark:text-white"
              >
                <ListFilter className="w-4 h-4 mr-2" />
                <span>Classification</span>
              </Link>

              <Link
                to="/years"
                className="flex items-center px-4 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 text-gray-900 dark:text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                <span>Year</span>
              </Link>
              
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>

              {/* Auth Section */}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/favorites"
                    className="flex items-center px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-300"
                    title="My Favorites"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Favorites</span>
                  </Link>

                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                    title={user?.name}
                  >
                    <User className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">{user?.name}</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center px-4 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Admin</span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2.5 rounded-full bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-300"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
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
    </div>
  );
}