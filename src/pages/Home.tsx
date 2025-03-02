import React from 'react';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { TVSeriesCard } from '../components/TVSeriesCard';
import { TVSeries } from '../types';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';

export function Home() {
  const [series, setSeries] = React.useState<TVSeries[]>([]);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [totalPages, setTotalPages] = React.useState(1);

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

      setSeries(uniqueSeries);
      
      // Get the maximum total_pages from all responses
      const maxTotalPages = Math.max(...data.map(d => d.total_pages || 1));
      setTotalPages(maxTotalPages);
    } catch (error) {
      console.error('Error fetching series:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadSeries(page);
  }, [page]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => {
            setPage(i);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`px-3 py-1 mx-1 rounded-md ${
            page === i
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return pageNumbers;
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

      <div className="flex justify-center items-center space-x-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 dark:text-red-500" />
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1}
                className={`p-2 rounded-md ${
                  page === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex mx-2">
                {renderPageNumbers()}
              </div>
              
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className={`p-2 rounded-md ${
                  page === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {totalPages}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}