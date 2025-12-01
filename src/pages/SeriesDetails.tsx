import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Star, Calendar, Tv, Play, ExternalLink, User } from 'lucide-react';
import { TVSeries, Cast } from '../types';
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../lib/utils';
import { AddToFavoriteButton } from '../components/AddToFavoriteButton';
import { AddToWatchLaterButton } from '../components/AddToWatchLaterButton';
import { TVSeriesCard } from '../components/TVSeriesCard';
import { FavoritePersonButton } from '../components/FavoritePersonButton';

export function SeriesDetails() {
  const { id } = useParams<{ id: string }>();
  const [series, setSeries] = useState<TVSeries | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [recommendations, setRecommendations] = useState<TVSeries[]>([]);
  const [trailer, setTrailer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSeriesData() {
      if (!id) return;

      try {
        setLoading(true);

        const [seriesRes, creditsRes, videosRes, recommendationsRes] = await Promise.all([
          fetch(`${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=en-US`),
          fetch(`${TMDB_BASE_URL}/tv/${id}/credits?api_key=${TMDB_API_KEY}`),
          fetch(`${TMDB_BASE_URL}/tv/${id}/videos?api_key=${TMDB_API_KEY}&language=en-US`),
          fetch(`${TMDB_BASE_URL}/tv/${id}/recommendations?api_key=${TMDB_API_KEY}&language=en-US&page=1`)
        ]);

        const [seriesData, creditsData, videosData, recommendationsData] = await Promise.all([
          seriesRes.json(),
          creditsRes.json(),
          videosRes.json(),
          recommendationsRes.json()
        ]);

        setSeries(seriesData);
        setCast(creditsData.cast.slice(0, 10));
        setRecommendations(recommendationsData.results.slice(0, 12));

        const trailerVideo = videosData.results.find(
          (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
        );
        if (trailerVideo) {
          setTrailer(trailerVideo.key);
        }
      } catch (error) {
        console.error('Error fetching series details:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSeriesData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-red-600 dark:text-red-500 animate-spin" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Series not found</h2>
      </div>
    );
  }

  const releaseYear = series.first_air_date?.split('-')[0] || 'N/A';
  const numberOfSeasons = series.number_of_seasons || 0;
  const numberOfEpisodes = series.number_of_episodes || 0;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div 
        className="relative -mx-4 sm:-mx-0 h-[500px] bg-cover bg-center rounded-none sm:rounded-2xl overflow-hidden"
        style={{
          backgroundImage: series.backdrop_path
            ? `url(${TMDB_IMAGE_BASE_URL}/original${series.backdrop_path})`
            : 'none',
          backgroundColor: !series.backdrop_path ? '#1f2937' : undefined
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        
        <div className="relative h-full container mx-auto px-4 flex items-end pb-8">
          <div className="flex flex-col md:flex-row gap-6 w-full">
            {/* Poster */}
            <img
              src={series.poster_path
                ? `${TMDB_IMAGE_BASE_URL}/w500${series.poster_path}`
                : 'https://via.placeholder.com/300x450.png?text=No+Image'
              }
              alt={series.name}
              className="w-48 h-72 object-cover rounded-lg shadow-2xl hidden md:block"
            />
            
            {/* Info */}
            <div className="flex-1 text-white space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">{series.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">{series.vote_average.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-5 h-5" />
                  <span>{releaseYear}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Tv className="w-5 h-5" />
                  <span>{numberOfSeasons} {numberOfSeasons === 1 ? 'Season' : 'Seasons'}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {series.genres.map((genre: any) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-3 pt-2">
                {trailer && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailer}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <Play size={20} className="fill-current" />
                    <span>Watch Trailer</span>
                  </a>
                )}
                
                <a
                  href={`https://www.themoviedb.org/tv/${series.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <ExternalLink size={20} />
                  <span>Watch TV Show</span>
                </a>
                
                <AddToFavoriteButton
                  movieId={series.id.toString()}
                  movieTitle={series.name}
                  moviePoster={series.poster_path}
                  movieOverview={series.overview}
                  movieRating={series.vote_average}
                  movieReleaseDate={series.first_air_date}
                  movieType="tv"
                />
                
                <AddToWatchLaterButton
                  itemId={series.id.toString()}
                  title={series.name}
                  poster={series.poster_path}
                  mediaType="tv"
                  overview={series.overview}
                  rating={series.vote_average}
                  releaseDate={series.first_air_date}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{series.overview}</p>
      </section>

      {/* Additional Info */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Tv className="w-5 h-5 text-blue-600 dark:text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Seasons</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{numberOfSeasons}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Play className="w-5 h-5 text-green-600 dark:text-green-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Episodes</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{numberOfEpisodes}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Status</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{series.status || 'N/A'}</p>
        </div>
      </section>

      {/* Cast */}
      {cast.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cast</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {cast.map((actor) => (
              <Link
                key={actor.id}
                to={`/person/${actor.id}`}
                className="group block relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Image Container */}
                <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                  {actor.profile_path ? (
                    <img
                      src={`${TMDB_IMAGE_BASE_URL}/w500${actor.profile_path}`}
                      alt={actor.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                      <User className="w-20 h-20 text-gray-500" />
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                  
                  {/* Character Badge */}
                  {actor.character && (
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold shadow-lg backdrop-blur-sm max-w-[80%]">
                      <span className="line-clamp-1">{actor.character}</span>
                    </div>
                  )}
                  
                  {/* Favorite Button */}
                  <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <FavoritePersonButton
                      person={{
                        id: actor.id.toString(),
                        name: actor.name,
                        profile_path: actor.profile_path,
                        known_for_department: actor.known_for_department || 'Acting',
                        popularity: 0
                      }}
                      variant="icon"
                    />
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-4 space-y-2">
                  {/* Name */}
                  <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
                    {actor.name}
                  </h3>

                  {/* Department */}
                  {actor.known_for_department && (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                        {actor.known_for_department}
                      </span>
                    </div>
                  )}
                </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-purple-500/50 transition-all duration-300 pointer-events-none" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {recommendations.map((show) => (
              <TVSeriesCard key={show.id} series={show} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}