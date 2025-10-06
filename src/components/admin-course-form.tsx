
"use client";

import { useState, useEffect } from "react";
import type { Course, CourseFolder, CourseContent } from "@/lib/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, PlusCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
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

interface AdminCourseFormProps {
  course: Course | null;
  onSave: (course: Course) => void;
  onCancel: () => void;
}

const emptyCourse: Omit<Course, "id" | "docId"> = {
  title: "",
  description: "",
  longDescription: "",
  thumbnail: "https://placehold.co/600x400.png",
  price: 0,
  folders: [],
};

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export function AdminCourseForm({ course, onSave, onCancel }: AdminCourseFormProps) {
  const [formData, setFormData] = useState<Omit<Course, "id" | "docId">>(emptyCourse);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        longDescription: course.longDescription,
        thumbnail: course.thumbnail,
        price: course.price,
        folders: course.folders || [],
      });
    } else {
       setFormData(emptyCourse);
    }
  }, [course]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
  };

  const handleFolderChange = (index: number, value: string) => {
    const newFolders = [...formData.folders];
    newFolders[index].name = value;
    setFormData(prev => ({ ...prev, folders: newFolders }));
  };

  const addFolder = () => {
    setFormData(prev => ({
      ...prev,
      folders: [...prev.folders, { id: generateId('folder'), name: 'New Folder', content: [] }]
    }));
  };

  const removeFolder = (index: number) => {
    const newFolders = formData.folders.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, folders: newFolders }));
  };
  
  const handleContentChange = (folderIndex: number, contentIndex: number, field: keyof CourseContent, value: string) => {
    const newFolders = [...formData.folders];
    const newContent = [...newFolders[folderIndex].content];
    (newContent[contentIndex] as any)[field] = value;
    newFolders[folderIndex].content = newContent;
    setFormData(prev => ({...prev, folders: newFolders }));
  };
  
  const addContentItem = (folderIndex: number) => {
    const newFolders = [...formData.folders];
    newFolders[folderIndex].content.push({ id: generateId('content'), type: 'pdf', title: '', url: '' });
    setFormData(prev => ({ ...prev, folders: newFolders }));
  };

  const removeContentItem = (folderIndex: number, contentIndex: number) => {
    const newFolders = [...formData.folders];
    newFolders[folderIndex].content = newFolders[folderIndex].content.filter((_, i) => i !== contentIndex);
    setFormData(prev => ({...prev, folders: newFolders}));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: course?.id || "", // This is the mock id, Firestore id will be docId
      docId: course?.docId
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div className="space-y-2 col-span-2">
          <Label htmlFor="description">Short Description</Label>
          <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
        </div>
         <div className="space-y-2 col-span-2">
          <Label htmlFor="longDescription">Long Description</Label>
          <Textarea id="longDescription" name="longDescription" value={formData.longDescription} onChange={handleChange} required rows={5}/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
        </div>
         <div className="space-y-2">
          <Label htmlFor="thumbnail">Thumbnail URL</Label>
          <Input id="thumbnail" name="thumbnail" value={formData.thumbnail} onChange={handleChange} required />
        </div>
      </div>
      
      <Separator className="my-6" />

      <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Course Content Folders</h3>
            <Button type="button" variant="outline" size="sm" onClick={addFolder}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Folder
            </Button>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-3">
          {formData.folders.map((folder, folderIndex) => (
            <AccordionItem value={folder.id} key={folder.id} className="border rounded-md px-4 bg-secondary/50">
               <div className="flex items-center w-full">
                    <AccordionTrigger className="flex-grow hover:no-underline py-3">
                        <Input value={folder.name} onClick={(e) => e.stopPropagation()} onChange={e => handleFolderChange(folderIndex, e.target.value)} className="font-medium" />
                    </AccordionTrigger>
                     <div className="flex items-center gap-3 ml-4">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" onClick={(e) => e.stopPropagation()}><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete "{folder.name}"?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete the folder and all its content.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => removeFolder(folderIndex)}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <AccordionContent>
                  <div className="space-y-4 p-2 border-t mt-3">
                     <div className="flex justify-between items-center">
                        <h4 className="font-semibold">Folder Content</h4>
                        <Button type="button" variant="outline" size="sm" onClick={() => addContentItem(folderIndex)}>
                          <PlusCircle className="mr-2 h-4 w-4" /> Add Content
                        </Button>
                      </div>
                      {folder.content.map((item, contentIndex) => (
                         <div key={item.id} className="p-4 border rounded-md space-y-3 relative bg-background">
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => removeContentItem(folderIndex, contentIndex)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                             <div className="grid grid-cols-6 gap-4 items-end">
                                <div className="space-y-2 col-span-3">
                                  <Label htmlFor={`content-title-${folderIndex}-${contentIndex}`}>Title</Label>
                                  <Input 
                                    id={`content-title-${folderIndex}-${contentIndex}`} 
                                    value={item.title} 
                                    onChange={e => handleContentChange(folderIndex, contentIndex, 'title', e.target.value)} 
                                    placeholder="e.g., Introduction PDF"
                                    required
                                  />
                                </div>
                                <div className="space-y-2 col-span-2">
                                  <Label htmlFor={`content-url-${folderIndex}-${contentIndex}`}>Content URL</Label>
                                  <Input 
                                    id={`content-url-${folderIndex}-${contentIndex}`}
                                    type="text"
                                    placeholder="https://example.com/file.pdf"
                                    value={item.url}
                                    onChange={(e) => handleContentChange(folderIndex, contentIndex, 'url', e.target.value)}
                                    required
                                  />
                                </div>
                                <div className="space-y-2 col-span-1">
                                  <Label htmlFor={`content-type-${folderIndex}-${contentIndex}`}>Type</Label>
                                  <Select 
                                    value={item.type}
                                    onValueChange={(value: 'pdf' | 'video' | 'image') => handleContentChange(folderIndex, contentIndex, 'type', value)}
                                  >
                                    <SelectTrigger id={`content-type-${folderIndex}-${contentIndex}`}>
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
                      {folder.content.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No content items in this folder yet.</p>}
                  </div>
                </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        {formData.folders.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No folders yet. Click "Add Folder" to get started.</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Course
        </Button>
      </div>
    </form>
  );
}
