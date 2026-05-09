
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, BrainCircuit, ArrowRight, Timer, ListChecks, Orbit, ShieldCheck, Circle, Folder, ChevronLeft, ChevronRight, Lock, Clock } from "lucide-react";
import { getQuizzes, getQuizFolders, type Quiz, type QuizFolder } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollAnimation } from "@/components/scroll-animation";
import { format } from "date-fns";

const ACADEMIC_CLASSES = ["5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

export default function QuizzesPage() {
  const [liveQuizzes, setLiveQuizzes] = useState<Quiz[]>([]);
  const [practiceQuizzes, setPracticeQuizzes] = useState<Quiz[]>([]);
  const [folders, setFolders] = useState<QuizFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuizzesAndFolders() {
      setLoading(true);
      const [allQuizzes, allFolders] = await Promise.all([
          getQuizzes(),
          getQuizFolders()
      ]);
      
      setFolders(allFolders);

      // Filter quizzes to only show those targeted at academic classes
      const generalQuizzes = allQuizzes.filter(quiz => {
        const targets = quiz.targetClasses || [];
        // Check if any selected target is an academic class
        const hasAcademicTarget = targets.some(t => ACADEMIC_CLASSES.includes(t));
        // Legacy support: also check singular targetClass
        const isLegacyAcademic = quiz.targetClass && ACADEMIC_CLASSES.includes(quiz.targetClass);
        
        return hasAcademicTarget || isLegacyAcademic;
      });

      const live = generalQuizzes.filter(q => q.startTime || q.endTime);
      const practice = generalQuizzes.filter(q => !q.startTime && !q.endTime);
      setLiveQuizzes(live);
      setPracticeQuizzes(practice);
      setLoading(false);
    }
    loadQuizzesAndFolders();
  }, []);

  const QuizCard = ({ quiz, isLiveType }: { quiz: Quiz, isLiveType: boolean }) => {
    const now = new Date();
    const start = quiz.startTime?.toDate();
    const end = quiz.endTime?.toDate();
    const isCurrentlyLive = start && end && now >= start && now <= end;
    const isExpired = end && now > end;
    const isUpcoming = start && now < start;

    return (
      <Card key={quiz.id} className="flex flex-col h-full transition-all duration-300 hover:shadow-md relative border-2 border-transparent hover:border-primary/10 overflow-hidden">
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
          {isCurrentlyLive && (
              <Badge variant="destructive" className="flex items-center gap-1.5 bg-red-600 animate-pulse border-none px-3 py-1 text-[10px] font-bold shadow-md">
                <Circle className="h-2 w-2 fill-white animate-pulse" />
                LIVE
              </Badge>
          )}
          {isExpired && (
             <Badge variant="secondary" className="bg-gray-500 text-white border-none px-3 py-1 text-[10px] font-bold shadow-sm">
                EXPIRED
             </Badge>
          )}
          {isUpcoming && (
             <Badge variant="secondary" className="bg-blue-600 text-white border-none px-3 py-1 text-[10px] font-bold shadow-sm">
                UPCOMING
             </Badge>
          )}
        </div>
        
        <CardHeader>
          <CardTitle className="font-headline text-2xl pr-16">{quiz.title}</CardTitle>
          <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
          {isUpcoming && start && (
            <div className="flex items-center gap-1.5 mt-2 p-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-700">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-tight">Starts: {format(start, "p, MMM d")}</span>
            </div>
          )}
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
          <Button asChild className="w-full font-bold h-11" variant={isExpired ? "outline" : isUpcoming ? "secondary" : "default"} disabled={isUpcoming}>
            <Link href={isUpcoming ? "#" : `/quizzes/${quiz.id}?type=${isLiveType ? 'live' : 'practice'}`}>
              {isCurrentlyLive ? 'Take Live Quiz' : isExpired ? 'View Analysis' : isUpcoming ? 'Locked Until Start' : 'Start Quiz'} 
              {!isUpcoming && <ArrowRight className="ml-2 h-4 w-4" />}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const filteredPracticeQuizzes = selectedFolderId 
    ? practiceQuizzes.filter(q => q.folderId === selectedFolderId)
    : practiceQuizzes.filter(q => !q.folderId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <ScrollAnimation as="h1" className="font-headline text-4xl md:text-5xl font-bold">
          Quizzes
        </ScrollAnimation>
        <ScrollAnimation as="p" delay={100} className="text-lg text-muted-foreground mt-2">
          Test your knowledge with our live and practice quizzes.
        </ScrollAnimation>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="practice" className="w-full">
          <div className="flex justify-center mb-10">
            <TabsList className="grid w-full grid-cols-2 max-w-md h-14 bg-secondary/50 p-1.5 rounded-2xl border shadow-inner">
              <TabsTrigger 
                value="practice" 
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl gap-2 font-headline transition-all duration-300 hover:bg-indigo-600/10"
              >
                <ShieldCheck className="h-5 w-5" /> Practice
              </TabsTrigger>
              <TabsTrigger 
                value="live" 
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl gap-2 font-headline transition-all duration-300 hover:bg-orange-500/10"
              >
                <Orbit className="h-5 w-5" /> Live Quizzes
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="practice" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
            {selectedFolderId ? (
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => setSelectedFolderId(null)} className="rounded-full">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Folders
                        </Button>
                        <h2 className="text-2xl font-bold font-headline">
                            {folders.find(f => f.id === selectedFolderId)?.name} Quizzes
                        </h2>
                    </div>
                    {filteredPracticeQuizzes.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-secondary/10">
                            <ShieldCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                            <h3 className="text-xl font-bold text-muted-foreground">No quizzes in this folder</h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPracticeQuizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} isLiveType={false} />)}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-10">
                    {/* Folders List */}
                    {folders.length > 0 && (
                        <div className="flex flex-col gap-3 max-w-3xl mx-auto">
                            {folders.map((folder) => (
                                <div 
                                    key={folder.id} 
                                    onClick={() => setSelectedFolderId(folder.id)}
                                    className="group cursor-pointer flex items-center justify-between p-4 rounded-xl bg-white border border-border hover:border-indigo-600/50 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-indigo-100 p-2.5 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <Folder className="h-6 w-6" />
                                        </div>
                                        <span className="font-bold text-lg">{folder.name}</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Uncategorized Quizzes */}
                    {filteredPracticeQuizzes.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold font-headline flex items-center gap-2">
                                <BrainCircuit className="h-5 w-5 text-indigo-600" /> Other Quizzes
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredPracticeQuizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} isLiveType={false} />)}
                            </div>
                        </div>
                    )}

                    {folders.length === 0 && practiceQuizzes.length === 0 && (
                        <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-secondary/10">
                            <ShieldCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                            <h3 className="text-xl font-bold text-muted-foreground">No practice quizzes found</h3>
                            <p className="text-sm text-muted-foreground mt-1">Check back later for new academic practice material.</p>
                        </div>
                    )}
                </div>
            )}
          </TabsContent>

          <TabsContent value="live" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
            {liveQuizzes.length === 0 ? (
                 <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-secondary/10">
                    <Orbit className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-xl font-bold text-muted-foreground">No live quizzes scheduled</h3>
                    <p className="text-sm text-muted-foreground mt-1">Stay tuned! Live tests will appear here when scheduled.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {liveQuizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} isLiveType={true} />)}
                </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
