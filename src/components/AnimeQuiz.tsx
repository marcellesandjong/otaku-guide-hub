import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { AnimeCard } from '@/components/AnimeCard';
import { fetchTopAnime, searchAnime, fetchAnimeByGenre, convertJikanToAnime, genreMapping } from '@/services/jikanApi';
import type { Anime } from '@/data/animeData';

interface QuizQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple';
  options: { value: string; label: string }[];
}

interface QuizAnswers {
  [key: string]: string | string[];
}

interface JikanAnime {
  mal_id: number;
  title: string;
  score: number;
  year?: number;
  genres: Array<{ name: string }>;
  synopsis: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  episodes: number;
  status: string;
}

const questions: QuizQuestion[] = [
  {
    id: 'experience',
    question: 'How familiar are you with anime?',
    type: 'single',
    options: [
      { value: 'new', label: 'Complete beginner - I\'ve never watched anime' },
      { value: 'casual', label: 'Casual - I\'ve watched a few popular shows' },
      { value: 'experienced', label: 'Experienced - I watch anime regularly' },
      { value: 'veteran', label: 'Veteran - I\'ve seen hundreds of series' }
    ]
  },
  {
    id: 'genres',
    question: 'What genres interest you most? (Select up to 3)',
    type: 'multiple',
    options: [
      { value: 'action', label: '⚔️ Action & Adventure' },
      { value: 'romance', label: '💕 Romance & Drama' },
      { value: 'comedy', label: '😂 Comedy & Slice of Life' },
      { value: 'fantasy', label: '🔮 Fantasy & Supernatural' },
      { value: 'thriller', label: '🔍 Thriller & Mystery' },
      { value: 'scifi', label: '🚀 Sci-Fi & Mecha' },
      { value: 'sports', label: '🏃 Sports & Competition' }
    ]
  },
  {
    id: 'tone',
    question: 'What tone do you prefer?',
    type: 'single',
    options: [
      { value: 'lighthearted', label: '😊 Lighthearted and fun' },
      { value: 'balanced', label: '⚖️ Mix of light and serious moments' },
      { value: 'serious', label: '😐 Serious and dramatic' },
      { value: 'dark', label: '🌑 Dark and intense' }
    ]
  },
  {
    id: 'length',
    question: 'How long of a series do you want?',
    type: 'single',
    options: [
      { value: 'movie', label: '🎬 Movies (1-3 hours total)' },
      { value: 'short', label: '📺 Short series (12-26 episodes)' },
      { value: 'medium', label: '📚 Medium series (27-100 episodes)' },
      { value: 'long', label: '📖 Long series (100+ episodes)' },
      { value: 'any', label: '🤷 Length doesn\'t matter to me' }
    ]
  },
  {
    id: 'pacing',
    question: 'What pacing do you prefer?',
    type: 'single',
    options: [
      { value: 'fast', label: '⚡ Fast-paced with lots of action' },
      { value: 'moderate', label: '🚶 Moderate pace with good balance' },
      { value: 'slow', label: '🐌 Slow burn with character development' },
      { value: 'varied', label: '🎭 Mix of different paces' }
    ]
  },
  {
    id: 'emotional',
    question: 'How much emotional depth do you want?',
    type: 'single',
    options: [
      { value: 'light', label: '🌈 Keep it fun and light' },
      { value: 'some', label: '🎭 Some emotional moments are good' },
      { value: 'deep', label: '💔 Deep emotional storytelling' },
      { value: 'heavy', label: '😭 Heavy themes and complex emotions' }
    ]
  }
];

export const AnimeQuiz: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      generateRecommendations();
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Get diverse anime from API based on user preferences
      const selectedGenres = answers.genres as string[];
      const experience = answers.experience as string;
      
      let apiResults: any[] = [];
      
      if (selectedGenres && selectedGenres.length > 0) {
        // Fetch anime based on selected genres
        for (const genre of selectedGenres.slice(0, 2)) { // Limit to 2 genres for API calls
          let genreId: number | undefined;
          
          // Map our quiz genres to Jikan API genre IDs
          switch (genre) {
            case 'action':
              genreId = genreMapping['Action'];
              break;
            case 'romance':
              genreId = genreMapping['Romance'];
              break;
            case 'comedy':
              genreId = genreMapping['Comedy'];
              break;
            case 'fantasy':
              genreId = genreMapping['Fantasy'];
              break;
            case 'thriller':
              genreId = genreMapping['Thriller'];
              break;
            case 'scifi':
              genreId = genreMapping['Sci-Fi'];
              break;
            case 'sports':
              genreId = genreMapping['Sports'];
              break;
          }
          
          if (genreId) {
            const genreResults = await fetchAnimeByGenre(genreId, 12);
            apiResults.push(...genreResults);
          }
        }
      }
      
      // If no genres selected or need more results, get top anime
      if (apiResults.length < 20) {
        const topResults = await fetchTopAnime(25);
        apiResults.push(...topResults);
      }
      
      // Remove duplicates
      const uniqueResults = apiResults.filter((anime, index, self) => 
        index === self.findIndex((a) => a.mal_id === anime.mal_id)
      );
      
      // Convert to our format and score them
      const convertedAnime = uniqueResults.map(anime => convertJikanToAnime(anime));
      
      // Score based on user preferences
      let scored = convertedAnime.map(anime => {
        let score = 0;
        
        // Experience level scoring
        if (experience === 'new') {
          // Boost beginner-friendly anime
          const beginnerFriendly = ['Attack on Titan', 'Demon Slayer', 'My Hero Academia', 'Your Name', 'Spirited Away', 'Death Note', 'Fullmetal Alchemist'];
          if (beginnerFriendly.some(title => anime.title.toLowerCase().includes(title.toLowerCase()))) {
            score += 40;
          }
          // Prefer shorter series for beginners
          if (anime.episodes <= 50) score += 20;
        } else if (experience === 'veteran') {
          // Veterans might appreciate more complex or niche anime
          if (anime.episodes > 100) score += 10;
          if (anime.rating >= 8.5) score += 15;
        }
        
        // Genre scoring - much more precise
        const selectedGenres = answers.genres as string[];
        if (selectedGenres) {
          selectedGenres.forEach(userGenre => {
            switch (userGenre) {
              case 'action':
                if (anime.genre.some(g => ['Action', 'Adventure', 'Military', 'Martial Arts'].includes(g))) {
                  score += 30;
                }
                break;
              case 'romance':
                if (anime.genre.some(g => ['Romance', 'Drama', 'Josei', 'Shoujo'].includes(g))) {
                  score += 30;
                }
                break;
              case 'comedy':
                if (anime.genre.some(g => ['Comedy', 'Slice of Life', 'Parody', 'Gag Humor'].includes(g))) {
                  score += 30;
                }
                break;
              case 'fantasy':
                if (anime.genre.some(g => ['Fantasy', 'Supernatural', 'Magic', 'Mythology'].includes(g))) {
                  score += 30;
                }
                break;
              case 'thriller':
                if (anime.genre.some(g => ['Thriller', 'Mystery', 'Psychological', 'Suspense'].includes(g))) {
                  score += 30;
                }
                break;
              case 'scifi':
                if (anime.genre.some(g => ['Sci-Fi', 'Mecha', 'Space', 'Cyberpunk'].includes(g))) {
                  score += 30;
                }
                break;
              case 'sports':
                if (anime.genre.some(g => ['Sports', 'Competition', 'Team Sports'].includes(g))) {
                  score += 30;
                }
                break;
            }
          });
        }
        
        // Length scoring
        const length = answers.length as string;
        switch (length) {
          case 'movie':
            if (anime.episodes <= 3) score += 25;
            break;
          case 'short':
            if (anime.episodes >= 12 && anime.episodes <= 26) score += 25;
            break;
          case 'medium':
            if (anime.episodes >= 27 && anime.episodes <= 100) score += 25;
            break;
          case 'long':
            if (anime.episodes > 100) score += 25;
            break;
          case 'any':
            score += 10; // Small boost for flexibility
            break;
        }
        
        // Tone scoring
        const tone = answers.tone as string;
        switch (tone) {
          case 'lighthearted':
            if (anime.genre.some(g => ['Comedy', 'Slice of Life', 'Romance'].includes(g))) {
              score += 20;
            }
            break;
          case 'dark':
            if (anime.genre.some(g => ['Thriller', 'Horror', 'Psychological'].includes(g))) {
              score += 20;
            }
            break;
          case 'serious':
            if (anime.genre.some(g => ['Drama', 'Historical', 'Military'].includes(g))) {
              score += 20;
            }
            break;
        }
        
        // Emotional depth scoring
        const emotional = answers.emotional as string;
        switch (emotional) {
          case 'light':
            if (anime.genre.some(g => ['Comedy', 'Slice of Life'].includes(g))) {
              score += 15;
            }
            break;
          case 'heavy':
            if (anime.genre.some(g => ['Drama', 'Tragedy', 'Psychological'].includes(g))) {
              score += 15;
            }
            break;
        }
        
        // Boost highly rated anime
        if (anime.rating >= 9.0) score += 15;
        else if (anime.rating >= 8.5) score += 10;
        else if (anime.rating >= 8.0) score += 5;
        
        return { ...anime, score };
      });
      
      // Sort by score and take top 6
      const topRecommendations = scored
        .sort((a, b) => (b as any).score - (a as any).score)
        .slice(0, 6);
      
      setRecommendations(topRecommendations);
      setShowResults(true);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Fallback to some default recommendations
      setRecommendations([]);
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
    setRecommendations([]);
    setLoading(false);
  };

  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];
  const currentAnswer = answers[currentQuestion?.id];

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <h3 className="text-xl font-semibold text-foreground">Generating Your Perfect Recommendations...</h3>
            <p className="text-muted-foreground">Analyzing your preferences and finding the best anime for you</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-accent" />
              <h2 className="text-3xl font-bold text-foreground">Your Personalized Recommendations</h2>
            </div>
            <p className="text-muted-foreground text-lg">
              Based on your preferences, here are the perfect anime for you!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {recommendations.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
          
          <div className="text-center">
            <Button onClick={resetQuiz} variant="outline" size="lg">
              Take Quiz Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Question {currentStep + 1} of {questions.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.type === 'single' ? (
              // Single choice
              currentQuestion.options.map((option) => (
                <Button
                  key={option.value}
                  variant={currentAnswer === option.value ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto p-4"
                  onClick={() => handleAnswer(currentQuestion.id, option.value)}
                >
                  {option.label}
                </Button>
              ))
            ) : (
              // Multiple choice
              currentQuestion.options.map((option) => {
                const selectedValues = (currentAnswer as string[]) || [];
                const isSelected = selectedValues.includes(option.value);
                const canSelect = selectedValues.length < 3 || isSelected;
                
                return (
                  <Button
                    key={option.value}
                    variant={isSelected ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto p-4"
                    disabled={!canSelect}
                    onClick={() => {
                      const current = selectedValues;
                      if (isSelected) {
                        handleAnswer(currentQuestion.id, current.filter(v => v !== option.value));
                      } else if (current.length < 3) {
                        handleAnswer(currentQuestion.id, [...current, option.value]);
                      }
                    }}
                  >
                    {option.label}
                    {currentQuestion.type === 'multiple' && selectedValues.length > 0 && (
                      <span className="ml-auto text-sm text-muted-foreground">
                        {selectedValues.length}/3
                      </span>
                    )}
                  </Button>
                );
              })
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)}
            className="flex items-center gap-2"
          >
            {currentStep === questions.length - 1 ? 'Get Recommendations' : 'Next'}
            {currentStep < questions.length - 1 && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};