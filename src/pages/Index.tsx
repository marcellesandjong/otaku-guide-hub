import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AnimeGrid } from '@/components/AnimeGrid';
import { AnimeQuiz } from '@/components/AnimeQuiz';
import {
  fetchTopAnime,
  fetchSeasonalAnime,
  convertJikanToAnime,
} from '@/services/jikanApi';
import type { Anime } from '@/services/jikanApi';
import {
  Sparkles,
  TrendingUp,
  Loader2,
  Tv2,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [topAnimes, setTopAnimes] = useState<Anime[]>([]);
  const [seasonalAnimes, setSeasonalAnimes] = useState<Anime[]>([]);
  const [loadingTop, setLoadingTop] = useState(true);
  const [loadingSeasonal, setLoadingSeasonal] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTopAnime(10)
      .then((data) => setTopAnimes(data.map(convertJikanToAnime)))
      .catch(() =>
        toast({ title: 'Error', description: 'Failed to load top anime.', variant: 'destructive' })
      )
      .finally(() => setLoadingTop(false));
  }, [toast]);

  useEffect(() => {
    fetchSeasonalAnime(10)
      .then((data) => setSeasonalAnimes(data.map(convertJikanToAnime)))
      .catch(() => {})
      .finally(() => setLoadingSeasonal(false));
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-hero opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(270_95%_65%/0.15),transparent_60%)]" />

        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-2">
              <img
                src="/logo.png"
                alt="Anime Plug logo"
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl shadow-glow"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent leading-tight pb-2">
              Anime Plug
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover anime, read community reviews, track when new episodes
              drop, and build your personal watchlist — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Button
                size="lg"
                asChild
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg px-8 py-6"
              >
                <Link to="/browse">Browse All Anime</Link>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="text-lg px-8 py-6"
              >
                <Link to="/schedule">
                  <Calendar className="w-5 h-5 mr-2" />
                  Airing Schedule
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-16">

        {/* ── Currently Airing ─────────────────────────────── */}
        <section className="space-y-6">
          <SectionHeader
            icon={<Tv2 className="w-7 h-7 text-emerald-400" />}
            title="Currently Airing"
            linkTo="/schedule"
            linkLabel="Full Schedule"
          />
          {loadingSeasonal ? (
            <SectionLoader text="Loading seasonal anime..." />
          ) : seasonalAnimes.length > 0 ? (
            <AnimeGrid animes={seasonalAnimes} />
          ) : null}
        </section>

        {/* ── Top Rated ────────────────────────────────────── */}
        <section id="top-anime" className="space-y-6">
          <SectionHeader
            icon={<TrendingUp className="w-7 h-7 text-accent" />}
            title="Top Rated Anime"
            linkTo="/browse"
            linkLabel="See All"
          />
          <p className="text-muted-foreground text-lg max-w-2xl -mt-2">
            The highest-rated series and movies on MyAnimeList, based on
            hundreds of thousands of user ratings.
          </p>
          {loadingTop ? (
            <SectionLoader text="Loading top anime..." />
          ) : (
            <AnimeGrid animes={topAnimes} />
          )}
        </section>

        {/* ── Quiz ─────────────────────────────────────────── */}
        <section className="space-y-6">
          <SectionHeader
            icon={<Sparkles className="w-7 h-7 text-accent" />}
            title="Find Your Perfect Anime"
          />
          <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">
            Not sure where to start? Answer a few quick questions and get
            personalized recommendations tailored to your taste.
          </p>
          <AnimeQuiz />
        </section>

        {/* ── Beginner Guide ────────────────────────────────── */}
        <section className="space-y-6">
          <SectionHeader
            icon={<Sparkles className="w-7 h-7 text-accent" />}
            title="New to Anime?"
          />
          <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">
            No worries — here are some of the best series to start with,
            whether you're into action, drama, or pure laughs.
          </p>
          <div className="bg-card/30 rounded-xl p-6 border border-border/50 grid grid-cols-1 md:grid-cols-3 gap-6">
            <BeginnerCategory
              title="Action & Adventure"
              items={[
                { id: 38000, label: 'Demon Slayer — Beautiful animation & story' },
                { id: 21, label: 'One Piece — Epic pirate adventure' },
                { id: 16498, label: 'Attack on Titan — Intense & rewarding' },
              ]}
            />
            <BeginnerCategory
              title="Drama & Movies"
              items={[
                { id: 32281, label: 'Your Name — Stunning animated film' },
                { id: 199, label: 'Spirited Away — Studio Ghibli masterpiece' },
                { id: 1535, label: 'Death Note — Psychological thriller' },
              ]}
            />
            <BeginnerCategory
              title="Long Adventures"
              items={[
                { id: 21, label: 'One Piece — 1000+ episodes of greatness' },
                { id: 20, label: 'Naruto — Coming-of-age ninja story' },
                { id: 813, label: 'Dragon Ball Z — Classic battle anime' },
              ]}
            />
          </div>
        </section>
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-card/30 border-t border-border/50 py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src="/logo.png" alt="Anime Plug" className="w-10 h-10 rounded-xl" />
            <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Anime Plug
            </h3>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
            Powered by the{' '}
            <a
              href="https://jikan.moe"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Jikan API
            </a>{' '}
            (MyAnimeList). Data includes real ratings, synopses, episode
            counts, and airing schedules.
          </p>
          <p className="mt-4 text-xs text-muted-foreground/60">
            Made with ❤️ for anime enthusiasts worldwide
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  linkTo,
  linkLabel,
}: {
  icon: React.ReactNode;
  title: string;
  linkTo?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {title}
        </h2>
      </div>
      {linkTo && linkLabel && (
        <Button variant="ghost" size="sm" asChild className="text-primary gap-1">
          <Link to={linkTo}>
            {linkLabel}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}

function SectionLoader({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 py-8">
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}

function BeginnerCategory({
  title,
  items,
}: {
  title: string;
  items: { id: number; label: string }[];
}) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-foreground">{title}</h4>
      <ul className="space-y-2">
        {items.map(({ id, label }) => (
          <li key={id}>
            <Link
              to={`/anime/${id}`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-start gap-2 group"
            >
              <span className="mt-0.5 text-primary/50 group-hover:text-primary transition-colors">•</span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
