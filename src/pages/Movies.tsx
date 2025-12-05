import { useState, useEffect } from 'react';
import { Loader2, Film, TrendingUp, Star } from 'lucide-react';
import { MovieCard } from '../components/MovieCard';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path?: string;
  overview: string;
  release_date: string;
  vote_average: number;
}

export function Movies() {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);

        const [popularRes, topRatedRes, trendingRes] = await Promise.all([
          fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`),
          fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`),
          fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`)
        ]);

        const [popularData, topRatedData, trendingData] = await Promise.all([
          popularRes.json(),
          topRatedRes.json(),
          trendingRes.json()
        ]);

        setPopularMovies(popularData.results.slice(0, 18));
        setTopRatedMovies(topRatedData.results.slice(0, 18));
        setTrendingMovies(trendingData.results.slice(0, 18));
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-red-600 dark:text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Film className="w-10 h-10 text-red-600 dark:text-red-500" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Movies</h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Discover the latest and greatest movies from around the world
        </p>
      </div>

      {/* Trending Movies */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-500" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Trending This Week</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {trendingMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Popular Movies */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Film className="w-6 h-6 text-red-600 dark:text-red-500" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Popular Movies</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {popularMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Top Rated Movies */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-6 h-6 text-yellow-500 fill-current" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Top Rated Movies</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {topRatedMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
}
