import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SeriesCard } from '../components/SeriesCard';
import { TVSeries } from '../types';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export function YearShows() {
  const { year } = useParams();
  const [shows, setShows] = React.useState<TVSeries[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [hoveredCard, setHoveredCard] = React.useState<number | null>(null);

  React.useEffect(() => {
    async function fetchShows() {
      setLoading(true);
      try {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        
        const response = await fetch(
          `${TMDB_BASE_URL}/discover/tv?` +
          `api_key=${TMDB_API_KEY}` +
          `&first_air_date.gte=${startDate}` +
          `&first_air_date.lte=${endDate}` +
          `&page=${page}` +
          `&language=en-US` +
          `&sort_by=popularity.desc`
        );
        
        const data = await response.json();
        
        setShows(data.results || []);
        setTotalPages(data.total_pages || 1);
      } catch (error) {
        console.error('Error fetching shows:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchShows();
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [year, page]);

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

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-red-600 dark:text-red-500" />
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading shows from {year}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 pb-12">
      <motion.h1 
        className="text-4xl md:text-5xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        TV Shows from {year}
      </motion.h1>
      <motion.p 
        className="text-center text-gray-600 dark:text-gray-400 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Discover popular series that premiered in {year}
      </motion.p>
      
      {shows.length === 0 ? (
        <div className="text-center text-gray-600 dark:text-gray-400 py-12">
          <p className="text-xl">No shows found for this year</p>
          <p className="mt-2">Try selecting a different year</p>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
