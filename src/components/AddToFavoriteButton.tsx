import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';

interface AddToFavoriteButtonProps {
  movieId: string;
  movieTitle: string;
  moviePoster?: string;
  movieOverview?: string;
  movieRating?: number;
  movieReleaseDate?: string;
  movieType?: string;
  variant?: 'icon' | 'button';
  className?: string;
}

export const AddToFavoriteButton = ({
  movieId,
  movieTitle,
  moviePoster,
  movieOverview,
  movieRating,
  movieReleaseDate,
  movieType = 'tv',
  variant = 'button',
  className = ''
}: AddToFavoriteButtonProps) => {
  const { isAuthenticated } = useAuth();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const favorite = isFavorite(movieId);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setError('Please login to add favorites');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (favorite) {
        await removeFromFavorites(movieId);
      } else {
        await addToFavorites({
          movieId,
          movieTitle,
          moviePoster,
          movieOverview,
          movieRating,
          movieReleaseDate,
          movieType
        });
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Don't show button if not logged in
  }

  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={handleToggleFavorite}
          disabled={isLoading}
          className={`p-2.5 rounded-full transition-all duration-300 backdrop-blur-sm ${
            favorite
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
          } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          title={favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={18}
            className={favorite ? 'fill-current' : ''}
          />
        </button>
        {error && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs px-3 py-1 rounded whitespace-nowrap z-50">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggleFavorite}
        disabled={isLoading}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 ${
          favorite
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <Heart
          size={20}
          className={favorite ? 'fill-current' : ''}
        />
        <span>
          {isLoading
            ? 'Loading...'
            : favorite
            ? 'Remove from Favorites'
            : 'Add to Favorites'}
        </span>
      </button>
      {error && (
        <div className="absolute top-full mt-2 left-0 bg-red-600 text-white text-sm px-3 py-2 rounded shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
};
