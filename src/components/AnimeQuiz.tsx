import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Sparkles, Loader2, RotateCcw, Check } from 'lucide-react';
import { AnimeCard } from '@/components/AnimeCard';
import {
  fetchTopAnime,
  fetchAnimeByGenre,
  fetchSeasonalAnime,
  convertJikanToAnime,
  type JikanAnime,
} from '@/services/jikanApi';
import type { Anime } from '@/services/jikanApi';

// ─── Types ─────────────────────────────────────────────────────────────────

interface QuizAnswers {
  experience: string;
  story: string[];
  vibe: string;
  length: string;
  themes: string[];
  avoid: string[];
}

// ─── Questions ──────────────────────────────────────────────────────────────

// Story type → Jikan genre IDs (primary genre + close relatives)
const STORY_GENRE_IDS: Record<string, number[]> = {
  fights:  [1, 2, 17],    // Action, Adventure, Martial Arts
  romance: [22, 8],       // Romance, Drama
  mystery: [7, 40, 41],   // Mystery, Psychological, Thriller
  comedy:  [4, 36],       // Comedy, Slice of Life
  dark:    [41, 40, 14],  // Thriller, Psychological, Horror
  fantasy: [10, 37, 2],   // Fantasy, Supernatural, Adventure
  sports:  [30],          // Sports
  scifi:   [24, 46],      // Sci-Fi, Award Winning
};

// Story type → which anime genre name strings to match against for scoring
const STORY_SCORE_GENRES: Record<string, string[]> = {
  fights:  ['Action', 'Adventure', 'Martial Arts', 'Military'],
  romance: ['Romance', 'Drama', 'Josei', 'Shoujo'],
  mystery: ['Mystery', 'Psychological', 'Thriller', 'Suspense'],
  comedy:  ['Comedy', 'Parody', 'Slice of Life', 'Gag Humor'],
  dark:    ['Horror', 'Psychological', 'Thriller', 'Tragedy'],
  fantasy: ['Fantasy', 'Supernatural', 'Magic', 'Adventure', 'Isekai'],
  sports:  ['Sports'],
  scifi:   ['Sci-Fi', 'Mecha', 'Space', 'Military'],
};

const VIBE_BOOST: Record<string, string[]> = {
  hyped:     ['Action', 'Adventure', 'Sports', 'Fantasy'],
  warm:      ['Comedy', 'Slice of Life', 'Romance'],
  emotional: ['Drama', 'Romance', 'Tragedy', 'Psychological'],
  tense:     ['Thriller', 'Horror', 'Psychological', 'Mystery'],
};

const VIBE_PENALIZE: Record<string, string[]> = {
  hyped:     ['Slice of Life', 'Romance'],
  warm:      ['Horror', 'Thriller', 'Psychological'],
  emotional: ['Comedy', 'Parody', 'Action'],
  tense:     ['Comedy', 'Parody', 'Slice of Life', 'Romance'],
};

const THEME_SCORE_GENRES: Record<string, string[]> = {
  friendship:  ['Action', 'Adventure', 'Shounen', 'Sports'],
  justice:     ['Action', 'Drama', 'Psychological', 'Thriller'],
  comingofage: ['School', 'Drama', 'Romance', 'Slice of Life', 'Shounen'],
  love:        ['Romance', 'Drama', 'Josei', 'Shoujo'],
  survival:    ['Action', 'Horror', 'Thriller', 'Psychological', 'Sci-Fi'],
  power:       ['Action', 'Fantasy', 'Psychological', 'Drama'],
  philosophy:  ['Psychological', 'Sci-Fi', 'Drama', 'Mystery'],
  fun:         ['Comedy', 'Parody', 'Slice of Life'],
};

// ─── Scoring Engine ──────────────────────────────────────────────────────────

function scoreAnime(anime: Anime, answers: QuizAnswers): number {
  let pts = 0;
  const { story, vibe, themes, length, experience, avoid } = answers;

  // ── 1. Story genre match — primary driver (up to ~80 pts) ──────────────
  story.forEach((s) => {
    const targets = STORY_SCORE_GENRES[s] ?? [];
    const matches = anime.genre.filter((g) => targets.includes(g)).length;
    pts += matches * 22;
  });

  // ── 2. Vibe match — secondary modifier ────────────────────────────────
  const boostTargets = VIBE_BOOST[vibe] ?? [];
  const penaltyTargets = VIBE_PENALIZE[vibe] ?? [];
  pts += anime.genre.filter((g) => boostTargets.includes(g)).length * 12;
  pts -= anime.genre.filter((g) => penaltyTargets.includes(g)).length * 16;

  // ── 3. Theme match ─────────────────────────────────────────────────────
  themes.forEach((t) => {
    const targets = THEME_SCORE_GENRES[t] ?? [];
    pts += anime.genre.filter((g) => targets.includes(g)).length * 8;
  });

  // ── 4. Length scoring ──────────────────────────────────────────────────
  const eps = anime.episodes;
  if (length === 'movie') {
    if (eps === 1) pts += 35;
    else if (eps <= 3) pts += 18;
    else if (eps > 12) pts -= 25;
  } else if (length === 'cour') {
    if (eps >= 10 && eps <= 16) pts += 35;
    else if (eps <= 26) pts += 15;
    else if (eps > 50) pts -= 20;
  } else if (length === 'season') {
    if (eps >= 20 && eps <= 30) pts += 35;
    else if (eps <= 52) pts += 15;
    else if (eps > 100) pts -= 15;
  } else if (length === 'multi') {
    if (eps >= 50 && eps <= 120) pts += 35;
    else if (eps >= 30) pts += 15;
    else if (eps < 20) pts -= 10;
  } else if (length === 'epic') {
    if (eps > 100) pts += 35;
    else if (eps > 50) pts += 15;
    else pts -= 15;
  }
  // 'any' → no length modifier

  // ── 5. Dealbreaker hard eliminations ──────────────────────────────────
  if (
    avoid.includes('no_violence') &&
    anime.genre.some((g) => ['Horror', 'Thriller', 'Gore'].includes(g))
  ) {
    pts -= 200;
  }
  if (
    avoid.includes('no_ecchi') &&
    anime.genre.some((g) => ['Ecchi', 'Hentai'].includes(g))
  ) {
    pts -= 200;
  }
  if (
    avoid.includes('no_comedy') &&
    anime.genre.some((g) => ['Comedy', 'Parody', 'Gag Humor'].includes(g))
  ) {
    pts -= 200;
  }
  if (avoid.includes('no_slow') && eps >= 50 && !anime.genre.includes('Action')) {
    pts -= 60;
  }

  // ── 6. Experience modifier ─────────────────────────────────────────────
  if (experience === 'new') {
    // Beginners need popular, polished gateway shows
    if (anime.rating >= 8.5) pts += 30;
    else if (anime.rating >= 8.0) pts += 15;
    else if (anime.rating < 7.5) pts -= 35;
  } else if (experience === 'casual') {
    if (anime.rating >= 8.0) pts += 15;
    else if (anime.rating < 7.0) pts -= 20;
  } else if (experience === 'veteran') {
    // Veterans: don't over-penalize niche shows, reward uniqueness
    if (anime.rating >= 9.0) pts += 10;
    // No strong penalties
  }

  // ── 7. Base quality bonus ─────────────────────────────────────────────
  if (anime.rating >= 9.0) pts += 22;
  else if (anime.rating >= 8.5) pts += 14;
  else if (anime.rating >= 8.0) pts += 8;
  else if (anime.rating >= 7.5) pts += 3;

  return pts;
}

// ─── API Strategy ────────────────────────────────────────────────────────────

async function fetchCandidates(answers: QuizAnswers): Promise<JikanAnime[]> {
  const { story, experience } = answers;

  // Collect primary genre IDs from selected story types (max 2 story picks × 2 genre IDs each)
  const genreIds = new Set<number>();
  story.slice(0, 2).forEach((s) => {
    STORY_GENRE_IDS[s]?.slice(0, 2).forEach((id) => genreIds.add(id));
  });

  const calls: Promise<JikanAnime[]>[] = [
    fetchTopAnime(25), // Always include the MAL top 25 for quality baseline
  ];

  genreIds.forEach((id) => {
    calls.push(fetchAnimeByGenre(id, 18));
  });

  // Veterans also get seasonal anime to surface less mainstream picks
  if (experience === 'veteran' || experience === 'regular') {
    calls.push(fetchSeasonalAnime(15));
  }

  const settled = await Promise.allSettled(calls);
  const all: JikanAnime[] = [];
  settled.forEach((r) => {
    if (r.status === 'fulfilled') all.push(...r.value);
  });

  // Deduplicate
  const seen = new Set<number>();
  return all.filter((a) => {
    if (seen.has(a.mal_id)) return false;
    seen.add(a.mal_id);
    return true;
  });
}

// ─── Option Component ─────────────────────────────────────────────────────────

interface OptionProps {
  emoji: string;
  label: string;
  sub?: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function OptionTile({ emoji, label, sub, selected, disabled, onClick }: OptionProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-start gap-3 group
        ${selected
          ? 'border-primary bg-primary/10 shadow-[0_0_0_1px_hsl(var(--primary)/0.4)]'
          : disabled
          ? 'border-border/30 bg-card/20 opacity-40 cursor-not-allowed'
          : 'border-border/50 bg-card/30 hover:border-primary/40 hover:bg-card/60'
        }`}
    >
      <span className="text-xl mt-0.5 shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm leading-snug ${selected ? 'text-primary' : 'text-foreground'}`}>
          {label}
        </p>
        {sub && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{sub}</p>
        )}
      </div>
      {selected && (
        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
      )}
    </button>
  );
}

// ─── Quiz Questions Config ────────────────────────────────────────────────────

interface QDef {
  id: keyof QuizAnswers;
  heading: string;
  sub?: string;
  type: 'single' | 'multi';
  maxPicks?: number;
  allowNone?: boolean; // for "skip" style questions
  options: { emoji: string; label: string; sub?: string; value: string }[];
}

const QUESTIONS: QDef[] = [
  {
    id: 'experience',
    heading: 'Where are you in your anime journey?',
    type: 'single',
    options: [
      {
        emoji: '🌱',
        value: 'new',
        label: 'Brand new',
        sub: "This is my first time exploring anime — point me to the classics",
      },
      {
        emoji: '👀',
        value: 'casual',
        label: 'Dipping in',
        sub: "I've seen a handful of popular ones — Naruto, DBZ, maybe Demon Slayer",
      },
      {
        emoji: '📺',
        value: 'regular',
        label: 'Regular viewer',
        sub: "I follow seasonal anime and always have a few shows going",
      },
      {
        emoji: '🎌',
        value: 'veteran',
        label: 'Full otaku',
        sub: "I've watched 50+ series — bring me something I might not know",
      },
    ],
  },
  {
    id: 'story',
    heading: 'What kind of story hooks you?',
    sub: 'Pick up to 2',
    type: 'multi',
    maxPicks: 2,
    options: [
      {
        emoji: '⚔️',
        value: 'fights',
        label: 'Battle & Power',
        sub: 'Epic fights, power-ups, rivalries, tournaments',
      },
      {
        emoji: '💕',
        value: 'romance',
        label: 'Love & Heartbreak',
        sub: 'Relationships, romantic tension, emotional bonds',
      },
      {
        emoji: '🔍',
        value: 'mystery',
        label: 'Mind Games',
        sub: 'Mysteries, psychological twists, cat-and-mouse',
      },
      {
        emoji: '😂',
        value: 'comedy',
        label: 'Good Vibes',
        sub: 'Comedy, slice of life, feel-good and wholesome',
      },
      {
        emoji: '🌑',
        value: 'dark',
        label: 'Dark & Gritty',
        sub: 'Intense, mature, morally complex, no easy answers',
      },
      {
        emoji: '🌍',
        value: 'fantasy',
        label: 'Epic Worlds',
        sub: 'Fantasy, adventure, world-building, magic, isekai',
      },
      {
        emoji: '🏆',
        value: 'sports',
        label: 'Competition',
        sub: 'Sports, tournaments, underdog arcs, team spirit',
      },
      {
        emoji: '🚀',
        value: 'scifi',
        label: 'Future & Tech',
        sub: 'Sci-fi, mecha, cyberpunk, space, dystopia',
      },
    ],
  },
  {
    id: 'vibe',
    heading: 'What do you want to feel while watching?',
    type: 'single',
    options: [
      {
        emoji: '🔥',
        value: 'hyped',
        label: 'Hyped and pumped up',
        sub: "I want adrenaline — action, tension, constant forward momentum",
      },
      {
        emoji: '😊',
        value: 'warm',
        label: 'Warm and happy',
        sub: "I want to smile, laugh, and feel good — nothing too heavy",
      },
      {
        emoji: '😢',
        value: 'emotional',
        label: 'Moved and emotional',
        sub: "I want to feel something real — even if it makes me cry",
      },
      {
        emoji: '🧠',
        value: 'tense',
        label: 'Tense and on-edge',
        sub: "I want to be glued to the screen, guessing what happens next",
      },
    ],
  },
  {
    id: 'length',
    heading: 'How long are you committing?',
    type: 'single',
    options: [
      {
        emoji: '🎬',
        value: 'movie',
        label: 'Movie night',
        sub: '1–3 hours — a self-contained film or special',
      },
      {
        emoji: '📺',
        value: 'cour',
        label: 'One cour',
        sub: '10–14 episodes — tight, focused, and complete',
      },
      {
        emoji: '📚',
        value: 'season',
        label: 'A full season',
        sub: '24–26 episodes — enough to really get into it',
      },
      {
        emoji: '📖',
        value: 'multi',
        label: 'Multi-season',
        sub: '50–120 episodes — I want a real story arc',
      },
      {
        emoji: '🔱',
        value: 'epic',
        label: 'The long haul',
        sub: '100+ episodes — I want something I can live in',
      },
      {
        emoji: '🎲',
        value: 'any',
        label: 'Surprise me',
        sub: "Length doesn't matter — just give me the best fit",
      },
    ],
  },
  {
    id: 'themes',
    heading: 'Which themes speak to you most?',
    sub: 'Pick up to 2',
    type: 'multi',
    maxPicks: 2,
    options: [
      {
        emoji: '🤝',
        value: 'friendship',
        label: 'Friendship & loyalty',
        sub: 'Bonds forged through hardship that can never break',
      },
      {
        emoji: '⚖️',
        value: 'justice',
        label: 'Justice & revenge',
        sub: 'Righting wrongs, fighting corruption, moral gray areas',
      },
      {
        emoji: '🌱',
        value: 'comingofage',
        label: 'Growing up',
        sub: 'Finding who you are, self-discovery, leaving childhood behind',
      },
      {
        emoji: '❤️‍🔥',
        value: 'love',
        label: 'Complicated love',
        sub: 'Messy, passionate, real relationships with real stakes',
      },
      {
        emoji: '🏃',
        value: 'survival',
        label: 'Survival',
        sub: 'Fighting against impossible odds — life and death stakes',
      },
      {
        emoji: '👑',
        value: 'power',
        label: 'Power & ambition',
        sub: 'What happens when you want everything — and the cost of getting it',
      },
      {
        emoji: '🧩',
        value: 'philosophy',
        label: 'Deep questions',
        sub: 'Existence, consciousness, what it means to be human',
      },
      {
        emoji: '😆',
        value: 'fun',
        label: 'Pure entertainment',
        sub: "No deep meaning required — I just want to have fun",
      },
    ],
  },
  {
    id: 'avoid',
    heading: 'Any hard no\'s?',
    sub: 'Select anything you want to avoid — or skip if you\'re open to everything',
    type: 'multi',
    allowNone: true,
    options: [
      {
        emoji: '⚠️',
        value: 'no_violence',
        label: 'No extreme violence or gore',
        sub: 'Keep it relatively clean in terms of graphic content',
      },
      {
        emoji: '🙅',
        value: 'no_ecchi',
        label: 'No fan service or ecchi',
        sub: 'I prefer content without gratuitous sexual elements',
      },
      {
        emoji: '😴',
        value: 'no_slow',
        label: 'No slow-burn openers',
        sub: "I need something that grabs me from episode 1",
      },
      {
        emoji: '🤡',
        value: 'no_comedy',
        label: 'No heavy comedy or silly humor',
        sub: "I prefer things played straight, not for laughs",
      },
    ],
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const DEFAULT_ANSWERS: QuizAnswers = {
  experience: '',
  story: [],
  vibe: '',
  length: '',
  themes: [],
  avoid: [],
};

export const AnimeQuiz: React.FC = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(DEFAULT_ANSWERS);
  const [phase, setPhase] = useState<'quiz' | 'loading' | 'results'>('quiz');
  const [results, setResults] = useState<Anime[]>([]);
  const [loadingMsg, setLoadingMsg] = useState('');

  const currentQ = QUESTIONS[step];

  // ── Answer handling ──────────────────────────────────────────────────────

  const setValue = (id: keyof QuizAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const toggleMulti = (id: keyof QuizAnswers, value: string, maxPicks = 99) => {
    setAnswers((prev) => {
      const current = (prev[id] as string[]) ?? [];
      if (current.includes(value)) {
        return { ...prev, [id]: current.filter((v) => v !== value) };
      }
      if (current.length < maxPicks) {
        return { ...prev, [id]: [...current, value] };
      }
      return prev;
    });
  };

  // ── Navigation ───────────────────────────────────────────────────────────

  const currentAnswer = answers[currentQ.id];
  const hasAnswer =
    currentQ.allowNone
      ? true // "avoid" question can always proceed (empty = no restrictions)
      : currentQ.type === 'single'
      ? !!currentAnswer
      : (currentAnswer as string[]).length > 0;

  const next = () => {
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      runRecommendations();
    }
  };

  const back = () => setStep((s) => s - 1);

  const reset = () => {
    setStep(0);
    setAnswers(DEFAULT_ANSWERS);
    setResults([]);
    setPhase('quiz');
  };

  // ── Recommendation Engine ─────────────────────────────────────────────────

  const runRecommendations = async () => {
    setPhase('loading');

    const msgs = [
      'Searching the anime universe...',
      'Analyzing your taste profile...',
      'Crunching 10,000+ anime...',
      'Almost there — picking the best 6...',
    ];
    let i = 0;
    setLoadingMsg(msgs[0]);
    const interval = setInterval(() => {
      i = (i + 1) % msgs.length;
      setLoadingMsg(msgs[i]);
    }, 1400);

    try {
      const candidates = await fetchCandidates(answers);
      const converted = candidates.map(convertJikanToAnime);

      const scored = converted
        .map((a) => ({ anime: a, pts: scoreAnime(a, answers) }))
        .sort((a, b) => b.pts - a.pts)
        .slice(0, 6)
        .map((x) => x.anime);

      setResults(scored);
      setPhase('results');
    } catch (err) {
      console.error(err);
      setResults([]);
      setPhase('results');
    } finally {
      clearInterval(interval);
    }
  };

  // ── Render: Loading ───────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div className="w-full max-w-2xl mx-auto rounded-2xl border border-border/50 bg-card/40 p-10 text-center space-y-5">
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
          <div className="relative flex items-center justify-center w-16 h-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-foreground">{loadingMsg}</h3>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Matching your answers against thousands of anime to find your perfect picks
        </p>
      </div>
    );
  }

  // ── Render: Results ───────────────────────────────────────────────────────

  if (phase === 'results') {
    const profileLabel = buildProfileLabel(answers);

    return (
      <div className="w-full space-y-8">
        {/* Results header */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              Your Personalized Picks
            </h2>
          </div>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Your profile: </span>
            {profileLabel}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4" />
            Retake quiz
          </Button>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground space-y-3">
            <p className="text-lg">No results matched your filters.</p>
            <p className="text-sm">Try relaxing some of your dealbreaker selections.</p>
            <Button onClick={reset} variant="secondary" className="mt-2">
              Retake Quiz
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {results.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Render: Quiz ──────────────────────────────────────────────────────────

  const progress = ((step + 1) / QUESTIONS.length) * 100;
  const selectedMulti = (currentAnswer as string[]) ?? [];

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-border/50 bg-card/40 overflow-hidden">
      {/* Progress bar */}
      <div className="px-6 pt-6 pb-4 space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            Question {step + 1} of {QUESTIONS.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Question */}
      <div className="px-6 pb-2 space-y-1">
        <h2 className="text-xl font-bold text-foreground leading-snug">
          {currentQ.heading}
        </h2>
        {currentQ.sub && (
          <p className="text-sm text-muted-foreground">{currentQ.sub}</p>
        )}
        {currentQ.type === 'multi' && currentQ.maxPicks && (
          <p className="text-xs text-primary font-medium">
            {selectedMulti.length}/{currentQ.maxPicks} selected
          </p>
        )}
      </div>

      {/* Options */}
      <div className="px-6 pb-6 pt-3">
        <div className="space-y-2">
          {currentQ.type === 'single'
            ? currentQ.options.map((opt) => (
                <OptionTile
                  key={opt.value}
                  emoji={opt.emoji}
                  label={opt.label}
                  sub={opt.sub}
                  selected={currentAnswer === opt.value}
                  onClick={() => setValue(currentQ.id, opt.value)}
                />
              ))
            : currentQ.options.map((opt) => {
                const isSelected = selectedMulti.includes(opt.value);
                const maxHit =
                  currentQ.maxPicks !== undefined &&
                  selectedMulti.length >= currentQ.maxPicks &&
                  !isSelected;

                return (
                  <OptionTile
                    key={opt.value}
                    emoji={opt.emoji}
                    label={opt.label}
                    sub={opt.sub}
                    selected={isSelected}
                    disabled={maxHit}
                    onClick={() =>
                      toggleMulti(currentQ.id, opt.value, currentQ.maxPicks)
                    }
                  />
                );
              })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={back}
            disabled={step === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            onClick={next}
            disabled={!hasAnswer}
            className="gap-2 bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            {step === QUESTIONS.length - 1 ? (
              <>
                <Sparkles className="w-4 h-4" />
                Get My Recommendations
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Profile Label ────────────────────────────────────────────────────────────

function buildProfileLabel(answers: QuizAnswers): string {
  const expMap: Record<string, string> = {
    new: 'anime newcomer',
    casual: 'casual viewer',
    regular: 'regular watcher',
    veteran: 'veteran otaku',
  };

  const storyMap: Record<string, string> = {
    fights: 'battle & power',
    romance: 'romance',
    mystery: 'mystery & psychological',
    comedy: 'comedy & slice of life',
    dark: 'dark & gritty',
    fantasy: 'fantasy & adventure',
    sports: 'sports & competition',
    scifi: 'sci-fi & mecha',
  };

  const vibeMap: Record<string, string> = {
    hyped: 'wants hype',
    warm: 'wants feel-good energy',
    emotional: 'wants emotional depth',
    tense: 'wants psychological tension',
  };

  const exp = expMap[answers.experience] ?? 'anime fan';
  const stories = answers.story.map((s) => storyMap[s]).filter(Boolean).join(' + ');
  const vibe = vibeMap[answers.vibe] ?? '';

  const parts = [exp];
  if (stories) parts.push(`into ${stories}`);
  if (vibe) parts.push(vibe);

  return parts.join(', ') + '.';
}
