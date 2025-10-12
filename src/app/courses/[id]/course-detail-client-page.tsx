
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Course, type CourseContent } from "@/lib/courses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lock, Unlock, FileText, Video, Loader2, Image as ImageIcon, Radio } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { checkUserPurchase, createPurchase, getScheduledLiveClassesForItem, type LiveClass } from "@/lib/data";
import { useRouter } from "next/navigation";
import { PaymentDialog } from "@/components/payment-dialog";
import { getGoogleDriveImageUrl } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";


export default function CourseDetailClientPage({ course }: { course: Course }) {
  const [isPurchased, setIsPurchased] = useState(false);
  const [contentToView, setContentToView] = useState<CourseContent | null>(null);
  const [loadingPurchase, setLoadingPurchase] = useState(true);
  const [isBuying, setIsBuying] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [liveClass, setLiveClass] = useState<LiveClass | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();


  useEffect(() => {
    async function checkAccessAndLiveClasses() {
      if (course.docId) {
        setLoadingPurchase(true);
        const scheduledClass = await getScheduledLiveClassesForItem(course.docId);
        if (scheduledClass) {
          setLiveClass(scheduledClass);
        }
        if (user) {
          const hasAccess = await checkUserPurchase(user.uid, course.docId);
          setIsPurchased(hasAccess);
        }
      }
      setLoadingPurchase(false);
    }
    checkAccessAndLiveClasses();
  }, [user, course.docId]);

  const handleBuyClick = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You must be logged in to make a purchase.",
      });
      router.push("/login");
      return;
    }
    setIsPaymentDialogOpen(true);
  };


  const handlePurchaseConfirm = async (razorpayPaymentId: string) => {
    if (!user || !course.docId) return;

    setIsBuying(true);
    try {
        await createPurchase(
          user.uid, 
          user.email || 'Anonymous',
          course.docId, 
          course.title,
          'course',
          course.price,
          razorpayPaymentId
        );
        setIsPurchased(true);
        toast({
          title: "Purchase Successful!",
          description: `You now have access to "${course.title}".`,
        });
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Purchase Failed",
            description: "Something went wrong. Please try again.",
        });
        console.error("Purchase failed:", error);
    }
    setIsBuying(false);
    setIsPaymentDialogOpen(false);
  };

  const handleViewContent = (content: CourseContent) => {
    if (!isPurchased) {
       toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Please purchase the course to view the content.",
      });
      return;
    }
    setContentToView(content);
  };

  const getContentIcon = (type: 'pdf' | 'video' | 'image') => {
    if (type === 'pdf') return <FileText className="h-5 w-5 text-primary" />;
    if (type === 'video') return <Video className="h-5 w-5 text-primary" />;
    return <ImageIcon className="h-5 w-5 text-primary" />;
  };

  const showPurchaseButton = !loadingPurchase && !isPurchased;
  const showPurchasedMessage = !loadingPurchase && isPurchased;

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

  const thumbnailUrl = getGoogleDriveImageUrl(course.thumbnail);
  const isLiveClassActive = liveClass && new Date() >= liveClass.startTime.toDate() && new Date() <= liveClass.endTime.toDate();

  return (
    <>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          <div className="md:col-span-2">
            <h1 className="font-headline text-3xl md:text-5xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-muted-foreground mb-6">{course.longDescription}</p>
            
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full space-y-3">
                  {(course.folders || []).map((folder) => (
                    <AccordionItem value={folder.id} key={folder.id} className="border rounded-md px-4 bg-secondary/50">
                      <AccordionTrigger className="hover:no-underline text-lg font-medium">{folder.name}</AccordionTrigger>
                      <AccordionContent className="pt-2">
                        <ul className="space-y-3">
                          {folder.content.map((item) => (
                            <li key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-background">
                              <div className="flex items-center gap-4">
                                {getContentIcon(item.type)}
                                <span className="font-medium">{item.title}</span>
                                <Badge variant={item.type === 'pdf' ? 'secondary' : 'default'} className="capitalize">{item.type}</Badge>
                              </div>
                              {isPurchased ? (
                                  <Button variant="ghost" size="sm" onClick={() => handleViewContent(item)}>View</Button>
                              ) : (
                                <Lock className="h-5 w-5 text-muted-foreground" />
                              )}
                            </li>
                          ))}
                          {folder.content.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-4">No content in this folder yet.</p>
                          )}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                {(course.folders || []).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No content available for this course yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          <aside className="md:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-0">
                <Image
                  src={thumbnailUrl}
                  alt={course.title}
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-t-lg prevent-long-press"
                  data-ai-hint="online course"
                  onContextMenu={(e) => e.preventDefault()}
                />
                <div className="p-6">
                  <div className="text-3xl font-bold mb-4">Rs. {course.price}</div>
                  {loadingPurchase && <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                  
                  {showPurchasedMessage && (
                    <div className="text-center font-semibold text-green-600 p-2 rounded-md bg-green-100 mb-4">
                      You have access to this course!
                    </div>
                  )}

                  {isLiveClassActive && (
                    <Button asChild size="lg" className="w-full mb-2 bg-red-600 hover:bg-red-700 animate-pulse">
                      <Link href={`/live-class/${liveClass!.id}`}>
                        <Radio className="mr-2 h-4 w-4"/> Join Live Now
                      </Link>
                    </Button>
                  )}

                  {showPurchaseButton && (
                    <Button size="lg" className="w-full" onClick={handleBuyClick} disabled={isBuying}>
                      {isBuying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlock className="mr-2 h-4 w-4" />}
                      {isBuying ? "Processing..." : "Buy Now"}
                    </Button>
                  )}
                  
                   {liveClass && !isLiveClassActive && (
                     <div className="mt-4 text-center text-sm text-muted-foreground p-3 bg-secondary rounded-lg">
                        <p className="font-semibold">Upcoming Live Class:</p>
                        <p>{liveClass.title}</p>
                        <p>on {format(liveClass.startTime.toDate(), "PPP p")}</p>
                    </div>
                  )}

                </div>
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
          <div className="flex-1 bg-secondary min-h-0 overflow-auto">
            {renderContentInDialog()}
          </div>
        </DialogContent>
      </Dialog>

       <PaymentDialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          itemName={course.title}
          itemPrice={course.price}
          isProcessing={isBuying}
          onConfirm={handlePurchaseConfirm}
          itemId={course.docId!}
          itemType="course"
        />
    </>
  );
}
