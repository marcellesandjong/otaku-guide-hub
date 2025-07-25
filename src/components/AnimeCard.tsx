import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Calendar, Tv, ExternalLink } from "lucide-react";
import { Anime } from "@/data/animeData";
import { useState } from "react";

interface AnimeCardProps {
  anime: Anime;
}

export const AnimeCard = ({ anime }: AnimeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleWatchNow = () => {
    // Search for the anime on Crunchyroll
    const searchUrl = `https://www.crunchyroll.com/search?q=${encodeURIComponent(anime.title)}`;
    window.open(searchUrl, '_blank');
  };

  return (
    <Card className="group bg-card hover:bg-gradient-secondary border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow hover:-translate-y-2 cursor-pointer overflow-hidden">
      <div className="aspect-[3/4] bg-gradient-hero rounded-t-lg flex items-center justify-center">
        <img 
          src={anime.image} 
          alt={anime.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
            {anime.title}
          </h3>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="text-foreground font-medium">{anime.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{anime.year}</span>
            </div>
            <div className="flex items-center gap-1">
              <Tv className="w-4 h-4" />
              <span>{anime.episodes} ep</span>
            </div>
          </div>
        </div>

        {/* Watch Now Button */}
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            handleWatchNow();
          }}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
          size="sm"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Watch Now
        </Button>
        
        <div className="text-sm text-muted-foreground leading-relaxed">
          <p className={isExpanded ? "" : "line-clamp-3"}>
            {anime.summary}
          </p>
          {anime.summary.length > 150 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-primary hover:text-primary/80 text-xs mt-1 font-medium transition-colors"
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1">
          {anime.genre.slice(0, 3).map((genre) => (
            <Badge 
              key={genre} 
              variant="secondary" 
              className="text-xs bg-secondary/50 hover:bg-primary/20 transition-colors"
            >
              {genre}
            </Badge>
          ))}
          {anime.genre.length > 3 && (
            <Badge variant="secondary" className="text-xs bg-secondary/50">
              +{anime.genre.length - 3}
            </Badge>
          )}
        </div>
        
        <div className="pt-2 border-t border-border/50">
          <Badge 
            variant={anime.status === "Ongoing" ? "default" : "secondary"}
            className={`text-xs ${
              anime.status === "Ongoing" 
                ? "bg-gradient-primary text-primary-foreground" 
                : "bg-secondary/50"
            }`}
          >
            {anime.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};