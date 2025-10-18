

"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getQuiz, type Quiz, saveQuizAttempt, type QuizAttempt, type Question, type MatchOption } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Timer, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

type AnswersState = { [questionId: string]: number | string | { [matchId: string]: string } };

// Helper function to shuffle an array (Fisher-Yates shuffle algorithm)
const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  const newArray = [...array]; // Create a copy to avoid mutating the original
  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};

const QuizQuestion = ({ question, answer, onAnswerChange }: { question: Question, answer: any, onAnswerChange: (questionId: string, value: any) => void }) => {
    
    // State for re-orderable list
    const [orderedAnswers, setOrderedAnswers] = useState<MatchOption[]>([]);
    const initialAnswerSetRef = useRef(false);

    useEffect(() => {
        if (question.type === 'match' && question.matchOptions && !initialAnswerSetRef.current) {
            const initialOrder = shuffleArray([...question.matchOptions]);
            setOrderedAnswers(initialOrder);

            // IMPORTANT FIX: Immediately set the initial shuffled order as the answer.
            // This ensures an answer is recorded even if the user doesn't interact.
            const initialAnswerObject: { [matchId: string]: string } = {};
            question.matchOptions.forEach((qOpt, idx) => {
                initialAnswerObject[qOpt.id] = initialOrder[idx].answer;
            });
            onAnswerChange(question.id, initialAnswerObject);
            initialAnswerSetRef.current = true; // Mark as set to prevent re-shuffling on re-renders
        }
    }, [question, onAnswerChange]);

    const handleReorder = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= orderedAnswers.length) return;

        const newOrder = [...orderedAnswers];
        const temp = newOrder[index];
        newOrder[index] = newOrder[newIndex];
        newOrder[newIndex] = temp;

        setOrderedAnswers(newOrder);

        // Update the main `answers` state after reordering
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
                    {/* Column A (Questions) */}
                    <div className="space-y-4">
                        <div className="font-semibold text-center pb-2 border-b">Column A</div>
                        {question.matchOptions.map((matchOpt) => (
                            <div key={matchOpt.id} className="h-[52px] flex items-center justify-center p-3 bg-secondary rounded-md text-sm text-center">
                                {matchOpt.question}
                            </div>
                        ))}
                    </div>

                    <div className="text-muted-foreground text-2xl font-thin mt-12">...</div>

                    {/* Column B (Answers) - Re-orderable */}
                     <div className="space-y-4">
                        <div className="font-semibold text-center pb-2 border-b">Column B</div>
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
                        <Label htmlFor={`q-opt-true`} className="text-base font-normal flex-1 cursor-pointer">
                            True
                        </Label>
                    </div>
                    <div className="flex items-center space-x-3 border rounded-lg p-4 has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-colors">
                        <RadioGroupItem value="1" id={`q-opt-false`} />
                        <Label htmlFor={`q-opt-false`} className="text-base font-normal flex-1 cursor-pointer">
                            False
                        </Label>
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
                    className="text-base"
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
                        <Label htmlFor={`q-opt-${index}`} className="text-base font-normal flex-1 cursor-pointer">
                            {option}
                        </Label>
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
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmittedRef = useRef(false);

  // User details & quiz type from query params
  const quizType = searchParams.get('type') || 'practice';
  const schoolId = searchParams.get('schoolId'); // For school tests
  const name = searchParams.get('name') || 'Anonymous';
  const userClass = searchParams.get('class') || 'N/A';
  const userSchool = searchParams.get('school') || '';
  const userId = searchParams.get('userId');
  const userEmail = searchParams.get('userEmail');

  const handleSubmit = useCallback(async (currentAnswers: AnswersState) => {
    if (!quiz || hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    
    if (timerRef.current) clearInterval(timerRef.current);
    let score = 0;
    quiz.questions.forEach(q => {
        const userAnswer = currentAnswers[q.id];
        if (q.type === 'mcq' || q.type === 'true_false') {
            if (userAnswer?.toString() === q.correctAnswer?.toString()) {
                score++;
            }
        } else if (q.type === 'fill_in_blank') {
            if (typeof userAnswer === 'string' && userAnswer.trim().toLowerCase() === q.answerText.trim().toLowerCase()) {
                score++;
            }
        } else if (q.type === 'match') {
            if (typeof userAnswer === 'object' && userAnswer !== null && Object.keys(userAnswer).length > 0) {
                const correctMatches = q.matchOptions.every(
                    (opt) => (userAnswer as any)[opt.id] === opt.answer
                );
                if (correctMatches) {
                    score++;
                }
            }
        }
    });

    const encodedAnswers = encodeURIComponent(JSON.stringify(currentAnswers));

    if (quizType === 'live') {
        const attemptData: Omit<QuizAttempt, 'id' | 'submittedAt'> = {
          quizId,
          quizTitle: quiz.title,
          userId: userId,
          userEmail: userEmail,
          userName: name,
          userClass: userClass,
          userSchool: userSchool,
          answers: currentAnswers,
          score: score,
          totalQuestions: quiz.questions.length,
          percentage: (score / quiz.questions.length) * 100,
          schoolId: schoolId || null,
        };
        
        try {
            await saveQuizAttempt(attemptData);
            // Store attempt flag and data in localStorage for redirection
            localStorage.setItem(`quiz-attempted-${quiz.id}`, 'true');
            const dataToSave = { answers: encodedAnswers, name, class: userClass, school: userSchool };
            localStorage.setItem(`quiz-data-${quiz.id}`, JSON.stringify(dataToSave));
        } catch(error) {
            console.error("Failed to save quiz attempt:", error);
            toast({ variant: "destructive", title: "Error saving results. Please try again."})
            hasSubmittedRef.current = false; // Allow retry if saving fails
            return;
        }
    }
    
    const queryParams = new URLSearchParams({
        type: quizType,
        answers: encodedAnswers,
        name: name,
        class: userClass,
    });
    if (schoolId) {
        queryParams.set('schoolId', schoolId);
    }
    
    router.replace(`/quizzes/${quizId}/results?${queryParams.toString()}`);
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
        if (quizType === 'live') {
            const shuffledQuestions = shuffleArray(loadedQuiz.questions);
            setQuiz({ ...loadedQuiz, questions: shuffledQuestions });
        } else {
            setQuiz(loadedQuiz);
        }

        if (loadedQuiz.duration) {
          setTimeLeft(loadedQuiz.duration * 60);
        }
      } else {
        toast({ variant: 'destructive', title: 'Quiz not found' });
        router.push('/quizzes');
      }
      setLoading(false);
    }
    loadQuiz();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId, router, toast, quizType]);


  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeLeft === 0 && !hasSubmittedRef.current) {
        toast({
          title: "Time's Up!",
          description: "Your quiz has been automatically submitted.",
        });
        triggerSubmit();
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => (prev ? prev - 1 : 0));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, triggerSubmit]);

  useEffect(() => {
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden' && !hasSubmittedRef.current) {
            toast({
                variant: 'destructive',
                title: 'Quiz Submitted',
                description: 'You moved to another tab. Your quiz has been submitted to prevent cheating.',
            });
            triggerSubmit();
        }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [triggerSubmit]);

  
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (!quiz) {
    return <div className="text-center py-16">Quiz not found.</div>;
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
             <div>
                <CardTitle className="font-headline text-3xl">{quiz.title}</CardTitle>
                <CardDescription>Good luck, {name}!</CardDescription>
             </div>
            {timeLeft !== null && (
              <div className="flex items-center gap-2 font-mono text-xl font-bold bg-secondary px-4 py-2 rounded-lg">
                <Timer className="h-6 w-6"/>
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
          <div className="pt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-6 min-h-[300px]">
            <h2 className="text-xl font-semibold mb-6">{currentQuestion.text}</h2>
            <QuizQuestion
                key={currentQuestion.id} 
                question={currentQuestion}
                answer={answers[currentQuestion.id]}
                onAnswerChange={handleAnswerChange}
            />
          </div>
          
          <div className="flex justify-between items-center mt-8">
            <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
              Previous
            </Button>
            
            {isLastQuestion ? (
              <Button onClick={() => setShowSubmitConfirm(true)} className="bg-green-600 hover:bg-green-700">
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you ready to submit?</AlertDialogTitle>
                  <AlertDialogDescription>
                      You have answered {Object.keys(answers).length} out of {quiz.questions.length} questions. You cannot change your answers after submitting.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <Button variant="ghost" onClick={() => setShowSubmitConfirm(false)}>Review Answers</Button>
                  <AlertDialogAction onClick={triggerSubmit}>Submit</AlertDialogAction>
              </AlertDialogFooter>
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
