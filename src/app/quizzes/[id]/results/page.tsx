
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
import { Badge } from "@/components/ui/badge";
import { getGoogleDriveImageUrl } from "@/lib/utils";

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
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [score, setScore] = useState(0);
  const [maxMarks, setMaxMarks] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [canShowAnalysis, setCanShowAnalysis] = useState(false);
  const [allAttempts, setAllAttempts] = useState<QuizAttempt[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [canShowRank, setCanShowRank] = useState(false);

  useEffect(() => {
    if (answersString) {
      try {
        setAnswers(JSON.parse(decodeURIComponent(answersString)));
      } catch (e) {
        console.error("Failed to parse answers", e);
      }
    }
  }, [answersString]);

  useEffect(() => {
    async function loadQuizAndResults() {
      if (!quizId) return;
      setLoading(true);

      const loadedQuiz = await getQuiz(quizId);

      if (loadedQuiz) {
        setQuiz(loadedQuiz);

        const now = new Date();
        const endTime = loadedQuiz.endTime?.toDate();
        
        let showAnalysis = quizType === 'practice';
        let showRank = false;

        if (quizType === 'live') {
            if (endTime && now > endTime) {
                showAnalysis = true;
                showRank = true;
            } else if (!endTime) {
                showAnalysis = true;
                showRank = false;
            }

            const attempts = await getQuizAttemptsForQuiz(quizId);
            setAllAttempts(attempts);
            
            const rank = attempts.findIndex(attempt => attempt.userId === user?.uid) + 1;
            setUserRank(rank > 0 ? rank : null);
        }

        let earnedMarks = 0;
        let totalPossibleMarks = 0;
        let correct = 0;
        let incorrect = 0;

        loadedQuiz.questions.forEach(q => {
            const qMarks = q.marks ?? 1;
            const qNegMarks = q.negativeMarks ?? 0;
            totalPossibleMarks += qMarks;

            const userAnswer = answers[q.id];
            let isCorrect = false;
            let isAttempted = userAnswer !== undefined && userAnswer !== null && userAnswer !== "";

            if (isAttempted) {
                if (q.type === 'mcq' || q.type === 'true_false') {
                    isCorrect = parseInt(userAnswer?.toString() || '-1') === q.correctAnswer;
                } else if (q.type === 'fill_in_blank') {
                    isCorrect = typeof userAnswer === 'string' && userAnswer.trim().toLowerCase() === q.answerText.trim().toLowerCase();
                } else if (q.type === 'match') {
                    if (typeof userAnswer === 'object' && userAnswer !== null) {
                        isCorrect = q.matchOptions.every(opt => (userAnswer as any)[opt.id] === opt.answer);
                    }
                }

                if (isCorrect) {
                    earnedMarks += qMarks;
                    correct++;
                } else {
                    earnedMarks -= qNegMarks;
                    incorrect++;
                }
            }
        });

        setScore(Math.max(0, earnedMarks));
        setMaxMarks(totalPossibleMarks);
        setCorrectCount(correct);
        setIncorrectCount(incorrect);
        setCanShowAnalysis(showAnalysis && Object.keys(answers).length > 0);
        setCanShowRank(showRank || quizType === 'live');
        
      } else {
        toast({ variant: 'destructive', title: 'Quiz not found.' });
      }
      setLoading(false);
    }

    loadQuizAndResults();
  
  }, [quizId, answers, toast, quizType, user]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (!quiz) {
    return <div className="text-center py-16">Quiz results not found or invalid.</div>;
  }

  const scorePercentage = maxMarks > 0 ? (score / maxMarks) * 100 : 0;
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
        <CardHeader>
          <div className="flex justify-center mb-4">
                <GraduationCap className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl text-center">
                {Object.keys(answers).length > 0 ? `Results: ${quiz.title}` : `Leaderboard: ${quiz.title}`}
            </CardTitle>
            <CardDescription className="text-center">
                {Object.keys(answers).length > 0 ? `Well done, ${name}! Here's how you did.` : `Check out the top performers for this quiz!`}
            </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
            {Object.keys(answers).length > 0 && (
                <>
                    <div className="text-5xl font-bold text-primary">
                        {score} / {maxMarks} <span className="text-xl font-normal text-muted-foreground ml-1">Marks</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 w-full max-w-md mt-2">
                        <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100 shadow-sm">
                            <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Correct</p>
                            <p className="text-2xl font-bold text-green-700">{correctCount}</p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-xl border border-red-100 shadow-sm">
                            <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Incorrect</p>
                            <p className="text-2xl font-bold text-red-700">{incorrectCount}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Skipped</p>
                            <p className="text-2xl font-bold text-gray-700">{quiz.questions.length - correctCount - incorrectCount}</p>
                        </div>
                    </div>

                    <div className="w-full max-w-sm mt-4">
                         <Progress value={scorePercentage} className="h-4" />
                    </div>
                    <p className="font-semibold text-lg">{scorePercentage.toFixed(0)}% Score</p>
                </>
            )}

            {canShowRank && userRank && (
                <div className="font-bold text-2xl p-4 bg-secondary rounded-lg">
                    Your Rank: <span className={cn("font-extrabold", getRankColor(userRank))}>{userRank}</span>
                </div>
            )}

             <div className="flex gap-4 mt-4">
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

      {topThree.length > 0 && (
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
                                  <p className="text-sm text-muted-foreground">{attempt.userClass}</p>
                                </div>
                              </div>
                               <div className="text-lg font-bold">
                                    {attempt.score} / {attempt.maxMarks || attempt.totalQuestions} Marks
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
                let isAttempted = userAnswer !== undefined && userAnswer !== null && userAnswer !== "";
                
                if (isAttempted) {
                    if(question.type === 'mcq' || question.type === 'true_false') {
                        isCorrect = parseInt(userAnswer?.toString() || '-1') === question.correctAnswer;
                    } else if (question.type === 'fill_in_blank') {
                        isCorrect = typeof userAnswer === 'string' && userAnswer.trim().toLowerCase() === question.answerText.trim().toLowerCase();
                    } else if (question.type === 'match') {
                        if (typeof userAnswer === 'object' && userAnswer !== null) {
                            isCorrect = question.matchOptions.every(opt => (userAnswer as any)[opt.id] === opt.answer);
                        }
                    }
                }

                return (
                    <Card key={question.id} className={cn("border-l-4 overflow-hidden", isAttempted ? (isCorrect ? "border-green-500" : "border-red-500") : "border-gray-300")}>
                        <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-2 items-center">
                                    <Badge variant="outline">Q{index + 1}</Badge>
                                    {isAttempted && <Badge className="bg-blue-100 text-blue-700 border-blue-200">Attempted</Badge>}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge variant="secondary" className="bg-primary/5">+{question.marks} Marks</Badge>
                                    {question.negativeMarks > 0 && <Badge variant="destructive" className="text-[10px] py-0">-{question.negativeMarks} Neg.</Badge>}
                                </div>
                            </div>
                            <CardTitle className="text-lg">
                                {question.text}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {question.imageUrl && (
                                <div className="mb-4 rounded-md overflow-hidden border bg-secondary/5 flex justify-center">
                                    <img 
                                        src={getGoogleDriveImageUrl(question.imageUrl)} 
                                        alt="Question Context" 
                                        className="max-w-full h-auto max-h-[200px] object-contain" 
                                    />
                                </div>
                            )}

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
                                     <div className={cn("flex items-center gap-3 p-3 rounded-md border", isAttempted && !isCorrect && "bg-red-100 border-red-300")}>
                                        {isAttempted ? (isCorrect ? <CheckCircle2 className="h-5 w-5 text-green-600"/> : <XCircle className="h-5 w-5 text-red-600"/>) : <FileQuestion className="h-5 w-5 text-muted-foreground"/>}
                                        <span className="flex-1">Your Answer: <span className="font-mono">{userAnswer as string || '(Skipped)'}</span></span>
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
                                            <div key={opt.id} className={cn("grid grid-cols-[1fr_auto_1fr] gap-4 items-center p-2 rounded-md border", isAttempted ? (isPairCorrect ? "bg-green-100/60" : "bg-red-100/60") : "bg-gray-50")}>
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
         Object.keys(answers).length > 0 && !canShowAnalysis && (
            <Card className="text-center p-8 bg-secondary">
                <Clock className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle className="text-2xl font-bold">Analysis Pending</CardTitle>
                <CardDescription>Detailed results and explanations will be available after the quiz period ends.</CardDescription>
                {quiz.endTime && <p className="font-bold text-lg mt-2">Available after: {format(quiz.endTime.toDate(), "PPP p")}</p>}
            </Card>
         )
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
