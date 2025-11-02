
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Gamepad2, Loader2, CheckCircle, XCircle, RefreshCw, ArrowRight } from "lucide-react";
import { getGames, type SentenceScrambleItem } from "@/lib/data";

// Helper function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  let currentIndex = array.length, randomIndex;
  const newArray = [...array];
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};

export default function SentenceScramblePage() {
  const [loading, setLoading] = useState(true);
  const [allSentences, setAllSentences] = useState<SentenceScrambleItem[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [assembledSentence, setAssembledSentence] = useState<string[]>([]);
  const [showResult, setShowResult] = useState<'' | 'correct' | 'incorrect'>('');
  const [score, setScore] = useState(0);

  const setupLevel = useCallback((index: number) => {
    if (index >= allSentences.length) {
      // Game over
      return;
    }
    const currentSentence = allSentences[index].sentence;
    const words = currentSentence.split(' ');
    
    let shuffled = shuffleArray(words);
    // Ensure shuffled is not the same as original
    while(shuffled.join(' ') === currentSentence) {
        shuffled = shuffleArray(words);
    }

    setShuffledWords(shuffled);
    setAssembledSentence([]);
    setShowResult('');
  }, [allSentences]);

  useEffect(() => {
    async function loadGameData() {
      setLoading(true);
      const games = await getGames();
      const scrambleGame = games.find(g => g.type === 'SentenceScramble');
      if (scrambleGame && scrambleGame.sentences) {
        setAllSentences(scrambleGame.sentences);
      }
      setLoading(false);
    }
    loadGameData();
  }, []);
  
  useEffect(() => {
    if (allSentences.length > 0) {
      setupLevel(currentSentenceIndex);
    }
  }, [allSentences, currentSentenceIndex, setupLevel]);

  const handleWordClick = (word: string, index: number) => {
    setShuffledWords(prev => prev.filter((_, i) => i !== index));
    setAssembledSentence(prev => [...prev, word]);
  };
  
  const handleAssembledWordClick = (word: string, index: number) => {
     setAssembledSentence(prev => prev.filter((_, i) => i !== index));
     setShuffledWords(prev => [...prev, word]);
  };
  
  const checkAnswer = () => {
    const originalSentence = allSentences[currentSentenceIndex].sentence;
    const userAnswer = assembledSentence.join(' ');

    if (userAnswer === originalSentence) {
      setShowResult('correct');
      setScore(prev => prev + 1);
      setTimeout(() => {
        setCurrentSentenceIndex(prev => prev + 1);
      }, 1500);
    } else {
      setShowResult('incorrect');
      setTimeout(() => {
        setShowResult('');
      }, 1500);
    }
  };

  const resetGame = () => {
    setCurrentSentenceIndex(0);
    setScore(0);
    setupLevel(0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const isGameOver = currentSentenceIndex >= allSentences.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto shadow-lg overflow-hidden">
        <CardHeader className="text-center bg-secondary p-6">
          <div className="flex justify-center mb-4">
            <Gamepad2 className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl md:text-4xl">Sentence Scramble</CardTitle>
          <CardDescription className="text-md md:text-lg text-muted-foreground pt-2">
            Arrange the words to form a correct sentence.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {allSentences.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground">No sentences found for this game.</p>
          ) : isGameOver ? (
            <div className="text-center py-10">
                <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
                <p className="text-xl text-muted-foreground mb-6">Your final score is:</p>
                <p className="text-6xl font-bold text-primary mb-8">{score} / {allSentences.length}</p>
                <Button onClick={resetGame}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Play Again
                </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Level {currentSentenceIndex + 1} of {allSentences.length}</p>
                <p className="font-semibold">Score: {score}</p>
              </div>

              <div className="p-6 min-h-[80px] border-2 border-dashed rounded-lg flex flex-wrap gap-3 items-center justify-center bg-background">
                {assembledSentence.map((word, index) => (
                    <Button key={index} variant="secondary" className="text-lg cursor-pointer" onClick={() => handleAssembledWordClick(word, index)}>
                        {word}
                    </Button>
                ))}
                {assembledSentence.length === 0 && <p className="text-muted-foreground">Click on the words below to build the sentence here.</p>}
              </div>

              <div className="p-6 min-h-[80px] rounded-lg flex flex-wrap gap-3 items-center justify-center bg-secondary">
                 {shuffledWords.map((word, index) => (
                    <Button key={index} className="text-lg cursor-pointer" onClick={() => handleWordClick(word, index)}>
                        {word}
                    </Button>
                ))}
              </div>

              <div className="text-center">
                <Button onClick={checkAnswer} size="lg" disabled={!!showResult}>
                    {showResult === 'correct' && <CheckCircle className="mr-2 h-5 w-5"/>}
                    {showResult === 'incorrect' && <XCircle className="mr-2 h-5 w-5"/>}
                    {showResult === '' && <CheckCircle className="mr-2 h-5 w-5"/>}
                    Check Answer
                </Button>
              </div>

              {showResult && (
                <div className={cn("text-center text-xl font-bold animate-pulse", showResult === 'correct' ? 'text-green-600' : 'text-red-600')}>
                    {showResult === 'correct' ? 'Correct!' : 'Try Again!'}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
