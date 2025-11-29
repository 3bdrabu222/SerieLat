import { useState } from 'react';
import { Clock, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWatchLater } from '../context/WatchLaterContext';
import { AddToWatchLaterPayload } from '../api/watchLaterService';

interface AddToWatchLaterButtonProps {
  itemId: string;
  title: string;
  poster: string;
  mediaType: 'tv' | 'movie';
  overview?: string;
  rating?: number;
  releaseDate?: string;
  variant?: 'default' | 'icon';
  className?: string;
}

export const AddToWatchLaterButton = ({
  itemId,
  title,
  poster,
  mediaType,
  overview,
  rating,
  releaseDate,
  variant = 'default',
  className = ''
}: AddToWatchLaterButtonProps) => {
  const { isAuthenticated } = useAuth();
  const { isInWatchLater, addToWatchLater, removeFromWatchLater } = useWatchLater();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const inWatchLater = isInWatchLater(itemId);

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToastMessage('Please log in to use Watch Later');
      return;
    }

    setLoading(true);

    try {
      if (inWatchLater) {
        await removeFromWatchLater(itemId);
        showToastMessage('Removed from Watch Later');
      } else {
        const item: AddToWatchLaterPayload = {
          itemId,
          title,
          poster,
          mediaType,
          overview,
          rating,
          releaseDate
        };
        await addToWatchLater(item);
        showToastMessage('Added to Watch Later');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An error occurred';
      showToastMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleClick}
          disabled={loading}
          className={`p-2 rounded-full transition-all duration-300 ${
            inWatchLater
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-white/90 text-gray-800 hover:bg-blue-600 hover:text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${className}`}
          title={inWatchLater ? 'Added to Watch Later' : 'Add to Watch Later'}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : inWatchLater ? (
            <Check size={20} />
          ) : (
            <Clock size={20} />
          )}
        </button>

        {showToast && (
          <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in">
            {toastMessage}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
          inWatchLater
            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </>
        ) : inWatchLater ? (
          <>
            <Check size={20} />
            <span>Added to Watch Later</span>
          </>
        ) : (
          <>
            <Clock size={20} />
            <span>Watch Later</span>
          </>
        )}
      </button>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}
    </>
  );
};
