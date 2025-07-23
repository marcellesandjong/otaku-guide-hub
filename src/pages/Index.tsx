import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimeGrid } from "@/components/AnimeGrid";
import { GenreFilter } from "@/components/GenreFilter";
import { animeData, genres, Anime } from "@/data/animeData";
import { Search, Sparkles, TrendingUp } from "lucide-react";

const Index = () => {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAnimes: Anime[] = useMemo(() => {
    let filtered = animeData;

    // Filter by genre
    if (selectedGenre !== "All") {
      filtered = filtered.filter(anime => 
        anime.genre.includes(selectedGenre)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(anime =>
        anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        anime.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        anime.genre.some(genre => 
          genre.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    return filtered;
  }, [selectedGenre, searchQuery]);

  const topAnimes = useMemo(() => 
    [...animeData].sort((a, b) => b.rating - a.rating).slice(0, 6)
  , []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-primary opacity-10" />
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-accent animate-pulse" />
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Otaku Guide Hub
              </h1>
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your ultimate destination for anime discovery, ratings, and comprehensive guides to the best anime series and movies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg px-8 py-6"
              >
                Explore Top Anime
              </Button>
              <Button 
                size="lg" 
                variant="secondary" 
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
        {!searchQuery && selectedGenre === "All" && (
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-accent" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Top Rated Anime
              </h2>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Discover the highest-rated anime series and movies, carefully curated based on user ratings and critical acclaim.
            </p>
            <AnimeGrid animes={topAnimes} />
          </section>
        )}

        {/* Genre Filter & All Anime */}
        <section className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {searchQuery 
                ? `Search Results (${filteredAnimes.length})` 
                : selectedGenre === "All" 
                  ? "All Anime" 
                  : `${selectedGenre} Anime (${filteredAnimes.length})`
              }
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

          {filteredAnimes.length > 0 ? (
            <AnimeGrid animes={filteredAnimes} />
          ) : (
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
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-card/30 border-t border-border/50 py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-accent" />
            <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Otaku Guide Hub
            </h3>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive anime database with ratings, summaries, and genre-based discovery. 
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