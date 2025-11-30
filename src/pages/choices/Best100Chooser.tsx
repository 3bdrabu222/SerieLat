import { Link } from 'react-router-dom';
import { Trophy, Tv, Film, Star, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export function Best100Chooser() {
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
            <Trophy className="w-12 h-12 text-yellow-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Best 100
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover the highest-rated content of all time. Choose your category to explore the best of the best.
          </p>
        </motion.div>

        {/* Cards Container */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Best 100 TV Shows Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link to="/best-tv">
              <motion.div
                className="relative group overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 p-8 md:p-12 shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 cursor-pointer h-full min-h-[300px] flex flex-col justify-between"
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
                    <Trophy className="w-6 h-6 text-yellow-300" />
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    Best 100 TV Shows
                  </h2>
                  
                  <p className="text-blue-100 text-base md:text-lg mb-6">
                    Explore the top-rated TV series of all time, from timeless classics to modern masterpieces.
                  </p>

                  <div className="flex items-center gap-4 text-sm text-blue-100">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current text-yellow-300" />
                      <span>Highest Rated</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      <span>100 Series</span>
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
                  <span>Explore TV Shows</span>
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

          {/* Best 100 Movies Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/best-movies">
              <motion.div
                className="relative group overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 p-8 md:p-12 shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 cursor-pointer h-full min-h-[300px] flex flex-col justify-between"
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
                    <Trophy className="w-6 h-6 text-yellow-300" />
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    Best 100 Movies
                  </h2>
                  
                  <p className="text-purple-100 text-base md:text-lg mb-6">
                    Discover the highest-rated movies of all time, from cinematic legends to award-winning films.
                  </p>

                  <div className="flex items-center gap-4 text-sm text-purple-100">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current text-yellow-300" />
                      <span>Highest Rated</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      <span>100 Movies</span>
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
                  <span>Explore Movies</span>
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
          <p>Rankings are based on user ratings from The Movie Database (TMDB)</p>
        </motion.div>
      </div>
    </div>
  );
}
