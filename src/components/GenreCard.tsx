import React from 'react';
import { motion } from 'framer-motion';
import { TMDB_IMAGE_BASE_URL, cn } from '../lib/utils';

interface Show {
  backdrop_path: string | null;
  poster_path: string | null;
  name: string;
}

interface GenreCardProps {
  id: number;
  name: string;
  onClick: () => void;
  show: Show | null;
}

export function GenreCard({ id, name, onClick, show }: GenreCardProps) {
  const [loading, setLoading] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);
  
  const backgroundImage = show && (show.backdrop_path || show.poster_path)
    ? `${TMDB_IMAGE_BASE_URL}/original${show.backdrop_path || show.poster_path}`
    : null;

  // Generate a unique color for each genre based on its ID
  const generateGenreColor = (genreId: number) => {
    const colors = [
      'from-red-500 to-orange-500',
      'from-blue-500 to-indigo-600',
      'from-green-500 to-emerald-600',
      'from-purple-500 to-pink-600',
      'from-yellow-400 to-amber-600',
      'from-indigo-500 to-purple-600',
      'from-rose-500 to-red-600',
      'from-teal-500 to-cyan-600',
      'from-fuchsia-500 to-pink-600',
      'from-amber-500 to-yellow-500',
    ];
    
    return colors[genreId % colors.length];
  };
  
  const genreColor = generateGenreColor(id);

  return (
    <motion.div
      onClick={onClick}
      className="relative h-48 w-full rounded-xl overflow-hidden shadow-lg group cursor-pointer"
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
      }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layout
    >
      {/* Background Image or Gradient Fallback */}
      <div className="absolute inset-0">
        {backgroundImage ? (
          <img
            src={backgroundImage}
            alt={show?.name || ""}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              "group-hover:scale-110 group-hover:filter group-hover:brightness-110",
              loading ? "opacity-0" : "opacity-100"
            )}
            loading="lazy"
            onLoad={() => setLoading(false)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${genreColor}`}></div>
        )}
      </div>

      {/* Dynamic Overlay with animated gradient */}
      <div 
        className={cn(
          "absolute inset-0 transition-all duration-500",
          "bg-gradient-to-t from-black/80 via-black/40 to-transparent",
          isHovered ? "opacity-90" : "opacity-80"
        )}
      />
      
      {/* Animated border effect on hover */}
      <motion.div 
        className="absolute inset-0 rounded-xl pointer-events-none"
        animate={{
          boxShadow: isHovered 
            ? `inset 0 0 0 2px rgba(255,255,255,0.5)` 
            : `inset 0 0 0 0px rgba(255,255,255,0)`
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-4 z-10 flex flex-col items-center">
        <motion.h2 
          className="text-2xl font-bold text-white text-center drop-shadow-lg"
          animate={{ 
            y: isHovered ? -5 : 0,
            scale: isHovered ? 1.05 : 1
          }}
          transition={{ duration: 0.3 }}
        >
          {name}
        </motion.h2>
        
        {show && (
          <motion.p 
            className="text-sm text-gray-200 text-center mt-2 max-w-full truncate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: isHovered ? 1 : 0.7,
              y: isHovered ? 0 : 5
            }}
            transition={{ duration: 0.3 }}
          >
            Featuring: {show.name}
          </motion.p>
        )}
        
        {/* Explore button that appears on hover */}
        <motion.div
          className="mt-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10
          }}
          transition={{ duration: 0.3 }}
        >
          <span className="px-4 py-1 bg-red-600 text-white text-sm rounded-full inline-flex items-center">
            Explore
            <svg className="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
