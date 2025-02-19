import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Tv, Search, Moon, Sun, ListFilter, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

export function Layout() {
  const [darkMode, setDarkMode] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-gray-50 text-gray-900 flex flex-col",
      "dark:bg-gray-900 dark:text-gray-100"
    )}>
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 dark:border-gray-800 transition-all duration-300">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <Tv className="w-8 h-8 text-red-600 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-2xl font-bold tracking-tight hover:text-red-600 transition-colors duration-300">SerieLat</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search series..."
                className="w-72 pl-10 pr-4 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              />
            </form>

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
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
            >
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
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