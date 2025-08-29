
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getQuiz, type Quiz } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Timer, ListChecks, Info, User, School, MapPin, NotebookText, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function QuizStartPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizStatus, setQuizStatus] = useState<'available' | 'expired' | 'upcoming'>('available');
  const { toast } = useToast();
  
  // User details state
  const [userName, setUserName] = useState('');
  const [userSchool, setUserSchool] = useState('');
  const [userClass, setUserClass] = useState('');
  const [userPlace, setUserPlace] = useState('');

  useEffect(() => {
    async function loadQuiz() {
      if (!quizId) return;
      setLoading(true);

      const loadedQuiz = await getQuiz(quizId);
      if (loadedQuiz) {
        setQuiz(loadedQuiz);

        const now = new Date();
        const startTime = loadedQuiz.startTime?.toDate();
        const endTime = loadedQuiz.endTime?.toDate();

        if (startTime && now < startTime) {
          setQuizStatus('upcoming');
        } else if (endTime && now > endTime) {
          setQuizStatus('expired');
        } else {
            // Check for previous attempt only if the quiz is available
            const hasAttempted = localStorage.getItem(`quiz-attempted-${quizId}`);
            if (hasAttempted) {
                toast({
                    title: "Quiz Already Attempted",
                    description: "Redirecting to your results...",
                });
                 // Get stored data for results page redirection
                const savedData = JSON.parse(localStorage.getItem(`quiz-data-${quizId}`) || '{}');
                const queryParams = new URLSearchParams({
                    answers: encodeURIComponent(savedData.answers || '{}'),
                    name: savedData.name || 'Anonymous',
                    school: savedData.school || '',
                    class: savedData.class || '',
                    place: savedData.place || ''
                }).toString();
                router.replace(`/quizzes/${quizId}/results?${queryParams}`);
            } else {
               setQuizStatus('available');
            }
        }

      } else {
        toast({ variant: 'destructive', title: 'Quiz not found' });
        router.push('/quizzes');
      }
      setLoading(false);
    }
    loadQuiz();
  }, [quizId, router, toast]);

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userSchool || !userClass || !userPlace) {
      toast({ variant: 'destructive', title: 'Please fill all details.' });
      return;
    }

    // Save user data to local storage in case they need to be redirected back
    const quizData = { name: userName, school: userSchool, class: userClass, place: userPlace };
    localStorage.setItem(`quiz-data-${quizId}`, JSON.stringify(quizData));

    const queryParams = new URLSearchParams(quizData).toString();
    
    router.push(`/quizzes/${quizId}/attempt?${queryParams}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (!quiz) {
    return <div className="text-center py-16">Quiz not found or could not be loaded.</div>;
  }

  const renderQuizStatusMessage = () => {
    if (quizStatus === 'expired') {
        return (
            <Card className="text-center p-8 bg-destructive/10 border-destructive">
                <Clock className="h-12 w-12 mx-auto text-destructive mb-4" />
                <CardTitle className="text-2xl font-bold text-destructive">Quiz Expired</CardTitle>
                <CardDescription className="text-destructive/80">This quiz is no longer available for attempts.</CardDescription>
            </Card>
        )
    }
     if (quizStatus === 'upcoming' && quiz.startTime) {
        return (
            <Card className="text-center p-8 bg-secondary">
                <Clock className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle className="text-2xl font-bold">Quiz Upcoming</CardTitle>
                <CardDescription>This quiz will be available from:</CardDescription>
                <p className="font-bold text-lg mt-2">{format(quiz.startTime.toDate(), "PPP p")}</p>
            </Card>
        )
    }
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
            <div>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">{quiz.title}</CardTitle>
                        <CardDescription>{quiz.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <h3 className="font-headline text-xl font-semibold">Instructions</h3>
                        <ul className="space-y-3 text-muted-foreground">
                            <li className="flex items-start gap-3">
                                <ListChecks className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                <span>This quiz contains <strong>{quiz.questions.length} questions</strong>.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Timer className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                <span>You will have <strong>{quiz.duration || 'unlimited'} minutes</strong> to complete the quiz.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                <span>Each question has only one correct answer. Choose the best option.</span>
                            </li>
                             <li className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                                <span className="font-semibold">This quiz can only be attempted once.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                                <span className="font-semibold">Do not switch tabs or minimize the app, or your quiz will be submitted automatically.</span>
                            </li>
                             <li className="flex items-start gap-3">
                                <NotebookText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                <span>Results will be available after the quiz period ends.</span>
                            </li>
                        </ul>
                    </CardContent>
                 </Card>
            </div>
             <div>
                {quizStatus === 'available' ? (
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Enter Your Details</CardTitle>
                            <CardDescription>Please fill in your details to start the quiz.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleStartQuiz} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="flex items-center gap-2"><User className="h-4 w-4"/> Name</Label>
                                    <Input id="name" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Your full name" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="school" className="flex items-center gap-2"><School className="h-4 w-4"/> School Name</Label>
                                    <Input id="school" value={userSchool} onChange={(e) => setUserSchool(e.target.value)} placeholder="Your school name" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="class" className="flex items-center gap-2"><NotebookText className="h-4 w-4"/> Class</Label>
                                    <Input id="class" value={userClass} onChange={(e) => setUserClass(e.target.value)} placeholder="e.g., 10th, 12th" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="place" className="flex items-center gap-2"><MapPin className="h-4 w-4"/> Place</Label>
                                    <Input id="place" value={userPlace} onChange={(e) => setUserPlace(e.target.value)} placeholder="Your city/village" required />
                                </div>
                                <Button type="submit" className="w-full" size="lg">Start Quiz</Button>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    renderQuizStatusMessage()
                )}
            </div>
        </div>
    </div>
  );
}
