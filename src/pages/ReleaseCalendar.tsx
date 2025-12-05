import { useState, useEffect } from 'react';
import { Loader2, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';
import { AddToFavoriteButton } from '../components/AddToFavoriteButton';
import { AddToWatchLaterButton } from '../components/AddToWatchLaterButton';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
}

interface GroupedMovies {
  [date: string]: Movie[];
}

export function ReleaseCalendar() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUpcomingMovies() {
      try {
        setLoading(true);
        setError(null);

        // Get today's date and 60 days from now
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 60);

        const minDate = today.toISOString().split('T')[0];
        const maxDate = futureDate.toISOString().split('T')[0];

        // Fetch upcoming movies from multiple pages with date range
        const promises = [];
        for (let page = 1; page <= 3; page++) {
          promises.push(
            fetch(
              `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=${page}&region=US`
            ).then(res => res.json())
          );
        }

        const results = await Promise.all(promises);
        const allMovies = results.flatMap(result => result.results);
        
        // Filter movies to only show those releasing from today onwards
        const upcomingMovies = allMovies.filter(movie => {
          const releaseDate = new Date(movie.release_date);
          return releaseDate >= today;
        });
        
        // Sort by release date
        const sortedMovies = upcomingMovies.sort((a, b) => {
          return new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
        });
        
        setMovies(sortedMovies);
      } catch (err) {
        console.error('Error fetching upcoming movies:', err);
        setError('Failed to load release calendar. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchUpcomingMovies();
  }, []);

  // Group movies by release date
  const groupedMovies: GroupedMovies = movies.reduce((acc, movie) => {
    const date = movie.release_date || 'TBA';
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(movie);
    return acc;
  }, {} as GroupedMovies);

  const formatDate = (dateString: string) => {
    if (dateString === 'TBA') return 'To Be Announced';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getRelativeDate = (dateString: string) => {
    if (dateString === 'TBA') return '';
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays > 7 && diffDays <= 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
    if (diffDays > 30) return `In ${Math.ceil(diffDays / 30)} months`;
    return '';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-red-600 dark:text-red-500 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading release calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Calendar className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Calendar className="w-10 h-10 text-red-600 dark:text-red-500" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            Release Calendar
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Upcoming movie releases - Mark your calendar for these exciting new films!
        </p>
      </div>

      {/* Release Calendar */}
      <div className="space-y-8">
        {Object.entries(groupedMovies).map(([date, dateMovies]) => (
          <div key={date} className="space-y-4">
            {/* Date Header */}
            <div className="sticky top-16 z-10 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 backdrop-blur-sm border-l-4 border-red-600 dark:border-red-500 p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatDate(date)}
                  </h2>
                  {getRelativeDate(date) && (
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-1 mt-1">
                      <Clock className="w-4 h-4" />
                      {getRelativeDate(date)}
                    </p>
                  )}
                </div>
                <span className="px-3 py-1 bg-red-600 dark:bg-red-500 text-white text-sm font-semibold rounded-full">
                  {dateMovies.length} {dateMovies.length === 1 ? 'Movie' : 'Movies'}
                </span>
              </div>
            </div>

            {/* Movies Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {dateMovies.map((movie) => (
                <Link
                  key={movie.id}
                  to={`/movie/${movie.id}`}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-auto aspect-[2/3] object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {/* Action Buttons */}
                      <div className="absolute top-2 left-2 flex gap-1 z-10">
                        <AddToFavoriteButton
                          movieId={movie.id.toString()}
                          movieTitle={movie.title}
                          moviePoster={movie.poster_path}
                          movieOverview={movie.overview}
                          movieRating={movie.vote_average}
                          movieReleaseDate={movie.release_date}
                          movieType="movie"
                          variant="icon"
                        />
                        <AddToWatchLaterButton
                          itemId={movie.id.toString()}
                          title={movie.title}
                          poster={movie.poster_path || ''}
                          mediaType="movie"
                          overview={movie.overview}
                          rating={movie.vote_average}
                          releaseDate={movie.release_date}
                          variant="icon"
                        />
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                          {movie.title}
                        </h3>
                        {movie.vote_average > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400 text-xs">★</span>
                            <span className="text-white text-xs font-medium">
                              {movie.vote_average.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rating Badge */}
                    {movie.vote_average > 0 && (
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="text-white text-xs font-bold">
                          {movie.vote_average.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Movie Title (visible on mobile) */}
                  <div className="mt-2 md:hidden">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                      {movie.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {movies.length === 0 && !loading && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No upcoming releases found.
          </p>
        </div>
      )}
    </div>
  );
}
