
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, notFound } from "next/navigation";
import { getGames, type Game, type MathProblem } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MathRunnerPage() {
  const params = useParams();
  const gameId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<Game | null>(null);
  const [problems, setProblems] = useState<MathProblem[]>([]);
  
  const [gameState, setGameState] = useState<"ready" | "playing" | "over">("ready");
  const [score, setScore] = useState(0);
  const [obstacles, setObstacles] = useState<any[]>([]);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

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
    const correctAnswerValue = eval(randomProblem.question);
    
    const options = [{ value: correctAnswerValue, isCorrect: true }];
    while (options.length < 3) {
      const wrongAnswer = correctAnswerValue + Math.floor(Math.random() * 10) - 5;
      if (wrongAnswer !== correctAnswerValue && !options.some(o => o.value === wrongAnswer)) {
        options.push({ value: wrongAnswer, isCorrect: false });
      }
    }
    
    const shuffledOptions = options.sort(() => Math.random() - 0.5);

    return {
      id: Date.now(),
      question: randomProblem.question,
      options: shuffledOptions,
      top: -150, // Start above the screen
      tapped: false, // To track if any option has been tapped
    };
  }, [problems]);
  
  // Game Loop
  useEffect(() => {
    if (gameState !== "playing") {
        if(gameLoopRef.current) clearInterval(gameLoopRef.current);
        return;
    }

    gameLoopRef.current = setInterval(() => {
      setObstacles(prev => {
        const newObstacles = prev.map(obs => ({ ...obs, top: obs.top + 5 })); // Slower speed

        // Check if any obstacle has gone off-screen without a correct tap
        newObstacles.forEach(obs => {
            if (obs.top > window.innerHeight && !obs.tapped) {
                setGameState("over");
            }
        });

        // Filter out obstacles that have been tapped and are off-screen
        const visibleObstacles = newObstacles.filter(obs => obs.top < window.innerHeight + 50);

        // Add new obstacle if needed
        if (visibleObstacles.length === 0 || visibleObstacles[visibleObstacles.length - 1].top > 400) {
          const newObs = generateObstacle();
          if (newObs) visibleObstacles.push(newObs);
        }
        
        return visibleObstacles;
      });
    }, 50); // Slower interval for smoother animation

    return () => {
        if(gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, generateObstacle]);

  const handleAnswerTap = (obstacleId: number, option: { value: number, isCorrect: boolean }) => {
    if (gameState !== "playing") return;

    if (option.isCorrect) {
        setScore(s => s + 1);
        // Mark the obstacle as tapped so it doesn't trigger game over
        setObstacles(prev => prev.map(obs => obs.id === obstacleId ? { ...obs, tapped: true } : obs));
    } else {
        setGameState("over");
    }
  };

  const startGame = () => {
    setScore(0);
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
          <div className="absolute top-4 left-4 text-xl font-bold bg-background/50 p-2 rounded-lg shadow-md z-10">Score: {score}</div>
          
          {/* Obstacles */}
          {obstacles.map(obs => (
            <div key={obs.id} className="absolute w-full transition-all duration-100 ease-linear" style={{ top: `${obs.top}px` }}>
              <div className="text-center text-2xl font-bold mb-4">{obs.question} = ?</div>
              <div className="flex justify-around">
                {obs.options.map((opt: {value: number, isCorrect: boolean}, index: number) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswerTap(obs.id, opt)}
                    disabled={obs.tapped}
                    className={cn(
                      "w-28 h-28 flex items-center justify-center text-2xl font-bold rounded-lg shadow-lg",
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                      obs.tapped && opt.isCorrect && "bg-green-500 hover:bg-green-500 cursor-not-allowed",
                    )}
                  >
                    {opt.value}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {gameState === "ready" && (
        <div className="w-full h-full flex items-center justify-center">
            <Card className="max-w-md text-center">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">{game.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">Tap on the correct answer box as it comes down to score points!</p>
                    <Button onClick={startGame} size="lg">Start Game</Button>
                </CardContent>
            </Card>
        </div>
      )}

       {gameState === "over" && (
         <div className="w-full h-full flex items-center justify-center bg-black/50 z-20 absolute top-0 left-0">
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

