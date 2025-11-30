import { Link } from 'react-router-dom';
import { Tv, Film, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function Home() {
  return (
    <div className="min-h-[70vh] sm:min-h-[80vh] flex items-center justify-center px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl w-full">
        {/* Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent leading-tight">
            Welcome to SerieLat
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 px-4">
            Your gateway to unlimited entertainment
          </p>
        </motion.div>

        {/* Gateway Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
          {/* TV Shows Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link to="/discover/tv" className="group block">
              <div className="relative h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-[0_0_50px_rgba(59,130,246,0.5)]">
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80)',
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                
                {/* Neon Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <motion.div
                    className="mb-6"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Tv className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-blue-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]" />
                  </motion.div>
                  
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
                    TV Shows
                  </h2>
                  
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-8 max-w-md px-4">
                    Discover thousands of TV series from around the world
                  </p>
                  
                  <motion.button
                    className="flex items-center gap-2 sm:gap-3 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm sm:text-base font-semibold rounded-full shadow-lg transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Explore TV Shows</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                  </motion.button>
                </div>
                
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl border-2 border-blue-500/0 group-hover:border-blue-500/50 transition-all duration-500" />
              </div>
            </Link>
          </motion.div>

          {/* Movies Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/discover/movies" className="group block">
              <div className="relative h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-[0_0_50px_rgba(239,68,68,0.5)]">
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80)',
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                
                {/* Neon Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <motion.div
                    className="mb-6"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Film className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
                  </motion.div>
                  
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
                    Movies
                  </h2>
                  
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-8 max-w-md px-4">
                    Explore the latest and greatest movies from around the world
                  </p>
                  
                  <motion.button
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-full shadow-lg transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Explore Movies</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                  </motion.button>
                </div>
                
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl border-2 border-red-500/0 group-hover:border-red-500/50 transition-all duration-500" />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Bottom Stats */}
        <motion.div 
          className="mt-8 sm:mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="p-4 sm:p-5 md:p-6 bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10">
            <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1 sm:mb-2">10K+</div>
            <div className="text-xs sm:text-sm text-gray-400">TV Shows</div>
          </div>
          <div className="p-4 sm:p-5 md:p-6 bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10">
            <div className="text-2xl sm:text-3xl font-bold text-red-400 mb-1 sm:mb-2">50K+</div>
            <div className="text-xs sm:text-sm text-gray-400">Movies</div>
          </div>
          <div className="p-4 sm:p-5 md:p-6 bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10">
            <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-1 sm:mb-2">HD</div>
            <div className="text-xs sm:text-sm text-gray-400">Quality</div>
          </div>
          <div className="p-4 sm:p-5 md:p-6 bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10">
            <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-1 sm:mb-2">24/7</div>
            <div className="text-xs sm:text-sm text-gray-400">Available</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
