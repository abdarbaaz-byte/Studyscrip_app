
"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Quiz, type Question } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, FileQuestion, GraduationCap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type AnswersState = { [questionId: string]: number };

function QuizResultsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const quizId = params.id as string;
  const answersString = searchParams.get('answers');

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!answersString) {
      // Handle case where answers are missing, maybe redirect
      return;
    }
    try {
      setAnswers(JSON.parse(decodeURIComponent(answersString)));
    } catch (e) {
      console.error("Failed to parse answers", e);
    }
  }, [answersString]);

  useEffect(() => {
    async function loadQuizAndCalculateScore() {
      if (!quizId || Object.keys(answers).length === 0) return;
      setLoading(true);

      const quizDocRef = doc(db, 'quizzes', quizId);
      const quizSnap = await getDoc(quizDocRef);

      if (quizSnap.exists()) {
        const loadedQuiz = { id: quizSnap.id, ...quizSnap.data() } as Quiz;
        setQuiz(loadedQuiz);

        let currentScore = 0;
        loadedQuiz.questions.forEach(q => {
          if (answers[q.id] === q.correctAnswer) {
            currentScore++;
          }
        });
        setScore(currentScore);
      } else {
        // Handle quiz not found
      }
      setLoading(false);
    }

    if (Object.keys(answers).length > 0) {
      loadQuizAndCalculateScore();
    }
  }, [quizId, answers]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (!quiz) {
    return <div className="text-center py-16">Quiz results not found or invalid.</div>;
  }

  const scorePercentage = (score / quiz.questions.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <GraduationCap className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl">Quiz Results: {quiz.title}</CardTitle>
            <CardDescription>Here's how you did!</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
            <div className="text-5xl font-bold text-primary">
                {score} / {quiz.questions.length}
            </div>
            <div className="w-full max-w-sm">
                 <Progress value={scorePercentage} className="h-4" />
            </div>
            <p className="font-semibold text-lg">{scorePercentage.toFixed(0)}% Correct</p>
            <Button onClick={() => router.push('/quizzes')}>Take Another Quiz</Button>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <h2 className="font-headline text-2xl font-bold">Detailed Analysis</h2>
        {quiz.questions.map((question, index) => {
            const userAnswerIndex = answers[question.id];
            const isCorrect = userAnswerIndex === question.correctAnswer;
            
            return (
                <Card key={question.id} className={cn("border-l-4", isCorrect ? "border-green-500" : "border-red-500")}>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-start gap-4">
                           <span className="text-primary">{index + 1}.</span> 
                           <span className="flex-1">{question.text}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            {question.options.map((option, optIndex) => {
                                const isUserAnswer = userAnswerIndex === optIndex;
                                const isCorrectAnswer = question.correctAnswer === optIndex;
                                return (
                                    <div
                                     key={optIndex}
                                     className={cn(
                                        "flex items-center gap-3 p-3 rounded-md border",
                                        isCorrectAnswer ? "bg-green-100 border-green-300" : "",
                                        isUserAnswer && !isCorrectAnswer ? "bg-red-100 border-red-300" : ""
                                     )}
                                    >
                                     {isCorrectAnswer ? <CheckCircle2 className="h-5 w-5 text-green-600"/> : isUserAnswer ? <XCircle className="h-5 w-5 text-red-600"/> : <FileQuestion className="h-5 w-5 text-muted-foreground"/> }
                                     <span className="flex-1">{option}</span>
                                    </div>
                                )
                            })}
                        </div>
                        {question.explanation && (
                            <div className="p-3 bg-secondary rounded-lg text-sm text-muted-foreground">
                                <h4 className="font-semibold text-foreground mb-1">Explanation:</h4>
                                <p>{question.explanation}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )
        })}
      </div>

    </div>
  );
}


export default function QuizResultsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <QuizResultsContent />
        </Suspense>
    )
}
