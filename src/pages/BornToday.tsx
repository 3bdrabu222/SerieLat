import { useState, useEffect } from 'react';
import { Loader2, Cake, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../lib/utils';

interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  birthday?: string;
  deathday?: string | null;
  age?: number;
}

export function BornToday() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBornToday() {
      try {
        setLoading(true);
        setError(null);

        // Get today's date
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();

        // Fetch popular people from multiple pages to increase chances
        const pagePromises = [];
        for (let page = 1; page <= 5; page++) {
          pagePromises.push(
            fetch(`${TMDB_BASE_URL}/person/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`)
              .then(res => res.json())
          );
        }
        
        const pagesData = await Promise.all(pagePromises);
        const allPeople = pagesData.flatMap(data => data.results);

        // Fetch detailed info for each person to get birthday
        const detailedPeoplePromises = allPeople.map(async (person: Person) => {
          try {
            const detailRes = await fetch(
              `${TMDB_BASE_URL}/person/${person.id}?api_key=${TMDB_API_KEY}&language=en-US`
            );
            const detailData = await detailRes.json();
            return {
              ...person,
              birthday: detailData.birthday,
              deathday: detailData.deathday
            };
          } catch {
            return null;
          }
        });

        const detailedPeople = (await Promise.all(detailedPeoplePromises)).filter(p => p !== null);
        
        // Filter people born today
        const bornToday = detailedPeople.filter(person => {
          if (!person || !person.birthday) return false;
          const birthDate = new Date(person.birthday);
          return birthDate.getMonth() + 1 === month && birthDate.getDate() === day;
        });

        // Calculate age and sort by popularity
        const peopleWithAge = bornToday.map(person => {
          if (person.birthday) {
            const birthYear = new Date(person.birthday).getFullYear();
            const currentYear = today.getFullYear();
            return {
              ...person,
              age: currentYear - birthYear
            };
          }
          return person;
        });

        peopleWithAge.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        setPeople(peopleWithAge);
      } catch (err) {
        console.error('Error fetching people born today:', err);
        setError('Failed to load celebrities. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchBornToday();
  }, []);

  const getTodayFormatted = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-red-600 dark:text-red-500 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading celebrities born today...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Cake className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Cake className="w-10 h-10 text-red-600 dark:text-red-500" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            Born Today
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Celebrating celebrities born on {getTodayFormatted()}
        </p>
      </div>

      {/* People Grid */}
      {people.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {people.map((person) => (
            <Link
              key={person.id}
              to={`/person/${person.id}`}
              className="group"
            >
              <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                {/* Profile Image */}
                {person.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                    alt={person.name}
                    className="w-full h-auto aspect-[2/3] object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                  </div>
                )}

                {/* Birthday Badge */}
                <div className="absolute top-2 right-2 bg-gradient-to-br from-pink-500 to-red-500 p-2 rounded-full shadow-lg animate-bounce">
                  <Cake className="w-5 h-5 text-white" />
                </div>

                {/* Age Badge */}
                {person.age && (
                  <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-sm font-bold">
                      {person.age} years
                    </span>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                      {person.name}
                    </h3>
                    <p className="text-white/80 text-xs">
                      {person.known_for_department}
                    </p>
                  </div>
                </div>
              </div>

              {/* Person Info (visible on mobile) */}
              <div className="mt-2 md:hidden">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                  {person.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {person.known_for_department}
                  {person.age && ` • ${person.age} years`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Cake className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Celebrities Born Today
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            We couldn't find any famous people born on {getTodayFormatted()} in our database.
          </p>
        </div>
      )}

      {/* Fun Fact */}
      {people.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 rounded-xl border border-pink-200 dark:border-pink-800">
          <div className="flex items-start gap-3">
            <Cake className="w-6 h-6 text-pink-600 dark:text-pink-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                🎉 Birthday Fun Fact
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Today we're celebrating {people.length} {people.length === 1 ? 'celebrity' : 'celebrities'} born on this special day! 
                The oldest is turning {Math.max(...people.map(p => p.age || 0))} years old.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
