import { useState, useEffect } from 'react';
import { Loader2, Film, TrendingUp, Star, Tv, ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieCard } from '../components/MovieCard';
import { TVSeriesCard } from '../components/TVSeriesCard';
import { Movie, TVSeries } from '../types';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';

type MediaType = 'movie' | 'tv';
type FilterType = 'popular' | 'top_rated' | 'trending';

interface DiscoverProps {
  mediaType: MediaType;
}

export function Discover({ mediaType }: DiscoverProps) {
  const [content, setContent] = useState<(Movie | TVSeries)[]>([]);
  const [filter, setFilter] = useState<FilterType>('popular');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isMovie = mediaType === 'movie';
  const title = isMovie ? 'Movies' : 'TV Shows';
  const subtitle = isMovie 
    ? 'Discover the latest and greatest movies from around the world'
    : 'Discover the latest and greatest TV shows from around the world';

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        let endpoint = '';
        if (filter === 'popular') {
          endpoint = `${TMDB_BASE_URL}/${mediaType}/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
        } else if (filter === 'top_rated') {
          endpoint = `${TMDB_BASE_URL}/${mediaType}/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
        } else if (filter === 'trending') {
          endpoint = `${TMDB_BASE_URL}/trending/${mediaType}/week?api_key=${TMDB_API_KEY}&page=${page}`;
        }

        const response = await fetch(endpoint);
        const data = await response.json();
        setContent(data.results);
        setTotalPages(Math.min(data.total_pages, 500)); // TMDB limits to 500 pages
      } catch (error) {
        console.error(`Error fetching ${mediaType}:`, error);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [mediaType, filter, page]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter, mediaType]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
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
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            page === i
              ? 'bg-red-600 text-white shadow-lg scale-105'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-red-600 dark:text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-12 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            {isMovie ? (
              <Film className="w-10 h-10" />
            ) : (
              <Tv className="w-10 h-10" />
            )}
            <h1 className="text-5xl font-bold">{title}</h1>
          </div>
          <p className="text-xl opacity-90 max-w-2xl">
            {subtitle}
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setFilter('popular')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
            filter === 'popular'
              ? 'bg-red-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Film className="w-5 h-5" />
          Popular
        </button>
        
        <button
          onClick={() => setFilter('top_rated')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
            filter === 'top_rated'
              ? 'bg-red-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Star className="w-5 h-5" />
          Top Rated
        </button>
        
        <button
          onClick={() => setFilter('trending')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
            filter === 'trending'
              ? 'bg-red-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          Trending
        </button>
      </div>

      {/* Content Grid - Fully Responsive */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {content.map((item) => (
          isMovie ? (
            <MovieCard key={item.id} movie={item as Movie} />
          ) : (
            <TVSeriesCard key={item.id} series={item as TVSeries} />
          )
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center gap-6 mt-12">
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={`p-3 rounded-lg transition-all duration-300 ${
              page === 1
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {/* Page Numbers */}
          <div className="flex gap-2">
            {renderPageNumbers()}
          </div>
          
          {/* Next Button */}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className={`p-3 rounded-lg transition-all duration-300 ${
              page === totalPages
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Page Info */}
        <div className="text-sm text-gray-400">
          Page {page} of {totalPages}
        </div>
      </div>
    </div>
  );
}
