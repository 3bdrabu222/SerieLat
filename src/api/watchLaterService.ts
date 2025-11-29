import axiosClient from './axiosClient';

export interface WatchLaterItem {
  id: string;
  itemId: string;
  title: string;
  poster: string;
  mediaType: 'tv' | 'movie';
  overview?: string;
  rating?: number;
  releaseDate?: string;
  createdAt: string;
}

export interface AddToWatchLaterPayload {
  itemId: string;
  title: string;
  poster: string;
  mediaType: 'tv' | 'movie';
  overview?: string;
  rating?: number;
  releaseDate?: string;
}

// Add item to watch later
export const addToWatchLater = async (item: AddToWatchLaterPayload) => {
  const response = await axiosClient.post('/watchlater/add', item);
  return response.data;
};

// Remove item from watch later
export const removeFromWatchLater = async (itemId: string) => {
  const response = await axiosClient.delete(`/watchlater/remove/${itemId}`);
  return response.data;
};

// Get all watch later items
export const getWatchLater = async (): Promise<{ count: number; items: WatchLaterItem[] }> => {
  const response = await axiosClient.get('/watchlater');
  return response.data;
};

// Check if item is in watch later
export const checkWatchLater = async (itemId: string): Promise<{ isInWatchLater: boolean; itemId?: string }> => {
  const response = await axiosClient.get(`/watchlater/check/${itemId}`);
  return response.data;
};
