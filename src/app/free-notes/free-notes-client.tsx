
"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, Video, Image as ImageIcon, Download, Globe, Smartphone, ChevronRight, X } from "lucide-react";
import { useData } from "@/hooks/use-data";
import { type ContentItem } from "@/lib/data";

export default function FreeNotesClient() {
  const { freeNotes: notes, loading } = useData();
  const [contentToView, setContentToView] = useState<ContentItem | null>(null);
  const [activeTab, setActiveTab] = useState("online");

  const getContentIcon = (type: ContentItem['type']) => {
    if (type === 'pdf') return <FileText className="h-5 w-5 text-primary" />;
    if (type === 'video') return <Video className="h-5 w-5 text-primary" />;
    return <ImageIcon className="h-5 w-5 text-primary" />;
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

  const onlineNotes = notes.filter(n => (n.category || 'online') === 'online');
  const offlineNotes = notes.filter(n => n.category === 'offline');

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight">Free Notes</h1>
          <p className="text-lg text-muted-foreground mt-2 font-medium">Access high-quality study materials for various topics.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="online" value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
                <div className="flex justify-center mb-10">
                    <TabsList className="grid w-full grid-cols-2 max-w-md h-14 bg-secondary/50 p-1.5 rounded-2xl border shadow-inner">
                        <TabsTrigger 
                          value="online" 
                          className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl gap-2 font-headline font-semibold transition-all duration-300 hover:bg-emerald-600/10"
                        >
                          <Globe className="h-5 w-5"/> Online Notes
                        </TabsTrigger>
                        <TabsTrigger 
                          value="offline" 
                          className="data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl gap-2 font-headline font-semibold transition-all duration-300 hover:bg-orange-500/10"
                        >
                          <Smartphone className="h-5 w-5"/> Offline (Download)
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="online" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {onlineNotes.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {onlineNotes.map((note) => (
                            <AccordionItem value={note.id} key={note.id} className="border rounded-xl bg-card shadow-sm overflow-hidden border-border/50">
                                <AccordionTrigger className="p-6 text-xl font-headline font-semibold hover:no-underline hover:bg-secondary/10 transition-all">
                                {note.title}
                                </AccordionTrigger>
                                <AccordionContent className="p-6 pt-0">
                                <p className="text-muted-foreground mb-5 leading-relaxed text-sm">{note.description}</p>
                                <ul className="space-y-3">
                                    {note.content.map((item, index) => (
                                        <li 
                                          key={index} 
                                          className="flex items-center gap-4 p-4 rounded-xl bg-secondary/40 cursor-pointer hover:bg-secondary/80 transition-all border border-transparent hover:border-primary/20 group"
                                          onClick={() => setContentToView(item)}
                                        >
                                          <div className="bg-primary/10 p-2.5 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                                            {getContentIcon(item.type)}
                                          </div>
                                          <span className="font-medium flex-1 text-base">{item.title}</span>
                                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </li>
                                    ))}
                                </ul>
                                </AccordionContent>
                            </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <EmptyState message="No online notes found." />
                    )}
                </TabsContent>

                <TabsContent value="offline" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {offlineNotes.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {offlineNotes.map((note) => (
                            <AccordionItem value={note.id} key={note.id} className="border rounded-xl bg-card shadow-sm overflow-hidden border-border/50">
                                <AccordionTrigger className="p-6 text-xl font-headline font-semibold hover:no-underline hover:bg-secondary/10 transition-all">
                                {note.title}
                                </AccordionTrigger>
                                <AccordionContent className="p-6 pt-0">
                                <p className="text-muted-foreground mb-5 leading-relaxed text-sm">{note.description}</p>
                                <ul className="space-y-3">
                                    {note.content.map((item, index) => (
                                        <li 
                                          key={index} 
                                          className="flex items-center gap-4 p-4 rounded-xl bg-secondary/40 cursor-pointer hover:bg-secondary/80 transition-all border border-transparent hover:border-primary/20 group"
                                          onClick={() => window.open(item.url, '_blank')}
                                        >
                                          <div className="bg-primary/10 p-2.5 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                                            {getContentIcon(item.type)}
                                          </div>
                                          <span className="font-medium flex-1 text-base">{item.title}</span>
                                          <Download className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </li>
                                    ))}
                                </ul>
                                </AccordionContent>
                            </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <EmptyState message="No offline notes available for download yet." />
                    )}
                </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      <Dialog open={!!contentToView} onOpenChange={() => setContentToView(null)}>
        <DialogContent className="w-screen h-screen max-w-none p-0 flex flex-col rounded-none border-none">
          <DialogHeader className="p-3 border-b shrink-0 flex flex-row items-center justify-between bg-background">
            <DialogTitle className="truncate pl-4 font-headline text-lg font-bold">{contentToView?.title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setContentToView(null)} className="rounded-full"><X className="h-5 w-5"/></Button>
          </DialogHeader>
          <div className="flex-1 bg-secondary min-h-0">
            {renderContentInDialog()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-secondary/10 border-border">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground font-semibold text-lg">{message}</p>
        </div>
    );
}
