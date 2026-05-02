import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchFullSchedule, convertJikanToAnime, type ScheduleDay } from '@/services/jikanApi';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Tv, Calendar, Clock } from 'lucide-react';

const DAYS: { key: ScheduleDay; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

function getTodayKey(): ScheduleDay {
  const days: ScheduleDay[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return days[new Date().getDay()];
}

export default function SchedulePage() {
  const { data: schedule, isLoading } = useQuery({
    queryKey: ['schedule'],
    queryFn: fetchFullSchedule,
    staleTime: 1000 * 60 * 30,
  });

  const today = getTodayKey();

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-accent" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Airing Schedule
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Track exactly when new episodes drop each week. Never miss a release.
        </p>
      </div>

      {isLoading ? (
        <ScheduleSkeleton />
      ) : (
        <div className="space-y-10">
          {DAYS.map(({ key, label }) => {
            const animes = schedule?.[key] ?? [];
            const isToday = key === today;

            return (
              <section key={key} id={key}>
                {/* Day header */}
                <div className="flex items-center gap-3 mb-4">
                  <h2
                    className={`text-xl font-bold ${
                      isToday ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    {label}
                  </h2>
                  {isToday && (
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-medium">
                      Today
                    </Badge>
                  )}
                  {animes.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {animes.length} show{animes.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  <div className="flex-1 h-px bg-border/50 ml-2" />
                </div>

                {animes.length === 0 ? (
                  <p className="text-muted-foreground text-sm pl-2">
                    Nothing scheduled yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {animes.map((jAnime) => {
                      const anime = convertJikanToAnime(jAnime);
                      return (
                        <Link
                          key={anime.id}
                          to={`/anime/${anime.id}`}
                          className="group"
                        >
                          <div
                            className={`flex gap-3 p-3 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow ${
                              isToday
                                ? 'border-primary/30 bg-primary/5 hover:border-primary/50'
                                : 'border-border/40 bg-card/40 hover:border-border/70'
                            }`}
                          >
                            {/* Thumbnail */}
                            <div className="w-14 h-20 rounded-lg overflow-hidden shrink-0 bg-secondary/50">
                              <img
                                src={anime.image}
                                alt={anime.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                {anime.title}
                              </p>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                {anime.rating > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    {anime.rating.toFixed(1)}
                                  </span>
                                )}
                                {anime.episodes > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Tv className="w-3 h-3" />
                                    {anime.episodes} ep
                                  </span>
                                )}
                              </div>

                              {jAnime.broadcast?.time && (
                                <div className="flex items-center gap-1 text-xs text-emerald-400">
                                  <Clock className="w-3 h-3" />
                                  <span>{jAnime.broadcast.time} JST</span>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-1">
                                {anime.genre.slice(0, 2).map((g) => (
                                  <Badge
                                    key={g}
                                    variant="secondary"
                                    className="text-xs px-1.5 py-0 bg-secondary/60"
                                  >
                                    {g}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ScheduleSkeleton() {
  return (
    <div className="space-y-10">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-7 w-32 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
