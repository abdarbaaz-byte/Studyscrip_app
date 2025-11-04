
"use client";

import { useState, useEffect } from "react";
import type { AudioLecture, AudioTrack } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, PlusCircle, Save, Loader2, Edit } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AdminAudioLecturesFormProps {
  initialLectures: AudioLecture[];
  onSave: (lecture: AudioLecture) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const emptyLecture: Omit<AudioLecture, 'id'> = {
  title: "",
  description: "",
  audios: [],
};

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export function AdminAudioLecturesForm({ initialLectures, onSave, onDelete }: AdminAudioLecturesFormProps) {
  const [editingLecture, setEditingLecture] = useState<AudioLecture | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = async (lectureData: AudioLecture) => {
    setIsSaving(true);
    await onSave(lectureData);
    setIsSaving(false);
    setIsDialogOpen(false);
    setEditingLecture(null);
  };
  
  const handleAddNew = () => {
    setEditingLecture({ ...emptyLecture, id: '' });
    setIsDialogOpen(true);
  };
  
  const handleEdit = (lecture: AudioLecture) => {
    setEditingLecture(lecture);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) setEditingLecture(null); setIsDialogOpen(isOpen); }}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Topic
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingLecture?.id ? "Edit Topic" : "Add New Topic"}</DialogTitle>
              <DialogDescription>
                Fill in the details for the audio lecture topic.
              </DialogDescription>
            </DialogHeader>
            <LectureForm
              lecture={editingLecture}
              onSave={handleSave}
              onCancel={() => setIsDialogOpen(false)}
              isSaving={isSaving}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-3">
        {initialLectures.map(lecture => (
          <AccordionItem value={lecture.id} key={lecture.id} className="border rounded-md px-4 bg-secondary/50">
            <div className="flex items-center w-full">
              <AccordionTrigger className="flex-grow hover:no-underline py-3 text-lg font-medium text-left">
                {lecture.title}
              </AccordionTrigger>
              <div className="flex items-center gap-3 ml-4">
                 <Button variant="outline" size="sm" onClick={() => handleEdit(lecture)}>
                    <Edit className="mr-2 h-4 w-4"/>Edit
                 </Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" onClick={(e) => e.stopPropagation()}><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{lecture.title}"?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete the topic and all its audio tracks.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(lecture.id)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <AccordionContent>
              <div className="space-y-4 p-2 border-t mt-3">
                <p className="text-sm text-muted-foreground">{lecture.description}</p>
                {lecture.audios.map((track, index) => (
                   <div key={index} className="p-3 border rounded-md grid grid-cols-3 gap-4 items-center bg-background">
                      <div><span className="font-semibold">Track:</span> {track.title}</div>
                      <div><span className="font-semibold">Duration:</span> {track.duration}</div>
                      <div className="truncate"><span className="font-semibold">URL:</span> {track.url}</div>
                   </div>
                ))}
                {lecture.audios.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No audio tracks yet. Edit to add some.</p>}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {initialLectures.length === 0 && <p className="text-muted-foreground text-center py-8">No audio lectures found. Add one to get started.</p>}
    </div>
  );
}

function LectureForm({ lecture, onSave, onCancel, isSaving }: { lecture: AudioLecture | null, onSave: (lecture: AudioLecture) => void, onCancel: () => void, isSaving: boolean }) {
  const [formData, setFormData] = useState<Omit<AudioLecture, 'id'>>(lecture || emptyLecture);

  useEffect(() => {
    setFormData(lecture || emptyLecture);
  }, [lecture]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTrackChange = (index: number, field: keyof AudioTrack, value: string) => {
    const newAudios = [...formData.audios];
    (newAudios[index] as any)[field] = value;
    setFormData(prev => ({ ...prev, audios: newAudios }));
  };

  const addAudioTrack = () => {
    setFormData(prev => ({
      ...prev,
      audios: [...prev.audios, { id: generateId('audio'), title: '', url: '', duration: '' }]
    }));
  };

  const removeAudioTrack = (index: number) => {
    const newAudios = formData.audios.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, audios: newAudios }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: lecture?.id || '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-4">
      <div className="space-y-2">
        <Label htmlFor="title">Topic Title</Label>
        <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Audio Tracks</h3>
            <Button type="button" variant="outline" size="sm" onClick={addAudioTrack}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Track
            </Button>
        </div>
        <div className="space-y-4">
          {formData.audios.map((track, index) => (
            <div key={track.id || index} className="p-4 border rounded-md space-y-3 relative bg-secondary/50">
               <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => removeAudioTrack(index)}>
                  <Trash2 className="h-4 w-4" />
               </Button>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor={`track-title-${index}`}>Track Title</Label>
                   <Input id={`track-title-${index}`} value={track.title} onChange={e => handleTrackChange(index, 'title', e.target.value)} required />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor={`track-duration-${index}`}>Duration (e.g., 10:35)</Label>
                   <Input id={`track-duration-${index}`} value={track.duration} onChange={e => handleTrackChange(index, 'duration', e.target.value)} required />
                 </div>
                 <div className="space-y-2 col-span-2">
                   <Label htmlFor={`track-url-${index}`}>Audio URL (Google Drive Link)</Label>
                   <Input id={`track-url-${index}`} type="text" value={track.url} onChange={(e) => handleTrackChange(index, 'url', e.target.value)} required />
                 </div>
               </div>
            </div>
          ))}
          {formData.audios.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No audio tracks yet.</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Topic
        </Button>
      </div>
    </form>
  );
}
