
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, Video, Image as ImageIcon, Download, Eye, Globe, Smartphone } from "lucide-react";
import { getFreeNotes, type FreeNote, type ContentItem } from "@/lib/data";

export default function FreeNotesClient() {
  const [notes, setNotes] = useState<FreeNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentToView, setContentToView] = useState<ContentItem | null>(null);
  const [activeTab, setActiveTab] = useState("online");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const freeNotesData = await getFreeNotes();
      setNotes(freeNotesData);
      setLoading(false);
    }
    loadData();
  }, []);

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
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Free Notes</h1>
          <p className="text-lg text-muted-foreground mt-2">Access free study materials for various topics.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="online" value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
                <TabsList className="grid w-full grid-cols-2 h-12 bg-secondary/50">
                    <TabsTrigger value="online" className="gap-2"><Globe className="h-4 w-4"/> Online Notes</TabsTrigger>
                    <TabsTrigger value="offline" className="gap-2"><Smartphone className="h-4 w-4"/> Offline (Download)</TabsTrigger>
                </TabsList>

                <TabsContent value="online" className="mt-6">
                    {onlineNotes.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {onlineNotes.map((note) => (
                            <AccordionItem value={note.id} key={note.id} className="border rounded-lg bg-card">
                                <AccordionTrigger className="p-6 text-xl font-headline hover:no-underline">
                                {note.title}
                                </AccordionTrigger>
                                <AccordionContent className="p-6 pt-0">
                                <p className="text-muted-foreground mb-4">{note.description}</p>
                                <ul className="space-y-3">
                                    {note.content.map((item, index) => (
                                        <li key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                                        <div className="flex items-center gap-4">
                                            {getContentIcon(item.type)}
                                            <span className="font-medium">{item.title}</span>
                                            <Badge variant={item.type === 'pdf' ? 'secondary' : 'default'} className="capitalize">{item.type}</Badge>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => setContentToView(item)}>
                                            <Eye className="mr-2 h-4 w-4"/> View
                                        </Button>
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

                <TabsContent value="offline" className="mt-6">
                    {offlineNotes.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {offlineNotes.map((note) => (
                            <AccordionItem value={note.id} key={note.id} className="border rounded-lg bg-card">
                                <AccordionTrigger className="p-6 text-xl font-headline hover:no-underline">
                                {note.title}
                                </AccordionTrigger>
                                <AccordionContent className="p-6 pt-0">
                                <p className="text-muted-foreground mb-4">{note.description}</p>
                                <ul className="space-y-3">
                                    {note.content.map((item, index) => (
                                        <li key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                                        <div className="flex items-center gap-4">
                                            {getContentIcon(item.type)}
                                            <span className="font-medium">{item.title}</span>
                                            <Badge variant="outline" className="capitalize">{item.type}</Badge>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" download>
                                                    <Download className="mr-2 h-4 w-4"/> Download
                                                </a>
                                            </Button>
                                        </div>
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

function EmptyState({ message }: { message: string }) {
    return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{message}</p>
        </div>
    );
}
