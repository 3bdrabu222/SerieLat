import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Calendar, PlayCircle, Tv } from 'lucide-react';
import { TVSeries, Cast, Video } from '../types';
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL, cn } from '../lib/utils';
import { AddToFavoriteButton } from '../components/AddToFavoriteButton';

export function SeriesDetails() {
  const { id } = useParams();
  const [series, setSeries] = React.useState<TVSeries | null>(null);
  const [cast, setCast] = React.useState<Cast[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [trailerKey, setTrailerKey] = React.useState<string | null>(null);
  const [watchProviders, setWatchProviders] = React.useState<{
    link: string;
    flatrate?: { provider_name: string; logo_path: string }[];
  } | null>(null);

  React.useEffect(() => {
    async function fetchSeriesDetails() {
      try {
        const [seriesResponse, creditsResponse, videosResponse, providersResponse] = await Promise.all([
          fetch(`${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=en-US`),
          fetch(`${TMDB_BASE_URL}/tv/${id}/credits?api_key=${TMDB_API_KEY}&language=en-US`),
          fetch(`${TMDB_BASE_URL}/tv/${id}/videos?api_key=${TMDB_API_KEY}&language=en-US`),
          fetch(`${TMDB_BASE_URL}/tv/${id}/watch/providers?api_key=${TMDB_API_KEY}`)
        ]);

        const [seriesData, creditsData, videosData, providersData] = await Promise.all([
          seriesResponse.json(),
          creditsResponse.json(),
          videosResponse.json(),
          providersResponse.json()
        ]);

        setSeries(seriesData);
        setCast(creditsData.cast);
        
        // Find official trailer or fallback to any trailer/teaser
        const trailer = videosData.results.find(
          (video: Video) => 
            video.site === "YouTube" && 
            (video.type === "Trailer" || video.type === "Teaser")
        );
        
        if (trailer) {
          setTrailerKey(trailer.key);
        }

        // Get watch providers for the US region (you can modify this based on user's location)
        if (providersData.results.US) {
          setWatchProviders({
            link: providersData.results.US.link,
            flatrate: providersData.results.US.flatrate
          });
        }
      } catch (error) {
        console.error('Error fetching series details:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSeriesDetails();
  }, [id]);

  const handleWatchTrailer = () => {
    if (trailerKey) {
      window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank', 'noopener noreferrer');
    }
  };

  const handleWatchShow = () => {
    if (watchProviders?.link) {
      window.open(watchProviders.link, '_blank', 'noopener noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent dark:border-red-500" />
      </div>
    );
  }

  if (!series) {
    return <div className="text-center text-gray-600 dark:text-gray-400">Series not found</div>;
  }

  return (
    <div className="space-y-8">
      <div className="relative h-[60vh] overflow-hidden rounded-xl">
        <img
          src={`${TMDB_IMAGE_BASE_URL}/original${series.backdrop_path}`}
          alt={series.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h1 className="text-4xl font-bold mb-4">{series.name}</h1>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400 mr-1" />
              <span>{series.vote_average.toFixed(1)}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-1" />
              <span>{new Date(series.first_air_date).getFullYear()}</span>
            </div>
          </div>
          <p className="text-lg max-w-3xl">{series.overview}</p>
          <div className="flex items-center flex-wrap gap-4 mt-6">
            <button 
              onClick={handleWatchTrailer}
              className={cn(
                "flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-300",
                trailerKey
                  ? "bg-red-600 hover:bg-red-700 hover:scale-105"
                  : "bg-gray-600 cursor-not-allowed"
              )}
              disabled={!trailerKey}
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              {trailerKey ? "Watch Trailer" : "No Trailer Available"}
            </button>

            <button
              onClick={handleWatchShow}
              className={cn(
                "flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-300",
                watchProviders
                  ? "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                  : "bg-gray-600 cursor-not-allowed"
              )}
              disabled={!watchProviders}
              title={watchProviders?.flatrate 
                ? `Available on: ${watchProviders.flatrate.map(p => p.provider_name).join(', ')}`
                : "No streaming providers found"
              }
            >
              <Tv className="w-5 h-5 mr-2" />
              Watch TV Show
            </button>

            <AddToFavoriteButton
              movieId={series.id.toString()}
              movieTitle={series.name}
              moviePoster={series.poster_path}
              movieOverview={series.overview}
              movieRating={series.vote_average}
              movieReleaseDate={series.first_air_date}
              movieType="tv"
              variant="button"
            />
          </div>

          {watchProviders?.flatrate && (
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-sm text-gray-300">Available on:</span>
              <div className="flex items-center space-x-2">
                {watchProviders.flatrate.map((provider) => (
                  <img
                    key={provider.provider_name}
                    src={`${TMDB_IMAGE_BASE_URL}/original${provider.logo_path}`}
                    alt={provider.provider_name}
                    title={provider.provider_name}
                    className="w-6 h-6 rounded-full"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Cast</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {cast.slice(0, 12).map((actor) => (
            <Link
              key={actor.id}
              to={`/actor/${actor.id}`}
              className="group"
            >
              <div className="aspect-[2/3] rounded-lg overflow-hidden mb-2 bg-gray-100 dark:bg-gray-800">
                <img
                  src={actor.profile_path
                    ? `${TMDB_IMAGE_BASE_URL}/w500${actor.profile_path}`
                    : 'https://via.placeholder.com/300x450.png?text=No+Image'
                  }
                  alt={actor.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{actor.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{actor.character}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}