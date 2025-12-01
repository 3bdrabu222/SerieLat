import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Person {
  id: string;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
}

interface FavoritePersonButtonProps {
  person: Person;
  variant?: 'icon' | 'button';
}

export const FavoritePersonButton = ({ person, variant = 'icon' }: FavoritePersonButtonProps) => {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      checkIfFavorite();
    }
  }, [person.id, isAuthenticated]);

  const checkIfFavorite = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/favorites/people/check/${person.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setError('Please login to add favorites');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Please login to add favorites');
        setTimeout(() => setError(''), 3000);
        return;
      }

      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`http://localhost:5000/api/favorites/people/remove/${person.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsFavorite(false);
        } else {
          const data = await response.json();
          setError(data.message || 'Failed to remove favorite');
          setTimeout(() => setError(''), 3000);
        }
      } else {
        // Add to favorites
        const response = await fetch('http://localhost:5000/api/favorites/people/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: person.id,
            name: person.name,
            profile_path: person.profile_path,
            known_for_department: person.known_for_department,
            popularity: person.popularity
          })
        });

        if (response.ok) {
          setIsFavorite(true);
        } else {
          const data = await response.json();
          setError(data.message || 'Failed to add favorite');
          setTimeout(() => setError(''), 3000);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Don't show button if not logged in
  }

  // Icon variant for cards
  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={toggleFavorite}
          disabled={loading}
          className={`p-2.5 rounded-full transition-all duration-300 backdrop-blur-sm ${
            isFavorite
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={18}
            className={isFavorite ? 'fill-current' : ''}
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

  // Button variant for details page
  return (
    <div className="relative">
      <button
        onClick={toggleFavorite}
        disabled={loading}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 ${
          isFavorite
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Heart
          size={20}
          className={isFavorite ? 'fill-current' : ''}
        />
        <span>
          {loading
            ? 'Loading...'
            : isFavorite
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
