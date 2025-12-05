import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Search, Film, Tv, Users } from 'lucide-react';
import { TVSeriesCard } from '../components/TVSeriesCard';
import { MovieCard } from '../components/MovieCard';
import PersonCard from '../components/PersonCard';
import { TVSeries } from '../types';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path?: string;
  overview: string;
  release_date: string;
  vote_average: number;
}

interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
}

type MediaType = 'all' | 'tv' | 'movie' | 'person';

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [series, setSeries] = React.useState<TVSeries[]>([]);
  const [movies, setMovies] = React.useState<Movie[]>([]);
  const [people, setPeople] = React.useState<Person[]>([]);
  const [mediaType, setMediaType] = React.useState<MediaType>('all');
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const loader = React.useRef<HTMLDivElement>(null);

  const searchContent = async (pageNumber: number) => {
    if (!query) return;
    
    setLoading(true);
    try {
      if (mediaType === 'all') {
        const [tvResponse, movieResponse, peopleResponse] = await Promise.all([
          fetch(`${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${pageNumber}`),
          fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${pageNumber}&include_adult=false`),
          fetch(`${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${pageNumber}&include_adult=false`)
        ]);
        
        const [tvData, movieData, peopleData] = await Promise.all([
          tvResponse.json(),
          movieResponse.json(),
          peopleResponse.json()
        ]);
        
        if (pageNumber === 1) {
          setSeries(tvData.results);
          setMovies(movieData.results);
          setPeople(peopleData.results);
        } else {
          setSeries(prev => [...prev, ...tvData.results]);
          setMovies(prev => [...prev, ...movieData.results]);
          setPeople(prev => [...prev, ...peopleData.results]);
        }
        
        setHasMore(tvData.page < tvData.total_pages || movieData.page < movieData.total_pages || peopleData.page < peopleData.total_pages);
      } else if (mediaType === 'tv') {
        const response = await fetch(
          `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${pageNumber}`
        );
        const data = await response.json();
        
        if (pageNumber === 1) {
          setSeries(data.results);
          setMovies([]);
          setPeople([]);
        } else {
          setSeries(prev => [...prev, ...data.results]);
        }
        
        setHasMore(data.page < data.total_pages);
      } else if (mediaType === 'movie') {
        const response = await fetch(
          `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${pageNumber}&include_adult=false`
        );
        const data = await response.json();
        
        if (pageNumber === 1) {
          setMovies(data.results);
          setSeries([]);
          setPeople([]);
        } else {
          setMovies(prev => [...prev, ...data.results]);
        }
        
        setHasMore(data.page < data.total_pages);
      } else if (mediaType === 'person') {
        const response = await fetch(
          `${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${pageNumber}&include_adult=false`
        );
        const data = await response.json();
        
        if (pageNumber === 1) {
          setPeople(data.results);
          setSeries([]);
          setMovies([]);
        } else {
          setPeople(prev => [...prev, ...data.results]);
        }
        
        setHasMore(data.page < data.total_pages);
      }
    } catch (error) {
      console.error('Error searching content:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    setSeries([]);
    setMovies([]);
    setPeople([]);
    setPage(1);
    setHasMore(true);
    if (query) {
      searchContent(1);
    }
  }, [query, mediaType]);

  React.useEffect(() => {
    if (page > 1) {
      searchContent(page);
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Universal Search</h2>
        <p className="text-gray-600 dark:text-gray-400">Search for movies, TV shows, and people</p>
      </div>
    );
  }

  const totalResults = series.length + movies.length + people.length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          Search Results
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Showing results for "{query}"
        </p>
        
        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setMediaType('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              mediaType === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All ({totalResults})
          </button>
          <button
            onClick={() => setMediaType('tv')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              mediaType === 'tv'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Tv className="w-4 h-4" />
            TV Series ({series.length})
          </button>
          <button
            onClick={() => setMediaType('movie')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              mediaType === 'movie'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Film className="w-4 h-4" />
            Movies ({movies.length})
          </button>
          <button
            onClick={() => setMediaType('person')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              mediaType === 'person'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            People ({people.length})
          </button>
        </div>
      </div>

      {totalResults > 0 ? (
        <div className="space-y-8">
          {/* Movies Section */}
          {(mediaType === 'all' || mediaType === 'movie') && movies.length > 0 && (
            <div>
              {mediaType === 'all' && (
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <Film className="w-6 h-6" />
                  Movies
                </h3>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {movies.map((movie) => (
                  <MovieCard key={`movie-${movie.id}`} movie={movie} />
                ))}
              </div>
            </div>
          )}
          
          {/* TV Series Section */}
          {(mediaType === 'all' || mediaType === 'tv') && series.length > 0 && (
            <div>
              {mediaType === 'all' && (
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <Tv className="w-6 h-6" />
                  TV Series
                </h3>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {series.map((show) => (
                  <TVSeriesCard key={`tv-${show.id}`} series={show} />
                ))}
              </div>
            </div>
          )}
          
          {/* People Section */}
          {(mediaType === 'all' || mediaType === 'person') && people.length > 0 && (
            <div>
              {mediaType === 'all' && (
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  People
                </h3>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {people.map((person) => (
                  <PersonCard key={`person-${person.id}`} person={person} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : !loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No results found for "{query}"</p>
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