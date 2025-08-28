
"use client";

import { useState, useEffect } from "react";
import type { BookstoreItem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle, Save, Loader2 } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AdminBookstoreFormProps {
  initialItems: BookstoreItem[];
  onSave: (item: BookstoreItem) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const emptyItem: Omit<BookstoreItem, 'id'> = {
  title: "",
  url: "",
  thumbnailUrl: "",
};

export function AdminBookstoreForm({ initialItems, onSave, onDelete }: AdminBookstoreFormProps) {
  const [items, setItems] = useState<BookstoreItem[]>(initialItems);
  const [editingItem, setEditingItem] = useState<BookstoreItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = async (itemData: BookstoreItem) => {
    setIsSaving(true);
    await onSave(itemData);
    setIsSaving(false);
    setIsDialogOpen(false);
    setEditingItem(null);
  };
  
  const handleAddNew = () => {
    setEditingItem({ ...emptyItem, id: '' }); // Temp empty object for the form
    setIsDialogOpen(true);
  };
  
  const handleEdit = (item: BookstoreItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
       <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) setEditingItem(null); setIsDialogOpen(isOpen); }}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Book
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem?.id ? "Edit Book" : "Add New Book"}</DialogTitle>
              <DialogDescription>
                Fill in the details for the bookstore item.
              </DialogDescription>
            </DialogHeader>
            <BookForm
              item={editingItem}
              onSave={handleSave}
              onCancel={() => setIsDialogOpen(false)}
              isSaving={isSaving}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <div className="grid grid-cols-[1fr_1fr_auto] p-2 font-medium bg-secondary">
          <div>Title</div>
          <div>PDF URL</div>
          <div className="text-right">Actions</div>
        </div>
        <div className="space-y-2 p-2">
            {initialItems.map(item => (
                <div key={item.id} className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center p-2 border-b">
                    <p className="truncate">{item.title}</p>
                    <p className="truncate text-sm text-muted-foreground">{item.url}</p>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>Edit</Button>
                        <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{item.title}"?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(item.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            ))}
            {initialItems.length === 0 && <p className="text-muted-foreground text-center py-8">No books found. Add one to get started.</p>}
        </div>
      </div>
    </div>
  );
}

// Sub-component for the form itself
function BookForm({ item, onSave, onCancel, isSaving }: { item: BookstoreItem | null, onSave: (item: BookstoreItem) => void, onCancel: () => void, isSaving: boolean }) {
  const [formData, setFormData] = useState<Omit<BookstoreItem, 'id'>>(item || emptyItem);
  
  useEffect(() => {
    setFormData(item || emptyItem);
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: item?.id || '' });
  };
  
  return (
     <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Book Title</Label>
        <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="url">PDF URL</Label>
        <Input id="url" name="url" value={formData.url} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="thumbnailUrl">Thumbnail URL (Optional)</Label>
        <Input id="thumbnailUrl" name="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleChange} placeholder="e.g., Google Drive image link"/>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Book
        </Button>
      </div>
    </form>
  )
}
