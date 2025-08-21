
"use client";

import { useState } from "react";
import type { AcademicClass, Subject, Chapter, ContentItem } from "@/lib/academics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, PlusCircle, Pencil, ArrowLeft, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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


interface AdminAcademicsFormProps {
  initialClasses: AcademicClass[];
  onSave: (classes: AcademicClass[]) => Promise<void>;
  onDeleteClass: (classId: string) => Promise<void>;
}

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export function AdminAcademicsForm({ initialClasses, onSave, onDeleteClass }: AdminAcademicsFormProps) {
  const [academics, setAcademics] = useState<AcademicClass[]>(initialClasses);
  const [view, setView] = useState<'list' | 'class' | 'subject'>('list');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const selectedClass = academics.find(c => c.id === selectedClassId) || null;
  const selectedSubject = selectedClass?.subjects.find(s => s.id === selectedSubjectId) || null;

  const handleUpdate = <T extends { id: string }>(items: T[], updatedItem: T): T[] => {
    return items.map(item => item.id === updatedItem.id ? updatedItem : item);
  };
  
  const handleDelete = <T extends { id: string }>(items: T[], id: string): T[] => {
    return items.filter(item => item.id !== id);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    await onSave(academics);
    setIsSaving(false);
  };

  // Class handlers
  const handleAddClass = () => {
    const newClass: AcademicClass = {
      id: generateId('class'),
      name: 'New Class',
      description: 'A new class description.',
      subjects: [],
    };
    setAcademics([...academics, newClass]);
  };
  
  const handleUpdateClass = (id: string, field: 'name' | 'description', value: string) => {
    setAcademics(academics.map(cls => cls.id === id ? { ...cls, [field]: value } : cls));
  };
  
  const handleDeleteClass = (id: string) => {
    onDeleteClass(id);
    setAcademics(prev => prev.filter(c => c.id !== id));
  };

  // Subject handlers
  const handleAddSubject = () => {
    if (!selectedClass) return;
    const newSubject: Subject = { id: generateId('subject'), name: 'New Subject', price: 9.99, chapters: [] };
    const updatedClass = { ...selectedClass, subjects: [...selectedClass.subjects, newSubject] };
    setAcademics(handleUpdate(academics, updatedClass));
  };

  const handleUpdateSubject = (id: string, field: 'name' | 'price', value: string | number) => {
    if (!selectedClass) return;
    const updatedSubjects = selectedClass.subjects.map(sub => sub.id === id ? { ...sub, [field]: value } : sub);
    const updatedClass = { ...selectedClass, subjects: updatedSubjects };
    setAcademics(handleUpdate(academics, updatedClass));
  };
  
  const handleDeleteSubject = (id: string) => {
    if (!selectedClass) return;
    const updatedSubjects = handleDelete(selectedClass.subjects, id);
    const updatedClass = { ...selectedClass, subjects: updatedSubjects };
    setAcademics(handleUpdate(academics, updatedClass));
  };

  // Chapter handlers
  const handleAddChapter = () => {
    if (!selectedClassId || !selectedSubjectId) return;
    const newChapter: Chapter = { id: generateId('chapter'), name: 'New Chapter', content: [] };
    setAcademics(prevAcademics => prevAcademics.map(ac => 
        ac.id !== selectedClassId ? ac : {
            ...ac,
            subjects: ac.subjects.map(sub => 
                sub.id !== selectedSubjectId ? sub : {
                    ...sub,
                    chapters: [...sub.chapters, newChapter]
                }
            )
        }
    ));
  };
  
  const handleUpdateChapter = (id: string, name: string) => {
    if (!selectedClass || !selectedSubject) return;
    const updatedChapters = selectedSubject.chapters.map(chap => chap.id === id ? { ...chap, name } : chap);
    const updatedSubject = { ...selectedSubject, chapters: updatedChapters };
    const updatedSubjects = handleUpdate(selectedClass.subjects, updatedSubject);
    const updatedClass = { ...selectedClass, subjects: updatedSubjects };
    setAcademics(handleUpdate(academics, updatedClass));
  };

  const handleDeleteChapter = (id: string) => {
     if (!selectedClass || !selectedSubject) return;
    const updatedChapters = handleDelete(selectedSubject.chapters, id);
    const updatedSubject = { ...selectedSubject, chapters: updatedChapters };
    const updatedSubjects = handleUpdate(selectedClass.subjects, updatedSubject);
    const updatedClass = { ...selectedClass, subjects: updatedSubjects };
    setAcademics(handleUpdate(academics, updatedClass));
  };

  // Content Item handlers
  const handleAddContentItem = (chapterId: string) => {
    if (!selectedClass || !selectedSubject) return;
    const newContentItem: ContentItem = { id: generateId('content'), type: 'pdf', title: 'New Content', url: '' };
    const updatedChapters = selectedSubject.chapters.map(chap => 
      chap.id === chapterId 
        ? { ...chap, content: [...chap.content, newContentItem] } 
        : chap
    );
    const updatedSubject = { ...selectedSubject, chapters: updatedChapters };
    const updatedSubjects = handleUpdate(selectedClass.subjects, updatedSubject);
    const updatedClass = { ...selectedClass, subjects: updatedSubjects };
    setAcademics(handleUpdate(academics, updatedClass));
  };

  const handleUpdateContentItem = (chapterId: string, contentId: string, field: keyof ContentItem, value: string) => {
    if (!selectedClass || !selectedSubject) return;
    const updatedChapters = selectedSubject.chapters.map(chap => {
      if (chap.id !== chapterId) return chap;
      const updatedContent = chap.content.map(item => 
        item.id === contentId ? { ...item, [field]: value } : item
      );
      return { ...chap, content: updatedContent };
    });
    const updatedSubject = { ...selectedSubject, chapters: updatedChapters };
    const updatedSubjects = handleUpdate(selectedClass.subjects, updatedSubject);
    const updatedClass = { ...selectedClass, subjects: updatedSubjects };
    setAcademics(handleUpdate(academics, updatedClass));
  };
  
  const handleDeleteContentItem = (chapterId: string, contentId: string) => {
    if (!selectedClass || !selectedSubject) return;
    const updatedChapters = selectedSubject.chapters.map(chap => {
      if (chap.id !== chapterId) return chap;
      const updatedContent = chap.content.filter(item => item.id !== contentId);
      return { ...chap, content: updatedContent };
    });
    const updatedSubject = { ...selectedSubject, chapters: updatedChapters };
    const updatedSubjects = handleUpdate(selectedClass.subjects, updatedSubject);
    const updatedClass = { ...selectedClass, subjects: updatedSubjects };
    setAcademics(handleUpdate(academics, updatedClass));
  };

  const renderClassList = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Classes</CardTitle>
          <CardDescription>Add, edit, or delete classes.</CardDescription>
        </div>
        <Button onClick={handleAddClass}><PlusCircle className="mr-2 h-4 w-4" /> Add Class</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {academics.map(cls => (
          <div key={cls.id} className="p-4 border rounded-md space-y-3 bg-secondary/50">
            <div className="flex items-center gap-4">
              <Input value={cls.name} onChange={e => handleUpdateClass(cls.id, 'name', e.target.value)} className="text-lg font-semibold flex-grow"/>
              <Button variant="outline" size="sm" onClick={() => { setSelectedClassId(cls.id); setView('class'); }}>
                Manage Subjects <Pencil className="ml-2 h-3 w-3" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{cls.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone. This will permanently delete the class and all its subjects and chapters from the database.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteClass(cls.id)}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
            </div>
            <Textarea value={cls.description} onChange={e => handleUpdateClass(cls.id, 'description', e.target.value)} placeholder="Class description..." />
          </div>
        ))}
        {academics.length === 0 && <p className="text-muted-foreground text-center py-8">No classes found. Add one to get started.</p>}
      </CardContent>
    </Card>
  );

  const renderSubjectList = () => (
    <Card>
       <CardHeader>
         <Button variant="ghost" size="sm" onClick={() => setView('list')} className="mb-4 w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Classes
        </Button>
        <div className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Manage Subjects for {selectedClass?.name}</CardTitle>
              <CardDescription>Add, edit, or delete subjects for this class.</CardDescription>
            </div>
             <Button onClick={handleAddSubject}><PlusCircle className="mr-2 h-4 w-4" /> Add Subject</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {selectedClass?.subjects.map(sub => (
           <div key={sub.id} className="flex items-center justify-between p-3 border rounded-md bg-secondary/50 gap-4">
            <div className="flex-grow space-y-2">
                <Label htmlFor={`subject-name-${sub.id}`}>Subject Name</Label>
                <Input id={`subject-name-${sub.id}`} value={sub.name} onChange={e => handleUpdateSubject(sub.id, 'name', e.target.value)} className="font-medium" />
            </div>
            <div className="w-48 space-y-2">
                 <Label htmlFor={`subject-price-${sub.id}`}>Price (Rs.)</Label>
                 <Input id={`subject-price-${sub.id}`} type="number" value={sub.price} onChange={e => handleUpdateSubject(sub.id, 'price', parseFloat(e.target.value) || 0)} className="w-full" />
            </div>
            <div className="flex gap-2 self-end">
                <Button variant="outline" size="sm" onClick={() => { setSelectedSubjectId(sub.id); setView('subject');}}>
                    Manage Chapters <Pencil className="ml-2 h-3 w-3" />
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{sub.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete the subject and all its chapters.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSubject(sub.id)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
          </div>
        ))}
         {selectedClass?.subjects.length === 0 && <p className="text-muted-foreground text-center py-8">No subjects found. Add one to get started.</p>}
      </CardContent>
    </Card>
  );

  const renderChapterList = () => (
    <Card>
      <CardHeader>
        <Button variant="ghost" size="sm" onClick={() => setView('class')} className="mb-4 w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subjects
        </Button>
        <div className="flex flex-row items-center justify-between">
            <div>
                 <CardTitle>Manage Chapters for {selectedSubject?.name}</CardTitle>
                 <CardDescription>Add, edit, or delete chapters for this subject.</CardDescription>
            </div>
             <Button onClick={handleAddChapter}><PlusCircle className="mr-2 h-4 w-4" /> Add Chapter</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full space-y-3">
          {selectedSubject?.chapters.map(chap => (
            <AccordionItem value={chap.id} key={chap.id} className="border rounded-md px-4 bg-secondary/50">
                <div className="flex items-center w-full">
                    <AccordionTrigger className="flex-grow hover:no-underline py-3">
                        <Input value={chap.name} onClick={(e) => e.stopPropagation()} onChange={e => handleUpdateChapter(chap.id, e.target.value)} className="font-medium" />
                    </AccordionTrigger>
                     <div className="flex items-center gap-3 ml-4">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" onClick={(e) => e.stopPropagation()}><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete "{chap.name}"?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete the chapter and all its content.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteChapter(chap.id)}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
              <AccordionContent>
                <div className="space-y-4 p-2 border-t mt-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Chapter Content</h4>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddContentItem(chap.id)}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Content
                    </Button>
                  </div>

                  {chap.content.map(item => (
                     <div key={item.id} className="p-4 border rounded-md space-y-3 relative bg-background">
                       <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => handleDeleteContentItem(chap.id, item.id)}>
                          <Trash2 className="h-4 w-4" />
                       </Button>
                       <div className="grid grid-cols-6 gap-4 items-end">
                        <div className="space-y-2 col-span-3">
                          <Label htmlFor={`content-title-${item.id}`}>Title</Label>
                          <Input 
                            id={`content-title-${item.id}`} 
                            value={item.title} 
                            onChange={e => handleUpdateContentItem(chap.id, item.id, 'title', e.target.value)} 
                            placeholder="e.g., Introduction PDF"
                            required
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                           <Label htmlFor={`content-url-${item.id}`}>Content URL</Label>
                           <Input 
                            id={`content-url-${item.id}`}
                            type="text"
                            placeholder="https://example.com/file.pdf"
                            value={item.url}
                            onChange={(e) => handleUpdateContentItem(chap.id, item.id, 'url', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2 col-span-1">
                          <Label htmlFor={`content-type-${item.id}`}>Type</Label>
                          <Select 
                            value={item.type}
                            onValueChange={(value: 'pdf' | 'video' | 'image') => handleUpdateContentItem(chap.id, item.id, 'type', value)}
                          >
                            <SelectTrigger id={`content-type-${item.id}`}>
                              <SelectValue placeholder="Select type" />
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
                   {chap.content.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No content items yet.</p>}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
         {selectedSubject?.chapters.length === 0 && <p className="text-muted-foreground text-center py-8">No chapters found. Add one to get started.</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {view === 'list' && renderClassList()}
      {view === 'class' && selectedClass && renderSubjectList()}
      {view === 'subject' && selectedSubject && renderChapterList()}

      <div className="flex justify-end mt-6">
        <Button size="lg" onClick={handleSaveAll} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            {isSaving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>
    </div>
  );
}

    