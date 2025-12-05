import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Film, Tv } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';
import { AddToFavoriteButton } from '../components/AddToFavoriteButton';
import { AddToWatchLaterButton } from '../components/AddToWatchLaterButton';

interface TrendingItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path?: string;
  vote_average: number;
  media_type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  overview: string;
}

export function TrendingThisWeek() {
  const [trendingAll, setTrendingAll] = useState<TrendingItem[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<TrendingItem[]>([]);
  const [trendingTV, setTrendingTV] = useState<TrendingItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'movies' | 'tv'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrending() {
      try {
        setLoading(true);
        setError(null);

        // Fetch trending for all, movies, and TV
        const [allRes, moviesRes, tvRes] = await Promise.all([
          fetch(`${TMDB_BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}`),
          fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`),
          fetch(`${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}`)
        ]);

        const allData = await allRes.json();
        const moviesData = await moviesRes.json();
        const tvData = await tvRes.json();

        setTrendingAll(allData.results);
        setTrendingMovies(moviesData.results);
        setTrendingTV(tvData.results);
      } catch (err) {
        console.error('Error fetching trending:', err);
        setError('Failed to load trending content. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchTrending();
  }, []);

  const getCurrentList = () => {
    switch (activeTab) {
      case 'movies':
        return trendingMovies;
      case 'tv':
        return trendingTV;
      default:
        return trendingAll;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-red-600 dark:text-red-500 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading trending content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <TrendingUp className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  const currentList = getCurrentList();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <TrendingUp className="w-10 h-10 text-red-600 dark:text-red-500" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            Trending This Week
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          The hottest movies and TV shows everyone is watching right now
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            activeTab === 'all'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All ({trendingAll.length})
        </button>
        <button
          onClick={() => setActiveTab('movies')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'movies'
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Film className="w-4 h-4" />
          Movies ({trendingMovies.length})
        </button>
        <button
          onClick={() => setActiveTab('tv')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'tv'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Tv className="w-4 h-4" />
          TV Shows ({trendingTV.length})
        </button>
      </div>

      {/* Featured Item (Top Trending) */}
      {currentList.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative h-[400px] md:h-[500px]">
            {currentList[0].backdrop_path ? (
              <img
                src={`https://image.tmdb.org/t/p/original${currentList[0].backdrop_path}`}
                alt={currentList[0].title || currentList[0].name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="px-4 py-2 bg-red-600 rounded-full flex items-center gap-2 animate-pulse">
                  <TrendingUp className="w-5 h-5 text-white" />
                  <span className="text-white font-bold text-sm uppercase">#1 Trending</span>
                </div>
                {currentList[0].media_type && (
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full flex items-center gap-1">
                    {currentList[0].media_type === 'movie' ? (
                      <>
                        <Film className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-medium">Movie</span>
                      </>
                    ) : (
                      <>
                        <Tv className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-medium">TV Show</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-3">
                {currentList[0].title || currentList[0].name}
              </h2>
              
              <p className="text-white/90 text-base md:text-lg max-w-3xl line-clamp-3 mb-4">
                {currentList[0].overview}
              </p>
              
              <div className="flex items-center gap-4">
                {currentList[0].vote_average > 0 && (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <span className="text-2xl">★</span>
                    <span className="text-xl font-bold">{currentList[0].vote_average.toFixed(1)}</span>
                  </div>
                )}
                <Link
                  to={currentList[0].media_type === 'movie' ? `/movie/${currentList[0].id}` : `/series/${currentList[0].id}`}
                  className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {currentList.slice(1).map((item, index) => (
          <Link
            key={`${item.media_type}-${item.id}`}
            to={item.media_type === 'movie' ? `/movie/${item.id}` : `/series/${item.id}`}
            className="group relative"
          >
            <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              {item.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title || item.name}
                  className="w-full h-auto aspect-[2/3] object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                  {item.media_type === 'movie' ? (
                    <Film className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                  ) : (
                    <Tv className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                  )}
                </div>
              )}

              {/* Rank Badge */}
              <div className="absolute top-2 left-2 w-10 h-10 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">#{index + 2}</span>
              </div>

              {/* Rating Badge */}
              {item.vote_average > 0 && (
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
                  <span className="text-yellow-400 text-xs">★</span>
                  <span className="text-white text-xs font-bold">
                    {item.vote_average.toFixed(1)}
                  </span>
                </div>
              )}

              {/* Media Type Badge */}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-md flex items-center gap-1">
                {item.media_type === 'movie' ? (
                  <>
                    <Film className="w-3 h-3 text-purple-400" />
                    <span className="text-white text-xs font-medium">Movie</span>
                  </>
                ) : (
                  <>
                    <Tv className="w-3 h-3 text-blue-400" />
                    <span className="text-white text-xs font-medium">TV</span>
                  </>
                )}
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Action Buttons */}
                <div className="absolute top-2 left-2 flex gap-1 z-10">
                  <AddToFavoriteButton
                    movieId={item.id.toString()}
                    movieTitle={item.title || item.name || ''}
                    moviePoster={item.poster_path}
                    movieOverview={item.overview}
                    movieRating={item.vote_average}
                    movieReleaseDate={item.release_date || item.first_air_date}
                    movieType={item.media_type}
                    variant="icon"
                  />
                  <AddToWatchLaterButton
                    itemId={item.id.toString()}
                    title={item.title || item.name || ''}
                    poster={item.poster_path || ''}
                    mediaType={item.media_type}
                    overview={item.overview}
                    rating={item.vote_average}
                    releaseDate={item.release_date || item.first_air_date}
                    variant="icon"
                  />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white font-semibold text-sm line-clamp-2">
                    {item.title || item.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Title (visible on mobile) */}
            <div className="mt-2 md:hidden">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                {item.title || item.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      {currentList.length === 0 && !loading && (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No trending content found.
          </p>
        </div>
      )}
    </div>
  );
}
