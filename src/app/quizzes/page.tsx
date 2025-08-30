
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, BrainCircuit, ArrowRight, Timer, ListChecks, Orbit, ShieldCheck } from "lucide-react";
import { getQuizzes, type Quiz } from "@/lib/data";

export default function QuizzesPage() {
  const [liveQuizzes, setLiveQuizzes] = useState<Quiz[]>([]);
  const [practiceQuizzes, setPracticeQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuizzes() {
      setLoading(true);
      const allQuizzes = await getQuizzes();
      const live = allQuizzes.filter(q => q.startTime || q.endTime);
      const practice = allQuizzes.filter(q => !q.startTime && !q.endTime);
      setLiveQuizzes(live);
      setPracticeQuizzes(practice);
      setLoading(false);
    }
    loadQuizzes();
  }, []);

  const QuizCard = ({ quiz, isLive }: { quiz: Quiz, isLive: boolean }) => (
     <Card key={quiz.id} className="flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{quiz.title}</CardTitle>
          <CardDescription>{quiz.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ListChecks className="h-4 w-4" />
              <span>{quiz.questions.length} Questions</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span>{quiz.duration ? `${quiz.duration} Minutes` : 'No time limit'}</span>
            </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={`/quizzes/${quiz.id}?type=${isLive ? 'live' : 'practice'}`}>
              {isLive ? 'Take Live Quiz' : 'Start Practice'} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Quizzes</h1>
        <p className="text-lg text-muted-foreground mt-2">Test your knowledge with our live and practice quizzes.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-16">
          <section>
            <div className="flex items-center gap-4 mb-8">
                <Orbit className="h-8 w-8 text-primary" />
                <h2 className="font-headline text-3xl font-bold">Live Quizzes</h2>
            </div>
            {liveQuizzes.length === 0 ? (
                 <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No live quizzes are available right now. Check back later!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {liveQuizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} isLive={true} />)}
                </div>
            )}
          </section>

          <section>
             <div className="flex items-center gap-4 mb-8">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <h2 className="font-headline text-3xl font-bold">Practice Quizzes</h2>
            </div>
            {practiceQuizzes.length === 0 ? (
                 <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No practice quizzes available right now.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {practiceQuizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} isLive={false} />)}
                </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
