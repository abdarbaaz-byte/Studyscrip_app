"use client";

import { useState, useEffect, useRef, Suspense, useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getQuiz, type Quiz, saveQuizAttempt, type QuizAttempt, type Question, type MatchOption } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Timer, AlertTriangle, ArrowUp, ArrowDown, LayoutGrid, CheckCircle2, Bookmark, Eye, HelpCircle, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { getGoogleDriveImageUrl, cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

type AnswersState = { [questionId: string]: number | string | { [matchId: string]: string } };
type QuestionStates = { [questionId: string]: { visited: boolean; marked: boolean } };

// Helper function to shuffle an array (Fisher-Yates shuffle algorithm)
const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  const newArray = [...array]; 
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};

const QuizQuestion = ({ question, answer, onAnswerChange }: { question: Question, answer: any, onAnswerChange: (questionId: string, value: any) => void }) => {
    const [orderedAnswers, setOrderedAnswers] = useState<MatchOption[]>([]);
    const initialShuffleRef = useRef(false);

    useEffect(() => {
        if (question.type === 'match' && question.matchOptions && !initialShuffleRef.current) {
            setOrderedAnswers(shuffleArray([...question.matchOptions]));
            initialShuffleRef.current = true;
        }
    }, [question]);
    
    const handleReorder = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= orderedAnswers.length) return;

        const newOrder = [...orderedAnswers];
        const temp = newOrder[index];
        newOrder[index] = newOrder[newIndex];
        newOrder[newIndex] = temp;

        setOrderedAnswers(newOrder);

        const newAnswerObject: { [matchId: string]: string } = {};
        question.matchOptions.forEach((qOpt, idx) => {
            newAnswerObject[qOpt.id] = newOrder[idx].answer;
        });
        onAnswerChange(question.id, newAnswerObject);
    };

    switch (question.type) {
        case 'match':
            return (
                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
                    <div className="space-y-4">
                        <div className="font-semibold text-center pb-2 border-b text-xs uppercase tracking-wider text-muted-foreground">Column A</div>
                        {question.matchOptions.map((matchOpt) => (
                            <div key={matchOpt.id} className="h-[52px] flex items-center justify-center p-3 bg-secondary rounded-md text-sm text-center">
                                {matchOpt.question}
                            </div>
                        ))}
                    </div>
                    <div className="text-muted-foreground text-2xl font-thin mt-12">...</div>
                     <div className="space-y-4">
                        <div className="font-semibold text-center pb-2 border-b text-xs uppercase tracking-wider text-muted-foreground">Column B</div>
                        <div className="space-y-4">
                          {orderedAnswers.map((ans, index) => (
                              <div key={ans.id} className="flex items-center gap-2">
                                  <div className="flex-grow p-3 h-[52px] flex items-center justify-center bg-background border rounded-md shadow-sm text-sm">
                                    {ans.answer}
                                  </div>
                                  <div className="flex flex-col gap-1">
                                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleReorder(index, 'up')} disabled={index === 0}>
                                          <ArrowUp className="h-4 w-4" />
                                      </Button>
                                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleReorder(index, 'down')} disabled={index === orderedAnswers.length - 1}>
                                          <ArrowDown className="h-4 w-4" />
                                      </Button>
                                  </div>
                              </div>
                          ))}
                        </div>
                    </div>
                </div>
            );
        case 'true_false':
            return (
                 <RadioGroup 
                    value={answer?.toString()} 
                    onValueChange={(value) => onAnswerChange(question.id, parseInt(value))}
                    className="space-y-4"
                >
                    <div className="flex items-center space-x-3 border rounded-lg p-4 has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-colors">
                        <RadioGroupItem value="0" id={`q-opt-true`} />
                        <Label htmlFor={`q-opt-true`} className="text-base font-normal flex-1 cursor-pointer">True</Label>
                    </div>
                    <div className="flex items-center space-x-3 border rounded-lg p-4 has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-colors">
                        <RadioGroupItem value="1" id={`q-opt-false`} />
                        <Label htmlFor={`q-opt-false`} className="text-base font-normal flex-1 cursor-pointer">False</Label>
                    </div>
                </RadioGroup>
            );
        case 'fill_in_blank':
            return (
                <Input
                    type="text"
                    placeholder="Type your answer here..."
                    value={answer as string || ""}
                    onChange={(e) => onAnswerChange(question.id, e.target.value)}
                    className="text-base h-12"
                />
            );
        case 'mcq':
        default:
            return (
                 <RadioGroup 
                    value={answer?.toString()} 
                    onValueChange={(value) => onAnswerChange(question.id, parseInt(value))}
                    className="space-y-4"
                >
                    {question.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3 border rounded-lg p-4 has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-colors">
                        <RadioGroupItem value={index.toString()} id={`q-opt-${index}`} />
                        <Label htmlFor={`q-opt-${index}`} className="text-base font-normal flex-1 cursor-pointer">{option}</Label>
                        </div>
                    ))}
                </RadioGroup>
            );
    }
}

function QuizAttemptContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [qStates, setQStates] = useState<QuestionStates>({});
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmittedRef = useRef(false);

  const quizType = searchParams.get('type') || 'practice';
  const schoolId = searchParams.get('schoolId');
  const name = searchParams.get('name') || 'Anonymous';
  const userClass = searchParams.get('class') || 'N/A';
  const userSchool = searchParams.get('school') || '';
  const userId = searchParams.get('userId');
  const userEmail = searchParams.get('userEmail');

  const handleSubmit = useCallback(async (currentAnswers: AnswersState) => {
    if (!quiz || hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    
    let earnedMarks = 0;
    let maxPossibleMarks = 0;

    quiz.questions.forEach(q => {
        const qMarks = q.marks ?? 1;
        const qNegMarks = q.negativeMarks ?? 0;
        maxPossibleMarks += qMarks;
        const userAnswer = currentAnswers[q.id];
        let isCorrect = false;
        let isAttempted = userAnswer !== undefined && userAnswer !== null && userAnswer !== "";
        if (isAttempted) {
            if (q.type === 'mcq' || q.type === 'true_false') {
                isCorrect = userAnswer?.toString() === q.correctAnswer?.toString();
            } else if (q.type === 'fill_in_blank') {
                isCorrect = typeof userAnswer === 'string' && userAnswer.trim().toLowerCase() === q.answerText.trim().toLowerCase();
            } else if (q.type === 'match') {
                if (typeof userAnswer === 'object' && userAnswer !== null && Object.keys(userAnswer).length > 0) {
                    isCorrect = q.matchOptions.every((opt) => (userAnswer as any)[opt.id] === opt.answer);
                }
            }
            if (isCorrect) earnedMarks += qMarks;
            else earnedMarks -= qNegMarks;
        }
    });

    const finalScore = Math.max(0, earnedMarks);
    const encodedAnswers = encodeURIComponent(JSON.stringify(currentAnswers));

    if (quizType === 'live') {
        const attemptData: Omit<QuizAttempt, 'id' | 'submittedAt'> = {
          quizId, quizTitle: quiz.title, userId, userEmail, userName: name, userClass, userSchool,
          answers: currentAnswers, score: finalScore, maxMarks: maxPossibleMarks, totalQuestions: quiz.questions.length,
          percentage: (finalScore / maxPossibleMarks) * 100, schoolId: schoolId || null,
        };
        try {
            await saveQuizAttempt(attemptData);
            localStorage.setItem(`quiz-attempted-${quiz.id}`, 'true');
            localStorage.setItem(`quiz-data-${quiz.id}`, JSON.stringify({ answers: encodedAnswers, name, class: userClass, school: userSchool }));
        } catch(error) {
            console.error("Failed to save test attempt:", error);
            toast({ variant: "destructive", title: "Error saving results. Please try again."});
            hasSubmittedRef.current = false;
            return;
        }
    }
    router.replace(`/quizzes/${quizId}/results?type=${quizType}&answers=${encodedAnswers}&name=${name}&class=${userClass}${schoolId ? `&schoolId=${schoolId}` : ''}`);
  }, [quiz, quizId, quizType, name, userClass, userSchool, userId, userEmail, schoolId, router, toast]);

  const triggerSubmit = useCallback(() => {
    handleSubmit(answers);
  }, [answers, handleSubmit]);

  useEffect(() => {
    async function loadQuiz() {
      if (!quizId) return;
      setLoading(true);
      const loadedQuiz = await getQuiz(quizId);
      if (loadedQuiz) {
        const processedQuestions = quizType === 'live' ? shuffleArray(loadedQuiz.questions) : loadedQuiz.questions;
        setQuiz({ ...loadedQuiz, questions: processedQuestions });
        if (loadedQuiz.duration) setTimeLeft(loadedQuiz.duration * 60);
        
        // Initialize states
        const initialStates: QuestionStates = {};
        processedQuestions.forEach((q, idx) => {
            initialStates[q.id] = { visited: idx === 0, marked: false };
        });
        setQStates(initialStates);
      } else {
        toast({ variant: 'destructive', title: 'Test not found' });
        router.push('/quizzes');
      }
      setLoading(false);
    }
    loadQuiz();
  }, [quizId, router, toast, quizType]);

  useEffect(() => {
    if (quiz && quiz.questions[currentQuestionIndex]) {
        const qId = quiz.questions[currentQuestionIndex].id;
        if (!qStates[qId]?.visited) {
            setQStates(prev => ({ ...prev, [qId]: { ...prev[qId], visited: true } }));
        }
    }
  }, [currentQuestionIndex, quiz, qStates]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeLeft === 0 && !hasSubmittedRef.current) {
        toast({ title: "Time's Up!", description: "Your test has been automatically submitted." });
        triggerSubmit();
      }
      return;
    }
    timerRef.current = setInterval(() => setTimeLeft(prev => (prev ? prev - 1 : 0)), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft, triggerSubmit]);

  useEffect(() => {
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden' && !hasSubmittedRef.current) {
            toast({ variant: 'destructive', title: 'Test Submitted', description: 'You moved to another tab. Test auto-submitted.' });
            triggerSubmit();
        }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [triggerSubmit, toast]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleMarkForReview = () => {
      if (!quiz) return;
      const qId = quiz.questions[currentQuestionIndex].id;
      setQStates(prev => ({ ...prev, [qId]: { ...prev[qId], marked: !prev[qId].marked } }));
  };

  const handleSaveAndNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
        setShowSubmitConfirm(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };

  const statusCounts = useMemo(() => {
    if (!quiz) return { answered: 0, marked: 0, notAnswered: 0, notVisited: 0 };
    let counts = { answered: 0, marked: 0, notAnswered: 0, notVisited: 0 };
    quiz.questions.forEach(q => {
        const state = qStates[q.id];
        const ans = answers[q.id];
        const isAnswered = ans !== undefined && ans !== null && ans !== "";
        if (state?.marked) counts.marked++;
        else if (isAnswered) counts.answered++;
        else if (state?.visited) counts.notAnswered++;
        else counts.notVisited++;
    });
    return counts;
  }, [quiz, qStates, answers]);

  const getQuestionStatus = (qId: string) => {
      const state = qStates[qId];
      const ans = answers[qId];
      const isAnswered = ans !== undefined && ans !== null && ans !== "";
      if (state?.marked) return 'marked';
      if (isAnswered) return 'answered';
      if (state?.visited) return 'not-answered';
      return 'not-visited';
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  if (!quiz) return <div className="text-center py-16">Test not found.</div>;
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const hasAnswer = answers[currentQuestion.id] !== undefined && answers[currentQuestion.id] !== null && answers[currentQuestion.id] !== "";
  const isMarked = qStates[currentQuestion.id]?.marked;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-secondary/10 pb-20">
      <div className="sticky top-0 z-20 bg-background border-b shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex flex-col">
                  <h1 className="font-headline text-lg md:text-xl font-bold truncate max-w-[200px] md:max-w-md">{quiz.title}</h1>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{name} | Class {userClass}</span>
              </div>
              <div className="flex items-center gap-4">
                  {timeLeft !== null && (
                    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full font-mono font-bold border", timeLeft < 60 ? "bg-red-50 text-red-600 border-red-200 animate-pulse" : "bg-secondary text-foreground")}>
                      <Timer className="h-4 w-4"/>
                      <span>{formatTime(timeLeft)}</span>
                    </div>
                  )}
                  <Sheet open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
                      <SheetTrigger asChild>
                          <Button variant="outline" size="sm" className="rounded-full shadow-sm"><LayoutGrid className="mr-2 h-4 w-4"/> Questions</Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0 flex flex-col">
                          <SheetHeader className="p-6 border-b">
                              <SheetTitle className="font-headline">Question Palette</SheetTitle>
                          </SheetHeader>
                          <ScrollArea className="flex-1 p-6">
                              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-10">
                                  {quiz.questions.map((q, idx) => {
                                      const status = getQuestionStatus(q.id);
                                      const isActive = currentQuestionIndex === idx;
                                      return (
                                          <button
                                              key={q.id}
                                              onClick={() => { setCurrentQuestionIndex(idx); setIsPaletteOpen(false); }}
                                              className={cn(
                                                  "h-10 w-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all relative",
                                                  status === 'answered' && "bg-green-600 text-white shadow-md",
                                                  status === 'marked' && "bg-indigo-600 text-white shadow-md",
                                                  status === 'not-answered' && "bg-red-500 text-white shadow-md",
                                                  status === 'not-visited' && "bg-gray-200 text-gray-500",
                                                  isActive && "ring-2 ring-primary ring-offset-2 scale-110 z-10"
                                              )}
                                          >
                                              {idx + 1}
                                          </button>
                                      );
                                  })}
                              </div>
                              <div className="space-y-4 pt-6 border-t">
                                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Legend</h4>
                                  <div className="grid grid-cols-2 gap-4 text-xs">
                                      <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-green-600"></div> Answered</div>
                                      <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-indigo-600"></div> Marked</div>
                                      <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-red-500"></div> Not Answered</div>
                                      <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-gray-200"></div> Not Visited</div>
                                  </div>
                              </div>
                          </ScrollArea>
                          <div className="p-6 border-t bg-secondary/10">
                              <Button onClick={() => { setIsPaletteOpen(false); setShowSubmitConfirm(true); }} className="w-full font-bold">Submit Test</Button>
                          </div>
                      </SheetContent>
                  </Sheet>
              </div>
          </div>
          <div className="bg-secondary/30 border-t">
              <div className="container mx-auto px-4 py-2 flex justify-between gap-1 overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-1.5 shrink-0"><div className="h-2 w-2 rounded-full bg-green-600"></div> <span className="text-[10px] font-bold uppercase text-muted-foreground">Ans: {statusCounts.answered}</span></div>
                  <div className="flex items-center gap-1.5 shrink-0"><div className="h-2 w-2 rounded-full bg-indigo-600"></div> <span className="text-[10px] font-bold uppercase text-muted-foreground">Mark: {statusCounts.marked}</span></div>
                  <div className="flex items-center gap-1.5 shrink-0"><div className="h-2 w-2 rounded-full bg-red-500"></div> <span className="text-[10px] font-bold uppercase text-muted-foreground">N-Ans: {statusCounts.notAnswered}</span></div>
                  <div className="flex items-center gap-1.5 shrink-0"><div className="h-2 w-2 rounded-full bg-gray-300"></div> <span className="text-[10px] font-bold uppercase text-muted-foreground">N-Vis: {statusCounts.notVisited}</span></div>
              </div>
          </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Card className="shadow-xl border-none overflow-hidden">
              <CardHeader className="bg-primary/5 pb-8">
                  <div className="flex justify-between items-center mb-4">
                      <Badge variant="secondary" className="bg-white/80 shadow-sm border-none font-bold">Question {currentQuestionIndex + 1} of {quiz.questions.length}</Badge>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">+{currentQuestion.marks} Marks</Badge>
                        {currentQuestion.negativeMarks > 0 && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">-{currentQuestion.negativeMarks} Neg.</Badge>}
                      </div>
                  </div>
                  <CardTitle className="text-xl md:text-2xl leading-relaxed text-foreground/90">{currentQuestion.text}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10">
                  {currentQuestion.imageUrl && (
                      <div className="mb-8 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-secondary/10 flex justify-center">
                          <img 
                              src={getGoogleDriveImageUrl(currentQuestion.imageUrl)} 
                              alt="Context" 
                              className="max-w-full h-auto max-h-[400px] object-contain p-2"
                              loading="lazy"
                          />
                      </div>
                  )}

                  <QuizQuestion
                      key={currentQuestion.id} 
                      question={currentQuestion}
                      answer={answers[currentQuestion.id]}
                      onAnswerChange={handleAnswerChange}
                  />
              </CardContent>
          </Card>
      </div>

      {/* Persistent Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-t p-3 md:p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="container mx-auto max-w-4xl flex items-center justify-between gap-3">
              <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0} className="rounded-xl h-12 px-3 md:px-6">
                  <ChevronLeft className="mr-1 h-5 w-5"/> <span className="hidden sm:inline">Previous</span>
              </Button>

              <Button 
                variant={isMarked ? "default" : "outline"} 
                onClick={handleMarkForReview} 
                className={cn("rounded-xl h-12 flex-1 max-w-[140px] md:max-w-none transition-all", isMarked ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "border-indigo-200 text-indigo-700 hover:bg-indigo-50")}
              >
                  {isMarked ? <Bookmark className="mr-1 h-4 w-4 fill-current"/> : <Bookmark className="mr-1 h-4 w-4"/>}
                  <span className="text-xs md:text-sm">{isMarked ? "Marked" : "Review"}</span>
              </Button>

              <Button 
                onClick={handleSaveAndNext} 
                className={cn("rounded-xl h-12 px-3 md:px-8 font-bold transition-all", hasAnswer ? "bg-green-600 hover:bg-green-700 shadow-md" : "")}
              >
                  {currentQuestionIndex === quiz.questions.length - 1 ? "Submit" : hasAnswer ? "Save & Next" : "Next"}
                  {currentQuestionIndex < quiz.questions.length - 1 && <ChevronRight className="ml-1 h-5 w-5"/>}
              </Button>
          </div>
      </div>

      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
          <AlertDialogContent className="rounded-2xl max-w-[90vw] sm:max-w-md">
              <AlertDialogHeader className="flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-4 rounded-full mb-2 text-primary">
                    <CheckCircle2 className="h-10 w-10"/>
                  </div>
                  <AlertDialogTitle className="text-2xl font-headline">Ready to submit?</AlertDialogTitle>
                  <AlertDialogDescription className="text-base pt-2">
                      You have answered <span className="font-bold text-green-600">{statusCounts.answered}</span> questions. 
                      Marked for review: <span className="font-bold text-indigo-600">{statusCounts.marked}</span>.
                      <br /><br />
                      Are you sure you want to finish the test?
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-6">
                  <Button variant="ghost" onClick={() => setShowSubmitConfirm(false)} className="rounded-xl h-12 font-bold">Review More</Button>
                  <AlertDialogAction onClick={triggerSubmit} className="rounded-xl h-12 font-bold bg-green-600 hover:bg-green-700">Finish Now</AlertDialogAction>
              </div>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function QuizAttemptPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <QuizAttemptContent />
        </Suspense>
    )
}
