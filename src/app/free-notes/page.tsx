
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, FileText, Video, Image as ImageIcon } from "lucide-react";
import { getFreeNotes, type FreeNote, type ContentItem } from "@/lib/data";

export default function FreeNotesPage() {
  const [notes, setNotes] = useState<FreeNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentToView, setContentToView] = useState<ContentItem | null>(null);

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
      return <iframe src={url} className="w-full h-full" title={title} allow="autoplay; fullscreen" allowFullScreen></iframe>;
    }

    if (type === 'pdf') {
       const driveId = getGoogleDriveFileId(url);
       if (driveId) {
           const embedUrl = `https://drive.google.com/file/d/${driveId}/preview`;
           return <iframe src={embedUrl} className="w-full h-full" title={title}></iframe>;
       }
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
            {notes.length > 0 ? (
              <Accordion type="single" collapsible className="w-full space-y-4">
                {notes.map((note) => (
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
                              <Button variant="ghost" size="sm" onClick={() => handleViewContent(item)}>View</Button>
                            </li>
                          ))}
                           {note.content.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">No content available for this topic yet.</p>
                           )}
                       </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center col-span-full py-16">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No free notes available at the moment. Please check back later.</p>
              </div>
            )}
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
