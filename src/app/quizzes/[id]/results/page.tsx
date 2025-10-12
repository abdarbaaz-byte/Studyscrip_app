

"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getQuiz, type Quiz, getQuizAttemptsForQuiz, type QuizAttempt } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, FileQuestion, GraduationCap, Clock, ArrowRight, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

type AnswersState = { [questionId: string]: number | string | { [matchId: string]: string } };

function QuizResultsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const quizId = params.id as string;
  const quizType = searchParams.get('type') || 'practice';
  const answersString = searchParams.get('answers');
  const name = searchParams.get('name') || 'Student';
  const userClass = searchParams.get('class');
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [canShowAnalysis, setCanShowAnalysis] = useState(quizType === 'practice');
  const [allAttempts, setAllAttempts] = useState<QuizAttempt[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    if (!answersString) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load answers.' });
      router.push(`/quizzes/${quizId}?type=${quizType}`);
      return;
    }
    try {
      setAnswers(JSON.parse(decodeURIComponent(answersString)));
    } catch (e) {
      console.error("Failed to parse answers", e);
      router.push(`/quizzes/${quizId}?type=${quizType}`);
    }
  }, [answersString, quizId, router, toast, quizType]);

  useEffect(() => {
    async function loadQuizAndResults() {
      if (!quizId || Object.keys(answers).length === 0) return;
      setLoading(true);

      const loadedQuiz = await getQuiz(quizId);

      if (loadedQuiz) {
        setQuiz(loadedQuiz);

        let showAnalysis = quizType === 'practice';
        if (quizType === 'live') {
            const now = new Date();
            const endTime = loadedQuiz.endTime?.toDate();
            if (!endTime || now > endTime) {
                showAnalysis = true;
            }
            
            if (showAnalysis) {
                // Fetch all attempts for ranking only if analysis can be shown
                const attempts = await getQuizAttemptsForQuiz(quizId);
                setAllAttempts(attempts);
                
                // Find current user's rank
                const rank = attempts.findIndex(attempt => attempt.userId === user?.uid) + 1;
                setUserRank(rank > 0 ? rank : null);
            }
        }
        setCanShowAnalysis(showAnalysis);

        let currentScore = 0;
        loadedQuiz.questions.forEach(q => {
            const userAnswer = answers[q.id];
            if (q.type === 'mcq' || q.type === 'true_false') {
                if (parseInt(userAnswer?.toString() || '-1') === q.correctAnswer) {
                    currentScore++;
                }
            } else if (q.type === 'fill_in_blank') {
                if (typeof userAnswer === 'string' && userAnswer.trim().toLowerCase() === q.answerText.trim().toLowerCase()) {
                    currentScore++;
                }
            } else if (q.type === 'match') {
                 if (typeof userAnswer === 'object' && userAnswer !== null) {
                    const allCorrect = q.matchOptions.every(opt => (userAnswer as any)[opt.id] === opt.answer);
                    if (allCorrect) {
                        currentScore++;
                    }
                }
            }
        });
        setScore(currentScore);
        
      } else {
        toast({ variant: 'destructive', title: 'Quiz not found.' });
      }
      setLoading(false);
    }

    if (Object.keys(answers).length > 0) {
      loadQuizAndResults();
    }
  
  }, [quizId, answers, toast, quizType, user]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (!quiz) {
    return <div className="text-center py-16">Quiz results not found or invalid.</div>;
  }

  const scorePercentage = (score / quiz.questions.length) * 100;
  const isPractice = quizType === 'practice';
  const topThree = allAttempts.slice(0, 3);
  
  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-yellow-700";
    return "text-muted-foreground";
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <GraduationCap className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl">Quiz Results: {quiz.title}</CardTitle>
            <CardDescription>Well done, {name}! {userClass && `(Class: ${userClass})`} Here's how you did.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
            <div className="text-5xl font-bold text-primary">
                {score} / {quiz.questions.length}
            </div>
            <div className="w-full max-w-sm">
                 <Progress value={scorePercentage} className="h-4" />
            </div>
            <p className="font-semibold text-lg">{scorePercentage.toFixed(0)}% Correct</p>

            {quizType === 'live' && userRank && (
                <div className="font-bold text-2xl p-4 bg-secondary rounded-lg">
                    Your Rank: <span className={cn("font-extrabold", getRankColor(userRank))}>{userRank}</span>
                </div>
            )}

             <div className="flex gap-4">
                {isPractice && (
                    <Button onClick={() => router.push(`/quizzes/${quizId}?type=practice`)}>
                        Attempt Again
                    </Button>
                )}
                <Button variant="outline" onClick={() => router.push('/quizzes')}>
                    {isPractice ? 'More Quizzes' : 'Back to Quizzes'}
                </Button>
            </div>
        </CardContent>
      </Card>

      {quizType === 'live' && canShowAnalysis && topThree.length > 0 && (
          <Card className="mb-8 bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20">
              <CardHeader className="text-center">
                   <div className="flex justify-center mb-4">
                        <Trophy className="h-16 w-16 text-yellow-500" />
                    </div>
                  <CardTitle className="font-headline text-3xl text-yellow-600">Congratulations to the Top 3!</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                      {topThree.map((attempt, index) => (
                           <div key={attempt.id} className="flex items-center justify-between p-4 rounded-lg bg-background shadow-sm">
                              <div className="flex items-center gap-4">
                                <div className={cn("text-2xl font-bold w-8 text-center", getRankColor(index + 1))}>
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-bold">{attempt.userName}</p>
                                  <p className="text-sm text-muted-foreground">{attempt.userSchool}, {attempt.userPlace}</p>
                                </div>
                              </div>
                               <div className="text-lg font-bold">
                                    {attempt.score} / {attempt.totalQuestions}
                               </div>
                           </div>
                      ))}
                  </div>
              </CardContent>
          </Card>
      )}
      
      {canShowAnalysis ? (
        <div className="space-y-6">
            <h2 className="font-headline text-2xl font-bold">Detailed Analysis</h2>
            {quiz.questions.map((question, index) => {
                const userAnswer = answers[question.id];
                let isCorrect = false;
                if(question.type === 'mcq' || question.type === 'true_false') {
                    isCorrect = parseInt(userAnswer?.toString() || '-1') === question.correctAnswer;
                } else if (question.type === 'fill_in_blank') {
                    isCorrect = typeof userAnswer === 'string' && userAnswer.trim().toLowerCase() === question.answerText.trim().toLowerCase();
                } else if (question.type === 'match') {
                     if (typeof userAnswer === 'object' && userAnswer !== null) {
                        isCorrect = question.matchOptions.every(opt => (userAnswer as any)[opt.id] === opt.answer);
                    }
                }

                return (
                    <Card key={question.id} className={cn("border-l-4", isCorrect ? "border-green-500" : "border-red-500")}>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-start gap-4">
                            <span className="text-primary">{index + 1}.</span> 
                            <span className="flex-1">{question.text}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {question.type === 'mcq' && question.options.map((option, optIndex) => {
                                const isUserAnswer = parseInt(userAnswer?.toString() || '-1') === optIndex;
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

                             {question.type === 'true_false' && ['True', 'False'].map((option, optIndex) => {
                                const isUserAnswer = parseInt(userAnswer?.toString() || '-1') === optIndex;
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

                            {question.type === 'fill_in_blank' && (
                                <div className="space-y-2">
                                     <div className={cn("flex items-center gap-3 p-3 rounded-md border", !isCorrect && "bg-red-100 border-red-300")}>
                                        {isCorrect ? <CheckCircle2 className="h-5 w-5 text-green-600"/> : <XCircle className="h-5 w-5 text-red-600"/>}
                                        <span className="flex-1">Your Answer: <span className="font-mono">{userAnswer as string || '""'}</span></span>
                                     </div>
                                      <div className={cn("flex items-center gap-3 p-3 rounded-md border bg-green-100 border-green-300")}>
                                        <CheckCircle2 className="h-5 w-5 text-green-600"/>
                                        <span className="flex-1">Correct Answer: <span className="font-mono">{question.answerText}</span></span>
                                     </div>
                                </div>
                            )}

                             {question.type === 'match' && (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 font-semibold text-center text-sm">
                                        <div>Your Answer</div>
                                        <div></div>
                                        <div>Correct Answer</div>
                                    </div>
                                    {question.matchOptions.map(opt => {
                                        const studentAnswer = (userAnswer as any)?.[opt.id];
                                        const isPairCorrect = studentAnswer === opt.answer;
                                        return (
                                            <div key={opt.id} className={cn("grid grid-cols-[1fr_auto_1fr] gap-4 items-center p-2 rounded-md border", isPairCorrect ? "bg-green-100/60" : "bg-red-100/60")}>
                                                <div className="text-center">{opt.question}</div>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground"/>
                                                <div className="text-center">
                                                    {isPairCorrect ? (
                                                        <span className="flex items-center justify-center gap-2 text-green-700">
                                                            <CheckCircle2 className="h-4 w-4"/> {studentAnswer}
                                                        </span>
                                                    ) : (
                                                        <div className="flex flex-col items-center">
                                                            <span className="line-through text-red-700">{studentAnswer || '(No answer)'}</span>
                                                            <span className="text-green-700">{opt.answer}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

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
      ) : (
         <Card className="text-center p-8 bg-secondary">
            <Clock className="h-12 w-12 mx-auto text-primary mb-4" />
            <CardTitle className="text-2xl font-bold">Analysis Pending</CardTitle>
            <CardDescription>Detailed results and explanations will be available after the quiz period ends.</CardDescription>
            {quiz.endTime && <p className="font-bold text-lg mt-2">Available after: {format(quiz.endTime.toDate(), "PPP p")}</p>}
        </Card>
      )}

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

    