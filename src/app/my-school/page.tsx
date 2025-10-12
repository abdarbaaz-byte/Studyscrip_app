

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { getSchool, type School, getSchoolNotes, type SchoolNote, type ContentItem, getSchoolTests, type Quiz, getSchoolInformation, type SchoolInformation } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, School as SchoolIcon, FileText, BrainCircuit, Video, Image as ImageIcon, ArrowRight, Timer, ListChecks, User, Megaphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

export default function MySchoolPage() {
  const { user, userSchoolId, loading: authLoading } = useAuth();
  const router = useRouter();
  const [school, setSchool] = useState<School | null>(null);
  const [notes, setNotes] = useState<SchoolNote[]>([]);
  const [tests, setTests] = useState<Quiz[]>([]);
  const [information, setInformation] = useState<SchoolInformation[]>([]);
  const [userClass, setUserClass] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [contentToView, setContentToView] = useState<ContentItem | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!userSchoolId) {
      setLoadingData(false);
      return;
    }

    async function loadSchoolData() {
      try {
        const schoolData = await getSchool(userSchoolId!);
        setSchool(schoolData);

        // Find the current student's class from the school data
        const studentInfo = schoolData?.students?.find(s => s.uid === user?.uid);
        const studentClass = studentInfo?.userClass || null;
        setUserClass(studentClass);

        const [schoolNotes, schoolTests, schoolInfo] = await Promise.all([
            getSchoolNotes(userSchoolId!),
            getSchoolTests(userSchoolId!),
            getSchoolInformation(userSchoolId!),
        ]);

        // Filter content based on student's class
        const visibleNotes = schoolNotes.filter(note => note.targetClass === 'all' || note.targetClass === studentClass);
        const visibleTests = schoolTests.filter(test => test.targetClass === 'all' || test.targetClass === studentClass);
        const visibleInfo = schoolInfo.filter(info => info.targetClass === 'all' || info.targetClass === studentClass);
        
        setNotes(visibleNotes);
        setTests(visibleTests);
        setInformation(visibleInfo);

      } catch (error) {
        console.error("Failed to load school data:", error);
      } finally {
        setLoadingData(false);
      }
    }

    loadSchoolData();
  }, [user, userSchoolId, authLoading, router]);

  const getContentIcon = (type: ContentItem['type']) => {
    if (type === 'pdf') return <FileText className="h-5 w-5 text-primary" />;
    if (type === 'video') return <Video className="h-5 w-5 text-primary" />;
    return <ImageIcon className="h-5 w-5 text-primary" />;
  };

  const handleViewContent = (item: ContentItem) => {
    setContentToView(item);
  };
  
  const renderContentInDialog = () => {
    if (!contentToView) return null;

    const { type, url, title } = contentToView;
    
    const getYouTubeId = (youtubeUrl: string) => {
      const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
      ];
      for (const pattern of patterns) {
        const match = youtubeUrl.match(pattern);
        if (match && match[1]) return match[1];
      }
      return null;
    };
    
    const getGoogleDriveFileId = (driveUrl: string) => {
        const match = driveUrl.match(/file\/d\/([^/]+)/);
        return match ? match[1] : null;
    }

    let contentUrl = url;

    if (type === 'pdf') {
        return (
             <iframe 
                src={url} 
                className="w-full h-full border-0" 
                title={title} 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
            ></iframe>
        );
    }

    if (type === 'video') {
        const youtubeId = getYouTubeId(url);
        if (youtubeId) {
            contentUrl = `https://www.youtube.com/embed/${youtubeId}?rel=0&showinfo=0&iv_load_policy=3`;
        } else {
            const driveId = getGoogleDriveFileId(url);
            if (driveId) {
                contentUrl = `https://drive.google.com/file/d/${driveId}/preview`;
            } else {
                contentUrl = url;
            }
        }
        return (
            <iframe 
                src={contentUrl} 
                className="w-full h-full border-0" 
                title={title} 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
            ></iframe>
        );
    }
    
    if (type === 'image') {
      return (
        <div className="w-full h-full flex items-center justify-center overflow-auto bg-secondary">
            <Image src={url} alt={title} width={1200} height={800} className="max-w-full max-h-full object-contain" />
        </div>
      );
    }
    
    return <p>Unsupported content type.</p>;
  };

  if (authLoading || loadingData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!userSchoolId || !school) {
    return (
      <div className="container mx-auto py-10 text-center">
        <Card className="max-w-md mx-auto p-8">
            <CardHeader>
                <CardTitle>Not Enrolled in a School</CardTitle>
                <CardDescription>
                    You are not currently enrolled in any school or institute on this platform.
                    Please contact your teacher to get access.
                </CardDescription>
            </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <>
    <div className="container mx-auto py-10 space-y-8">
      <div className="text-center">
        <SchoolIcon className="h-16 w-16 mx-auto text-primary mb-4" />
        <h1 className="font-headline text-4xl font-bold">{school.name}</h1>
        <p className="text-xl text-muted-foreground">Your School Portal</p>
         {userClass && <div className="mt-2 inline-flex items-center gap-2 text-sm font-medium bg-secondary text-secondary-foreground py-1 px-3 rounded-full"><User className="h-4 w-4"/> Class: {userClass}</div>}
      </div>

      <Accordion type="multiple" defaultValue={["info", "notes", "tests"]} className="w-full max-w-4xl mx-auto space-y-4">
         <AccordionItem value="info" className="border rounded-lg bg-card">
          <AccordionTrigger className="p-6 text-xl font-headline hover:no-underline">
            <div className="flex items-center gap-4">
                <Megaphone />
                Information
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
             {information.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                    No information posted by your teacher yet.
                </p>
             ) : (
                <div className="space-y-4">
                    {information.map(info => (
                         <div key={info.id} className="p-4 border rounded-md bg-secondary/50">
                            <h4 className="font-semibold">{info.title}</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{info.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">Posted on: {format(info.createdAt.toDate(), "PPP")}</p>
                         </div>
                    ))}
                </div>
             )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="notes" className="border rounded-lg bg-card">
          <AccordionTrigger className="p-6 text-xl font-headline hover:no-underline">
            <div className="flex items-center gap-4">
                <FileText />
                Notes
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
             {notes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                    Your teacher has not added any notes yet.
                </p>
             ) : (
                <Accordion type="single" collapsible className="w-full space-y-3">
                    {notes.map(note => (
                         <AccordionItem value={note.id} key={note.id} className="border rounded-md px-4 bg-secondary/50">
                             <AccordionTrigger className="hover:no-underline font-medium">
                                 {note.title}
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-3 pt-2">
                                     {note.content.map((item, index) => (
                                        <li key={index} className="flex items-center justify-between p-3 rounded-lg bg-background list-none">
                                        <div className="flex items-center gap-4">
                                            {getContentIcon(item.type)}
                                            <span className="font-medium">{item.title}</span>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => handleViewContent(item)}>View</Button>
                                        </li>
                                    ))}
                                    {note.content.length === 0 && <p className="text-sm text-center py-2">No content here yet.</p>}
                                </div>
                            </AccordionContent>
                         </AccordionItem>
                    ))}
                </Accordion>
             )}
          </AccordionContent>
        </AccordionItem>

         <AccordionItem value="tests" className="border rounded-lg bg-card">
          <AccordionTrigger className="p-6 text-xl font-headline hover:no-underline">
             <div className="flex items-center gap-4">
                <BrainCircuit />
                Tests
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
             {tests.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                    No tests have been assigned yet.
                </p>
             ) : (
                <div className="space-y-4">
                    {tests.map(test => (
                        <Card key={test.id} className="flex flex-col sm:flex-row items-center justify-between p-4">
                           <div>
                            <CardTitle className="font-headline text-lg">{test.title}</CardTitle>
                            <CardDescription>{test.description}</CardDescription>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                               <div className="flex items-center gap-1"><ListChecks className="h-3 w-3"/> {test.questions.length} Questions</div>
                               <div className="flex items-center gap-1"><Timer className="h-3 w-3"/> {test.duration || 'N/A'} mins</div>
                            </div>
                           </div>
                           <Button asChild className="mt-4 sm:mt-0">
                                <Link href={`/quizzes/${test.id}?type=live&schoolId=${userSchoolId}`}>
                                    Take Test <ArrowRight className="ml-2 h-4 w-4"/>
                                </Link>
                           </Button>
                        </Card>
                    ))}
                </div>
             )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>

    <Dialog open={!!contentToView} onOpenChange={() => setContentToView(null)}>
        <DialogContent className="w-screen h-screen max-w-none p-0 flex flex-col">
          <DialogHeader className="p-2 border-b shrink-0">
            <DialogTitle>{contentToView?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 bg-secondary min-h-0">
            {renderContentInDialog()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
