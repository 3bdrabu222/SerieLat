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
  const loader = React.useRef<HTMLDivElement>(null);

  const loadSeries = async (pageNumber: number) => {
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
    loadSeries(page);
  }, [page]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Discover TV Series</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {series.map((show) => (
            <TVSeriesCard key={show.id} series={show} />
          ))}
        </div>
      </section>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-red-600 dark:text-red-500" />
        </div>
      )}

      <div ref={loader} className="h-4" />
    </div>
  );
}