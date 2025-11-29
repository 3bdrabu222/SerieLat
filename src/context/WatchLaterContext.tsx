import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  getWatchLater, 
  addToWatchLater as addToWatchLaterAPI, 
  removeFromWatchLater as removeFromWatchLaterAPI,
  WatchLaterItem,
  AddToWatchLaterPayload
} from '../api/watchLaterService';

interface WatchLaterContextType {
  watchLaterItems: WatchLaterItem[];
  loading: boolean;
  addToWatchLater: (item: AddToWatchLaterPayload) => Promise<void>;
  removeFromWatchLater: (itemId: string) => Promise<void>;
  isInWatchLater: (itemId: string) => boolean;
  refreshWatchLater: () => Promise<void>;
}

const WatchLaterContext = createContext<WatchLaterContextType | undefined>(undefined);

export const WatchLaterProvider = ({ children }: { children: ReactNode }) => {
  const [watchLaterItems, setWatchLaterItems] = useState<WatchLaterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchWatchLater = async () => {
    if (!isAuthenticated) {
      setWatchLaterItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getWatchLater();
      setWatchLaterItems(data.items);
    } catch (error) {
      console.error('Error fetching watch later:', error);
      setWatchLaterItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchLater();
  }, [isAuthenticated]);

  const addToWatchLater = async (item: AddToWatchLaterPayload) => {
    try {
      const response = await addToWatchLaterAPI(item);
      // Add to local state
      setWatchLaterItems(prev => [response.item, ...prev]);
    } catch (error: any) {
      console.error('Error adding to watch later:', error);
      throw error;
    }
  };

  const removeFromWatchLater = async (itemId: string) => {
    try {
      await removeFromWatchLaterAPI(itemId);
      // Remove from local state
      setWatchLaterItems(prev => prev.filter(item => item.itemId !== itemId));
    } catch (error) {
      console.error('Error removing from watch later:', error);
      throw error;
    }
  };

  const isInWatchLater = (itemId: string): boolean => {
    return watchLaterItems.some(item => item.itemId === itemId);
  };

  const refreshWatchLater = async () => {
    await fetchWatchLater();
  };

  return (
    <WatchLaterContext.Provider
      value={{
        watchLaterItems,
        loading,
        addToWatchLater,
        removeFromWatchLater,
        isInWatchLater,
        refreshWatchLater
      }}
    >
      {children}
    </WatchLaterContext.Provider>
  );
};

export const useWatchLater = () => {
  const context = useContext(WatchLaterContext);
  if (context === undefined) {
    throw new Error('useWatchLater must be used within a WatchLaterProvider');
  }
  return context;
};
