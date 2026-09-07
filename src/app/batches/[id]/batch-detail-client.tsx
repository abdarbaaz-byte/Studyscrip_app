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

  const handlePurchaseConfirm = async (paymentId: string, creditUsed: number) => {
    if (!user) return;
    setIsBuying(true);
    try {
      await createPurchase(
          user.uid, 
          user.email || 'Anonymous', 
          batch.id, 
          batch.title, 
          'batch', 
          batch.price - creditUsed, 
          paymentId,
          creditUsed
      );
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

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    if (val === 'information') {
      setHasNewInfo(false);
      localStorage.setItem(`batch-info-viewed-${batch.id}`, Date.now().toString());
    }
    if (val === 'chats') {
      scrollToBottom();
    }
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
                <AccordionTrigger className="hover:no-underline font-semibold text-base py-5">
                    <div className="flex items-center gap-3 text-left flex-1 min-w-0 pr-2">
                        <Folder className="h-5 w-5 text-primary opacity-70 shrink-0" />
                        <span className="flex-1 text-left leading-tight line-clamp-2">{folder.title}</span>
                        {!hasAccess && <Lock className="h-4 w-4 text-muted-foreground shrink-0" />}
                    </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 space-y-4">
                    {folder.subFolders && folder.subFolders.length > 0 && (
                        <div className="pl-4 space-y-3 border-l-2 border-primary/10 ml-2">
                            {renderRecursiveNotes(folder.subFolders)}
                        </div>
                    )}
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
    const { url, title } = contentToView;
    const driveId = url.match(/file\/d\/([^/]+)/)?.[1];
    let contentUrl = driveId ? `https://drive.google.com/file/d/${driveId}/preview` : url;
    return (
      <div className="relative w-full h-full overflow-hidden">
        <iframe src={contentUrl} className="w-full h-full border-0" title={title} allowFullScreen></iframe>
        {/* Anti-Popout Overlay for Google Drive PDFs */}
        {driveId && (
          <div className="absolute top-0 right-0 w-20 h-16 z-50 bg-transparent flex items-center justify-end pr-4 pointer-events-auto select-none">
            <Image src="/icons/icon-96x96.png" alt="StudyScript" width={44} height={48} className="opacity-90" />
          </div>
        )}
      </div>
    );
  };

  if (loading || authLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className={cn("container mx-auto px-4 py-4 md:py-8", isChatting ? "h-[calc(100dvh-128px)] overflow-hidden" : "pb-32 min-h-screen")}>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className={cn(isChatting ? "w-full" : "w-full lg:w-2/3", "flex flex-col min-w-0")}>
          <div className="mb-6">
             <h1 className="font-headline text-xl md:text-2xl font-bold break-words">{batch.title}</h1>
             <p className="text-muted-foreground mt-1 text-sm md:text-base">{batch.description}</p>
          </div>

          <Tabs defaultValue="notes" value={activeTab} onValueChange={handleTabChange} className={cn("w-full flex flex-col", isChatting ? "h-full" : "h-auto")}>
            <TabsList className="grid w-full grid-cols-5 h-12 bg-secondary/50 shrink-0 mb-4 overflow-x-auto">
              <TabsTrigger value="notes" className="gap-2 text-[10px] md:text-sm"><FileText className="h-3.5 w-3.5 md:h-4 md:w-4"/> Notes</TabsTrigger>
              <TabsTrigger value="quizzes" className="gap-2 text-[10px] md:text-sm"><BrainCircuit className="h-3.5 w-3.5 md:h-4 md:w-4"/> Test</TabsTrigger>
              <TabsTrigger value="downloads" className="gap-2 text-[10px] md:text-sm"><Download className="h-3.5 w-3.5 md:h-4 md:w-4"/> Files</TabsTrigger>
              <TabsTrigger value="chats" className="gap-2 text-[10px] md:text-sm"><MessageSquare className="h-3.5 w-3.5 md:h-4 md:w-4"/> Chat</TabsTrigger>
              <TabsTrigger value="information" className="gap-2 text-[10px] md:text-sm relative">
                <Megaphone className="h-3.5 w-3.5 md:h-4 md:w-4"/> Info
                {hasNewInfo && <Circle className="h-2 w-2 fill-red-600 text-red-600 absolute top-1 right-0.5" />}
              </TabsTrigger>
            </TabsList>

            <div className={cn("relative min-w-0", isChatting ? "flex-1 min-h-0" : "h-auto")}>
                <TabsContent value="notes" className="mt-0 pb-10 focus-visible:outline-none">
                    <Card className="border shadow-sm">
                        <CardContent className="pt-6">
                            {renderRecursiveNotes(batch.notes)}
                            {batch.notes.length === 0 && <p className="text-center py-10 text-muted-foreground text-sm">Abhi tak koi notes add nahi kiye gaye hain.</p>}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="quizzes" className="mt-0 pb-10 focus-visible:outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                    {quizzes.map(quiz => {
                        const now = new Date();
                        const start = quiz.startTime?.toDate();
                        const end = quiz.endTime?.toDate();
                        const isCurrentlyLive = start && end && now >= start && now <= end;
                        const userAttemptAnswers = attemptedQuizzes[quiz.id];
                        const hasAttempted = userAttemptAnswers !== undefined;

                        return (
                        <Card key={quiz.id} className="flex flex-col relative shadow-sm">
                            {isCurrentlyLive && (
                                <div className="absolute top-3 right-3 z-10"><Badge variant="destructive" className="animate-pulse bg-red-600 text-[10px]">LIVE</Badge></div>
                            )}
                            <CardHeader>
                                <CardTitle className="text-lg pr-12 flex items-center gap-2">{quiz.title} {!hasAccess && <Lock className="h-3.5 w-3.5" />}</CardTitle>
                                <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                            </CardHeader>
                            <CardFooter className="mt-auto">
                                {!hasAccess ? (
                                    <Button onClick={handleBuyClick} className="w-full"><Lock className="h-4 w-4 mr-2" /> Unlock Test</Button>
                                ) : hasAttempted ? (
                                    <Button asChild className="w-full"><Link href={`/quizzes/${quiz.id}/results?type=live&answers=${encodeURIComponent(userAttemptAnswers || '')}`}>View Analysis <Trophy className="ml-2 h-4 w-4"/></Link></Button>
                                ) : (
                                    <Button asChild className="w-full"><Link href={`/quizzes/${quiz.id}?type=live`}>Start Test <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
                                )}
                            </CardFooter>
                        </Card>
                        )
                    })}
                    {quizzes.length === 0 && (
                        <div className="text-center col-span-full py-16 border-2 border-dashed rounded-xl bg-secondary/10 w-full">
                            <BrainCircuit className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-30" />
                            <p className="text-muted-foreground font-medium">Is batch ke liye koi test available nahi hai.</p>
                        </div>
                    )}
                    </div>
                </TabsContent>

                <TabsContent value="downloads" className="mt-0 pb-10 focus-visible:outline-none">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-headline flex items-center gap-2"><Download className="h-5 w-5"/> Premium Resources</CardTitle>
                            <CardDescription>Download detailed PDF notes and materials for offline study.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {(batch.downloadContent || []).map((item) => (
                                <div key={item.id} className={cn("flex items-center justify-between p-4 rounded-xl border", hasAccess ? "bg-background" : "bg-secondary/20 opacity-80")}>
                                    <div className="flex items-center gap-4">
                                        <div className={cn("p-2 rounded-lg", hasAccess ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-400")}><FileText className="h-6 w-6" /></div>
                                        <div className="flex flex-col"><span className="font-semibold text-sm">{item.title}</span>{!hasAccess && <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Unlock on Purchase</span>}</div>
                                    </div>
                                    {hasAccess ? (
                                        <Button asChild size="sm" variant="secondary" className="hover:bg-primary hover:text-white"><a href={item.url} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4 mr-2" /> Download</a></Button>
                                    ) : (
                                        <Button size="sm" variant="outline" disabled><Lock className="h-4 w-4 mr-2" /> Locked</Button>
                                    )}
                                </div>
                            ))}
                            {(batch.downloadContent || []).length === 0 && <p className="text-center py-10 text-muted-foreground text-sm">Koi downloadable files available nahi hain.</p>}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="chats" className="mt-0 h-full flex flex-col bg-secondary/10 rounded-xl overflow-hidden border focus-visible:outline-none">
                    {!hasAccess ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background">
                            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                            <h3 className="text-xl font-bold">Group Discussion Locked</h3>
                            <p className="text-muted-foreground mt-2 max-w-sm">Join the batch to participate in real-time discussions with teachers and other students.</p>
                            <Button className="mt-6" onClick={handleBuyClick}><Lock className="mr-2 h-4 w-4" /> Enroll to Unlock Chat</Button>
                        </div>
                    ) : !chatEnabled ? (
                         <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background">
                            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                            <h3 className="text-xl font-bold">Chat is Currently Disabled</h3>
                            <p className="text-muted-foreground mt-2">The group discussion is currently turned off by the admin.</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col min-h-0">
                            <ScrollArea className="flex-1 p-4" ref={chatScrollRef}>
                                <div className="space-y-4">
                                    {batchMessages.map((msg) => (
                                        <div key={msg.id} className={cn("flex flex-col", msg.senderId === user?.uid ? "items-end" : "items-start")}>
                                            <div className="flex items-center gap-2 mb-1 px-1">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{msg.senderName}</span>
                                            </div>
                                            <div className={cn("max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm", msg.senderId === user?.uid ? "bg-primary text-white rounded-tr-none" : "bg-white text-foreground rounded-tl-none")}>
                                                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                                                <p className={cn("text-[9px] mt-1 text-right", msg.senderId === user?.uid ? "text-white/70" : "text-muted-foreground")}>
                                                    {msg.timestamp ? format(msg.timestamp.toDate(), "p") : format(new Date(), "p")}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {batchMessages.length === 0 && <p className="text-center text-xs text-muted-foreground py-10 italic">Yahan abhi tak koi message nahi hai. Say hi! 👋</p>}
                                </div>
                            </ScrollArea>
                            <form onSubmit={handleSendMessage} className="p-4 bg-background border-t flex gap-2">
                                <Input placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="rounded-full bg-secondary/50" />
                                <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={isSending || !newMessage.trim()}>
                                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </form>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="information" className="mt-0 pb-10 focus-visible:outline-none">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg md:text-xl"><Megaphone className="h-5 w-5 text-primary"/> Batch Announcements</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                        {infoList.map(info => (
                            <div key={info.id} className="p-4 border rounded-xl bg-secondary/20 relative overflow-hidden shadow-sm">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/30" />
                                <h4 className="font-bold text-base md:text-lg">{info.title}</h4>
                                <p className="text-sm mt-2 whitespace-pre-wrap leading-relaxed">{info.message}</p>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-4 font-bold uppercase tracking-wider">
                                    <Clock className="h-3 w-3" /> {format(info.createdAt.toDate(), "PPP p")}
                                </div>
                            </div>
                        ))}
                        {infoList.length === 0 && (
                            <div className="text-center py-8 px-6 border-2 border-dashed rounded-3xl bg-secondary/5">
                                <Megaphone className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                                <h4 className="font-bold text-base text-foreground/80">Abhi koi announcement nahi hai</h4>
                                <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                                    Naye updates aur batch se judi zaroori jaankari yahan dikhayi denge. Stay tuned!
                                </p>
                            </div>
                        )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Aside Sidebar - Only sticky on desktop */}
        {!isChatting && (
          <aside className="w-full lg:w-1/3 space-y-6 lg:mt-[100px]">
            <Card className="overflow-hidden shadow-lg border-2 border-primary/10 lg:sticky lg:top-24 z-10">
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
                  <Button size="lg" className="w-full font-bold shadow-lg" onClick={handleBuyClick}>Enroll Now <ArrowRight className="ml-2 h-5 w-5"/></Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 p-3 bg-green-100 text-green-700 rounded-xl font-bold border border-green-200"><Unlock className="h-5 w-5"/> Enrolled Successfully</div>
                )}

                {(batch.includes || []).length > 0 && (
                    <div className="mt-8 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b pb-2">What&apos;s Included</h4>
                        <ul className="space-y-3">
                            {batch.includes.map((inc, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm font-medium">
                                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                                    <span>{inc}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
              </CardContent>
            </Card>
          </aside>
        )}
      </div>

      <PaymentDialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen} itemName={batch.title} itemPrice={batch.price} isProcessing={isBuying} itemId={batch.id} itemType="batch" onConfirm={handlePurchaseConfirm} />
      
      {/* Bottom Sticky Purchase Bar for Mobile */}
      {!hasAccess && !isChatting && (
        <div className="fixed bottom-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t px-4 py-3 md:bottom-0 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            <div className="container mx-auto flex items-center justify-between gap-4">
                <div className="flex flex-col">
                    <span className="text-2xl font-bold text-primary">{isFree ? 'Free' : `Rs. ${batch.price}`}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Full Batch Access</span>
                </div>
                <Button 
                    size="lg" 
                    onClick={handleBuyClick} 
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-4 rounded-xl transition-all active:scale-95 h-12 shadow-md"
                >
                    Enroll Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </div>
      )}

      <Dialog open={!!contentToView} onOpenChange={() => setContentToView(null)}>
        <DialogContent className="w-screen h-screen max-w-none p-0 flex flex-col rounded-none border-none">
          <DialogHeader className="p-3 border-b shrink-0 flex flex-row items-center justify-between bg-background z-10">
            <DialogTitle className="truncate text-base pl-2">{contentToView?.title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setContentToView(null)}><X className="h-6 w-6"/></Button>
          </DialogHeader>
          <div className="flex-1 bg-secondary min-h-0">{renderContentInDialog()}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
