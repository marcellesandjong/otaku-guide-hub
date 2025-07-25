import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { AnimeCard } from '@/components/AnimeCard';
import { animeData } from '@/data/animeData';
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

const questions: QuizQuestion[] = [
  {
    id: 'experience',
    question: 'How familiar are you with anime?',
    type: 'single',
    options: [
      { value: 'new', label: 'Complete beginner' },
      { value: 'casual', label: 'Watched a few shows' },
      { value: 'experienced', label: 'Pretty experienced' },
      { value: 'veteran', label: 'Anime veteran' }
    ]
  },
  {
    id: 'genres',
    question: 'What genres interest you most? (Select up to 3)',
    type: 'multiple',
    options: [
      { value: 'action', label: 'Action & Adventure' },
      { value: 'romance', label: 'Romance & Drama' },
      { value: 'comedy', label: 'Comedy & Slice of Life' },
      { value: 'fantasy', label: 'Fantasy & Supernatural' },
      { value: 'thriller', label: 'Thriller & Mystery' },
      { value: 'scifi', label: 'Sci-Fi & Mecha' }
    ]
  },
  {
    id: 'tone',
    question: 'What tone do you prefer?',
    type: 'single',
    options: [
      { value: 'lighthearted', label: 'Lighthearted and fun' },
      { value: 'balanced', label: 'Mix of light and serious' },
      { value: 'serious', label: 'Serious and dramatic' },
      { value: 'dark', label: 'Dark and intense' }
    ]
  },
  {
    id: 'length',
    question: 'How long of a series do you want?',
    type: 'single',
    options: [
      { value: 'movie', label: 'Movies (1-3 hours)' },
      { value: 'short', label: 'Short series (12-26 episodes)' },
      { value: 'medium', label: 'Medium series (27-100 episodes)' },
      { value: 'long', label: 'Long series (100+ episodes)' }
    ]
  },
  {
    id: 'pacing',
    question: 'What pacing do you prefer?',
    type: 'single',
    options: [
      { value: 'fast', label: 'Fast-paced with lots of action' },
      { value: 'moderate', label: 'Moderate pace with good balance' },
      { value: 'slow', label: 'Slow burn with character development' },
      { value: 'varied', label: 'Doesn\'t matter to me' }
    ]
  },
  {
    id: 'emotional',
    question: 'How much emotional depth do you want?',
    type: 'single',
    options: [
      { value: 'light', label: 'Keep it fun and light' },
      { value: 'some', label: 'Some emotional moments' },
      { value: 'deep', label: 'Deep emotional storytelling' },
      { value: 'heavy', label: 'Heavy themes and complex emotions' }
    ]
  }
];

export const AnimeQuiz: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<Anime[]>([]);

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

  const generateRecommendations = () => {
    let scored = animeData.map(anime => {
      let score = 0;
      
      // Experience level scoring
      const experience = answers.experience as string;
      if (experience === 'new') {
        // Prioritize accessible, popular anime
        if (['My Hero Academia', 'Demon Slayer', 'Your Name', 'Spirited Away'].includes(anime.title)) {
          score += 30;
        }
      }
      
      // Genre scoring
      const selectedGenres = answers.genres as string[];
      if (selectedGenres?.includes('action') && anime.genre.some(g => ['Action', 'Adventure'].includes(g))) {
        score += 25;
      }
      if (selectedGenres?.includes('romance') && anime.genre.some(g => ['Romance', 'Drama'].includes(g))) {
        score += 25;
      }
      if (selectedGenres?.includes('comedy') && anime.genre.some(g => ['Comedy'].includes(g))) {
        score += 25;
      }
      if (selectedGenres?.includes('fantasy') && anime.genre.some(g => ['Fantasy', 'Supernatural'].includes(g))) {
        score += 25;
      }
      if (selectedGenres?.includes('thriller') && anime.genre.some(g => ['Thriller', 'Psychological'].includes(g))) {
        score += 25;
      }
      
      // Length scoring
      const length = answers.length as string;
      if (length === 'movie' && anime.episodes <= 3) score += 20;
      if (length === 'short' && anime.episodes >= 12 && anime.episodes <= 50) score += 20;
      if (length === 'medium' && anime.episodes >= 27 && anime.episodes <= 100) score += 20;
      if (length === 'long' && anime.episodes > 100) score += 20;
      
      // Tone scoring
      const tone = answers.tone as string;
      if (tone === 'lighthearted' && anime.genre.includes('Comedy')) score += 15;
      if (tone === 'dark' && ['Death Note', 'Attack on Titan'].includes(anime.title)) score += 15;
      if (tone === 'serious' && anime.genre.includes('Drama')) score += 15;
      
      // Boost highly rated anime
      if (anime.rating >= 9.0) score += 10;
      if (anime.rating >= 8.5) score += 5;
      
      return { ...anime, score };
    });

    // Sort by score and take top 6
    const topRecommendations = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
    
    setRecommendations(topRecommendations);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
    setRecommendations([]);
  };

  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];
  const currentAnswer = answers[currentQuestion?.id];

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