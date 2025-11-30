import { useState, useEffect } from 'react';
import { Loader2, Trophy, Star } from 'lucide-react';
import { MovieCard } from '../components/MovieCard';
import { Movie } from '../types';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';

export function Best100Movies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTop100Movies() {
      try {
        setLoading(true);
        setError(null);

        // Fetch 5 pages to get 100 movies (20 per page)
        const promises = [];
        for (let page = 1; page <= 5; page++) {
          promises.push(
            fetch(
              `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
            ).then(res => res.json())
          );
        }

        const results = await Promise.all(promises);
        
        // Combine all results and take top 100
        const allMovies = results.flatMap(result => result.results);
        const top100 = allMovies.slice(0, 100);
        
        setMovies(top100);
      } catch (err) {
        console.error('Error fetching top 100 movies:', err);
        setError('Failed to load top movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchTop100Movies();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-red-600 dark:text-red-500 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading the best 100 movies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-600 dark:text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Oops!</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-500 via-red-500 to-pink-500 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Top 100 Movies</h1>
          </div>
          <p className="text-lg opacity-90 max-w-2xl">
            Discover the highest-rated movies of all time, ranked by viewers worldwide.
            From timeless classics to modern masterpieces.
          </p>
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-300 fill-current" />
              <span>Highest Rated</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <span>100 Movies</span>
            </div>
          </div>
        </div>
        
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-md">
          <div className="text-3xl font-bold text-red-600 dark:text-red-500">100</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Top Movies</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-md">
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">⭐</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Highest Rated</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-md">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-500">🌍</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Worldwide</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-md">
          <div className="text-3xl font-bold text-green-600 dark:text-green-500">🏆</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Award Winners</div>
        </div>
      </div>

      {/* Movies Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          The Best of the Best
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {movies.map((movie, index) => (
            <div key={movie.id} className="relative">
              {/* Rank Badge */}
              <div className="absolute -top-2 -left-2 z-30 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900">
                #{index + 1}
              </div>
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400 py-8">
        <p>Rankings are based on user ratings from The Movie Database (TMDB)</p>
        <p className="mt-2">Updated regularly to reflect the latest viewer opinions</p>
      </div>
    </div>
  );
}
