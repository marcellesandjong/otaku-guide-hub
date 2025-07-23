import { AnimeCard } from "./AnimeCard";
import { Anime } from "@/data/animeData";

interface AnimeGridProps {
  animes: Anime[];
}

export const AnimeGrid = ({ animes }: AnimeGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {animes.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  );
};