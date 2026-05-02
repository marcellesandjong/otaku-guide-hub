import { Link } from 'react-router-dom';
import { Bookmark, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWatchlistContext } from '@/context/WatchlistContext';
import { AnimeGrid } from '@/components/AnimeGrid';

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist } = useWatchlistContext();

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bookmark className="w-8 h-8 text-accent" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              My Watchlist
            </h1>
            <p className="text-muted-foreground mt-0.5">
              {watchlist.length} anime saved
            </p>
          </div>
        </div>

        {watchlist.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => watchlist.forEach((a) => removeFromWatchlist(a.id))}
            className="gap-2 text-destructive border-destructive/40 hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
            Clear all
          </Button>
        )}
      </div>

      {watchlist.length === 0 ? (
        <div className="text-center py-24 space-y-5">
          <Bookmark className="w-16 h-16 text-muted-foreground/30 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">
              Your watchlist is empty
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Browse anime and click the bookmark icon to save shows you want to
              watch later.
            </p>
          </div>
          <Button asChild className="bg-gradient-primary hover:shadow-glow mt-4">
            <Link to="/browse">Browse Anime</Link>
          </Button>
        </div>
      ) : (
        <AnimeGrid animes={watchlist} />
      )}
    </div>
  );
}
