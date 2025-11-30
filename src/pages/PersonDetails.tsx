import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, MapPin, Calendar, Briefcase, Star, Film, Tv, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';

interface PersonDetails {
  id: number;
  name: string;
  profile_path: string | null;
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
  known_for_department: string;
  popularity: number;
}

interface Credit {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type: 'movie' | 'tv';
}

interface CombinedCredits {
  cast: Credit[];
  crew: Credit[];
}

const PersonDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [credits, setCredits] = useState<CombinedCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBio, setExpandedBio] = useState(false);
  const [activeTab, setActiveTab] = useState<'known' | 'movies' | 'tv'>('known');

  useEffect(() => {
    if (id) {
      fetchPersonData(id);
    }
  }, [id]);

  const fetchPersonData = async (personId: string) => {
    try {
      setLoading(true);
      setError(null);

      const [personResponse, creditsResponse] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/person/${personId}?api_key=${TMDB_API_KEY}&language=en-US`),
        fetch(`${TMDB_BASE_URL}/person/${personId}/combined_credits?api_key=${TMDB_API_KEY}&language=en-US`)
      ]);

      if (!personResponse.ok || !creditsResponse.ok) {
        throw new Error('Failed to fetch person data');
      }

      const personData = await personResponse.json();
      const creditsData = await creditsResponse.json();

      setPerson(personData);
      setCredits(creditsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthday: string | null): number | null => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getKnownForWorks = (): Credit[] => {
    if (!credits) return [];
    const allWorks = [...credits.cast, ...credits.crew];
    return allWorks
      .sort((a, b) => b.vote_average - a.vote_average)
      .slice(0, 12);
  };

  const getMovies = (): Credit[] => {
    if (!credits) return [];
    return credits.cast
      .filter(credit => credit.media_type === 'movie')
      .sort((a, b) => {
        const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
        const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
        return dateB - dateA;
      });
  };

  const getTVShows = (): Credit[] => {
    if (!credits) return [];
    return credits.cast
      .filter(credit => credit.media_type === 'tv')
      .sort((a, b) => {
        const dateA = a.first_air_date ? new Date(a.first_air_date).getTime() : 0;
        const dateB = b.first_air_date ? new Date(b.first_air_date).getTime() : 0;
        return dateB - dateA;
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto" />
          <p className="text-gray-400">Loading person details...</p>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-red-400">{error || 'Person not found'}</p>
        </div>
      </div>
    );
  }

  const age = calculateAge(person.birthday);
  const bioLength = person.biography?.length || 0;
  const shouldTruncate = bioLength > 500;

  return (
    <div className="min-h-screen py-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              {person.profile_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                  alt={person.name}
                  className="w-full h-auto"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <User className="w-32 h-32 text-gray-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </motion.div>
          </div>

          {/* Info Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Name */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {person.name}
            </h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {person.known_for_department && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs text-gray-400">Known For</span>
                  </div>
                  <p className="text-white font-semibold">{person.known_for_department}</p>
                </div>
              )}

              {age && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-pink-600/20 to-red-600/20 border border-pink-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-pink-400" />
                    <span className="text-xs text-gray-400">Age</span>
                  </div>
                  <p className="text-white font-semibold">{age} years</p>
                </div>
              )}

              {person.place_of_birth && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs text-gray-400">Place of Birth</span>
                  </div>
                  <p className="text-white font-semibold line-clamp-1">{person.place_of_birth}</p>
                </div>
              )}

              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-purple-400" />
                  <span className="text-xs text-gray-400">Popularity</span>
                </div>
                <p className="text-white font-semibold">{person.popularity.toFixed(1)}</p>
              </div>
            </div>

            {/* Biography */}
            {person.biography && (
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white">Biography</h2>
                <div className="relative">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={expandedBio ? 'expanded' : 'collapsed'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-gray-300 leading-relaxed"
                    >
                      {shouldTruncate && !expandedBio
                        ? `${person.biography.slice(0, 500)}...`
                        : person.biography}
                    </motion.p>
                  </AnimatePresence>
                  
                  {shouldTruncate && (
                    <button
                      onClick={() => setExpandedBio(!expandedBio)}
                      className="mt-3 flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-medium"
                    >
                      {expandedBio ? (
                        <>
                          <span>Show Less</span>
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>Read More</span>
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Works Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('known')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'known'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>Known For</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('movies')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'movies'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4" />
              <span>Movies ({getMovies().length})</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('tv')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'tv'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4" />
              <span>TV Shows ({getTVShows().length})</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'known' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {getKnownForWorks().map((work) => (
                  <WorkCard key={`${work.media_type}-${work.id}`} work={work} />
                ))}
              </div>
            )}

            {activeTab === 'movies' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {getMovies().map((movie) => (
                  <WorkCard key={movie.id} work={movie} />
                ))}
              </div>
            )}

            {activeTab === 'tv' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {getTVShows().map((show) => (
                  <WorkCard key={show.id} work={show} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Work Card Component
const WorkCard: React.FC<{ work: Credit }> = ({ work }) => {
  const title = work.title || work.name || 'Unknown';
  const year = work.release_date?.split('-')[0] || work.first_air_date?.split('-')[0] || 'N/A';
  const linkTo = work.media_type === 'movie' ? `/movie/${work.id}` : `/series/${work.id}`;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link to={linkTo} className="block">
        <div className="relative rounded-xl overflow-hidden bg-gray-900 shadow-lg hover:shadow-2xl transition-all duration-300">
          {work.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${work.poster_path}`}
              alt={title}
              className="w-full aspect-[2/3] object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              {work.media_type === 'movie' ? (
                <Film className="w-12 h-12 text-gray-600" />
              ) : (
                <Tv className="w-12 h-12 text-gray-600" />
              )}
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {work.vote_average > 0 && (
            <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-sm">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-white">{work.vote_average.toFixed(1)}</span>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
            <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1">{title}</h3>
            <p className="text-xs text-gray-400">{year}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PersonDetails;
