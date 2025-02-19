import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { TVSeries } from '../types';
import { TMDB_IMAGE_BASE_URL } from '../lib/utils';

interface SeriesCardProps {
  series: TVSeries;
}

export function SeriesCard({ series }: SeriesCardProps) {
  return (
    <Link
      to={`/series/${series.id}`}
      className="group block rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        <img
          src={series.poster_path
            ? `${TMDB_IMAGE_BASE_URL}/w500${series.poster_path}`
            : 'https://via.placeholder.com/300x450.png?text=No+Image'
          }
          alt={series.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center space-x-1 text-yellow-400">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium text-white">
              {series.vote_average?.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors duration-300 line-clamp-2">
          {series.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {new Date(series.first_air_date).getFullYear()}
        </p>
      </div>
    </Link>
  );
}
