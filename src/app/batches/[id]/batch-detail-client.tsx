
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { checkUserPurchase, getBatchInformation, createPurchase, getQuizzesForTarget, type Batch, type BatchInformation, type Quiz, type ContentItem } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, Unlock, FileText, BrainCircuit, MessageSquare, Megaphone, ArrowRight, Video, ImageIcon, CheckCircle, Circle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getGoogleDriveImageUrl } from "@/lib/utils";
import { format } from "date-fns";
import { PaymentDialog } from "@/components/payment-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function BatchDetailClient({ batch }: { batch: Batch }) {
  const { user, loading: authLoading } = useAuth();
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [infoList, setInfoList] = useState<BatchInformation[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [contentToView, setContentToView] = useState<ContentItem | null>(null);
  const [hasNewInfo, setHasNewInfo] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const isFree = batch.price === 0;
  const hasAccess = isPurchased || isFree;

  useEffect(() => {
    async function loadData() {
      if (user) {
        const hasAccessRecord = await checkUserPurchase(user.uid, batch.id);
        setIsPurchased(hasAccessRecord);
      }
      
      const infoData = await getBatchInformation(batch.id);
      setInfoList(infoData);

      // Check for new info badge
      if (infoData.length > 0) {
        const lastViewed = localStorage.getItem(`batch-info-viewed-${batch.id}`);
        const latestTime = infoData[0].createdAt.toMillis();
        if (!lastViewed || parseInt(lastViewed) < latestTime) {
          setHasNewInfo(true);
        }
      }

      // Load quizzes data dynamically based on batch target
      const quizResults = await getQuizzesForTarget(batch.id);
      setQuizzes(quizResults);

      setLoading(false);
    }
    loadData();
  }, [user, batch.id]);

  const handleBuyClick = () => {
    if (!user) {
      toast({ variant: "destructive", title: "Login Required", description: "Please login to purchase this batch." });
      router.push(`/login?redirect=/batches/${batch.id}`);
      return;
    }
    setIsPaymentDialogOpen(true);
  };

  const handlePurchaseConfirm = async (paymentId: string) => {
    if (!user) return;
    setIsBuying(true);
    try {
      await createPurchase(user.uid, user.email || 'Anonymous', batch.id, batch.title, 'batch', batch.price, paymentId);
      setIsPurchased(true);
      toast({ title: "Welcome to the Batch!", description: "Enrollment successful." });
    } catch (error) {
      toast({ variant: "destructive", title: "Purchase failed." });
    }
    setIsBuying(false);
    setIsPaymentDialogOpen(false);
  };

  const handleInfoTabClick = () => {
    setHasNewInfo(false);
    if (infoList.length > 0) {
      localStorage.setItem(`batch-info-viewed-${batch.id}`, infoList[0].createdAt.toMillis().toString());
    }
  };

  const getContentIcon = (type: string) => {
    if (type === 'pdf') return <FileText className="h-5 w-5 text-primary" />;
    if (type === 'video') return <Video className="h-5 w-5 text-primary" />;
    return <ImageIcon className="h-5 w-5 text-primary" />;
  };

  const renderContentInDialog = () => {
    if (!contentToView) return null;
    const { type, url, title } = contentToView;
    const driveId = url.match(/file\/d\/([^/]+)/)?.[1];
    let contentUrl = driveId ? `https://drive.google.com/file/d/${driveId}/preview` : url;

    return (
        <iframe src={contentUrl} className="w-full h-full border-0" title={title} allowFullScreen></iframe>
    );
  };

  const discountPercentage = (batch.originalPrice && batch.price < batch.originalPrice) 
    ? Math.round(((batch.originalPrice - batch.price) / batch.originalPrice) * 100) 
    : null;

  if (loading || authLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h1 className="font-headline text-4xl font-bold">{batch.title}</h1>
            <p className="text-lg text-muted-foreground">{batch.description}</p>
          </div>

          <Tabs defaultValue="notes" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-12 bg-secondary/50">
              <TabsTrigger value="notes" className="gap-2"><FileText className="h-4 w-4"/> Notes</TabsTrigger>
              <TabsTrigger value="quizzes" className="gap-2"><BrainCircuit className="h-4 w-4"/> Quiz</TabsTrigger>
              <TabsTrigger value="chats" className="gap-2"><MessageSquare className="h-4 w-4"/> Chat</TabsTrigger>
              <TabsTrigger value="information" onClick={handleInfoTabClick} className="gap-2 relative">
                <Megaphone className="h-4 w-4"/> Info
                {hasNewInfo && <Circle className="h-2 w-2 fill-red-600 text-red-600 absolute top-1 right-1" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="pt-6">
              <Card>
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {batch.notes.map(topic => (
                      <AccordionItem value={topic.id} key={topic.id} className="border rounded-md px-4 bg-secondary/20">
                        <AccordionTrigger className="hover:no-underline font-medium">
                          <div className="flex items-center gap-2">
                            {topic.title}
                            {!hasAccess && <Lock className="h-3 w-3 text-muted-foreground" />}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 space-y-2">
                          {topic.content.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                              <div className="flex items-center gap-3">
                                {getContentIcon(item.type)}
                                <span className="text-sm font-medium">{item.title}</span>
                              </div>
                              {hasAccess ? (
                                <Button variant="ghost" size="sm" onClick={() => setContentToView(item)}>View</Button>
                              ) : (
                                <Button variant="ghost" size="sm" onClick={handleBuyClick}>
                                  <Lock className="h-4 w-4 text-muted-foreground mr-2" />
                                  Unlock
                                </Button>
                              )}
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                    {batch.notes.length === 0 && <p className="text-center py-10 text-muted-foreground">No notes assigned yet.</p>}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quizzes" className="pt-6">
              {!hasAccess ? (
                <LockedContent title="Enroll to access Batch Quizzes" onBuy={handleBuyClick} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizzes.map(quiz => {
                    const now = new Date();
                    const start = quiz.startTime?.toDate();
                    const end = quiz.endTime?.toDate();
                    const isUpcoming = start && now < start;
                    const isExpired = end && now > end;
                    const isCurrentlyLive = start && end && now >= start && now <= end;

                    return (
                      <Card key={quiz.id} className="flex flex-col relative">
                        {isCurrentlyLive && (
                          <div className="absolute top-3 right-3 z-10">
                            <Badge variant="destructive" className="flex items-center gap-1.5 bg-red-600 animate-pulse border-none px-2 py-0.5 text-[10px]">
                              <Circle className="h-1.5 w-1.5 fill-white animate-pulse" />
                              LIVE
                            </Badge>
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="text-lg pr-12">{quiz.title}</CardTitle>
                          <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 pb-4">
                            {isUpcoming && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 flex items-center gap-1 w-fit">
                                    <Clock className="h-3 w-3" /> Upcoming: {format(start, "p, MMM d")}
                                </Badge>
                            )}
                            {isExpired && (
                                <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                    <Lock className="h-3 w-3" /> Expired
                                </Badge>
                            )}
                        </CardContent>
                        <CardFooter className="mt-auto">
                          <Button asChild className="w-full" disabled={isUpcoming || isExpired}>
                            <Link href={isUpcoming || isExpired ? "#" : `/quizzes/${quiz.id}?type=live`}>
                                {isUpcoming ? "Not Started" : isExpired ? "Locked" : "Start Quiz"} 
                                <ArrowRight className="ml-2 h-4 w-4"/>
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    )
                  })}
                  {quizzes.length === 0 && <p className="col-span-2 text-center py-10 text-muted-foreground">No quizzes assigned yet.</p>}
                </div>
              )}
            </TabsContent>

            <TabsContent value="chats" className="pt-6">
              {!hasAccess ? (
                <LockedContent title="Enroll to chat with Batch Instructors" onBuy={handleBuyClick} />
              ) : (
                <Card>
                  <CardHeader><CardTitle>Direct Support Chat</CardTitle><CardDescription>Need help with a topic? Message the instructor here.</CardDescription></CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-primary/10 p-6 rounded-full mb-4">
                        <MessageSquare className="h-12 w-12 text-primary"/>
                    </div>
                    <p className="text-muted-foreground max-w-sm">Use the floating chat button at the bottom right to talk directly with us about this batch.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="information" className="pt-6">
              <Card>
                <CardHeader><CardTitle>Latest Announcements</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {infoList.length === 0 ? (
                    <p className="text-muted-foreground text-center py-10">No announcements yet.</p>
                  ) : infoList.map(info => (
                    <div key={info.id} className="p-4 border rounded-lg bg-secondary/20">
                      <h4 className="font-bold">{info.title}</h4>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{info.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">{format(info.createdAt.toDate(), "PPP p")}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-6">
          <Card className="sticky top-24 overflow-hidden shadow-lg border-2 border-primary/10">
            <div className="aspect-[16/10] relative">
              <Image src={getGoogleDriveImageUrl(batch.thumbnail)} alt={batch.title} fill className="object-cover" />
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-muted-foreground">Enrollment Fee</span>
                <div className="text-right">
                    <span className="text-3xl font-bold text-primary block">
                        {isFree ? <Badge className="text-xl bg-green-600 px-4 py-1">Free</Badge> : `Rs. ${batch.price}`}
                    </span>
                    {batch.originalPrice && batch.originalPrice > batch.price && (
                        <span className="text-sm text-muted-foreground line-through">Rs. {batch.originalPrice}</span>
                    )}
                </div>
              </div>
              {!hasAccess ? (
                <Button size="lg" className="w-full" onClick={handleBuyClick}>Enroll Now <ArrowRight className="ml-2"/></Button>
              ) : (
                <div className="flex items-center justify-center gap-2 p-3 bg-green-100 text-green-700 rounded-lg font-bold">
                  <Unlock className="h-5 w-5"/> {isFree ? "Free Access" : "Enrolled"}
                </div>
              )}
              <div className="mt-6 space-y-3">
                <p className="text-sm font-semibold border-b pb-2">Includes:</p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  {(batch.includes && batch.includes.length > 0) ? (
                      batch.includes.map((point, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0"/> 
                            <span>{point}</span>
                        </li>
                      ))
                  ) : (
                    <>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500"/> Lifetime access to Batch content</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500"/> Direct Support Chat</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500"/> Specialized Practice Tests</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500"/> Downloadable PDF Notes</li>
                    </>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Sticky Bottom Purchase Bar */}
      {!hasAccess && !isFree && (
        <div className="fixed bottom-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t px-4 py-3 md:bottom-0 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            <div className="container mx-auto flex items-center justify-between gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">Rs. {batch.price}</span>
                    </div>
                    {batch.originalPrice && batch.originalPrice > batch.price && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground line-through">Rs. {batch.originalPrice}</span>
                            {discountPercentage && <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded ml-1">{discountPercentage}% OFF</span>}
                        </div>
                    )}
                </div>
                <Button 
                    size="lg" 
                    onClick={handleBuyClick} 
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 rounded-xl transition-all active:scale-95 h-12 shadow-md"
                >
                    Enroll Now
                </Button>
            </div>
        </div>
      )}

      <PaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        itemName={batch.title}
        itemPrice={batch.price}
        isProcessing={isBuying}
        itemId={batch.id}
        itemType="batch"
        onConfirm={handlePurchaseConfirm}
      />

      <Dialog open={!!contentToView} onOpenChange={() => setContentToView(null)}>
        <DialogContent className="w-screen h-screen max-w-none p-0 flex flex-col">
          <DialogHeader className="p-2 border-b shrink-0"><DialogTitle>{contentToView?.title}</DialogTitle></DialogHeader>
          <div className="flex-1 bg-secondary min-h-0">{renderContentInDialog()}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LockedContent({ title, onBuy }: { title: string, onBuy: () => void }) {
  return (
    <Card className="flex flex-col items-center justify-center py-20 text-center bg-secondary/10">
      <Lock className="h-16 w-16 text-muted-foreground mb-4" />
      <CardTitle className="text-xl mb-2">{title}</CardTitle>
      <Button onClick={onBuy} className="mt-4">Purchase Access <ArrowRight className="ml-2 h-4 w-4"/></Button>
    </Card>
  );
}
