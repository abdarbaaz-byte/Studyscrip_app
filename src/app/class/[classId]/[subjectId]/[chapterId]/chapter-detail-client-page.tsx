
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, FileText, Video, Image as ImageIcon, ChevronRight, Loader2 } from "lucide-react";
import { type ContentItem, type Chapter, type Subject, type AcademicClass, getAcademicData } from "@/lib/academics";
import { useParams, notFound, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { checkUserPurchase } from "@/lib/data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function ChapterDetailClientPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const subjectId = params.subjectId as string;
  const chapterId = params.chapterId as string;

  const [academicClass, setAcademicClass] = useState<AcademicClass>();
  const [subject, setSubject] = useState<Subject>();
  const [chapter, setChapter] = useState<Chapter>();
  const [chapterIndex, setChapterIndex] = useState(-1);
  const [isSubjectPurchased, setIsSubjectPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contentToView, setContentToView] = useState<ContentItem | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    async function loadChapterData() {
        if (classId && subjectId && chapterId) {
            const classes = await getAcademicData();
            const foundClass = classes.find(c => c.id === classId);
            const foundSubject = foundClass?.subjects.find(s => s.id === subjectId);
            const foundChapter = foundSubject?.chapters.find(ch => ch.id === chapterId);
            const foundChapterIndex = foundSubject?.chapters.findIndex(ch => ch.id === chapterId) ?? -1;

            setAcademicClass(foundClass);
            setSubject(foundSubject);
            setChapter(foundChapter);
            setChapterIndex(foundChapterIndex);

            if (user) {
              const hasAccess = await checkUserPurchase(user.uid, subjectId);
              setIsSubjectPurchased(hasAccess);
            }
        }
        setLoading(false);
    }
    loadChapterData();
  }, [classId, subjectId, chapterId, user]);
  
  if (loading) {
    return (
        <div className="container mx-auto px-4 py-8 flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  if (!academicClass || !subject || !chapter) {
    notFound();
  }

  const isFirstChapter = chapterIndex === 0;
  const hasAccess = isFirstChapter || isSubjectPurchased;

  const getContentIcon = (type: ContentItem['type']) => {
    if (type === 'pdf') return <FileText className="h-5 w-5 text-primary" />;
    if (type === 'video') return <Video className="h-5 w-5 text-primary" />;
    return <ImageIcon className="h-5 w-5 text-primary" />;
  };

  const handleUnlockSubject = () => {
    if(!user) {
        router.push('/login');
    } else {
        router.push(`/class/${academicClass.id}/${subject.id}`);
    }
  }

  const handleViewContent = (item: ContentItem) => {
    if (!hasAccess) {
       toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Please purchase the subject to view the content.",
      });
      return;
    }
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

    if (type === 'video') {
      const youtubeId = getYouTubeId(url);
      if (youtubeId) {
        const embedUrl = `https://www.youtube.com/embed/${youtubeId}?rel=0&showinfo=0&iv_load_policy=3`;
        return <iframe src={embedUrl} className="w-full h-full" title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>;
      }
      const driveId = getGoogleDriveFileId(url);
      if (driveId) {
         const embedUrl = `https://drive.google.com/file/d/${driveId}/preview`;
         return <iframe src={embedUrl} className="w-full h-full" title={title} allow="autoplay" allowFullScreen></iframe>;
      }
      // Fallback for other video URLs
      return <iframe src={url} className="w-full h-full" title={title} allow="autoplay; fullscreen" allowFullScreen></iframe>;
    }

    if (type === 'pdf') {
       const driveId = getGoogleDriveFileId(url);
       if (driveId) {
           const embedUrl = `https://drive.google.com/file/d/${driveId}/preview`;
           return <iframe src={embedUrl} className="w-full h-full" title={title}></iframe>;
       }
       // For other PDFs, add #toolbar=0 to attempt to hide controls
       return <iframe src={`${url}#toolbar=0`} className="w-full h-full" title={title}></iframe>;
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

  return (
    <>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
           <Link href={`/class/${academicClass.id}/${subject.id}`} className="text-sm text-muted-foreground hover:text-primary flex items-center">
              <ChevronRight className="h-4 w-4 transform rotate-180 mr-1" />
              Back to {subject.name} Chapters
          </Link>
          <h1 className="font-headline text-3xl md:text-5xl font-bold mt-2 flex items-center gap-4">
            {chapter.name}
            {!hasAccess && <Lock className="h-8 w-8 text-muted-foreground" />}
            {isFirstChapter && !isSubjectPurchased && <Badge className="bg-green-600 hover:bg-green-700">Free Preview</Badge>}
          </h1>
          <p className="text-lg text-muted-foreground">Content for this chapter.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Chapter Content</CardTitle>
              </CardHeader>
              <CardContent>
                 {!hasAccess ? (
                    <div className="text-center py-16">
                       <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                       <h3 className="text-xl font-semibold">This Chapter is Locked</h3>
                       <p className="text-muted-foreground">Purchase the subject to unlock this and all other chapters.</p>
                        <Button onClick={handleUnlockSubject} className="mt-4">
                             <Unlock className="mr-2 h-4 w-4" />
                             Unlock Subject
                       </Button>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {chapter.content.map((item) => (
                        <li key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                          <div className="flex items-center gap-4">
                            {getContentIcon(item.type)}
                            <span className="font-medium">{item.title}</span>
                            <Badge variant={item.type === 'pdf' ? 'secondary' : 'default'} className="capitalize">{item.type}</Badge>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleViewContent(item)}>View</Button>
                        </li>
                      ))}
                      {chapter.content.length === 0 && (
                          <p className="text-center text-muted-foreground py-8">No content available for this chapter yet.</p>
                      )}
                    </ul>
                  )}
              </CardContent>
            </Card>
          </div>
          
          <aside className="md:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                  <CardTitle>{subject.name}</CardTitle>
                  <CardDescription>Full Subject</CardDescription>
              </CardHeader>
              <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Purchase this subject to get access to all its chapters and content.</p>
                   <Button onClick={handleUnlockSubject} size="lg" className="w-full">
                       <Unlock className="mr-2 h-4 w-4" /> View Purchase Options
                    </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
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

    