
"use client";

import { useState, useEffect, useRef, Suspense, useMemo, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getQuiz, type Quiz, saveQuizAttempt, type QuizAttempt, type Question, type MatchOption } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Timer, AlertTriangle, GripVertical } from "lucide-react";
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
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type AnswersState = { [questionId: string]: number | string | { [matchId: string]: string } };

// Helper function to shuffle an array
const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};


// Draggable Answer Item for Match the Following
const SortableAnswer = ({ id, answerText }: { id: string; answerText: string }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center gap-2 p-3 bg-white border rounded-md shadow-sm">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
            <span>{answerText}</span>
        </div>
    );
};


const QuizQuestion = ({ question, answer, onAnswerChange }: { question: Question, answer: any, onAnswerChange: (questionId: string, value: any) => void }) => {
    
    // State for drag and drop
    const [dndAnswers, setDndAnswers] = useState<MatchOption[]>([]);

    useEffect(() => {
        if (question.type === 'match' && question.matchOptions) {
            // If answers are already present, order them, else shuffle.
            if (answer && Object.keys(answer).length === question.matchOptions.length) {
                 const orderedAnswers = question.matchOptions.map(qOpt => {
                    const answerId = answer[qOpt.id];
                    return question.matchOptions.find(aOpt => aOpt.answer === answerId) || qOpt; // Fallback
                });
                setDndAnswers(orderedAnswers);
            } else {
                 setDndAnswers(shuffleArray([...question.matchOptions]));
            }
        }
    }, [question, answer]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setDndAnswers((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Update the main `answers` state after reordering
                const newAnswerObject: { [matchId: string]: string } = {};
                question.matchOptions.forEach((qOpt, index) => {
                    newAnswerObject[qOpt.id] = newOrder[index].answer;
                });
                onAnswerChange(question.id, newAnswerObject);

                return newOrder;
            });
        }
    };


    switch (question.type) {
        case 'match':
            return (
                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                    {/* Column A (Questions) */}
                    <div className="space-y-4">
                        <div className="font-semibold text-center pb-2 border-b">Column A</div>
                        {question.matchOptions.map((matchOpt) => (
                            <div key={matchOpt.id} className="h-[52px] flex items-center justify-center p-3 bg-secondary rounded-md text-sm text-center">
                                {matchOpt.question}
                            </div>
                        ))}
                    </div>

                    <div className="text-muted-foreground text-2xl font-thin">...</div>

                    {/* Column B (Answers) - Draggable */}
                     <div className="space-y-4">
                        <div className="font-semibold text-center pb-2 border-b">Column B</div>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={dndAnswers.map(a => a.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-2">
                                {dndAnswers.map(ans => (
                                    <SortableAnswer key={ans.id} id={ans.id} answerText={ans.answer} />
                                ))}
                                </div>
                            </SortableContext>
                        </DndContext>
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
  const name = searchParams.get('name') || 'Anonymous';
  const school = searchParams.get('school');
  const userClass = searchParams.get('class');
  const place = searchParams.get('place');
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
            if (typeof userAnswer === 'object' && userAnswer !== null) {
                const correctMatches = q.matchOptions.every(
                    (opt) => (userAnswer as any)[opt.id] === opt.answer
                );
                if (correctMatches) {
                    score++;
                }
            }
        }
    });

    if (quizType === 'live') {
        const attemptData: Omit<QuizAttempt, 'id' | 'submittedAt'> = {
          quizId,
          quizTitle: quiz.title,
          userId: userId,
          userEmail: userEmail,
          userName: name,
          userSchool: school || 'N/A',
          userClass: userClass || 'N/A',
          userPlace: place || 'N/A',
          answers: currentAnswers,
          score: score,
          totalQuestions: quiz.questions.length,
          percentage: (score / quiz.questions.length) * 100,
        };
        
        try {
            await saveQuizAttempt(attemptData);
        } catch(error) {
            console.error("Failed to save quiz attempt:", error);
            toast({ variant: "destructive", title: "Error saving results. Please try again."})
            hasSubmittedRef.current = false; // Allow retry if saving fails
            return;
        }

        const encodedAnswers = encodeURIComponent(JSON.stringify(currentAnswers));
        localStorage.setItem(`quiz-attempted-${quiz.id}`, 'true');
        localStorage.setItem(`quiz-data-${quiz.id}`, JSON.stringify({
            answers: encodedAnswers,
            name,
            school,
            class: userClass,
            place
        }));
    }

    const encodedAnswers = encodeURIComponent(JSON.stringify(currentAnswers));
    const queryParams = new URLSearchParams({
        type: quizType,
        answers: encodedAnswers,
        name: name,
        school: school || '',
        class: userClass || '',
        place: place || ''
    }).toString();
    
    router.replace(`/quizzes/${quizId}/results?${queryParams}`);
  }, [quiz, quizId, quizType, name, school, userClass, place, userId, userEmail, router, toast]);

  const triggerSubmit = useCallback(() => {
    handleSubmit(answers);
  }, [answers, handleSubmit]);

  useEffect(() => {
    async function loadQuiz() {
      if (!quizId) return;
      setLoading(true);
      const loadedQuiz = await getQuiz(quizId);
      if (loadedQuiz) {
        setQuiz(loadedQuiz);
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
  }, [quizId, router, toast]);


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
  }, [timeLeft]);

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
      setCurrentQuestionIndex(prev => prev + 1);
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
