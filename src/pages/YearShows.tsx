import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SeriesCard } from '../components/SeriesCard';
import { TVSeries } from '../types';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';

export function YearShows() {
  const { year } = useParams();
  const [shows, setShows] = React.useState<TVSeries[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);

  React.useEffect(() => {
    async function fetchShows() {
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
        
        if (page === 1) {
          setShows(data.results);
        } else {
          setShows(prev => [...prev, ...data.results]);
        }
        
        setHasMore(data.page < data.total_pages);
      } catch (error) {
        console.error('Error fetching shows:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchShows();
  }, [year, page]);

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent dark:border-red-500" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-center mb-4">TV Shows from {year}</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
        Discover popular series that premiered in {year}
      </p>
      
      {shows.length === 0 ? (
        <div className="text-center text-gray-600 dark:text-gray-400">
          No shows found for this year
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {shows.map((show, index) => (
              <motion.div
                key={show.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index % 10 * 0.1 }}
              >
                <SeriesCard series={show} />
              </motion.div>
            ))}
          </div>
          
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all duration-300 hover:scale-105"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
