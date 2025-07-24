import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimeGrid } from "@/components/AnimeGrid";
import { GenreFilter } from "@/components/GenreFilter";
import { Logo } from "@/components/Logo";
import { Anime } from "@/data/animeData";
import { fetchTopAnime, searchAnime, fetchAnimeByGenre, convertJikanToAnime, genreMapping } from "@/services/jikanApi";
import { Search, Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const genres = [
  "All",
  "Action",
  "Adventure", 
  "Comedy",
  "Drama",
  "Fantasy",
  "Historical",
  "Horror",
  "Mystery",
  "Psychological",
  "Romance",
  "School",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller"
];

const Index = () => {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [topAnimes, setTopAnimes] = useState<Anime[]>([]);
  const [allAnimes, setAllAnimes] = useState<Anime[]>([]);
  const [filteredAnimes, setFilteredAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  // Fetch top anime on component mount
  useEffect(() => {
    const loadTopAnime = async () => {
      try {
        setLoading(true);
        const jikanAnimes = await fetchTopAnime(24);
        const convertedAnimes = jikanAnimes.map(convertJikanToAnime);
        setTopAnimes(convertedAnimes.slice(0, 6));
        setAllAnimes(convertedAnimes);
        setFilteredAnimes(convertedAnimes);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load anime data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadTopAnime();
  }, [toast]);

  // Handle search
  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.trim()) {
        try {
          setSearching(true);
          const searchResults = await searchAnime(searchQuery, 20);
          const convertedResults = searchResults.map(convertJikanToAnime);
          setFilteredAnimes(convertedResults);
        } catch (error) {
          toast({
            title: "Search Error",
            description: "Failed to search anime. Please try again.",
            variant: "destructive"
          });
        } finally {
          setSearching(false);
        }
      } else if (selectedGenre === "All") {
        setFilteredAnimes(allAnimes);
      }
    };

    const debounceTimer = setTimeout(handleSearch, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, allAnimes, selectedGenre, toast]);

  // Handle genre filtering
  useEffect(() => {
    const handleGenreFilter = async () => {
      if (selectedGenre !== "All" && !searchQuery.trim()) {
        try {
          setSearching(true);
          const genreId = genreMapping[selectedGenre];
          if (genreId) {
            const genreResults = await fetchAnimeByGenre(genreId, 20);
            const convertedResults = genreResults.map(convertJikanToAnime);
            setFilteredAnimes(convertedResults);
          }
        } catch (error) {
          toast({
            title: "Filter Error",
            description: "Failed to filter anime by genre. Please try again.",
            variant: "destructive"
          });
        } finally {
          setSearching(false);
        }
      } else if (selectedGenre === "All" && !searchQuery.trim()) {
        setFilteredAnimes(allAnimes);
      }
    };

    handleGenreFilter();
  }, [selectedGenre, searchQuery, allAnimes, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-primary opacity-10" />
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Logo className="w-16 h-16 md:w-20 md:h-20" />
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Anime Plug
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your ultimate destination for anime discovery, ratings, and comprehensive guides to the best anime series and movies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Button 
                size="lg" 
                onClick={() => document.getElementById('top-anime')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg px-8 py-6"
              >
                Explore Top Anime
              </Button>
              <Button 
                size="lg" 
                variant="secondary" 
                onClick={() => document.getElementById('genre-filter')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-8 py-6 hover:bg-secondary/80"
              >
                Browse by Genre
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Search Section */}
        <section className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search anime by title, genre, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg bg-card/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
            />
          </div>
        </section>

        {/* Top Rated Section */}
        {!searchQuery && selectedGenre === "All" && !loading && (
          <section id="top-anime" className="space-y-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-accent" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Top Rated Anime
              </h2>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Discover the highest-rated anime series and movies from MyAnimeList, curated based on user ratings and critical acclaim.
            </p>
            <AnimeGrid animes={topAnimes} />
          </section>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-lg text-muted-foreground">Loading anime data from MyAnimeList...</p>
            </div>
          </div>
        )}

        {/* Genre Filter & All Anime */}
        {!loading && (
          <section id="genre-filter" className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
                {searchQuery 
                  ? `Search Results ${searching ? '' : `(${filteredAnimes.length})`}` 
                  : selectedGenre === "All" 
                    ? "All Anime" 
                    : `${selectedGenre} Anime ${searching ? '' : `(${filteredAnimes.length})`}`
                }
                {searching && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
              </h2>
              {!searchQuery && (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-lg">
                    Filter by genre to find your perfect anime match
                  </p>
                  <GenreFilter
                    genres={genres}
                    selectedGenre={selectedGenre}
                    onGenreSelect={setSelectedGenre}
                  />
                </div>
              )}
            </div>

            {!searching && filteredAnimes.length > 0 ? (
              <AnimeGrid animes={filteredAnimes} />
            ) : !searching && filteredAnimes.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="text-6xl">😅</div>
                <h3 className="text-2xl font-semibold text-foreground">No anime found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchQuery 
                    ? "Try adjusting your search terms or browse by genre instead."
                    : "No anime found in this genre. Try selecting a different genre."
                  }
                </p>
                {searchQuery && (
                  <Button 
                    variant="secondary" 
                    onClick={() => setSearchQuery("")}
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : searching && (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-lg text-muted-foreground">
                    {searchQuery ? "Searching anime..." : "Loading anime..."}
                  </p>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-card/30 border-t border-border/50 py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Logo className="w-8 h-8" />
            <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Anime Plug
            </h3>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive anime database powered by MyAnimeList with real ratings, summaries, and genre-based discovery. 
            Explore the vast world of anime and find your next favorite series.
          </p>
          <div className="mt-6 text-sm text-muted-foreground">
            Made with ❤️ for anime enthusiasts worldwide
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;