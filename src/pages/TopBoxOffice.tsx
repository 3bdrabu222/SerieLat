import { useState, useEffect } from 'react';
import { Loader2, DollarSign, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';
import { AddToFavoriteButton } from '../components/AddToFavoriteButton';
import { AddToWatchLaterButton } from '../components/AddToWatchLaterButton';

interface MovieWithRevenue {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path?: string;
  overview: string;
  release_date: string;
  vote_average: number;
  revenue?: number;
  popularity?: number;
}

export function TopBoxOffice() {
  const [movies, setMovies] = useState<MovieWithRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopBoxOffice() {
      try {
        setLoading(true);
        setError(null);

        // Fetch now playing movies (currently in theaters) - these are the current box office movies
        const response = await fetch(
          `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1&region=US`
        );
        const data = await response.json();

        // Get detailed info including revenue for each movie
        const detailedMoviesPromises = data.results.slice(0, 20).map(async (movie: any) => {
          try {
            const detailRes = await fetch(
              `${TMDB_BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}&language=en-US`
            );
            const detailData = await detailRes.json();
            return {
              ...movie,
              revenue: detailData.revenue || 0,
              runtime: detailData.runtime,
              popularity: movie.popularity || 0
            };
          } catch {
            return { ...movie, revenue: 0, popularity: movie.popularity || 0 };
          }
        });

        const detailedMovies = await Promise.all(detailedMoviesPromises);
        
        // Sort by revenue first, then by popularity for movies without revenue data
        // This shows highest grossing movies currently in theaters
        const sortedMovies = detailedMovies
          .sort((a, b) => {
            // If both have revenue, sort by revenue
            if (a.revenue > 0 && b.revenue > 0) {
              return b.revenue - a.revenue;
            }
            // If only one has revenue, prioritize it
            if (a.revenue > 0) return -1;
            if (b.revenue > 0) return 1;
            // If neither has revenue, sort by popularity
            return b.popularity - a.popularity;
          })
          .slice(0, 20);

        setMovies(sortedMovies);
      } catch (err) {
        console.error('Error fetching box office data:', err);
        setError('Failed to load box office data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchTopBoxOffice();
  }, []);

  const formatRevenue = (revenue: number) => {
    if (revenue >= 1000000000) {
      return `$${(revenue / 1000000000).toFixed(2)}B`;
    }
    if (revenue >= 1000000) {
      return `$${(revenue / 1000000).toFixed(1)}M`;
    }
    return `$${revenue.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-red-600 dark:text-red-500 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading box office data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <DollarSign className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <DollarSign className="w-10 h-10 text-green-600 dark:text-green-500" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Now in Cinema
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Movies currently playing in theaters
        </p>
      </div>

      {/* Top 3 Podium */}
      {movies.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 2nd Place */}
          <div className="md:order-1 order-2">
            <Link to={`/movie/${movies[1].id}`} className="group block">
              <div className="relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-white dark:border-gray-900">
                  2
                </div>
                <div className="relative overflow-hidden rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 mt-8">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movies[1].poster_path}`}
                    alt={movies[1].title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Action Buttons */}
                    <div className="absolute top-2 left-2 flex gap-1 z-10">
                      <AddToFavoriteButton
                        movieId={movies[1].id.toString()}
                        movieTitle={movies[1].title}
                        moviePoster={movies[1].poster_path}
                        movieOverview={movies[1].overview}
                        movieRating={movies[1].vote_average}
                        movieReleaseDate={movies[1].release_date}
                        movieType="movie"
                        variant="icon"
                      />
                      <AddToWatchLaterButton
                        itemId={movies[1].id.toString()}
                        title={movies[1].title}
                        poster={movies[1].poster_path || ''}
                        mediaType="movie"
                        overview={movies[1].overview}
                        rating={movies[1].vote_average}
                        releaseDate={movies[1].release_date}
                        variant="icon"
                      />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
                    <div className="absolute bottom-0 p-4 w-full">
                      <h3 className="text-white font-bold text-lg line-clamp-2 mb-2">
                        {movies[1].title}
                      </h3>
                      <div className="flex items-center gap-2 text-green-400 font-bold">
                        <DollarSign className="w-5 h-5" />
                        <span>{formatRevenue(movies[1].revenue || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* 1st Place */}
          <div className="md:order-2 order-1">
            <Link to={`/movie/${movies[0].id}`} className="group block">
              <div className="relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-3xl font-bold text-white shadow-2xl border-4 border-white dark:border-gray-900 animate-pulse">
                  👑
                </div>
                <div className="relative overflow-hidden rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 mt-10">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movies[0].poster_path}`}
                    alt={movies[0].title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Action Buttons */}
                    <div className="absolute top-2 left-2 flex gap-1 z-10">
                      <AddToFavoriteButton
                        movieId={movies[0].id.toString()}
                        movieTitle={movies[0].title}
                        moviePoster={movies[0].poster_path}
                        movieOverview={movies[0].overview}
                        movieRating={movies[0].vote_average}
                        movieReleaseDate={movies[0].release_date}
                        movieType="movie"
                        variant="icon"
                      />
                      <AddToWatchLaterButton
                        itemId={movies[0].id.toString()}
                        title={movies[0].title}
                        poster={movies[0].poster_path || ''}
                        mediaType="movie"
                        overview={movies[0].overview}
                        rating={movies[0].vote_average}
                        releaseDate={movies[0].release_date}
                        variant="icon"
                      />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
                    <div className="absolute bottom-0 p-4 w-full">
                      <h3 className="text-white font-bold text-xl line-clamp-2 mb-2">
                        {movies[0].title}
                      </h3>
                      <div className="flex items-center gap-2 text-yellow-400 font-bold text-lg">
                        <DollarSign className="w-6 h-6" />
                        <span>{formatRevenue(movies[0].revenue || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* 3rd Place */}
          <div className="md:order-3 order-3">
            <Link to={`/movie/${movies[2].id}`} className="group block">
              <div className="relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-white dark:border-gray-900">
                  3
                </div>
                <div className="relative overflow-hidden rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 mt-8">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movies[2].poster_path}`}
                    alt={movies[2].title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Action Buttons */}
                    <div className="absolute top-2 left-2 flex gap-1 z-10">
                      <AddToFavoriteButton
                        movieId={movies[2].id.toString()}
                        movieTitle={movies[2].title}
                        moviePoster={movies[2].poster_path}
                        movieOverview={movies[2].overview}
                        movieRating={movies[2].vote_average}
                        movieReleaseDate={movies[2].release_date}
                        movieType="movie"
                        variant="icon"
                      />
                      <AddToWatchLaterButton
                        itemId={movies[2].id.toString()}
                        title={movies[2].title}
                        poster={movies[2].poster_path || ''}
                        mediaType="movie"
                        overview={movies[2].overview}
                        rating={movies[2].vote_average}
                        releaseDate={movies[2].release_date}
                        variant="icon"
                      />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
                    <div className="absolute bottom-0 p-4 w-full">
                      <h3 className="text-white font-bold text-lg line-clamp-2 mb-2">
                        {movies[2].title}
                      </h3>
                      <div className="flex items-center gap-2 text-orange-400 font-bold">
                        <DollarSign className="w-5 h-5" />
                        <span>{formatRevenue(movies[2].revenue || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Rest of the List */}
      <div className="space-y-3">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-500" />
          Complete Rankings
        </h2>
        
        {movies.slice(3).map((movie, index) => (
          <Link
            key={movie.id}
            to={`/movie/${movie.id}`}
            className="group block"
          >
            <div className="flex items-center gap-2 md:gap-4 p-3 md:p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              {/* Rank */}
              <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                <span className="text-lg md:text-xl font-bold text-gray-700 dark:text-gray-300">
                  {index + 4}
                </span>
              </div>

              {/* Poster */}
              <div className="flex-shrink-0 w-12 h-18 md:w-16 md:h-24 rounded overflow-hidden shadow-md">
                <img
                  src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm md:text-lg line-clamp-2 md:line-clamp-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-2 md:gap-4 mt-1 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  {movie.release_date && (
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                  )}
                  {movie.vote_average > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span>{movie.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Revenue */}
              <div className="flex-shrink-0 text-right">
                <div className="flex flex-col md:flex-row items-end md:items-center gap-1 md:gap-2 text-green-600 dark:text-green-400 font-bold text-xs md:text-lg">
                  <DollarSign className="w-4 h-4 md:w-5 md:h-5 hidden md:block" />
                  <span className="text-xs md:text-base">{formatRevenue(movie.revenue || 0)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {movies.length === 0 && !loading && (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No box office data available.
          </p>
        </div>
      )}
    </div>
  );
}
