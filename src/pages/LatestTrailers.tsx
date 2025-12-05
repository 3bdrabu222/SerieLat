import { useState, useEffect } from 'react';
import { Loader2, Play, Film, Tv } from 'lucide-react';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';
import { AddToFavoriteButton } from '../components/AddToFavoriteButton';
import { AddToWatchLaterButton } from '../components/AddToWatchLaterButton';

interface Video {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
  published_at: string;
}

interface MediaWithTrailer {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  media_type: 'movie' | 'tv';
  trailer: Video;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

export function LatestTrailers() {
  const [trailers, setTrailers] = useState<MediaWithTrailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrailer, setSelectedTrailer] = useState<MediaWithTrailer | null>(null);

  useEffect(() => {
    async function fetchLatestTrailers() {
      try {
        setLoading(true);
        setError(null);

        // Fetch now playing movies and on the air TV shows for latest trailers
        const [moviesRes, tvRes, upcomingRes] = await Promise.all([
          fetch(`${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`),
          fetch(`${TMDB_BASE_URL}/tv/on_the_air?api_key=${TMDB_API_KEY}&language=en-US&page=1`),
          fetch(`${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`)
        ]);

        const moviesData = await moviesRes.json();
        const tvData = await tvRes.json();
        const upcomingData = await upcomingRes.json();

        // Get trailers for each item - prioritize now playing and upcoming
        const allMedia = [
          ...moviesData.results.slice(0, 8).map((m: any) => ({ ...m, media_type: 'movie' })),
          ...upcomingData.results.slice(0, 6).map((m: any) => ({ ...m, media_type: 'movie' })),
          ...tvData.results.slice(0, 6).map((t: any) => ({ ...t, media_type: 'tv' }))
        ];

        const trailersPromises = allMedia.map(async (media: any) => {
          try {
            const videosRes = await fetch(
              `${TMDB_BASE_URL}/${media.media_type}/${media.id}/videos?api_key=${TMDB_API_KEY}&language=en-US`
            );
            const videosData = await videosRes.json();
            
            // Find trailer
            const trailer = videosData.results.find(
              (v: Video) => v.type === 'Trailer' && v.site === 'YouTube'
            );

            if (trailer) {
              return {
                ...media,
                trailer
              };
            }
            return null;
          } catch {
            return null;
          }
        });

        const results = await Promise.all(trailersPromises);
        const validTrailers = results.filter((t): t is MediaWithTrailer => t !== null);
        
        // Sort by published date
        validTrailers.sort((a, b) => 
          new Date(b.trailer.published_at).getTime() - new Date(a.trailer.published_at).getTime()
        );

        setTrailers(validTrailers);
      } catch (err) {
        console.error('Error fetching trailers:', err);
        setError('Failed to load trailers. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchLatestTrailers();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-red-600 dark:text-red-500 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading latest trailers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Play className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Play className="w-10 h-10 text-red-600 dark:text-red-500" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            Latest Trailers
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Watch the newest trailers for upcoming movies and TV shows
        </p>
      </div>

      {/* Featured Trailer */}
      {trailers.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          <div className="aspect-video bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${trailers[0].trailer.key}?autoplay=0&rel=0`}
              title={trailers[0].trailer.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
            <div className="flex items-center gap-2 mb-2">
              {trailers[0].media_type === 'movie' ? (
                <Film className="w-5 h-5 text-red-500" />
              ) : (
                <Tv className="w-5 h-5 text-blue-500" />
              )}
              <span className="text-white/80 text-sm font-medium uppercase">
                {trailers[0].media_type === 'movie' ? 'Movie' : 'TV Show'}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {trailers[0].title || trailers[0].name}
            </h2>
            <p className="text-white/80 text-sm">
              {formatDate(trailers[0].trailer.published_at)}
            </p>
          </div>
        </div>
      )}

      {/* Trailers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trailers.slice(1).map((item) => (
          <div
            key={`${item.media_type}-${item.id}`}
            className="group cursor-pointer"
            onClick={() => setSelectedTrailer(item)}
          >
            <div className="relative rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-900">
                {item.backdrop_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w780${item.backdrop_path}`}
                    alt={item.title || item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                    <Play className="w-16 h-16 text-gray-500" />
                  </div>
                )}
                
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                  {/* Action Buttons */}
                  <div className="absolute bottom-3 left-3 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AddToFavoriteButton
                      movieId={item.id.toString()}
                      movieTitle={item.title || item.name || ''}
                      moviePoster={item.poster_path}
                      movieOverview=""
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
                      overview=""
                      rating={item.vote_average}
                      releaseDate={item.release_date || item.first_air_date}
                      variant="icon"
                    />
                  </div>
                  
                  <div className="w-16 h-16 rounded-full bg-red-600 group-hover:bg-red-500 flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </div>
                </div>

                {/* Media Type Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/80 backdrop-blur-sm">
                  {item.media_type === 'movie' ? (
                    <>
                      <Film className="w-4 h-4 text-red-500" />
                      <span className="text-white text-xs font-medium">Movie</span>
                    </>
                  ) : (
                    <>
                      <Tv className="w-4 h-4 text-blue-500" />
                      <span className="text-white text-xs font-medium">TV</span>
                    </>
                  )}
                </div>

                {/* Rating */}
                {item.vote_average > 0 && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/80 backdrop-blur-sm flex items-center gap-1">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-white text-xs font-bold">
                      {item.vote_average.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 bg-white dark:bg-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                  {item.title || item.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(item.trailer.published_at)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Selected Trailer */}
      {selectedTrailer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setSelectedTrailer(null)}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedTrailer(null)}
              className="absolute -top-12 right-0 text-white hover:text-red-500 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${selectedTrailer.trailer.key}?autoplay=1&rel=0`}
                title={selectedTrailer.trailer.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-white mb-1">
                {selectedTrailer.title || selectedTrailer.name}
              </h3>
              <p className="text-gray-400 text-sm">
                {formatDate(selectedTrailer.trailer.published_at)}
              </p>
            </div>
          </div>
        </div>
      )}

      {trailers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No trailers found.
          </p>
        </div>
      )}
    </div>
  );
}
