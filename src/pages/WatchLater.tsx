import { Link } from 'react-router-dom';
import { Clock, Star, Calendar, Trash2 } from 'lucide-react';
import { useWatchLater } from '../context/WatchLaterContext';
import { useState } from 'react';

export const WatchLater = () => {
  const { watchLaterItems, loading, removeFromWatchLater } = useWatchLater();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (itemId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setRemovingId(itemId);
    try {
      await removeFromWatchLater(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (watchLaterItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Clock size={64} className="text-gray-400 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          No Items in Watch Later
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
          Save movies and TV series to watch later and keep track of what you want to see!
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          Browse Content
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Clock size={32} className="text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Watch Later
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {watchLaterItems.length} {watchLaterItems.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {/* Watch Later Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {watchLaterItems.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <Link 
              to={`/series/${item.itemId}`} 
              className="block"
            >
              {/* Poster */}
              <div className="relative aspect-[2/3] overflow-hidden">
                {item.poster ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster}`}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <Clock size={48} className="text-gray-400" />
                  </div>
                )}

                {/* Remove Button Overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={(e) => handleRemove(item.itemId, e)}
                    disabled={removingId === item.itemId}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    title="Remove from Watch Later"
                  >
                    {removingId === item.itemId ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={20} />
                    )}
                  </button>
                </div>

                {/* Rating Badge */}
                {item.rating && (
                  <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-current" />
                    <span className="text-white text-sm font-semibold">
                      {item.rating.toFixed(1)}
                    </span>
                  </div>
                )}

                {/* Media Type Badge */}
                <div className="absolute bottom-2 left-2 bg-blue-600/90 backdrop-blur-sm px-2 py-1 rounded text-white text-xs font-semibold uppercase">
                  {item.mediaType}
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 text-sm">
                  {item.title}
                </h3>
                {item.releaseDate && (
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-xs">
                    <Calendar size={12} />
                    <span>{item.releaseDate.split('-')[0]}</span>
                  </div>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
