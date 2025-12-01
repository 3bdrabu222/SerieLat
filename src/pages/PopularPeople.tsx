import React, { useState, useEffect } from 'react';
import { Users, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import PersonCard from '../components/PersonCard';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';

interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
}

const PopularPeople: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  
  // Initialize page from sessionStorage or default to 1
  const [page, setPage] = useState(() => {
    const savedPage = sessionStorage.getItem('popularPeoplePage');
    return savedPage ? parseInt(savedPage, 10) : 1;
  });

  useEffect(() => {
    fetchPopularPeople(page);
  }, [page]);

  // Save page to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('popularPeoplePage', page.toString());
  }, [page]);

  const fetchPopularPeople = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${TMDB_BASE_URL}/person/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${pageNum}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch popular people');
      }

      const data = await response.json();
      setPeople(data.results);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto" />
          <p className="text-gray-400">Loading popular people...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => fetchPopularPeople(page)}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Popular People
            </h1>
            <p className="text-gray-400 mt-2">
              Discover the most popular actors, actresses, and filmmakers
            </p>
          </div>
        </div>
      </motion.div>

      {/* People Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {people.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          {/* Pagination Buttons */}
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || loading}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800/80 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page Numbers */}
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              let pageNumber;
              
              if (totalPages <= 5) {
                pageNumber = index + 1;
              } else if (page <= 3) {
                pageNumber = index + 1;
              } else if (page >= totalPages - 2) {
                pageNumber = totalPages - 4 + index;
              } else {
                pageNumber = page - 2 + index;
              }

              const isActive = pageNumber === page;

              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  disabled={loading}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg font-semibold transition-colors ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || loading}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800/80 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Page Counter */}
          <p className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default PopularPeople;
