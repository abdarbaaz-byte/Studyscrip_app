
"use client";

import { useState, useEffect } from "react";
import type { FreeNote, ContentItem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, PlusCircle, Save, Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AdminFreeNotesFormProps {
  initialNotes: FreeNote[];
  onSave: (note: FreeNote) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const emptyNote: Omit<FreeNote, 'id'> = {
  title: "",
  description: "",
  content: [],
};

export function AdminFreeNotesForm({ initialNotes, onSave, onDelete }: AdminFreeNotesFormProps) {
  const [editingNote, setEditingNote] = useState<FreeNote | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = async (noteData: FreeNote) => {
    setIsSaving(true);
    await onSave(noteData);
    setIsSaving(false);
    setIsDialogOpen(false);
    setEditingNote(null);
  };
  
  const handleAddNew = () => {
    setEditingNote({ ...emptyNote, id: '' }); // Temp empty object for the form
    setIsDialogOpen(true);
  };
  
  const handleEdit = (note: FreeNote) => {
    setEditingNote(note);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) setEditingNote(null); setIsDialogOpen(isOpen); }}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Topic
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>{editingNote?.id ? "Edit Topic" : "Add New Topic"}</DialogTitle>
              <DialogDescription>
                Fill in the details for the free note topic.
              </DialogDescription>
            </DialogHeader>
            <NoteForm
              note={editingNote}
              onSave={handleSave}
              onCancel={() => setIsDialogOpen(false)}
              isSaving={isSaving}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-3">
        {initialNotes.map(note => (
          <AccordionItem value={note.id} key={note.id} className="border rounded-md px-4 bg-secondary/50">
            <div className="flex items-center w-full">
              <AccordionTrigger className="flex-grow hover:no-underline py-3 text-lg font-medium">
                {note.title}
              </AccordionTrigger>
              <div className="flex items-center gap-3 ml-4">
                 <Button variant="outline" size="sm" onClick={() => handleEdit(note)}>Edit</Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" onClick={(e) => e.stopPropagation()}><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{note.title}"?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete the topic and all its content.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(note.id)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <AccordionContent>
              <div className="space-y-4 p-2 border-t mt-3">
                <p className="text-sm text-muted-foreground">{note.description}</p>
                {note.content.map((item, index) => (
                   <div key={index} className="p-3 border rounded-md grid grid-cols-3 gap-4 items-center bg-background">
                      <div><span className="font-semibold">Title:</span> {item.title}</div>
                      <div><span className="font-semibold">Type:</span> {item.type}</div>
                      <div className="truncate"><span className="font-semibold">URL:</span> {item.url}</div>
                   </div>
                ))}
                {note.content.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No content items yet.</p>}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {initialNotes.length === 0 && <p className="text-muted-foreground text-center py-8">No notes found. Add one to get started.</p>}
    </div>
  );
}


// Sub-component for the form itself
function NoteForm({ note, onSave, onCancel, isSaving }: { note: FreeNote | null, onSave: (note: FreeNote) => void, onCancel: () => void, isSaving: boolean }) {
  const [formData, setFormData] = useState<Omit<FreeNote, 'id'>>(note || emptyNote);

  useEffect(() => {
    setFormData(note || emptyNote);
  }, [note]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleContentChange = (index: number, field: keyof ContentItem, value: string) => {
    const newContent = [...formData.content];
    (newContent[index] as any)[field] = value;
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  const addContentItem = () => {
    setFormData(prev => ({
      ...prev,
      content: [...prev.content, { id: `new-${Date.now()}`, type: 'pdf', title: '', url: '' }]
    }));
  };

  const removeContentItem = (index: number) => {
    const newContent = formData.content.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: note?.id || '' });
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
            <h3 className="text-lg font-medium">Content Items</h3>
            <Button type="button" variant="outline" size="sm" onClick={addContentItem}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Content
            </Button>
        </div>
        <div className="space-y-4">
          {formData.content.map((item, index) => (
            <div key={item.id || index} className="p-4 border rounded-md space-y-3 relative bg-secondary/50">
               <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => removeContentItem(index)}>
                  <Trash2 className="h-4 w-4" />
               </Button>
               <div className="grid grid-cols-6 gap-4 items-end">
                <div className="space-y-2 col-span-3">
                  <Label htmlFor={`content-title-${index}`}>Title</Label>
                  <Input id={`content-title-${index}`} value={item.title} onChange={e => handleContentChange(index, 'title', e.target.value)} required />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor={`content-url-${index}`}>Content URL</Label>
                   <Input id={`content-url-${index}`} type="text" value={item.url} onChange={(e) => handleContentChange(index, 'url', e.target.value)} required />
                </div>
                <div className="space-y-2 col-span-1">
                  <Label htmlFor={`content-type-${index}`}>Type</Label>
                  <Select value={item.type} onValueChange={(value: 'pdf' | 'video' | 'image') => handleContentChange(index, 'type', value)}>
                    <SelectTrigger id={`content-type-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
          {formData.content.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No content items yet.</p>}
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

    