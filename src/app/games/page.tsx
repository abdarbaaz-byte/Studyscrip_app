
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Gamepad2, Shuffle, RefreshCw, Loader2 } from "lucide-react";
import { getGames, type Game, type WordMatchPair } from "@/lib/data";

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

export default function GamesPage() {
  const [loading, setLoading] = useState(true);
  const [initialWordPairs, setInitialWordPairs] = useState<WordMatchPair[]>([]);
  
  const [words, setWords] = useState<WordItem[]>([]);
  const [meanings, setMeanings] = useState<WordItem[]>([]);
  const [selectedWord, setSelectedWord] = useState<WordItem | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<WordItem | null>(null);
  const [score, setScore] = useState(0);
  const [incorrectShake, setIncorrectShake] = useState(false);

  useEffect(() => {
    async function loadGameData() {
        setLoading(true);
        const games = await getGames();
        const wordMatchGame = games.find(g => g.type === 'WordMatch');
        if (wordMatchGame) {
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

    setWords(shuffleArray(wordItems));
    setMeanings(shuffleArray(meaningItems));
    setSelectedWord(null);
    setSelectedMeaning(null);
    setScore(0);
  };

  useEffect(() => {
    setupGame();
  }, [initialWordPairs]);

  const handleWordSelect = (word: WordItem) => {
    if (word.matched) return;
    setSelectedWord(word);
  };

  const handleMeaningSelect = (meaning: WordItem) => {
    if (meaning.matched) return;
    setSelectedMeaning(meaning);
  };
  
  useEffect(() => {
    if (selectedWord && selectedMeaning) {
      if (selectedWord.pairId === selectedMeaning.pairId) {
        // Correct match
        setWords(prevWords =>
          prevWords.map(w => (w.id === selectedWord.id ? { ...w, matched: true } : w))
        );
        setMeanings(prevMeanings =>
          prevMeanings.map(m => (m.id === selectedMeaning.id ? { ...m, matched: true } : m))
        );
        setScore(prev => prev + 1);
        setSelectedWord(null);
        setSelectedMeaning(null);
      } else {
        // Incorrect match
        setIncorrectShake(true);
        setTimeout(() => {
          setSelectedWord(null);
          setSelectedMeaning(null);
          setIncorrectShake(false);
        }, 500);
      }
    }
  }, [selectedWord, selectedMeaning]);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  const allMatched = initialWordPairs.length > 0 && score === initialWordPairs.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Gamepad2 className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl md:text-4xl">Word Match Challenge</CardTitle>
          <CardDescription className="text-md md:text-lg text-muted-foreground pt-2">
            Match the English words with their correct Hindi meanings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {initialWordPairs.length === 0 ? (
             <div className="text-center py-16 text-muted-foreground">
                <p>No games available at the moment. Please check back later.</p>
             </div>
          ) : allMatched ? (
            <div className="text-center py-16">
              <Check className="h-20 w-20 text-green-500 mx-auto animate-bounce" />
              <h2 className="text-3xl font-bold mt-4">Congratulations! You Won!</h2>
              <p className="text-muted-foreground mt-2">You've matched all the words correctly.</p>
              <Button onClick={setupGame} className="mt-8">
                <RefreshCw className="mr-2 h-4 w-4" />
                Play Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:gap-8">
              {/* Words Column */}
              <div className="space-y-3">
                {words.map(word => (
                  <Button
                    key={word.id}
                    variant="outline"
                    onClick={() => handleWordSelect(word)}
                    disabled={word.matched}
                    className={cn(
                      "w-full justify-center text-lg h-14 p-2 transition-all duration-300",
                      selectedWord?.id === word.id && "ring-2 ring-primary scale-105",
                      word.matched && "bg-green-100 border-green-500 text-green-800 opacity-100 cursor-not-allowed",
                      incorrectShake && selectedWord?.id === word.id && "bg-red-100 border-red-500 animate-shake"
                    )}
                  >
                    {word.text}
                  </Button>
                ))}
              </div>

              {/* Meanings Column */}
              <div className="space-y-3">
                {meanings.map(meaning => (
                  <Button
                    key={meaning.id}
                    variant="outline"
                    onClick={() => handleMeaningSelect(meaning)}
                    disabled={meaning.matched}
                    className={cn(
                      "w-full justify-center text-lg h-14 p-2 transition-all duration-300",
                      selectedMeaning?.id === meaning.id && "ring-2 ring-primary scale-105",
                       meaning.matched && "bg-green-100 border-green-500 text-green-800 opacity-100 cursor-not-allowed",
                       incorrectShake && selectedMeaning?.id === meaning.id && "bg-red-100 border-red-500 animate-shake"
                    )}
                  >
                    {meaning.text}
                  </Button>
                ))}
              </div>
            </div>
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
