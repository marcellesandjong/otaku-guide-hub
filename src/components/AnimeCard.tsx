import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Calendar, Tv, Bookmark, BookmarkCheck } from 'lucide-react';
import type { Anime } from '@/services/jikanApi';
import { useWatchlistContext } from '@/context/WatchlistContext';
import { useToast } from '@/hooks/use-toast';

interface AnimeCardProps {
  anime: Anime;
}

const STATUS_STYLES: Record<Anime['status'], string> = {
  Ongoing: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Completed: 'bg-secondary/50 text-muted-foreground border-border/50',
  Upcoming: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export function AnimeCard({ anime }: AnimeCardProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlistContext();
  const { toast } = useToast();
  const [imgError, setImgError] = useState(false);
  const saved = isInWatchlist(anime.id);

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(anime);
    toast({
      title: saved ? 'Removed from watchlist' : 'Added to watchlist',
      description: anime.title,
    });
  };

  return (
    <Link to={`/anime/${anime.id}`} className="block group outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
      <Card className="h-full bg-card hover:bg-card/90 border-border hover:border-primary/40 transition-all duration-300 hover:shadow-glow hover:-translate-y-1 overflow-hidden">
        {/* Poster */}
        <div className="relative aspect-[3/4] bg-secondary/50 overflow-hidden">
          {imgError ? (
            <div className="w-full h-full flex items-center justify-center bg-secondary/80">
              <Tv className="w-12 h-12 text-muted-foreground/40" />
            </div>
          ) : (
            <img
              src={anime.image}
              alt={anime.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          )}

          {/* Status badge (top-left) */}
          <div className="absolute top-2 left-2">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                STATUS_STYLES[anime.status]
              }`}
            >
              {anime.status}
            </span>
          </div>

          {/* Watchlist button (top-right) */}
          <button
            onClick={handleWatchlist}
            aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}
            className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-all duration-200 ${
              saved
                ? 'bg-primary text-primary-foreground shadow-glow'
                : 'bg-black/40 text-white hover:bg-primary/80'
            }`}
          >
            {saved ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>

          {/* Score overlay at the bottom */}
          {anime.rating > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-white text-sm font-semibold">{anime.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <CardContent className="p-3 space-y-2">
          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
            {anime.title}
          </h3>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {anime.year || '—'}
            </span>
            <span className="flex items-center gap-1">
              <Tv className="w-3 h-3" />
              {anime.episodes ? `${anime.episodes} ep` : '?'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {anime.genre.slice(0, 2).map((g) => (
              <Badge
                key={g}
                variant="secondary"
                className="text-xs px-1.5 py-0 bg-secondary/60 hover:bg-primary/20 transition-colors"
              >
                {g}
              </Badge>
            ))}
            {anime.genre.length > 2 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-secondary/40">
                +{anime.genre.length - 2}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

