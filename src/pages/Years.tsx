import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export function Years() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1969 }, (_, i) => currentYear - i);
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);
  
  // Generate a color for each decade
  const getDecadeColor = (year: number) => {
    const decade = Math.floor(year / 10);
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
    ];
    
    return colors[decade % colors.length];
  };

  const handleYearClick = (year: number) => {
    setSelectedYear(year);
    
    // Add a small delay for the animation to complete
    setTimeout(() => {
      navigate(`/year/${year}`);
    }, 300);
  };

  // Container variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.2
      }
    }
  };

  // Item variants for individual year card animations
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

  // Group years by decade for better organization
  const yearsByDecade = years.reduce((acc, year) => {
    const decade = Math.floor(year / 10) * 10;
    if (!acc[decade]) {
      acc[decade] = [];
    }
    acc[decade].push(year);
    return acc;
  }, {} as Record<number, number[]>);

  const decades = Object.keys(yearsByDecade).map(Number).sort((a, b) => b - a);

  return (
    <motion.div 
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-16">
        <motion.h1 
          className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Browse by Year
        </motion.h1>
        <motion.p 
          className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Discover TV shows from different years and explore television history
        </motion.p>
      </div>

      {decades.map((decade) => (
        <motion.div key={decade} className="mb-12">
          <motion.h2 
            className="text-2xl font-bold mb-6 px-2 border-l-4 border-purple-500 dark:border-purple-400"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {decade}s
          </motion.h2>
          
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {yearsByDecade[decade].map((year) => (
              <motion.div
                key={year}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                }}
                whileTap={{ scale: 0.95 }}
                className={`${selectedYear === year ? 'z-10' : 'z-0'}`}
              >
                <motion.button
                  onClick={() => handleYearClick(year)}
                  className={cn(
                    "relative h-20 w-full rounded-xl overflow-hidden shadow-md",
                    "bg-gradient-to-br",
                    getDecadeColor(year),
                    "transition-all duration-300 hover:shadow-lg"
                  )}
                  initial="rest"
                  whileHover="hover"
                >
                  <motion.div 
                    className="absolute inset-0 bg-black opacity-20 hover:opacity-10 transition-opacity duration-300"
                  />
                  
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    variants={{
                      rest: { scale: 1 },
                      hover: { scale: 1.1 }
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-white text-center drop-shadow-lg">
                      {year}
                    </h2>
                  </motion.div>
                  
                  {/* Subtle animated border effect */}
                  <motion.div 
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    variants={{
                      rest: { boxShadow: "inset 0 0 0 0px rgba(255,255,255,0)" },
                      hover: { boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.5)" }
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
}
