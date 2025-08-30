
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getQuiz, type Quiz, saveQuizAttempt, type QuizAttempt } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Timer, AlertTriangle } from "lucide-react";
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

type AnswersState = { [questionId: string]: number };

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
  }, [quizId, router, toast]);

  const handleSubmit = async () => {
    if (!quiz || hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    
    if (timerRef.current) clearInterval(timerRef.current);

    if (quizType === 'live') {
        let currentScore = 0;
        quiz.questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) {
                currentScore++;
            }
        });

        const attemptData: Omit<QuizAttempt, 'id' | 'submittedAt'> = {
          quizId,
          quizTitle: quiz.title,
          userId: userId,
          userEmail: userEmail,
          userName: name,
          userSchool: school || 'N/A',
          userClass: userClass || 'N/A',
          userPlace: place || 'N/A',
          answers,
          score: currentScore,
          totalQuestions: quiz.questions.length,
          percentage: (currentScore / quiz.questions.length) * 100,
        };
        
        try {
            await saveQuizAttempt(attemptData);
        } catch(error) {
            console.error("Failed to save quiz attempt:", error);
            toast({ variant: "destructive", title: "Error saving results. Please try again."})
            hasSubmittedRef.current = false; // Allow retry if saving fails
            return;
        }

        // Set localStorage flags for live quizzes to prevent re-attempts
        const encodedAnswers = encodeURIComponent(JSON.stringify(answers));
        localStorage.setItem(`quiz-attempted-${quiz.id}`, 'true');
        localStorage.setItem(`quiz-data-${quiz.id}`, JSON.stringify({
            answers: encodedAnswers,
            name,
            school,
            class: userClass,
            place
        }));
    }

    const encodedAnswers = encodeURIComponent(JSON.stringify(answers));
    const queryParams = new URLSearchParams({
        type: quizType,
        answers: encodedAnswers,
        name: name,
        school: school || '',
        class: userClass || '',
        place: place || ''
    }).toString();
    
    router.replace(`/quizzes/${quizId}/results?${queryParams}`);
  };

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeLeft === 0 && !hasSubmittedRef.current) {
        toast({
          title: "Time's Up!",
          description: "Your quiz has been automatically submitted.",
        });
        handleSubmit();
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
            handleSubmit();
        }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  
  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
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
            <RadioGroup 
                value={answers[currentQuestion.id]?.toString()} 
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}
                className="space-y-4"
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 border rounded-lg p-4 has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-colors">
                  <RadioGroupItem value={index.toString()} id={`q${currentQuestionIndex}-opt${index}`} />
                  <Label htmlFor={`q${currentQuestionIndex}-opt${index}`} className="text-base font-normal flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
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
                  <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
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
