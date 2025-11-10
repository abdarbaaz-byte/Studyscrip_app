

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Loader2, ArrowRight, Puzzle, AlignJustify, Orbit, Search } from "lucide-react";
import { getGames, type Game } from "@/lib/data";

const gameIcons: { [key: string]: React.ElementType } = {
  WordMatch: Puzzle,
  SentenceScramble: AlignJustify,
  MathRunner: Orbit,
  PatternDetective: Search,
  Default: Gamepad2,
};

const gameLinks: { [key: string]: string } = {
  WordMatch: "/games/word-match",
  SentenceScramble: "/games/sentence-scramble",
  MathRunner: "/games/math-runner",
  PatternDetective: "/games/pattern-detective",
};

export default function GamesLobbyPage() {
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    async function loadGameData() {
      setLoading(true);
      const allGames = await getGames();
      setGames(allGames);
      setLoading(false);
    }
    loadGameData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const renderGameCard = (game: Game) => {
    const Icon = gameIcons[game.type] || gameIcons.Default;
    let link = gameLinks[game.type];
    if (!link) return null;
    
    // For games with topics, the link should be dynamic
    if(game.type === 'WordMatch' || game.type === 'MathRunner' || game.type === 'PatternDetective') {
        link = `${link}/${game.id}`;
    }

    return (
      <Card key={game.id} className="hover:shadow-md transition-shadow flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Icon className="h-10 w-10 text-primary" />
            <CardTitle className="font-headline">{game.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground h-10">
            {game.description}
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={link}>
              Play Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const wordMatchGames = games.filter(g => g.type === 'WordMatch');
  const sentenceScrambleGames = games.filter(g => g.type === 'SentenceScramble');
  const mathRunnerGames = games.filter(g => g.type === 'MathRunner');
  const patternDetectiveGames = games.filter(g => g.type === 'PatternDetective');

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto shadow-lg overflow-hidden bg-gradient-to-br from-secondary to-background">
        <CardHeader className="text-center bg-background/50 p-6">
          <div className="flex justify-center mb-4">
            <Gamepad2 className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl md:text-4xl">Games Arcade</CardTitle>
          <CardDescription className="text-md md:text-lg text-muted-foreground pt-2">
            Learn while having fun with these educational games!
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-12">
          {games.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>No games available at the moment. Please check back later.</p>
            </div>
          ) : (
            <>
               {patternDetectiveGames.length > 0 && (
                <section>
                  <h2 className="font-headline text-2xl font-bold mb-4">Pattern Detective</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {patternDetectiveGames.map(renderGameCard)}
                  </div>
                </section>
              )}

               {mathRunnerGames.length > 0 && (
                <section>
                  <h2 className="font-headline text-2xl font-bold mb-4">Math Runner</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mathRunnerGames.map(renderGameCard)}
                  </div>
                </section>
              )}

              {wordMatchGames.length > 0 && (
                <section>
                  <h2 className="font-headline text-2xl font-bold mb-4">Word Match Games</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {wordMatchGames.map(renderGameCard)}
                  </div>
                </section>
              )}

              {sentenceScrambleGames.length > 0 && (
                <section>
                  <h2 className="font-headline text-2xl font-bold mb-4">Sentence Scramble</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sentenceScrambleGames.map(renderGameCard)}
                  </div>
                </section>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
