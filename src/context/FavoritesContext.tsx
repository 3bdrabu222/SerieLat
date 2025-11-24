import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from './AuthContext';

interface FavoriteMovie {
  id: string;
  movieId: string;
  movieTitle: string;
  moviePoster?: string;
  movieOverview?: string;
  movieRating?: number;
  movieReleaseDate?: string;
  movieType?: string;
  createdAt: string;
}

interface FavoritesContextType {
  favorites: FavoriteMovie[];
  loading: boolean;
  addToFavorites: (movie: Omit<FavoriteMovie, 'id' | 'createdAt'>) => Promise<void>;
  removeFromFavorites: (movieId: string) => Promise<void>;
  isFavorite: (movieId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch favorites when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated]);

  const refreshFavorites = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/favorites');
      setFavorites(data.favorites || []);
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      if (error.response?.status === 401) {
        setFavorites([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (movie: Omit<FavoriteMovie, 'id' | 'createdAt'>) => {
    try {
      const { data } = await axiosClient.post('/favorites/add', movie);
      
      // Add to local state immediately
      setFavorites(prev => [data.favorite, ...prev]);
    } catch (error: any) {
      console.error('Error adding to favorites:', error);
      throw new Error(error.response?.data?.message || 'Failed to add to favorites');
    }
  };

  const removeFromFavorites = async (movieId: string) => {
    try {
      await axiosClient.delete(`/favorites/remove/${movieId}`);
      
      // Remove from local state immediately
      setFavorites(prev => prev.filter(fav => fav.movieId !== movieId));
    } catch (error: any) {
      console.error('Error removing from favorites:', error);
      throw new Error(error.response?.data?.message || 'Failed to remove from favorites');
    }
  };

  const isFavorite = (movieId: string): boolean => {
    return favorites.some(fav => fav.movieId === movieId);
  };

  const value = {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    refreshFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
