import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Calendar, Users, Film, Tv } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { AddToFavoriteButton } from '../components/AddToFavoriteButton';
import { FavoritePersonButton } from '../components/FavoritePersonButton';

interface FavoritePerson {
  id: string;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
}

export const Favorites = () => {
  const { favorites, loading } = useFavorites();
  const [favoritePeople, setFavoritePeople] = useState<FavoritePerson[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(true);

  // Separate movies and TV shows
  const movies = favorites.filter(fav => fav.movieType === 'movie');
  const tvShows = favorites.filter(fav => fav.movieType === 'tv');

  useEffect(() => {
    fetchFavoritePeople();
  }, []);

  const fetchFavoritePeople = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setPeopleLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/favorites/people', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFavoritePeople(data.people || []);
      }
    } catch (error) {
      console.error('Error fetching favorite people:', error);
    } finally {
      setPeopleLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (movies.length === 0 && tvShows.length === 0 && favoritePeople.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Heart size={64} className="text-gray-400 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          No Favorites Yet
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
          Start adding your favorite movies, TV series, and people to keep track of what you love!
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
        >
          Browse Content
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Heart size={32} className="text-red-600 fill-current" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Favorites
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {movies.length + tvShows.length + favoritePeople.length} total favorites
          </p>
        </div>
      </div>

      {/* Movies Section */}
      {movies.length > 0 && (
        <div className="space-y-6">
          {/* Movies Header */}
          <div className="flex items-center gap-3">
            <Film size={28} className="text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Favorite Movies
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {movies.length} {movies.length === 1 ? 'movie' : 'movies'}
              </p>
            </div>
          </div>

          {/* Movies Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {movies.map((favorite) => (
              <div
                key={favorite.id}
                className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <Link to={`/movie/${favorite.movieId}`} className="block">
                  {/* Poster */}
                  <div className="relative aspect-[2/3] overflow-hidden">
                    {favorite.moviePoster ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${favorite.moviePoster}`}
                        alt={favorite.movieTitle}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                        <Heart size={48} className="text-gray-400" />
                      </div>
                    )}

                    {/* Favorite Button Overlay */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <AddToFavoriteButton
                        movieId={favorite.movieId}
                        movieTitle={favorite.movieTitle}
                        moviePoster={favorite.moviePoster}
                        movieOverview={favorite.movieOverview}
                        movieRating={favorite.movieRating}
                        movieReleaseDate={favorite.movieReleaseDate}
                        movieType={favorite.movieType}
                        variant="icon"
                      />
                    </div>

                    {/* Rating Badge */}
                    {favorite.movieRating && (
                      <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                        <Star size={14} className="text-yellow-400 fill-current" />
                        <span className="text-white text-sm font-semibold">
                          {favorite.movieRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 text-sm">
                      {favorite.movieTitle}
                    </h3>
                    {favorite.movieReleaseDate && (
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-xs">
                        <Calendar size={12} />
                        <span>{favorite.movieReleaseDate.split('-')[0]}</span>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TV Shows Section */}
      {tvShows.length > 0 && (
        <div className="space-y-6">
          {/* TV Shows Header */}
          <div className="flex items-center gap-3">
            <Tv size={28} className="text-red-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Favorite TV Shows
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {tvShows.length} {tvShows.length === 1 ? 'show' : 'shows'}
              </p>
            </div>
          </div>

          {/* TV Shows Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {tvShows.map((favorite) => (
            <div
              key={favorite.id}
              className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <Link to={`/series/${favorite.movieId}`} className="block">
                {/* Poster */}
                <div className="relative aspect-[2/3] overflow-hidden">
                  {favorite.moviePoster ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${favorite.moviePoster}`}
                      alt={favorite.movieTitle}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                      <Heart size={48} className="text-gray-400" />
                    </div>
                  )}

                  {/* Favorite Button Overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <AddToFavoriteButton
                      movieId={favorite.movieId}
                      movieTitle={favorite.movieTitle}
                      moviePoster={favorite.moviePoster}
                      movieOverview={favorite.movieOverview}
                      movieRating={favorite.movieRating}
                      movieReleaseDate={favorite.movieReleaseDate}
                      movieType={favorite.movieType}
                      variant="icon"
                    />
                  </div>

                  {/* Rating Badge */}
                  {favorite.movieRating && (
                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span className="text-white text-sm font-semibold">
                        {favorite.movieRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 text-sm">
                    {favorite.movieTitle}
                  </h3>
                  {favorite.movieReleaseDate && (
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-xs">
                      <Calendar size={12} />
                      <span>{favorite.movieReleaseDate.split('-')[0]}</span>
                    </div>
                  )}
                </div>
              </Link>
            </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorite People Section */}
      {favoritePeople.length > 0 && (
        <div className="space-y-6">
          {/* People Header */}
          <div className="flex items-center gap-3">
            <Users size={28} className="text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Favorite People
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {favoritePeople.length} {favoritePeople.length === 1 ? 'person' : 'people'}
              </p>
            </div>
          </div>

          {/* People Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {favoritePeople.map((person) => (
              <div
                key={person.id}
                className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <Link to={`/person/${person.id}`} className="block">
                  {/* Profile Image */}
                  <div className="relative aspect-[2/3] overflow-hidden">
                    {person.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                        alt={person.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                        <Users size={48} className="text-gray-400" />
                      </div>
                    )}

                    {/* Favorite Button Overlay */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <FavoritePersonButton
                        person={person}
                        variant="icon"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 text-sm">
                      {person.name}
                    </h3>
                    {person.known_for_department && (
                      <p className="text-gray-600 dark:text-gray-400 text-xs">
                        {person.known_for_department}
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
