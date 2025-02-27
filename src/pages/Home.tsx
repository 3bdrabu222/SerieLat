import React from 'react';
import { Loader2 } from 'lucide-react';
import { TVSeriesCard } from '../components/TVSeriesCard';
import { TVSeries } from '../types';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';

export function Home() {
  const [series, setSeries] = React.useState<TVSeries[]>([]);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [hasMore, setHasMore] = React.useState(true);

  const loadSeries = async (pageNumber: number) => {
    setLoading(true);
    try {
      const promises = [
        fetch(`${TMDB_BASE_URL}/tv/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=${pageNumber}`),
        fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${pageNumber}`),
        fetch(`${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}&page=${pageNumber}`)
      ];

      const responses = await Promise.all(promises);
      const data = await Promise.all(responses.map(r => r.json()));
      
      const newSeries = data.flatMap(d => d.results);
      const uniqueSeries = Array.from(
        new Map(newSeries.map(item => [item.id, item])).values()
      );

      if (pageNumber === 1) {
        setSeries(uniqueSeries);
      } else {
        setSeries(prev => {
          const combined = [...prev, ...uniqueSeries];
          return Array.from(
            new Map(combined.map(item => [item.id, item])).values()
          );
        });
      }

      setHasMore(uniqueSeries.length > 0);
    } catch (error) {
      console.error('Error fetching series:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadSeries(1);
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      loadSeries(page + 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <section>
        <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Discover TV Series</h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {series.map((show) => (
            <TVSeriesCard key={show.id} series={show} />
          ))}
        </div>
      </section>

      <div className="flex justify-center">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 dark:text-red-500" />
          </div>
        ) : hasMore ? (
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Load More
          </button>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No more series to load</p>
        )}
      </div>
    </div>
  );
}