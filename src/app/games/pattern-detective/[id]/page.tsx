
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, notFound } from "next/navigation";
import { getGames, type Game, type PatternDetectiveItem } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Trophy, ArrowRight, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function PatternDetectivePage() {
  const params = useParams();
  const gameId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<Game | null>(null);
  const [patterns, setPatterns] = useState<PatternDetectiveItem[]>([]);
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const loadGame = useCallback(async () => {
    if (!gameId) return;
    setLoading(true);
    const allGames = await getGames();
    const foundGame = allGames.find(g => g.id === gameId && g.type === 'PatternDetective');
    if (foundGame && foundGame.patterns) {
      setGame(foundGame);
      setPatterns(shuffleArray(foundGame.patterns)); // Shuffle the patterns for variety
    } else {
      notFound();
    }
    setLoading(false);
  }, [gameId]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);
  
  useEffect(() => {
    if (patterns.length > 0) {
      const currentPattern = patterns[currentPatternIndex];
      if (currentPattern) {
        setShuffledOptions(shuffleArray(currentPattern.options));
        setSelectedAnswer(null);
        setIsCorrect(null);
      }
    }
  }, [patterns, currentPatternIndex]);


  const handleAnswerSelect = (option: string) => {
    if (selectedAnswer !== null) return; // Prevent changing answer

    setSelectedAnswer(option);
    const isAnswerCorrect = option === patterns[currentPatternIndex].correctAnswer;
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentPatternIndex < patterns.length) {
      setCurrentPatternIndex(i => i + 1);
    }
  };

  const resetGame = () => {
    setPatterns(shuffleArray(patterns));
    setCurrentPatternIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!game || patterns.length === 0) {
      return (
         <div className="flex justify-center items-center h-screen p-8">
            <Card className="text-center">
                <CardHeader>
                    <CardTitle>Game Not Found or Empty</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This game topic could not be found or has no patterns to solve.</p>
                </CardContent>
            </Card>
        </div>
      );
  }

  const isLastQuestion = currentPatternIndex === patterns.length - 1;
  const isGameOver = currentPatternIndex >= patterns.length;

  if (isGameOver) {
      return (
         <div className="w-full h-screen flex items-center justify-center bg-secondary p-4">
            <Card className="max-w-md text-center p-8">
               <Trophy className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
                <h2 className="text-3xl font-bold">Game Over!</h2>
                <p className="text-xl mt-2 mb-6">Your final score: <span className="font-bold text-primary">{score} / {patterns.length}</span></p>
                <Button onClick={resetGame}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Play Again
                </Button>
            </Card>
        </div>
      )
  }

  const currentPattern = patterns[currentPatternIndex];

  return (
    <div className="w-full h-screen bg-secondary overflow-hidden relative flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl text-center">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">{game.title}</CardTitle>
                <p className="text-sm text-muted-foreground pt-2">Level {currentPatternIndex + 1} of {patterns.length} | Score: {score}</p>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Sequence Display */}
                <div className="p-6 bg-background rounded-lg shadow-inner">
                    <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Find the next item in the sequence:</h3>
                    <div className="flex justify-center items-center gap-4 text-2xl md:text-4xl font-bold">
                        {currentPattern.sequence.map((item, index) => (
                            <span key={index}>{item}</span>
                        ))}
                        <span className="text-primary">?</span>
                    </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-3 gap-4">
                    {shuffledOptions.map((option, index) => {
                        const isSelected = selectedAnswer === option;
                        const isTheCorrectAnswer = option === currentPattern.correctAnswer;

                        return (
                            <Button
                                key={index}
                                onClick={() => handleAnswerSelect(option)}
                                disabled={selectedAnswer !== null}
                                className={cn(
                                    "h-20 text-2xl font-bold transition-all duration-300",
                                    selectedAnswer === null && "hover:scale-105",
                                    isSelected && isCorrect && "bg-green-600 hover:bg-green-600 scale-110",
                                    isSelected && !isCorrect && "bg-red-600 hover:bg-red-600 animate-shake",
                                    selectedAnswer !== null && !isSelected && isTheCorrectAnswer && "bg-green-600/50",
                                )}
                            >
                                {option}
                            </Button>
                        )
                    })}
                </div>

                {/* Feedback and Next Button */}
                <div className="min-h-[100px] flex flex-col items-center justify-center">
                    {selectedAnswer !== null && (
                        <div className="w-full text-center space-y-4">
                            <div className="flex items-center justify-center text-xl font-semibold">
                                {isCorrect ? (
                                    <span className="text-green-600 flex items-center gap-2"><Lightbulb /> Correct!</span>
                                ) : (
                                    <span className="text-red-600">Not quite! The correct answer was {currentPattern.correctAnswer}.</span>
                                )}
                            </div>

                            {currentPattern.explanation && (
                                <div className="p-3 bg-blue-100/50 text-blue-800 rounded-lg text-sm text-left">
                                    <h4 className="font-bold">Explanation:</h4>
                                    <p>{currentPattern.explanation}</p>
                                </div>
                            )}

                            <Button onClick={handleNext} className="animate-pulse">
                                {isLastQuestion ? 'Finish Game' : 'Next Question'}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
      <style jsx>{`
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
}
