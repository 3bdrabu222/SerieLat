import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { TVSeries } from '../types';
import { TMDB_IMAGE_BASE_URL, cn } from '../lib/utils';

interface SeriesCardProps {
  series: TVSeries;
  isHovered?: boolean;
}

export function SeriesCard({ series, isHovered = false }: SeriesCardProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  
  // Format the release year
  const releaseYear = series.first_air_date 
    ? new Date(series.first_air_date).getFullYear() 
    : 'Unknown';
  
  // Truncate overview for the hover card
  const truncatedOverview = series.overview && series.overview.length > 120
    ? `${series.overview.substring(0, 120)}...`
    : series.overview;

  return (
    <Link
      to={`/series/${series.id}`}
      className="block h-full"
    >
      <motion.div 
        className={cn(
          "relative h-full rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-md transition-all duration-300",
          isHovered ? "shadow-xl ring-2 ring-red-500 dark:ring-red-400" : ""
        )}
        initial="rest"
        animate={isHovered ? "hover" : "rest"}
        variants={{
          rest: { scale: 1 },
          hover: { scale: 1.03 }
        }}
      >
        {/* Poster Image Container */}
        <div className="aspect-[2/3] relative overflow-hidden bg-gray-200 dark:bg-gray-700">
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
          )}
          
          {/* Poster Image */}
          <motion.img
            src={series.poster_path
              ? `${TMDB_IMAGE_BASE_URL}/w500${series.poster_path}`
              : 'https://via.placeholder.com/300x450.png?text=No+Image'
            }
            alt={series.name}
            className={cn(
              "w-full h-full object-cover",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            variants={{
              rest: { scale: 1 },
              hover: { scale: 1.1 }
            }}
            transition={{ duration: 0.4 }}
          />
          
          {/* Rating Badge */}
          <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black/70 text-yellow-400 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
            <Star className="w-3 h-3" />
            <span>{series.vote_average?.toFixed(1)}</span>
          </div>
          
          {/* Gradient Overlay */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
            variants={{
              rest: { opacity: 0.7 },
              hover: { opacity: 0.85 }
            }}
          />
          
          {/* Bottom Title Bar */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 p-3"
            variants={{
              rest: { y: 0 },
              hover: { y: isHovered ? -60 : 0 }
            }}
          >
            <h3 className="font-semibold text-white line-clamp-2 drop-shadow-md">
              {series.name}
            </h3>
            
            <div className="flex items-center mt-1 text-xs text-gray-300">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{releaseYear}</span>
            </div>
          </motion.div>
          
          {/* Hover Content */}
          <motion.div 
            className="absolute inset-0 p-3 flex flex-col justify-end"
            variants={{
              rest: { opacity: 0 },
              hover: { opacity: 1 }
            }}
          >
            <motion.div
              className="bg-black/80 p-3 rounded-lg backdrop-blur-sm -mb-2 transform origin-bottom"
              variants={{
                rest: { opacity: 0, y: 20, scale: 0.9 },
                hover: { opacity: 1, y: 0, scale: 1 }
              }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-semibold text-white mb-1">{series.name}</h3>
              
              <div className="flex items-center justify-between mb-2 text-xs">
                <div className="flex items-center text-gray-300">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{releaseYear}</span>
                </div>
                <div className="flex items-center text-yellow-400">
                  <Star className="w-3 h-3 mr-1" />
                  <span>{series.vote_average?.toFixed(1)}</span>
                </div>
              </div>
              
              {truncatedOverview && (
                <p className="text-xs text-gray-300 line-clamp-3">{truncatedOverview}</p>
              )}
              
              <div className="mt-2 flex items-center text-xs text-red-400">
                <Eye className="w-3 h-3 mr-1" />
                <span>View details</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}
