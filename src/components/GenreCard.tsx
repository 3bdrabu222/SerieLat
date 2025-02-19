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
  const backgroundImage = show && (show.backdrop_path || show.poster_path)
    ? `${TMDB_IMAGE_BASE_URL}/original${show.backdrop_path || show.poster_path}`
    : null;

  return (
    <motion.button
      onClick={onClick}
      className="relative h-40 w-full rounded-xl overflow-hidden shadow-lg group"
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
      }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 bg-gray-800">
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt={show?.name || ""}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              "group-hover:scale-110",
              loading ? "opacity-0" : "opacity-100"
            )}
            loading="lazy"
            onLoad={() => setLoading(false)}
          />
        )}
      </div>

      {/* Dynamic Overlay - slightly darker for readability */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          "bg-gradient-to-t from-black/70 to-transparent",
          "group-hover:from-black/60 group-hover:to-transparent"
        )}
      />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-4 z-10">
        <h2 className="text-2xl font-bold text-white text-center drop-shadow-lg">
          {name}
        </h2>
        {show && (
          <p className="text-sm text-gray-200 text-center mt-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
            Featuring: {show.name}
          </p>
        )}
      </div>
    </motion.button>
  );
}
