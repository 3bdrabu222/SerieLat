import React from 'react';
import { Link } from 'react-router-dom';
import { User, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { FavoritePersonButton } from './FavoritePersonButton';

interface PersonCardProps {
  person: {
    id: number;
    name: string;
    profile_path: string | null;
    known_for_department: string;
    popularity: number;
  };
}

const PersonCard: React.FC<PersonCardProps> = ({ person }) => {
  const imageUrl = person.profile_path
    ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8 }}
    >
      <Link
        to={`/person/${person.id}`}
        className="group block relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300"
      >
        {/* Image Container */}
        <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={person.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
              <User className="w-20 h-20 text-gray-500" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
          
          {/* Popularity Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold shadow-lg backdrop-blur-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{person.popularity.toFixed(1)}</span>
          </div>

          {/* Favorite Button */}
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <FavoritePersonButton
              person={{
                id: person.id.toString(),
                name: person.name,
                profile_path: person.profile_path,
                known_for_department: person.known_for_department,
                popularity: person.popularity
              }}
              variant="icon"
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="p-4 space-y-2">
          {/* Name */}
          <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
            {person.name}
          </h3>

          {/* Department */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
              {person.known_for_department}
            </span>
          </div>
        </div>

        {/* Hover Effect Border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-purple-500/50 transition-all duration-300 pointer-events-none" />
      </Link>
    </motion.div>
  );
};

export default PersonCard;
