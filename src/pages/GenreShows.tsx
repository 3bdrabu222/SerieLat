import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SeriesCard } from '../components/SeriesCard';
import { TVSeries } from '../types';
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../lib/utils';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export function GenreShows() {
  const { genreId } = useParams();
  const [shows, setShows] = React.useState<TVSeries[]>([]);
  const [genreName, setGenreName] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [featuredShow, setFeaturedShow] = React.useState<TVSeries | null>(null);
  const [hoveredCard, setHoveredCard] = React.useState<number | null>(null);

  React.useEffect(() => {
    async function fetchGenreName() {
      try {
        const response = await fetch(
          `${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}&language=en-US`
        );
        const data = await response.json();
        const genre = data.genres.find((g: { id: number }) => g.id === Number(genreId));
        if (genre) {
          setGenreName(genre.name);
        }
      } catch (error) {
        console.error('Error fetching genre name:', error);
      }
    }

    fetchGenreName();
  }, [genreId]);

  React.useEffect(() => {
    async function fetchShows() {
      setLoading(true);
      try {
        const response = await fetch(
          `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}&language=en-US&sort_by=popularity.desc`
        );
        const data = await response.json();
        
        setShows(data.results || []);
        setTotalPages(data.total_pages || 1);
        
        // Set the most popular show as the featured show for the header
        if (page === 1 && data.results && data.results.length > 0) {
          // Find a show with a backdrop image
          const showWithBackdrop = data.results.find((show: TVSeries) => show.backdrop_path);
          setFeaturedShow(showWithBackdrop || data.results[0]);
        }
      } catch (error) {
        console.error('Error fetching shows:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchShows();
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [genreId, page]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`px-3 py-1 mx-1 rounded-md ${
            page === i
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return pageNumbers;
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-red-600 dark:text-red-500" />
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading {genreName} shows...</p>
        </div>
      </div>
    );
  }

  // Container variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };

  // Item variants for individual card animations
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="pb-12">
      {/* Hero section with featured show */}
      {featuredShow && featuredShow.backdrop_path && (
        <motion.div 
          className="relative w-full h-[40vh] md:h-[50vh] mb-12 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0">
            <img 
              src={`${TMDB_IMAGE_BASE_URL}/original${featuredShow.backdrop_path}`}
              alt={featuredShow.name}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
          </div>
          
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-7xl mx-auto">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 drop-shadow-lg">
                {genreName} <span className="text-red-500">Shows</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl mb-6 drop-shadow">
                Discover the best {genreName.toLowerCase()} TV series all in one place
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Main content */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Title section (only shown if no featured show) */}
        {(!featuredShow || !featuredShow.backdrop_path) && (
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-purple-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {genreName} Shows
          </motion.h1>
        )}

        {/* Filter/sort options could go here */}
        <div className="mb-8 flex justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400">
            {shows.length > 0 ? `Showing ${shows.length} results` : 'No shows found'}
          </p>
          
          {/* Placeholder for future filter/sort controls */}
          <div className="hidden md:block">
            {/* Future filter controls */}
          </div>
        </div>

        {/* Shows grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-red-600 dark:text-red-500" />
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {shows.map((show) => (
              <motion.div
                key={show.id}
                variants={itemVariants}
                whileHover={{ scale: 1.03, zIndex: 10 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setHoveredCard(show.id)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <SeriesCard 
                  series={show} 
                  isHovered={hoveredCard === show.id}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-col items-center space-y-4">
            <div className="flex items-center">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1}
                className={`p-2 rounded-md ${
                  page === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex mx-2">
                {renderPageNumbers()}
              </div>
              
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className={`p-2 rounded-md ${
                  page === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {totalPages}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
