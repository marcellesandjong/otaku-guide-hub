import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface GenreFilterProps {
  genres: string[];
  selectedGenre: string;
  onGenreSelect: (genre: string) => void;
}

export const GenreFilter = ({ genres, selectedGenre, onGenreSelect }: GenreFilterProps) => {
  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 p-1">
          {genres.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? "default" : "secondary"}
              size="sm"
              onClick={() => onGenreSelect(genre)}
              className={`flex-shrink-0 transition-all duration-300 ${
                selectedGenre === genre
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "bg-secondary hover:bg-secondary/80 text-secondary-foreground hover:text-foreground"
              }`}
            >
              {genre}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};