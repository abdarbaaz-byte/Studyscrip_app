
"use client";

import { useState, useEffect } from "react";
import type { Course, CourseContent } from "@/lib/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, PlusCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
  content: [],
};

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
        content: course.content,
      });
    } else {
       setFormData(emptyCourse);
    }
  }, [course]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
  };

  const handleContentChange = (index: number, field: keyof CourseContent, value: string) => {
    const newContent = [...formData.content];
    newContent[index] = { ...newContent[index], [field]: value };
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  const addContentItem = () => {
    setFormData(prev => ({
      ...prev,
      content: [...prev.content, { type: 'pdf', title: '', url: '' }]
    }));
  };

  const removeContentItem = (index: number) => {
    const newContent = formData.content.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, content: newContent }));
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
            <h3 className="text-lg font-medium">Course Content</h3>
            <Button type="button" variant="outline" size="sm" onClick={addContentItem}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Content
            </Button>
        </div>
        <div className="space-y-4">
          {formData.content.map((item, index) => (
            <div key={index} className="p-4 border rounded-md space-y-3 relative bg-secondary/50">
               <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => removeContentItem(index)}>
                  <Trash2 className="h-4 w-4" />
               </Button>
               <div className="grid grid-cols-6 gap-4 items-end">
                <div className="space-y-2 col-span-3">
                  <Label htmlFor={`content-title-${index}`}>Title</Label>
                  <Input 
                    id={`content-title-${index}`} 
                    value={item.title} 
                    onChange={e => handleContentChange(index, 'title', e.target.value)} 
                    placeholder="e.g., Chapter 1: Introduction"
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor={`content-url-${index}`}>Content URL</Label>
                   <Input 
                    id={`content-url-${index}`}
                    type="text"
                    value={item.url}
                    onChange={(e) => handleContentChange(index, 'url', e.target.value)}
                    placeholder="https://example.com/file.pdf"
                    required
                  />
                </div>
                <div className="space-y-2 col-span-1">
                  <Label htmlFor={`content-type-${index}`}>Type</Label>
                  <Select 
                    value={item.type}
                    onValueChange={(value: 'pdf' | 'video' | 'image') => handleContentChange(index, 'type', value)}
                  >
                    <SelectTrigger id={`content-type-${index}`}>
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
          {formData.content.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No content items yet. Click "Add Content" to get started.</p>
          )}
        </div>
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
