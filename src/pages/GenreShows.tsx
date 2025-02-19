import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SeriesCard } from '../components/SeriesCard';
import { TVSeries } from '../types';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';

export function GenreShows() {
  const { genreId } = useParams();
  const [shows, setShows] = React.useState<TVSeries[]>([]);
  const [genreName, setGenreName] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);

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
      try {
        const response = await fetch(
          `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}&language=en-US&sort_by=popularity.desc`
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
  }, [genreId, page]);

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent dark:border-red-500" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-center mb-12">{genreName} Shows</h1>
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
    </div>
  );
}
