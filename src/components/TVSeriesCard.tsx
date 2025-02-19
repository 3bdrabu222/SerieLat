import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { TVSeries } from '../types';
import { TMDB_IMAGE_BASE_URL } from '../lib/utils';

interface TVSeriesCardProps {
  series: TVSeries;
}

export function TVSeriesCard({ series }: TVSeriesCardProps) {
  return (
    <Link 
      to={`/series/${series.id}`} 
      className="group block"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        <img
          src={series.poster_path
            ? `${TMDB_IMAGE_BASE_URL}/w500${series.poster_path}`
            : 'https://via.placeholder.com/300x450.png?text=No+Image'
          }
          alt={series.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-semibold line-clamp-2 mb-2">{series.name}</h3>
            <div className="flex items-center text-yellow-400">
              <Star className="w-4 h-4 mr-1" />
              <span className="text-sm">{series.vote_average.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}