import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Search } from 'lucide-react';
import { TVSeriesCard } from '../components/TVSeriesCard';
import { TVSeries } from '../types';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [series, setSeries] = React.useState<TVSeries[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const loader = React.useRef<HTMLDivElement>(null);

  const searchSeries = async (pageNumber: number) => {
    if (!query) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${pageNumber}`
      );
      const data = await response.json();
      
      if (pageNumber === 1) {
        setSeries(data.results);
      } else {
        setSeries(prev => [...prev, ...data.results]);
      }
      
      setHasMore(data.page < data.total_pages);
    } catch (error) {
      console.error('Error searching series:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    setSeries([]);
    setPage(1);
    setHasMore(true);
    if (query) {
      searchSeries(1);
    }
  }, [query]);

  React.useEffect(() => {
    if (page > 1) {
      searchSeries(page);
    }
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

  if (!query) {
    return (
      <div className="text-center py-12">
        <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Search TV Series</h2>
        <p className="text-gray-600 dark:text-gray-400">Enter a search term to find TV series</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          Search Results
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Showing results for "{query}"
        </p>
      </div>

      {series.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {series.map((show) => (
            <TVSeriesCard key={show.id} series={show} />
          ))}
        </div>
      ) : !loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No TV series found for "{query}"</p>
        </div>
      ) : null}

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-red-600 dark:text-red-500" />
        </div>
      )}

      <div ref={loader} className="h-4" />
    </div>
  );
}