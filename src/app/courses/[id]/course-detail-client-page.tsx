"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Course, type CourseContent, type DownloadItem } from "@/lib/courses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lock, Unlock, FileText, Video, Loader2, Image as ImageIcon, Radio, ArrowRight, ChevronRight, Download, PlayCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { checkUserPurchase, createPurchase, getScheduledLiveClassesForItem, type LiveClass } from "@/lib/data";
import { useRouter } from "next/navigation";
import { PaymentDialog } from "@/components/payment-dialog";
import { getGoogleDriveImageUrl } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


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
  const isFree = course.price === 0;
  const hasAccess = isPurchased || isFree;

  const discountPercentage = (course.originalPrice && course.price < course.originalPrice) 
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100) 
    : null;

  return (
    <>
      <div className={cn("container mx-auto px-4 py-8 md:py-12", !hasAccess && "pb-32")}>
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="font-headline text-3xl md:text-5xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-muted-foreground">{course.longDescription}</p>
            </div>
            
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-secondary/50">
                <TabsTrigger value="content" className="gap-2"><PlayCircle className="h-4 w-4"/> Course Content</TabsTrigger>
                <TabsTrigger value="downloads" className="gap-2"><Download className="h-4 w-4"/> Downloads</TabsTrigger>
              </TabsList>

              <TabsContent value="content">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline text-2xl">Online Viewing</CardTitle>
                    <CardDescription>View notes inside the app.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full space-y-3">
                      {(course.folders || []).map((folder) => (
                        <AccordionItem value={folder.id} key={folder.id} className="border rounded-md px-4 bg-secondary/20">
                          <AccordionTrigger className="hover:no-underline text-lg font-medium">{folder.name}</AccordionTrigger>
                          <AccordionContent className="pt-2">
                            <ul className="space-y-3">
                              {folder.content.map((item) => (
                                <li 
                                  key={item.id} 
                                  className="flex items-center gap-4 p-4 rounded-lg bg-background cursor-pointer hover:bg-secondary/10 transition-colors"
                                  onClick={() => handleViewContent(item)}
                                >
                                  {getContentIcon(item.type)}
                                  <span className="font-medium flex-1">{item.title}</span>
                                  {hasAccess ? (
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
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
              </TabsContent>

              <TabsContent value="downloads">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline text-2xl">Downloadable Files</CardTitle>
                    <CardDescription>Premium PDFs and resources for offline access.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                        {(course.downloadContent || []).map((item) => (
                            <div 
                                key={item.id}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-xl border transition-all group",
                                    hasAccess ? "bg-background hover:border-primary/50" : "bg-secondary/20 opacity-80"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "p-2 rounded-lg",
                                        hasAccess ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-400"
                                    )}>
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold">{item.title}</span>
                                        {!hasAccess && (
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-bold tracking-tight">
                                                <Lock className="h-2.5 w-2.5" /> Unlock on Purchase
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {hasAccess ? (
                                    <Button asChild size="sm" variant="secondary" className="group-hover:bg-primary group-hover:text-white">
                                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                                            <Download className="h-4 w-4 mr-2" /> Download
                                        </a>
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="outline" className="text-muted-foreground" disabled>
                                        <Lock className="h-4 w-4 mr-2" /> Locked
                                    </Button>
                                )}
                            </div>
                        ))}
                        {(course.downloadContent || []).length === 0 && (
                            <p className="text-center text-muted-foreground py-10">No downloadable files added for this course yet.</p>
                        )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <aside className="md:col-span-1">
            <Card className="sticky top-24 overflow-hidden border-2 border-primary/10 shadow-xl">
              <CardContent className="p-0">
                <div className="relative aspect-video">
                  <Image
                    src={thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover prevent-long-press"
                    data-ai-hint="online course"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  {discountPercentage && !isPurchased && (
                    <div className="absolute top-4 right-4 bg-orange-600 text-white font-black px-3 py-1 rounded-lg text-sm shadow-xl animate-bounce">
                        {discountPercentage}% OFF
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-medium text-muted-foreground">Course Fee</span>
                    <div className="text-right">
                       <span className="text-3xl font-black text-primary block">Rs. {course.price}</span>
                       {course.originalPrice && course.originalPrice > course.price && (
                          <span className="text-sm text-muted-foreground line-through font-medium">Rs. {course.originalPrice}</span>
                       )}
                       <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block mt-1">Get Access</span>
                    </div>
                  </div>
                  
                  {loadingPurchase && <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                  
                  {showPurchasedMessage && (
                    <div className="text-center font-bold text-green-700 p-3 rounded-xl bg-green-100 mb-4 border border-green-200 flex items-center justify-center gap-2">
                      <Unlock className="h-4 w-4"/> Enrolled Successfully
                    </div>
                  )}

                  {isLiveClassActive && (
                    <Button asChild size="lg" className="w-full mb-3 bg-red-600 hover:bg-red-700 animate-pulse rounded-xl">
                      <Link href={`/live-class/${liveClass!.id}`}>
                        <Radio className="mr-2 h-4 w-4"/> Join Live Now
                      </Link>
                    </Button>
                  )}

                  {showPurchaseButton && (
                    <Button size="lg" className="w-full rounded-xl shadow-lg h-12" onClick={handleBuyClick} disabled={isBuying}>
                      {isBuying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlock className="mr-2 h-4 w-4" />}
                      {isBuying ? "Processing..." : "Enroll Now"}
                    </Button>
                  )}
                  
                   {liveClass && !isLiveClassActive && (
                     <div className="mt-6 text-center text-xs text-muted-foreground p-4 bg-secondary/50 rounded-xl border border-dashed">
                        <p className="font-bold text-foreground mb-1 uppercase tracking-tight">Upcoming Live Session:</p>
                        <p className="font-medium text-primary mb-1">{liveClass.title}</p>
                        <p>{format(liveClass.startTime.toDate(), "PPP p")}</p>
                    </div>
                  )}

                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {!hasAccess && (
        <div className="fixed bottom-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t px-4 py-3 md:bottom-0 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            <div className="container mx-auto flex items-center justify-between gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">Rs. {course.price}</span>
                    </div>
                    {course.originalPrice && course.originalPrice > course.price && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground line-through">Rs. {course.originalPrice}</span>
                            {discountPercentage && <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded ml-1">{discountPercentage}% OFF</span>}
                        </div>
                    )}
                </div>
                <Button 
                    size="lg" 
                    onClick={handleBuyClick} 
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 rounded-xl transition-all active:scale-95 h-12 shadow-md"
                >
                    Enroll Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </div>
      )}
      
       <Dialog open={!!contentToView} onOpenChange={() => setContentToView(null)}>
        <DialogContent className="w-screen h-screen max-w-none p-0 flex flex-col">
          <DialogHeader className="p-2 border-b shrink-0 flex flex-row items-center justify-between">
            <DialogTitle className="truncate pl-4">{contentToView?.title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setContentToView(null)}><Download className="h-5 w-5"/></Button>
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
