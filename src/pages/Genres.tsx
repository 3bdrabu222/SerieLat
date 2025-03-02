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

interface Show {
  id: number;
  backdrop_path: string | null;
  poster_path: string | null;
  name: string;
  genre_ids: number[];
}

interface GenreWithShow extends Genre {
  show: Show | null;
}

async function fetchShowsForGenre(genreId: number, page: number = 1): Promise<Show[]> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?` +
      `api_key=${TMDB_API_KEY}` +
      `&with_genres=${genreId}` +
      `&sort_by=popularity.desc` +
      `&page=${page}` +
      `&language=en-US`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Error fetching shows for genre ${genreId}:`, error);
    return [];
  }
}

async function findUniqueShowForGenre(
  genreId: number, 
  usedShowIds: Set<number>,
  retryCount: number = 0
): Promise<Show | null> {
  // Try primary genre
  for (let page = 1; page <= 3; page++) {
    const shows = await fetchShowsForGenre(genreId, page);
    const availableShow = shows.find(show => 
      !usedShowIds.has(show.id) && 
      (show.backdrop_path || show.poster_path)
    );
    
    if (availableShow) {
      return availableShow;
    }
  }

  // If no show found and we haven't tried related genres
  if (retryCount < 1 && relatedGenres[genreId]) {
    for (const relatedGenreId of relatedGenres[genreId]) {
      const shows = await fetchShowsForGenre(relatedGenreId);
      const availableShow = shows.find(show => 
        !usedShowIds.has(show.id) && 
        (show.backdrop_path || show.poster_path)
      );
      
      if (availableShow) {
        return availableShow;
      }
    }
  }

  // Create a fallback show object using the default background
  if (defaultBackgrounds[genreId]) {
    return {
      id: -genreId, // Negative ID to ensure uniqueness
      backdrop_path: defaultBackgrounds[genreId],
      poster_path: null,
      name: "Featured Show",
      genre_ids: [genreId]
    };
  }

  return null;
}

export function Genres() {
  const navigate = useNavigate();
  const [genresWithShows, setGenresWithShows] = React.useState<GenreWithShow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedGenre, setSelectedGenre] = React.useState<number | null>(null);

  React.useEffect(() => {
    async function fetchGenresAndShows() {
      try {
        // Fetch genres
        const genresResponse = await fetch(
          `${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}&language=en-US`
        );
        const genresData = await genresResponse.json();
        
        // Sort genres alphabetically
        const sortedGenres = genresData.genres.sort((a: Genre, b: Genre) => 
          a.name.localeCompare(b.name)
        );

        const usedShowIds = new Set<number>();
        const genresWithShows: GenreWithShow[] = [];

        // Assign shows to genres
        for (const genre of sortedGenres) {
          const show = await findUniqueShowForGenre(genre.id, usedShowIds);
          if (show) {
            usedShowIds.add(show.id);
          }
          genresWithShows.push({ ...genre, show });
        }

        setGenresWithShows(genresWithShows);
      } catch (error) {
        console.error('Error fetching genres and shows:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGenresAndShows();
  }, []);

  const handleGenreClick = (genreId: number) => {
    setSelectedGenre(genreId);
    
    // Add a small delay for the animation to complete
    setTimeout(() => {
      navigate(`/genre/${genreId}`);
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
          Browse by Genre
        </motion.h1>
        <motion.p 
          className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Discover TV shows across different genres and expand your viewing experience
        </motion.p>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {genresWithShows.map((genre) => (
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
              show={genre.show}
              onClick={() => handleGenreClick(genre.id)}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
