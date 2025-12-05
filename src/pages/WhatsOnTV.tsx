import { useState, useEffect } from 'react';
import { Loader2, Tv, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TVSeries } from '../types';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';
import { AddToFavoriteButton } from '../components/AddToFavoriteButton';
import { AddToWatchLaterButton } from '../components/AddToWatchLaterButton';

export function WhatsOnTV() {
  const [airingToday, setAiringToday] = useState<TVSeries[]>([]);
  const [onTheAir, setOnTheAir] = useState<TVSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTVShows() {
      try {
        setLoading(true);
        setError(null);

        // Fetch both airing today and on the air
        const [airingRes, onAirRes] = await Promise.all([
          fetch(`${TMDB_BASE_URL}/tv/airing_today?api_key=${TMDB_API_KEY}&language=en-US&page=1`),
          fetch(`${TMDB_BASE_URL}/tv/on_the_air?api_key=${TMDB_API_KEY}&language=en-US&page=1`)
        ]);

        const airingData = await airingRes.json();
        const onAirData = await onAirRes.json();

        setAiringToday(airingData.results);
        setOnTheAir(onAirData.results);
      } catch (err) {
        console.error('Error fetching TV shows:', err);
        setError('Failed to load TV shows. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchTVShows();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-red-600 dark:text-red-500 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading TV shows...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Tv className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  const TVShowCard = ({ show }: { show: TVSeries }) => (
    <Link
      to={`/series/${show.id}`}
      className="group"
    >
      <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
        {show.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
            alt={show.name}
            className="w-full h-auto aspect-[2/3] object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-[2/3] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <Tv className="w-12 h-12 text-gray-400 dark:text-gray-600" />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Action Buttons */}
          <div className="absolute top-2 left-2 flex gap-1 z-10">
            <AddToFavoriteButton
              movieId={show.id.toString()}
              movieTitle={show.name}
              moviePoster={show.poster_path}
              movieOverview={show.overview}
              movieRating={show.vote_average}
              movieReleaseDate={show.first_air_date}
              movieType="tv"
              variant="icon"
            />
            <AddToWatchLaterButton
              itemId={show.id.toString()}
              title={show.name}
              poster={show.poster_path || ''}
              mediaType="tv"
              overview={show.overview}
              rating={show.vote_average}
              releaseDate={show.first_air_date}
              variant="icon"
            />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">
              {show.name}
            </h3>
            {show.vote_average > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 text-xs">★</span>
                <span className="text-white text-xs font-medium">
                  {show.vote_average.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Rating Badge */}
        {show.vote_average > 0 && (
          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-white text-xs font-bold">
              {show.vote_average.toFixed(1)}
            </span>
          </div>
        )}

        {/* Live Badge */}
        <div className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded-md flex items-center gap-1 animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span className="text-white text-xs font-bold uppercase">Live</span>
        </div>
      </div>
      
      {/* Show Title (visible on mobile) */}
      <div className="mt-2 md:hidden">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
          {show.name}
        </h3>
        {show.first_air_date && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {new Date(show.first_air_date).getFullYear()}
          </p>
        )}
      </div>
    </Link>
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Tv className="w-10 h-10 text-red-600 dark:text-red-500" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            What's on TV
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Discover what's airing today and currently on TV
        </p>
      </div>

      {/* Airing Today Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg border-l-4 border-red-600 dark:border-red-500">
            <Clock className="w-6 h-6 text-red-600 dark:text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Airing Today
            </h2>
          </div>
          <span className="px-3 py-1 bg-red-600 dark:bg-red-500 text-white text-sm font-semibold rounded-full">
            {airingToday.length} Shows
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {airingToday.map((show) => (
            <TVShowCard key={show.id} show={show} />
          ))}
        </div>

        {airingToday.length === 0 && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Tv className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No shows airing today
            </p>
          </div>
        )}
      </div>

      {/* On The Air Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-l-4 border-blue-600 dark:border-blue-500">
            <Tv className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Currently On The Air
            </h2>
          </div>
          <span className="px-3 py-1 bg-blue-600 dark:bg-blue-500 text-white text-sm font-semibold rounded-full">
            {onTheAir.length} Shows
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {onTheAir.map((show) => (
            <TVShowCard key={show.id} show={show} />
          ))}
        </div>

        {onTheAir.length === 0 && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Tv className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No shows currently on the air
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
