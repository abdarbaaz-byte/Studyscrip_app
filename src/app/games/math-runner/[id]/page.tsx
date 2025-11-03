
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, notFound } from "next/navigation";
import { getGames, type Game, type MathProblem } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const PLAYER_POSITION_CLASSES = ["left-4", "left-1/2 -translate-x-1/2", "right-4"];

export default function MathRunnerPage() {
  const params = useParams();
  const gameId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<Game | null>(null);
  const [problems, setProblems] = useState<MathProblem[]>([]);
  
  const [gameState, setGameState] = useState<"ready" | "playing" | "over">("ready");
  const [score, setScore] = useState(0);
  const [playerPosition, setPlayerPosition] = useState(1); // 0: left, 1: center, 2: right
  const [obstacles, setObstacles] = useState<any[]>([]);

  const loadGame = useCallback(async () => {
    if (!gameId) return;
    setLoading(true);
    const allGames = await getGames();
    const foundGame = allGames.find(g => g.id === gameId && g.type === 'MathRunner');
    if (foundGame && foundGame.problems) {
      setGame(foundGame);
      setProblems(foundGame.problems);
    } else {
      notFound();
    }
    setLoading(false);
  }, [gameId]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  const generateObstacle = useCallback(() => {
    if (problems.length === 0) return null;

    const randomProblem = problems[Math.floor(Math.random() * problems.length)];
    const correctAnswer = eval(randomProblem.question);
    
    const options = [correctAnswer];
    while (options.length < 3) {
      const wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) - 5;
      if (wrongAnswer !== correctAnswer && !options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }
    
    const shuffledOptions = options.sort(() => Math.random() - 0.5);
    const correctLane = shuffledOptions.findIndex(opt => opt === correctAnswer);

    return {
      id: Date.now(),
      question: randomProblem.question,
      options: shuffledOptions,
      correctLane: correctLane,
      top: -100, // Start above the screen
    };
  }, [problems]);
  
  // Game Loop
  useEffect(() => {
    if (gameState !== "playing") return;

    const interval = setInterval(() => {
      setObstacles(prev => {
        const newObstacles = prev
          .map(obs => ({ ...obs, top: obs.top + 20 })) // Move obstacles down
          .filter(obs => obs.top < window.innerHeight);

        // Collision detection
        const playerBox = { y: window.innerHeight - 100, h: 50 };
        newObstacles.forEach(obs => {
          if (obs.top > playerBox.y && obs.top < playerBox.y + playerBox.h) {
            if (playerPosition !== obs.correctLane) {
                setGameState("over");
            } else {
                setScore(s => s + 1);
                // Remove the passed obstacle
                newObstacles.splice(newObstacles.indexOf(obs), 1);
            }
          }
        });

        // Add new obstacle if needed
        if (newObstacles.length === 0 || newObstacles[newObstacles.length - 1].top > 300) {
          const newObs = generateObstacle();
          if (newObs) newObstacles.push(newObs);
        }
        
        return newObstacles;
      });
    }, 50); // Adjust speed here

    return () => clearInterval(interval);
  }, [gameState, playerPosition, generateObstacle]);

   // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setPlayerPosition(p => Math.max(0, p - 1));
      } else if (e.key === "ArrowRight") {
        setPlayerPosition(p => Math.min(2, p + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const startGame = () => {
    setScore(0);
    setPlayerPosition(1);
    const firstObstacle = generateObstacle();
    setObstacles(firstObstacle ? [firstObstacle] : []);
    setGameState("playing");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!game) {
      return notFound();
  }

  return (
    <div className="w-full h-screen bg-secondary overflow-hidden relative">
      {gameState === "playing" && (
        <>
          {/* Game UI */}
          <div className="absolute top-4 left-4 text-xl font-bold bg-background/50 p-2 rounded-lg">Score: {score}</div>
          
          {/* Obstacles */}
          {obstacles.map(obs => (
            <div key={obs.id} className="absolute w-full" style={{ top: `${obs.top}px` }}>
              <div className="text-center text-2xl font-bold mb-4">{obs.question} = ?</div>
              <div className="flex justify-around">
                {obs.options.map((opt: number, index: number) => (
                  <div key={index} className={cn(
                      "w-24 h-24 flex items-center justify-center text-2xl font-bold rounded-lg",
                      index === obs.correctLane ? "bg-green-500" : "bg-red-500"
                  )}>
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Player */}
          <div className={cn(
              "absolute bottom-10 w-20 h-20 bg-blue-500 rounded-full transition-all duration-100",
              PLAYER_POSITION_CLASSES[playerPosition]
          )}></div>

          {/* Mobile Controls */}
           <div className="md:hidden absolute bottom-0 w-full h-1/4 grid grid-cols-2">
                <button aria-label="Move Left" className="w-full h-full" onClick={() => setPlayerPosition(p => Math.max(0, p - 1))}></button>
                <button aria-label="Move Right" className="w-full h-full" onClick={() => setPlayerPosition(p => Math.min(2, p + 1))}></button>
            </div>
        </>
      )}

      {gameState === "ready" && (
        <div className="w-full h-full flex items-center justify-center">
            <Card className="max-w-md text-center">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">{game.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">Use your arrow keys or tap left/right to move the player and dodge the wrong answers!</p>
                    <Button onClick={startGame} size="lg">Start Game</Button>
                </CardContent>
            </Card>
        </div>
      )}

       {gameState === "over" && (
         <div className="w-full h-full flex items-center justify-center bg-black/50">
            <Card className="max-w-md text-center p-8">
               <Trophy className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
                <h2 className="text-3xl font-bold">Game Over!</h2>
                <p className="text-xl mt-2 mb-6">Your final score: <span className="font-bold text-primary">{score}</span></p>
                <Button onClick={startGame}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Play Again
                </Button>
            </Card>
        </div>
      )}
    </div>
  );
}
