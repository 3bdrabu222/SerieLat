import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Movie } from '../types';
import { TMDB_IMAGE_BASE_URL } from '../lib/utils';
import { AddToFavoriteButton } from './AddToFavoriteButton';
import { AddToWatchLaterButton } from './AddToWatchLaterButton';

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const releaseYear = movie.release_date?.split('-')[0] || 'N/A';

  return (
    <Link 
      to={`/movie/${movie.id}`} 
      className="group block"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        <img
          src={movie.poster_path
            ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`
            : 'https://via.placeholder.com/300x450.png?text=No+Image'
          }
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Action Buttons */}
        <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <AddToFavoriteButton
            movieId={movie.id.toString()}
            movieTitle={movie.title}
            moviePoster={movie.poster_path}
            movieOverview={movie.overview}
            movieRating={movie.vote_average}
            movieReleaseDate={movie.release_date}
            movieType="movie"
            variant="icon"
          />
          <AddToWatchLaterButton
            itemId={movie.id.toString()}
            title={movie.title}
            poster={movie.poster_path}
            mediaType="movie"
            overview={movie.overview}
            rating={movie.vote_average}
            releaseDate={movie.release_date}
            variant="icon"
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-semibold line-clamp-2 mb-2">{movie.title}</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">{releaseYear}</span>
              <div className="flex items-center text-yellow-400">
                <Star className="w-4 h-4 mr-1 fill-current" />
                <span>{movie.vote_average.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
