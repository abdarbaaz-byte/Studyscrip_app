
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { checkUserPurchase, getBatchInformation, createPurchase, getQuizzesForTarget, listenToBatchMessages, sendBatchMessage, type Batch, type BatchInformation, type Quiz, type ContentItem, type BatchMessage, type BatchNote } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, Unlock, FileText, BrainCircuit, MessageSquare, Megaphone, ArrowRight, Video, ImageIcon, CheckCircle, Circle, Clock, Trophy, Send, User, Users, X, ChevronRight, Download, Folder } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getGoogleDriveImageUrl } from "@/lib/utils";
import { format } from "date-fns";
import { PaymentDialog } from "@/components/payment-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function BatchDetailClient({ batch }: { batch: Batch }) {
  const { user, loading: authLoading } = useAuth();
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [infoList, setInfoList] = useState<BatchInformation[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState<{[key: string]: string | null}>({});
  const [contentToView, setContentToView] = useState<ContentItem | null>(null);
  const [hasNewInfo, setHasNewInfo] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");
  
  const [batchMessages, setBatchMessages] = useState<BatchMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const router = useRouter();

  const isFree = batch.price === 0;
  const hasAccess = isPurchased || isFree;
  const isChatting = activeTab === 'chats' && hasAccess;
  const chatEnabled = batch.chatEnabled !== false;

  useEffect(() => {
    async function loadData() {
      if (user) {
        const hasAccessRecord = await checkUserPurchase(user.uid, batch.id);
        setIsPurchased(hasAccessRecord);
      }
      
      const infoData = await getBatchInformation(batch.id);
      setInfoList(infoData);

      if (infoData.length > 0) {
        const lastViewed = localStorage.getItem(`batch-info-viewed-${batch.id}`);
        const latestTime = infoData[0].createdAt.toMillis();
        if (!lastViewed || parseInt(lastViewed) < latestTime) {
          setHasNewInfo(true);
        }
      }

      const quizResults = await getQuizzesForTarget(batch.id);
      setQuizzes(quizResults);

      const attempts: {[key: string]: string | null} = {};
      quizResults.forEach(q => {
        const savedData = localStorage.getItem(`quiz-data-${q.id}`);
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            attempts[q.id] = parsed.answers;
          } catch (e) {
            attempts[q.id] = null;
          }
        }
      });
      setAttemptedQuizzes(attempts);

      setLoading(false);
    }
    loadData();
  }, [user, batch.id]);

  useEffect(() => {
    if (hasAccess && batch.id && activeTab === 'chats') {
        const unsubscribe = listenToBatchMessages(batch.id, (messages) => {
            setBatchMessages(messages);
            scrollToBottom();
        });
        return () => unsubscribe();
    }
  }, [hasAccess, batch.id, activeTab]);

  const scrollToBottom = () => {
    setTimeout(() => {
        if (chatScrollRef.current) {
            const viewport = chatScrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) viewport.scrollTop = viewport.scrollHeight;
        }
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || isSending || !chatEnabled) return;
    setIsSending(true);
    try {
        await sendBatchMessage(batch.id, user.uid, user.displayName || user.email?.split('@')[0] || 'Anonymous', newMessage);
        setNewMessage("");
        scrollToBottom();
    } catch (error) {
        toast({ variant: "destructive", title: "Failed to send message." });
    }
    setIsSending(false);
  };

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

  const getContentIcon = (type: string) => {
    if (type === 'pdf') return <FileText className="h-5 w-5 text-primary" />;
    if (type === 'video') return <Video className="h-5 w-5 text-primary" />;
    return <ImageIcon className="h-5 w-5 text-primary" />;
  };

  const renderContentItem = (item: ContentItem) => (
    <div 
        key={item.id} 
        className="flex items-center gap-3 p-3 bg-background rounded-lg border cursor-pointer hover:bg-secondary/10 transition-colors"
        onClick={hasAccess ? () => setContentToView(item) : handleBuyClick}
    >
        {getContentIcon(item.type)}
        <span className="text-sm font-medium flex-1">{item.title}</span>
        {hasAccess ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
    </div>
  );

  const renderRecursiveNotes = (notes: BatchNote[]) => (
    <Accordion type="single" collapsible className="w-full space-y-3">
        {notes.map(folder => (
            <AccordionItem value={folder.id} key={folder.id} className="border rounded-md px-4 bg-secondary/10">
                <AccordionTrigger className="hover:no-underline font-bold text-base">
                    <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-primary opacity-70" />
                        {folder.title}
                        {!hasAccess && <Lock className="h-3 w-3 text-muted-foreground" />}
                    </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 space-y-4">
                    {/* Render Sub-Folders */}
                    {folder.subFolders && folder.subFolders.length > 0 && (
                        <div className="pl-4 space-y-3">
                            {renderRecursiveNotes(folder.subFolders)}
                        </div>
                    )}
                    {/* Render direct items in this folder */}
                    <div className="space-y-2">
                        {folder.content.map(item => renderContentItem(item))}
                    </div>
                </AccordionContent>
            </AccordionItem>
        ))}
    </Accordion>
  );

  const renderContentInDialog = () => {
    if (!contentToView) return null;
    const { type, url, title } = contentToView;
    const driveId = url.match(/file\/d\/([^/]+)/)?.[1];
    let contentUrl = driveId ? `https://drive.google.com/file/d/${driveId}/preview` : url;
    return <iframe src={contentUrl} className="w-full h-full border-0" title={title} allowFullScreen></iframe>;
  };

  if (loading || authLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className={cn("container mx-auto px-4 py-4 md:py-8", isChatting ? "h-[calc(100dvh-128px)] overflow-hidden" : "pb-32")}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        <div className={cn(isChatting ? "lg:col-span-3 h-full" : "lg:col-span-2", "h-full flex flex-col")}>
          <Tabs defaultValue="notes" value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5 h-12 bg-secondary/50 shrink-0 mb-4 overflow-x-auto">
              <TabsTrigger value="notes" className="gap-2 text-xs md:text-sm"><FileText className="h-4 w-4"/> Notes</TabsTrigger>
              <TabsTrigger value="quizzes" className="gap-2 text-xs md:text-sm"><BrainCircuit className="h-4 w-4"/> Quiz</TabsTrigger>
              <TabsTrigger value="downloads" className="gap-2 text-xs md:text-sm"><Download className="h-4 w-4"/> DL</TabsTrigger>
              <TabsTrigger value="chats" className="gap-2 text-xs md:text-sm"><MessageSquare className="h-4 w-4"/> Chat</TabsTrigger>
              <TabsTrigger value="information" className="gap-2 text-xs md:text-sm relative">
                <Megaphone className="h-4 w-4"/> Info
                {hasNewInfo && <Circle className="h-2 w-2 fill-red-600 text-red-600 absolute top-1 right-1" />}
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 min-h-0 relative">
                <TabsContent value="notes" className="h-full mt-0 overflow-y-auto">
                <Card>
                    <CardContent className="pt-6">
                        {renderRecursiveNotes(batch.notes)}
                        {batch.notes.length === 0 && <p className="text-center py-10 text-muted-foreground">No notes assigned yet.</p>}
                    </CardContent>
                </Card>
                </TabsContent>

                <TabsContent value="quizzes" className="h-full mt-0 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                    {quizzes.map(quiz => {
                        const now = new Date();
                        const start = quiz.startTime?.toDate();
                        const end = quiz.endTime?.toDate();
                        const isCurrentlyLive = start && end && now >= start && now <= end;
                        const userAttemptAnswers = attemptedQuizzes[quiz.id];
                        const hasAttempted = userAttemptAnswers !== undefined;

                        return (
                        <Card key={quiz.id} className="flex flex-col relative">
                            {isCurrentlyLive && (
                                <div className="absolute top-3 right-3 z-10"><Badge variant="destructive" className="animate-pulse bg-red-600 text-[10px]">LIVE</Badge></div>
                            )}
                            <CardHeader>
                                <CardTitle className="text-lg pr-12 flex items-center gap-2">{quiz.title} {!hasAccess && <Lock className="h-3.5 w-3.5" />}</CardTitle>
                                <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                            </CardHeader>
                            <CardFooter className="mt-auto">
                                {!hasAccess ? (
                                    <Button onClick={handleBuyClick} className="w-full"><Lock className="h-4 w-4 mr-2" /> Unlock Quiz</Button>
                                ) : hasAttempted ? (
                                    <Button asChild className="w-full"><Link href={`/quizzes/${quiz.id}/results?type=live&answers=${encodeURIComponent(userAttemptAnswers || '')}`}>View Analysis <Trophy className="ml-2 h-4 w-4"/></Link></Button>
                                ) : (
                                    <Button asChild className="w-full"><Link href={`/quizzes/${quiz.id}?type=live`}>Start Quiz <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
                                )}
                            </CardFooter>
                        </Card>
                        )
                    })}
                    </div>
                </TabsContent>

                <TabsContent value="downloads" className="h-full mt-0 overflow-y-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-headline flex items-center gap-2"><Download className="h-5 w-5"/> Batch Resources</CardTitle>
                            <CardDescription>Premium PDF notes and study materials for offline use.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {(batch.downloadContent || []).map((item) => (
                                <div key={item.id} className={cn("flex items-center justify-between p-4 rounded-xl border", hasAccess ? "bg-background" : "bg-secondary/20 opacity-80")}>
                                    <div className="flex items-center gap-4">
                                        <div className={cn("p-2 rounded-lg", hasAccess ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-400")}><FileText className="h-6 w-6" /></div>
                                        <div className="flex flex-col"><span className="font-bold text-sm">{item.title}</span>{!hasAccess && <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Unlock on Purchase</span>}</div>
                                    </div>
                                    {hasAccess ? (
                                        <Button asChild size="sm" variant="secondary" className="hover:bg-primary hover:text-white"><a href={item.url} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4 mr-2" /> Download</a></Button>
                                    ) : (
                                        <Button size="sm" variant="outline" disabled><Lock className="h-4 w-4 mr-2" /> Locked</Button>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="chats" className="h-full mt-0 overflow-hidden">
                    {/* Chat logic... */}
                </TabsContent>

                <TabsContent value="information" className="h-full mt-0 overflow-y-auto">
                    <Card>
                        <CardHeader><CardTitle>Latest Announcements</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                        {infoList.map(info => (
                            <div key={info.id} className="p-4 border rounded-lg bg-secondary/20">
                                <h4 className="font-bold">{info.title}</h4>
                                <p className="text-sm mt-1 whitespace-pre-wrap">{info.message}</p>
                                <p className="text-[10px] text-muted-foreground mt-2">{format(info.createdAt.toDate(), "PPP p")}</p>
                            </div>
                        ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </div>
          </Tabs>
        </div>

        {!isChatting && (
          <aside className="space-y-6">
            <Card className="sticky top-24 overflow-hidden shadow-lg border-2 border-primary/10">
              <div className="aspect-[16/9] relative">
                <Image src={getGoogleDriveImageUrl(batch.thumbnail)} alt={batch.title} fill className="object-cover" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium text-muted-foreground">Enrollment Fee</span>
                  <div className="text-right">
                      <span className="text-3xl font-bold text-primary block">{isFree ? <Badge className="bg-green-600">Free</Badge> : `Rs. ${batch.price}`}</span>
                      {batch.originalPrice && batch.originalPrice > batch.price && <span className="text-sm text-muted-foreground line-through">Rs. {batch.originalPrice}</span>}
                  </div>
                </div>
                {!hasAccess ? (
                  <Button size="lg" className="w-full" onClick={handleBuyClick}>Enroll Now <ArrowRight className="ml-2"/></Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 p-3 bg-green-100 text-green-700 rounded-lg font-bold"><Unlock className="h-5 w-5"/> Enrolled</div>
                )}
              </CardContent>
            </Card>
          </aside>
        )}
      </div>

      <PaymentDialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen} itemName={batch.title} itemPrice={batch.price} isProcessing={isBuying} itemId={batch.id} itemType="batch" onConfirm={handlePurchaseConfirm} />
      
      <Dialog open={!!contentToView} onOpenChange={() => setContentToView(null)}>
        <DialogContent className="w-screen h-screen max-w-none p-0 flex flex-col">
          <DialogHeader className="p-2 border-b shrink-0 flex flex-row items-center justify-between">
            <DialogTitle className="truncate">{contentToView?.title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setContentToView(null)}><X className="h-5 w-5"/></Button>
          </DialogHeader>
          <div className="flex-1 bg-secondary min-h-0">{renderContentInDialog()}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
