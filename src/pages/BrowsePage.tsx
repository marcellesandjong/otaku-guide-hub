import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AnimeGrid } from '@/components/AnimeGrid';
import { GenreFilter } from '@/components/GenreFilter';
import { fetchTopAnime, searchAnime, fetchAnimeByGenre, convertJikanToAnime, genreMapping } from '@/services/jikanApi';
import type { Anime } from '@/services/jikanApi';
import { Search, Loader2, Library } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GENRES = [
  'All', 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Historical', 'Horror', 'Mystery', 'Psychological', 'Romance',
  'School', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller',
];

export default function BrowsePage() {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [allAnimes, setAllAnimes] = useState<Anime[]>([]);
  const [filteredAnimes, setFilteredAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchTopAnime(24);
        const converted = data.map(convertJikanToAnime);
        setAllAnimes(converted);
        setFilteredAnimes(converted);
      } catch {
        toast({ title: 'Error', description: 'Failed to load anime.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        if (selectedGenre === 'All') setFilteredAnimes(allAnimes);
        return;
      }
      try {
        setSearching(true);
        const results = await searchAnime(searchQuery, 24);
        setFilteredAnimes(results.map(convertJikanToAnime));
      } catch {
        toast({ title: 'Search Error', description: 'Failed to search.', variant: 'destructive' });
      } finally {
        setSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, allAnimes, selectedGenre, toast]);

  // Genre filter
  useEffect(() => {
    if (searchQuery.trim()) return;

    const filter = async () => {
      if (selectedGenre === 'All') {
        setFilteredAnimes(allAnimes);
        return;
      }
      const genreId = genreMapping[selectedGenre];
      if (!genreId) return;
      try {
        setSearching(true);
        const results = await fetchAnimeByGenre(genreId, 24);
        setFilteredAnimes(results.map(convertJikanToAnime));
      } catch {
        toast({ title: 'Filter Error', description: 'Failed to filter.', variant: 'destructive' });
      } finally {
        setSearching(false);
      }
    };

    filter();
  }, [selectedGenre, searchQuery, allAnimes, toast]);

  const title = searchQuery
    ? `Results for "${searchQuery}"`
    : selectedGenre !== 'All'
    ? `${selectedGenre} Anime`
    : 'All Anime';

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Library className="w-8 h-8 text-accent" />
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Browse Anime</h1>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 bg-card/50 border-border/50 focus:border-primary/50"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* Genre filter (hidden when searching) */}
      {!searchQuery && !loading && (
        <GenreFilter
          genres={GENRES}
          selectedGenre={selectedGenre}
          onGenreSelect={setSelectedGenre}
        />
      )}

      {/* Results header */}
      {!loading && (
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            {title}
            {!searching && (
              <span className="text-sm font-normal text-muted-foreground">
                ({filteredAnimes.length})
              </span>
            )}
            {searching && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
          </h2>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading anime...</p>
          </div>
        </div>
      ) : searching ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredAnimes.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <p className="text-4xl">😅</p>
          <h3 className="text-xl font-semibold">No results found</h3>
          <p className="text-muted-foreground">Try a different search or genre.</p>
          {searchQuery && (
            <Button variant="secondary" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <AnimeGrid animes={filteredAnimes} />
      )}
    </div>
  );
}
