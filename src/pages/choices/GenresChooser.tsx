import { Link } from 'react-router-dom';
import { ListFilter, Tv, Film, Grid, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export function GenresChooser() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <ListFilter className="w-12 h-12 text-indigo-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Browse by Genres
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore content by your favorite genres. Choose between TV shows or movies to discover your next watch.
          </p>
        </motion.div>

        {/* Cards Container */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* TV Genres Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link to="/genres/tv">
              <motion.div
                className="relative group overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 md:p-12 shadow-2xl hover:shadow-emerald-500/50 transition-all duration-500 cursor-pointer h-full min-h-[300px] flex flex-col justify-between"
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl"></div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Tv className="w-8 h-8 text-white" />
                    </div>
                    <Grid className="w-6 h-6 text-emerald-200" />
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    TV Genres
                  </h2>
                  
                  <p className="text-emerald-100 text-base md:text-lg mb-6">
                    Browse TV shows by genre. From action-packed thrillers to heartwarming comedies.
                  </p>

                  <div className="flex items-center gap-4 text-sm text-emerald-100">
                    <div className="flex items-center gap-1">
                      <Layers className="w-4 h-4" />
                      <span>All Genres</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tv className="w-4 h-4" />
                      <span>TV Series</span>
                    </div>
                  </div>
                </div>

                {/* Hover Arrow */}
                <motion.div
                  className="relative z-10 mt-6 flex items-center gap-2 text-white font-semibold"
                  initial={{ x: 0 }}
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <span>Browse TV Genres</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>

                {/* Shine Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                  animate={{
                    x: ["0%", "200%"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 5
                  }}
                />
              </motion.div>
            </Link>
          </motion.div>

          {/* Movie Genres Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/genres/movies">
              <motion.div
                className="relative group overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-pink-600 to-fuchsia-600 p-8 md:p-12 shadow-2xl hover:shadow-rose-500/50 transition-all duration-500 cursor-pointer h-full min-h-[300px] flex flex-col justify-between"
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl"></div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Film className="w-8 h-8 text-white" />
                    </div>
                    <Grid className="w-6 h-6 text-rose-200" />
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    Movie Genres
                  </h2>
                  
                  <p className="text-rose-100 text-base md:text-lg mb-6">
                    Discover movies by genre. From epic adventures to romantic dramas and everything in between.
                  </p>

                  <div className="flex items-center gap-4 text-sm text-rose-100">
                    <div className="flex items-center gap-1">
                      <Layers className="w-4 h-4" />
                      <span>All Genres</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Film className="w-4 h-4" />
                      <span>Movies</span>
                    </div>
                  </div>
                </div>

                {/* Hover Arrow */}
                <motion.div
                  className="relative z-10 mt-6 flex items-center gap-2 text-white font-semibold"
                  initial={{ x: 0 }}
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <span>Browse Movie Genres</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>

                {/* Shine Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                  animate={{
                    x: ["0%", "200%"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 5
                  }}
                />
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Bottom Info */}
        <motion.div
          className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p>Explore thousands of titles organized by genre</p>
        </motion.div>
      </div>
    </div>
  );
}
