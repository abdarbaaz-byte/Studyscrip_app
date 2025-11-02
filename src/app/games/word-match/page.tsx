
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Gamepad2, RefreshCw, Loader2, Timer, Trophy } from "lucide-react";
import { getGames, type Game, type WordMatchPair } from "@/lib/data";
import { Progress } from "@/components/ui/progress";

// Helper function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

type WordItem = {
  id: string;
  text: string;
  type: 'word' | 'meaning';
  pairId: string;
  matched: boolean;
};

export default function WordMatchPage() {
  const [loading, setLoading] = useState(true);
  const [initialWordPairs, setInitialWordPairs] = useState<WordMatchPair[]>([]);
  
  const [gameItems, setGameItems] = useState<WordItem[]>([]);
  const [firstSelection, setFirstSelection] = useState<WordItem | null>(null);
  const [secondSelection, setSecondSelection] = useState<WordItem | null>(null);
  const [score, setScore] = useState(0);
  const [incorrectShake, setIncorrectShake] = useState(false);

  // Timer state
  const [time, setTime] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadGameData() {
        setLoading(true);
        const games = await getGames();
        const wordMatchGame = games.find(g => g.type === 'WordMatch');
        if (wordMatchGame && wordMatchGame.pairs) {
            setInitialWordPairs(wordMatchGame.pairs);
        }
        setLoading(false);
    }
    loadGameData();
  }, []);

  const setupGame = () => {
    if (initialWordPairs.length === 0) return;
    
    const wordItems: WordItem[] = initialWordPairs.map((pair) => ({
      id: `word-${pair.id}`,
      text: pair.word,
      type: 'word',
      pairId: pair.id,
      matched: false,
    }));
    const meaningItems: WordItem[] = initialWordPairs.map((pair) => ({
      id: `meaning-${pair.id}`,
      text: pair.meaning,
      type: 'meaning',
      pairId: pair.id,
      matched: false,
    }));

    setGameItems(shuffleArray([...wordItems, ...meaningItems]));
    setFirstSelection(null);
    setSecondSelection(null);
    setScore(0);
    setTime(0);
    setIsGameActive(true);
  };

  useEffect(() => {
    setupGame();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialWordPairs]);

  useEffect(() => {
    if (isGameActive) {
      timerRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameActive]);

  const handleItemSelect = (item: WordItem) => {
    if (item.matched || secondSelection) return; // Prevent selection if already matched or 2 items are selected

    if (!firstSelection) {
      setFirstSelection(item);
    } else if (firstSelection.id !== item.id) {
      setSecondSelection(item);
    }
  };
  
  useEffect(() => {
    if (firstSelection && secondSelection) {
      if (firstSelection.pairId === secondSelection.pairId && firstSelection.type !== secondSelection.type) {
        // Correct match
        setGameItems(prevItems =>
          prevItems.map(item =>
            item.pairId === firstSelection.pairId ? { ...item, matched: true } : item
          )
        );
        setScore(prev => prev + 1);
        setFirstSelection(null);
        setSecondSelection(null);
      } else {
        // Incorrect match
        setIncorrectShake(true);
        setTimeout(() => {
          setFirstSelection(null);
          setSecondSelection(null);
          setIncorrectShake(false);
        }, 500);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstSelection, secondSelection]);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  const allMatched = initialWordPairs.length > 0 && score === initialWordPairs.length;
  if(allMatched && isGameActive) {
    setIsGameActive(false);
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto shadow-lg overflow-hidden bg-gradient-to-br from-secondary to-background">
        <CardHeader className="text-center bg-background/50 p-6">
          <div className="flex justify-center mb-4">
            <Gamepad2 className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl md:text-4xl">Word Match Challenge</CardTitle>
          <CardDescription className="text-md md:text-lg text-muted-foreground pt-2">
            Match the English words with their correct Hindi meanings as fast as you can!
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {initialWordPairs.length === 0 ? (
             <div className="text-center py-16 text-muted-foreground">
                <p>No games available at the moment. Please check back later.</p>
             </div>
          ) : allMatched ? (
            <div className="text-center py-16 flex flex-col items-center">
              <Trophy className="h-24 w-24 text-yellow-500" />
              <h2 className="text-4xl font-bold mt-4">Congratulations!</h2>
              <p className="text-muted-foreground mt-2 text-xl">You've matched all the words correctly.</p>
               <div className="mt-6 text-2xl font-mono p-4 bg-primary/10 text-primary rounded-lg flex items-center gap-2">
                  <Timer className="h-6 w-6"/>
                  Your Time: {formatTime(time)}
               </div>
              <Button onClick={setupGame} className="mt-8" size="lg">
                <RefreshCw className="mr-2 h-5 w-5" />
                Play Again
              </Button>
            </div>
          ) : (
            <>
                <div className="mb-6 flex justify-between items-center bg-background p-4 rounded-lg shadow-inner">
                    <div className="w-1/3">
                        <Progress value={(score / initialWordPairs.length) * 100} className="h-3"/>
                         <p className="text-sm text-center mt-1 text-muted-foreground">Progress</p>
                    </div>
                    <div className="text-xl font-bold text-primary font-mono text-center">Score: {score}</div>
                    <div className="text-xl font-bold text-primary font-mono flex items-center gap-2">
                        <Timer className="h-6 w-6"/> {formatTime(time)}
                    </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    {gameItems.map(item => (
                        <Button
                            key={item.id}
                            variant="outline"
                            onClick={() => handleItemSelect(item)}
                            disabled={item.matched || !!secondSelection}
                            className={cn(
                            "w-full justify-center text-lg h-20 p-2 transition-all duration-300 transform",
                            "border-2 bg-background shadow-md",
                            (firstSelection?.id === item.id || secondSelection?.id === item.id) && "ring-4 ring-primary ring-offset-2 scale-105 z-10",
                            item.matched && "bg-green-100 border-green-500 text-green-800 opacity-60 cursor-not-allowed",
                            incorrectShake && (firstSelection?.id === item.id || secondSelection?.id === item.id) && "bg-red-100 border-red-500 animate-shake"
                            )}
                        >
                            {item.text}
                            {item.matched && <Check className="ml-2 h-5 w-5" />}
                        </Button>
                    ))}
                </div>

                 <div className="mt-8 flex justify-center">
                    <Button variant="outline" onClick={setupGame}>
                        <RefreshCw className="mr-2 h-4 w-4"/> Restart Game
                    </Button>
                 </div>
            </>
          )}
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
