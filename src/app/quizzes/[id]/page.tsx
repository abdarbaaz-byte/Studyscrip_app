

"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getQuiz, type Quiz, getSchool } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Timer, ListChecks, Info, User, School, NotebookText, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

function QuizStartPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = params.id as string;
  const quizType = searchParams.get('type') || 'practice'; // Default to practice
  const schoolId = searchParams.get('schoolId');
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizStatus, setQuizStatus] = useState<'available' | 'expired' | 'upcoming'>('available');
  
  // User details state
  const [userName, setUserName] = useState('');
  const [userClass, setUserClass] = useState('');
  const [userSchool, setUserSchool] = useState('');

  const loadQuizAndUser = useCallback(async () => {
    if (!quizId) return;
    setLoading(true);

    if (quizType === 'live') {
      const hasAttempted = localStorage.getItem(`quiz-attempted-${quizId}`);
      if (hasAttempted) {
        const savedDataString = localStorage.getItem(`quiz-data-${quizId}`);
        if (savedDataString) {
          const savedData = JSON.parse(savedDataString);
          toast({
            title: "Quiz Already Attempted",
            description: "Redirecting to your results...",
          });
          const queryParams = new URLSearchParams({
            type: 'live',
            answers: savedData.answers,
            name: savedData.name || 'Anonymous',
            schoolId: schoolId || '',
          }).toString();
          router.replace(`/quizzes/${quizId}/results?${queryParams}`);
          return;
        }
      }
    }

    const loadedQuiz = await getQuiz(quizId);
    if (loadedQuiz) {
      setQuiz(loadedQuiz);

      if (user) {
        if (schoolId) {
          // For school tests, get details from the school's student list
          const schoolData = await getSchool(schoolId);
          const studentInfo = schoolData?.students?.find(s => s.uid === user.uid);
          if (studentInfo) {
            setUserName(studentInfo.name);
            setUserClass(studentInfo.userClass);
          } else {
            toast({
                variant: 'destructive',
                title: 'Access Error',
                description: 'You are not enrolled as a student in this school.'
            });
            router.push('/');
            return;
          }
        } else {
          setUserName(user.displayName || '');
        }
      }

      const now = new Date();
      const startTime = loadedQuiz.startTime?.toDate();
      const endTime = loadedQuiz.endTime?.toDate();

      if (startTime && now < startTime) {
        setQuizStatus('upcoming');
      } else if (endTime && now > endTime) {
        setQuizStatus('expired');
      } else {
        setQuizStatus('available');
      }

    } else {
      toast({ variant: 'destructive', title: 'Quiz not found' });
      router.push('/quizzes');
    }
    setLoading(false);
  }, [quizId, router, toast, quizType, schoolId, user]);
  
  useEffect(() => {
    loadQuizAndUser();
  }, [loadQuizAndUser]);

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast({ variant: 'destructive', title: 'Please Log In', description: 'You must be logged in to start a quiz.' });
        router.push(`/login?redirect=/quizzes/${quizId}?type=${quizType}${schoolId ? `&schoolId=${schoolId}`:''}`);
        return;
    }
    
    if (quizType === 'live' && !schoolId && (!userName || !userClass || !userSchool)) {
        toast({ variant: 'destructive', title: 'Please fill all your details for the quiz.' });
        return;
    }
    
    let quizData: any = { 
        type: quizType,
        name: userName || user.displayName, 
        class: userClass,
        school: userSchool,
        userId: user.uid,
        userEmail: user.email || ''
    };

    if (schoolId) {
        quizData.schoolId = schoolId;
    }
    
    const queryParams = new URLSearchParams(quizData).toString();
    
    router.push(`/quizzes/${quizId}/attempt?${queryParams}`);
  };

  if (authLoading || loading) {
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

  const isFormRequired = quizType === 'live' && !schoolId;

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
                        <h3 className="font-headline text-xl font-semibold">Instructions / निर्देश</h3>
                        <ul className="space-y-3 text-muted-foreground">
                            <li className="flex items-start gap-3">
                                <ListChecks className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                <div>
                                    <span>This quiz contains <strong>{quiz.questions.length} questions</strong>.</span>
                                    <p className="text-xs">इस क्विज़ में <strong>{quiz.questions.length} प्रश्न</strong> हैं।</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Timer className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                 <div>
                                    <span>You will have <strong>{quiz.duration || 'unlimited'} minutes</strong> to complete the quiz.</span>
                                    <p className="text-xs">आपको क्विज़ पूरा करने के लिए <strong>{quiz.duration || 'अनलिमिटेड'} मिनट</strong> मिलेंगे।</p>
                                </div>
                            </li>
                             <li className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                <div>
                                    <span className={cn(quizType === 'practice' && "font-semibold text-green-600")}>
                                        {quizType === 'practice' ? 'You can attempt this quiz multiple times.' : 'Each question has only one correct answer.'}
                                    </span>
                                     <p className="text-xs">
                                        {quizType === 'practice' ? 'आप इस क्विज़ को कई बार हल कर सकते हैं।' : 'हर प्रश्न का केवल एक ही सही उत्तर है।'}
                                    </p>
                                </div>
                            </li>
                             <li className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                                <div>
                                    <span className="font-semibold">Do not switch tabs or minimize the app, or your quiz will be submitted automatically.</span>
                                    <p className="text-xs font-semibold">ऐप का टैब न बदलें और न ही ऐप को मिनिमाइज़ करें, वरना आपका क्विज़ अपने आप सबमिट हो जाएगा।</p>
                                </div>
                            </li>
                             <li className="flex items-start gap-3">
                                <NotebookText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                <div>
                                    <span className={cn(quizType === 'live' && "font-semibold")}>
                                      {quizType === 'live' ? 'Results will be available after the quiz period ends.' : 'Results are shown immediately after submission.'}
                                    </span>
                                    <p className="text-xs">
                                        {quizType === 'live' ? 'परिणाम क्विज़ अवधि समाप्त होने के बाद उपलब्ध होंगे।' : 'परिणाम सबमिट करने के तुरंत बाद दिखाए जाते हैं।'}
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </CardContent>
                 </Card>
            </div>
             <div>
                {quizStatus === 'available' ? (
                    isFormRequired ? (
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Enter Your Details</CardTitle>
                            <CardDescription>Please fill in your details to start the live quiz.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleStartQuiz} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="flex items-center gap-2"><User className="h-4 w-4"/> Name</Label>
                                    <Input id="name" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Your full name" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="class" className="flex items-center gap-2"><NotebookText className="h-4 w-4"/> Class</Label>
                                    <Input id="class" value={userClass} onChange={(e) => setUserClass(e.target.value)} placeholder="e.g., 10th, 12th" required />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="school" className="flex items-center gap-2"><School className="h-4 w-4"/> School Name</Label>
                                    <Input id="school" value={userSchool} onChange={(e) => setUserSchool(e.target.value)} placeholder="e.g., Delhi Public School" required />
                                </div>
                                <Button type="submit" className="w-full" size="lg">Start Live Quiz</Button>
                            </form>
                        </CardContent>
                    </Card>
                    ) : (
                         <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">Ready to Start?</CardTitle>
                                <CardDescription>Click below to begin the {quizType}.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleStartQuiz}>
                                    <Button type="submit" className="w-full" size="lg">Start {quizType === 'live' ? 'Test' : 'Practice'}</Button>
                                </form>
                            </CardContent>
                        </Card>
                    )
                ) : (
                    renderQuizStatusMessage()
                )}
            </div>
        </div>
    </div>
  );
}

export default function QuizStartPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <QuizStartPageContent />
        </Suspense>
    )
}
