import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GenreCard } from '../components/GenreCard';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';
import { relatedGenres, defaultBackgrounds } from '../lib/genreBackgrounds';

interface Genre {
  id: number;
  name: string;
}

interface Movie {
  id: number;
  backdrop_path: string | null;
  poster_path: string | null;
  title: string;
  genre_ids: number[];
}

interface GenreWithMovie extends Genre {
  movie: Movie | null;
}

async function fetchMoviesForGenre(genreId: number, page: number = 1): Promise<Movie[]> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?` +
      `api_key=${TMDB_API_KEY}` +
      `&with_genres=${genreId}` +
      `&sort_by=popularity.desc` +
      `&page=${page}` +
      `&language=en-US`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Error fetching movies for genre ${genreId}:`, error);
    return [];
  }
}

async function findUniqueMovieForGenre(
  genreId: number, 
  usedMovieIds: Set<number>,
  retryCount: number = 0
): Promise<Movie | null> {
  // Try primary genre
  for (let page = 1; page <= 3; page++) {
    const movies = await fetchMoviesForGenre(genreId, page);
    const availableMovie = movies.find(movie => 
      !usedMovieIds.has(movie.id) && 
      (movie.backdrop_path || movie.poster_path)
    );
    
    if (availableMovie) {
      return availableMovie;
    }
  }

  // If no movie found and we haven't tried related genres
  if (retryCount < 1 && relatedGenres[genreId]) {
    for (const relatedGenreId of relatedGenres[genreId]) {
      const movies = await fetchMoviesForGenre(relatedGenreId);
      const availableMovie = movies.find(movie => 
        !usedMovieIds.has(movie.id) && 
        (movie.backdrop_path || movie.poster_path)
      );
      
      if (availableMovie) {
        return availableMovie;
      }
    }
  }

  // Create a fallback movie object using the default background
  if (defaultBackgrounds[genreId]) {
    return {
      id: -genreId, // Negative ID to ensure uniqueness
      backdrop_path: defaultBackgrounds[genreId],
      poster_path: null,
      title: "Featured Movie",
      genre_ids: [genreId]
    };
  }

  return null;
}

export function MovieGenres() {
  const navigate = useNavigate();
  const [genresWithMovies, setGenresWithMovies] = React.useState<GenreWithMovie[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedGenre, setSelectedGenre] = React.useState<number | null>(null);

  React.useEffect(() => {
    async function fetchGenresAndMovies() {
      try {
        // Fetch movie genres
        const genresResponse = await fetch(
          `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
        );
        const genresData = await genresResponse.json();
        
        // Sort genres alphabetically
        const sortedGenres = genresData.genres.sort((a: Genre, b: Genre) => 
          a.name.localeCompare(b.name)
        );

        const usedMovieIds = new Set<number>();
        const genresWithMovies: GenreWithMovie[] = [];

        // Assign movies to genres
        for (const genre of sortedGenres) {
          const movie = await findUniqueMovieForGenre(genre.id, usedMovieIds);
          if (movie) {
            usedMovieIds.add(movie.id);
          }
          genresWithMovies.push({ ...genre, movie });
        }

        setGenresWithMovies(genresWithMovies);
      } catch (error) {
        console.error('Error fetching genres and movies:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGenresAndMovies();
  }, []);

  const handleGenreClick = (genreId: number) => {
    setSelectedGenre(genreId);
    
    // Add a small delay for the animation to complete
    setTimeout(() => {
      navigate(`/movies/genres/${genreId}`);
    }, 300);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-red-600 border-t-transparent dark:border-red-500" />
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading genres...</p>
        </div>
      </div>
    );
  }

  // Container variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };

  // Item variants for individual card animations
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <motion.div 
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-16">
        <motion.h1 
          className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-purple-600 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Browse Movies by Genre
        </motion.h1>
        <motion.p 
          className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Discover movies across different genres and expand your cinematic experience
        </motion.p>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {genresWithMovies.map((genre) => (
          <motion.div
            key={genre.id}
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`${selectedGenre === genre.id ? 'z-10' : 'z-0'}`}
          >
            <GenreCard
              id={genre.id}
              name={genre.name}
              show={genre.movie ? { ...genre.movie, name: genre.movie.title } : null}
              onClick={() => handleGenreClick(genre.id)}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
