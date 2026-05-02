import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  fetchAnimeById,
  fetchAnimeEpisodes,
  fetchAnimeReviews,
  convertJikanToAnime,
  type JikanAnime,
  type JikanEpisode,
  type JikanReview,
} from '@/services/jikanApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useWatchlistContext } from '@/context/WatchlistContext';
import { useToast } from '@/hooks/use-toast';
import {
  Star,
  Calendar,
  Tv,
  Users,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ExternalLink,
  Clock,
  AlertCircle,
  ThumbsUp,
} from 'lucide-react';
import { format } from 'date-fns';

// ─── Episode List ─────────────────────────────────────────────────────────────

function EpisodeList({ animeId }: { animeId: number }) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['episodes', animeId, page],
    queryFn: () => fetchAnimeEpisodes(animeId, page),
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data || data.episodes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Tv className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>No episode data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        {data.episodes.map((ep: JikanEpisode) => (
          <div
            key={ep.mal_id}
            className="flex items-center gap-4 px-4 py-3 rounded-lg bg-card/50 border border-border/30 hover:border-border/60 transition-colors"
          >
            <span className="text-sm font-mono text-muted-foreground w-8 shrink-0">
              {ep.mal_id}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {ep.title || `Episode ${ep.mal_id}`}
              </p>
              {ep.title_japanese && (
                <p className="text-xs text-muted-foreground truncate">
                  {ep.title_japanese}
                </p>
              )}
            </div>
            {ep.aired && (
              <span className="text-xs text-muted-foreground shrink-0">
                {format(new Date(ep.aired), 'MMM d, yyyy')}
              </span>
            )}
            {ep.filler && (
              <Badge variant="secondary" className="text-xs shrink-0 bg-amber-500/10 text-amber-400 border-amber-500/20">
                Filler
              </Badge>
            )}
            {ep.recap && (
              <Badge variant="secondary" className="text-xs shrink-0 bg-blue-500/10 text-blue-400 border-blue-500/20">
                Recap
              </Badge>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={!data.hasNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

// ─── Review List ──────────────────────────────────────────────────────────────

function ReviewList({ animeId }: { animeId: number }) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', animeId],
    queryFn: () => fetchAnimeReviews(animeId),
    staleTime: 1000 * 60 * 30,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>No reviews yet. Be the first on MyAnimeList!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.slice(0, 10).map((review: JikanReview) => (
        <div
          key={review.mal_id}
          className="rounded-xl border border-border/50 bg-card/40 p-5 space-y-3"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {review.user?.images?.jpg?.image_url ? (
                <img
                  src={review.user.images.jpg.image_url}
                  alt={review.user.username}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-secondary/80 flex items-center justify-center text-sm font-bold text-muted-foreground">
                  {review.user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-sm text-foreground">
                  {review.user.username}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(review.date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-foreground">
                {review.score}/10
              </span>
            </div>
          </div>

          {review.tags && review.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {review.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-primary/10 text-primary border-primary/20"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
            {review.review}
          </p>

          {review.reactions?.overall !== undefined && review.reactions.overall > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
              <ThumbsUp className="w-3 h-3" />
              <span>{review.reactions.overall} found this helpful</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Detail Page ─────────────────────────────────────────────────────────

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlistContext();
  const { toast } = useToast();

  const animeId = Number(id);

  const { data: anime, isLoading, isError } = useQuery({
    queryKey: ['anime', animeId],
    queryFn: () => fetchAnimeById(animeId),
    enabled: !isNaN(animeId),
    staleTime: 1000 * 60 * 10,
  });

  const converted = anime ? convertJikanToAnime(anime) : null;
  const saved = converted ? isInWatchlist(converted.id) : false;

  const handleWatchlist = () => {
    if (!converted) return;
    toggleWatchlist(converted);
    toast({
      title: saved ? 'Removed from watchlist' : 'Added to watchlist',
      description: converted.title,
    });
  };

  const handleWatch = () => {
    if (!converted) return;
    window.open(
      `https://www.crunchyroll.com/search?q=${encodeURIComponent(converted.title)}`,
      '_blank'
    );
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (isError || !anime) {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-2xl font-bold">Anime not found</h2>
        <p className="text-muted-foreground">
          Could not load this anime. It may have been removed or the API is
          temporarily unavailable.
        </p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Go back
        </Button>
      </div>
    );
  }

  const allGenres = [
    ...(anime.genres ?? []),
    ...(anime.themes ?? []),
    ...(anime.demographics ?? []),
  ];

  const score = anime.score;
  const rank = anime.rank;
  const members = anime.members;

  return (
    <div className="min-h-screen pb-16">
      {/* Hero */}
      <div className="relative">
        {/* Blurred background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 blur-xl scale-110"
          style={{ backgroundImage: `url(${anime.images?.jpg?.large_image_url})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />

        <div className="relative container mx-auto px-4 py-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="shrink-0 mx-auto md:mx-0">
              <div className="w-48 md:w-56 rounded-xl overflow-hidden shadow-2xl border border-border/30">
                <img
                  src={anime.images?.jpg?.large_image_url}
                  alt={converted?.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  {converted?.title}
                </h1>
                {anime.title !== converted?.title && (
                  <p className="text-muted-foreground mt-1">{anime.title}</p>
                )}
                {anime.title_japanese && (
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {anime.title_japanese}
                  </p>
                )}
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-4 text-sm">
                {score != null && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-foreground text-base">
                      {score.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">/ 10</span>
                  </div>
                )}
                {rank && (
                  <div className="text-muted-foreground">
                    Ranked{' '}
                    <span className="text-foreground font-medium">
                      #{rank.toLocaleString()}
                    </span>
                  </div>
                )}
                {members && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{(members / 1000).toFixed(0)}K members</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-1.5">
                {allGenres.map((g) => (
                  <Badge
                    key={g.mal_id}
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                  >
                    {g.name}
                  </Badge>
                ))}
              </div>

              {/* Quick info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <InfoItem label="Status" value={converted?.status ?? '—'} />
                <InfoItem
                  label="Episodes"
                  value={anime.episodes ? String(anime.episodes) : 'Unknown'}
                />
                <InfoItem
                  label="Year"
                  value={converted?.year ? String(converted.year) : '—'}
                />
                {anime.type && (
                  <InfoItem label="Type" value={anime.type} />
                )}
                {anime.duration && (
                  <InfoItem label="Duration" value={anime.duration} />
                )}
                {anime.season && (
                  <InfoItem
                    label="Season"
                    value={`${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year}`}
                  />
                )}
                {anime.studios && anime.studios.length > 0 && (
                  <InfoItem
                    label="Studio"
                    value={anime.studios.map((s) => s.name).join(', ')}
                  />
                )}
                {anime.source && (
                  <InfoItem label="Source" value={anime.source} />
                )}
              </div>

              {/* Broadcast schedule for airing shows */}
              {converted?.status === 'Ongoing' && anime.broadcast?.day && (
                <div className="flex items-center gap-2 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2.5 w-fit">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">
                    Airs every{' '}
                    <strong>{anime.broadcast.day}</strong>
                    {anime.broadcast.time
                      ? ` at ${anime.broadcast.time} (JST)`
                      : ''}
                  </span>
                </div>
              )}

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                <Button
                  onClick={handleWatch}
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300 gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Watch on Crunchyroll
                </Button>
                <Button
                  variant="outline"
                  onClick={handleWatchlist}
                  className={`gap-2 transition-all duration-200 ${
                    saved
                      ? 'border-primary/50 text-primary hover:bg-primary/10'
                      : ''
                  }`}
                >
                  {saved ? (
                    <BookmarkCheck className="w-4 h-4" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                  {saved ? 'In Watchlist' : 'Add to Watchlist'}
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="gap-2"
                >
                  <a
                    href={`https://myanimelist.net/anime/${anime.mal_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on MAL
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 mt-6">
        <Tabs defaultValue="overview">
          <TabsList className="bg-card/50 border border-border/50 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Synopsis */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Synopsis</h2>
              <p className="text-muted-foreground leading-relaxed">
                {anime.synopsis || 'No synopsis available.'}
              </p>
              {anime.background && (
                <>
                  <h3 className="text-base font-medium text-foreground mt-4">Background</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {anime.background}
                  </p>
                </>
              )}
            </section>

            {/* Trailer */}
            {anime.trailer?.embed_url && (
              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">Trailer</h2>
                <div className="aspect-video rounded-xl overflow-hidden border border-border/50 bg-black">
                  <iframe
                    src={anime.trailer.embed_url}
                    title={`${converted?.title} trailer`}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                  />
                </div>
              </section>
            )}

            {/* Streaming */}
            {anime.streaming && anime.streaming.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  Where to Watch
                </h2>
                <div className="flex flex-wrap gap-2">
                  {anime.streaming.map((s) => (
                    <Button
                      key={s.name}
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-2"
                    >
                      <a href={s.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5" />
                        {s.name}
                      </a>
                    </Button>
                  ))}
                </div>
              </section>
            )}

            {/* Related anime */}
            {anime.relations && anime.relations.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">Related</h2>
                <div className="space-y-3">
                  {anime.relations
                    .filter((r) => r.entry.some((e) => e.type === 'anime'))
                    .map((rel) => (
                      <div key={rel.relation}>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                          {rel.relation}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {rel.entry
                            .filter((e) => e.type === 'anime')
                            .map((entry) => (
                              <Link
                                key={entry.mal_id}
                                to={`/anime/${entry.mal_id}`}
                              >
                                <Badge
                                  variant="secondary"
                                  className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors"
                                >
                                  {entry.name}
                                </Badge>
                              </Link>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}
          </TabsContent>

          {/* Episodes Tab */}
          <TabsContent value="episodes">
            <EpisodeList animeId={animeId} />
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <ReviewList animeId={animeId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
        {label}
      </p>
      <p className="text-sm text-foreground font-medium">{value}</p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <Skeleton className="h-6 w-24 rounded" />
      <div className="flex flex-col md:flex-row gap-8">
        <Skeleton className="w-48 md:w-56 aspect-[3/4] rounded-xl shrink-0" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-3/4 rounded" />
          <Skeleton className="h-5 w-1/3 rounded" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-16 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-24 w-full rounded" />
        </div>
      </div>
    </div>
  );
}
