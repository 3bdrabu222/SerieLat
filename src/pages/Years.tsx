import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export function Years() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1969 }, (_, i) => currentYear - i);

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-center mb-4">Browse by Year</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
        Discover TV shows from different years
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {years.map((year, index) => (
          <motion.button
            key={year}
            onClick={() => navigate(`/year/${year}`)}
            className={cn(
              "relative h-24 w-full rounded-xl overflow-hidden shadow-lg",
              "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
              "transition-colors duration-300"
            )}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3,
              delay: index % 18 * 0.05,
              type: "spring",
              stiffness: 100
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <h2 className="text-2xl font-bold text-white text-center drop-shadow-lg">
                {year}
              </h2>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
