import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { Actor, TVSeries } from '../types';
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../lib/utils';

export function ActorDetails() {
  const { id } = useParams();
  const [actor, setActor] = React.useState<Actor | null>(null);
  const [credits, setCredits] = React.useState<TVSeries[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchActorDetails() {
      try {
        const [actorResponse, creditsResponse] = await Promise.all([
          fetch(`${TMDB_BASE_URL}/person/${id}?api_key=${TMDB_API_KEY}&language=en-US`),
          fetch(`${TMDB_BASE_URL}/person/${id}/combined_credits?api_key=${TMDB_API_KEY}&language=en-US`)
        ]);

        const actorData = await actorResponse.json();
        const creditsData = await creditsResponse.json();

        setActor(actorData);
        setCredits(creditsData.cast
          .filter((credit: any) => credit.media_type === 'tv')
          .sort((a: any, b: any) => b.vote_count - a.vote_count)
          .slice(0, 12)
        );
      } catch (error) {
        console.error('Error fetching actor details:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchActorDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent dark:border-red-500" />
      </div>
    );
  }

  if (!actor) {
    return <div className="text-center text-gray-600 dark:text-gray-400">Actor not found</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={actor.profile_path
                ? `${TMDB_IMAGE_BASE_URL}/h632${actor.profile_path}`
                : 'https://via.placeholder.com/300x450.png?text=No+Image'
              }
              alt={actor.name}
              className="w-full h-auto"
            />
          </div>
          <div className="mt-4 space-y-2">
            {actor.birthday && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Born {new Date(actor.birthday).toLocaleDateString()}</span>
              </div>
            )}
            {actor.place_of_birth && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{actor.place_of_birth}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{actor.name}</h1>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{actor.biography}</p>
          </div>
        </div>
      </div>

      {credits.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Known For</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {credits.map((series) => (
              <Link
                key={series.id}
                to={`/series/${series.id}`}
                className="group"
              >
                <div className="aspect-[2/3] rounded-lg overflow-hidden mb-2 bg-gray-100 dark:bg-gray-800">
                  <img
                    src={series.poster_path
                      ? `${TMDB_IMAGE_BASE_URL}/w500${series.poster_path}`
                      : 'https://via.placeholder.com/300x450.png?text=No+Image'
                    }
                    alt={series.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{series.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}