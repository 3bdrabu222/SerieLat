import { Play, ExternalLink } from 'lucide-react';
import { AddToFavoriteButton } from './AddToFavoriteButton';
import { AddToWatchLaterButton } from './AddToWatchLaterButton';

interface MediaActionButtonsProps {
  // Common props
  id: string;
  title: string;
  poster?: string;
  overview?: string;
  rating?: number;
  releaseDate?: string;
  
  // Media type
  mediaType: 'movie' | 'tv';
  
  // Optional URLs
  trailerKey?: string | null;
  homepageUrl?: string | null;
}

export function MediaActionButtons({
  id,
  title,
  poster,
  overview,
  rating,
  releaseDate,
  mediaType,
  trailerKey,
  homepageUrl,
}: MediaActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Watch Trailer Button */}
      {trailerKey && (
        <a
          href={`https://www.youtube.com/watch?v=${trailerKey}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]"
        >
          <Play size={20} className="fill-current" />
          <span>Watch Trailer</span>
        </a>
      )}
      
      {/* Watch Movie/TV Show Button */}
      {homepageUrl && (
        <a
          href={homepageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
        >
          <ExternalLink size={20} />
          <span>Watch {mediaType === 'movie' ? 'Movie' : 'TV Show'}</span>
        </a>
      )}
      
      {/* Add to Favorites Button */}
      <div className="inline-flex">
        <AddToFavoriteButton
          movieId={id}
          movieTitle={title}
          moviePoster={poster}
          movieOverview={overview}
          movieRating={rating}
          movieReleaseDate={releaseDate}
          movieType={mediaType}
          className="!bg-gray-800 dark:!bg-gray-700 hover:!bg-gray-900 dark:hover:!bg-gray-600 !text-white hover:!shadow-[0_0_20px_rgba(107,114,128,0.5)]"
        />
      </div>
      
      {/* Watch Later Button */}
      <div className="inline-flex">
        <AddToWatchLaterButton
          itemId={id}
          title={title}
          poster={poster}
          mediaType={mediaType}
          overview={overview}
          rating={rating}
          releaseDate={releaseDate}
          className="!bg-blue-600 hover:!bg-blue-700 !text-white hover:!shadow-[0_0_20px_rgba(37,99,235,0.5)]"
        />
      </div>
    </div>
  );
}
