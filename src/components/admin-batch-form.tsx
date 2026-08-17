
"use client";

import { useState, useEffect } from "react";
import type { Batch, BatchNote, BatchInformation, ContentItem, BatchDownloadItem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, PlusCircle, Save, Loader2, Edit, Megaphone, FileText, ListPlus, MessageSquare, Download, Folder } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { saveBatchInformation, getBatchInformation, deleteBatchInformation } from "@/lib/data";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminBatchFormProps {
  initialBatches: Batch[];
  onSave: (batch: Batch) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export function AdminBatchForm({ initialBatches, onSave, onDelete }: AdminBatchFormProps) {
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddNew = () => {
    setEditingBatch({
        id: '',
        title: '',
        description: '',
        price: 0,
        originalPrice: 0,
        thumbnail: '',
        notes: [],
        downloadContent: [],
        quizIds: [],
        includes: [],
        createdAt: null as any,
        chatEnabled: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setIsDialogOpen(true);
  };

  const handleSaveBatch = async (batch: Batch) => {
    setIsSaving(true);
    await onSave(batch);
    setIsSaving(false);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Batch
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{editingBatch?.id ? "Edit Batch" : "Create New Batch"}</DialogTitle>
          </DialogHeader>
          {editingBatch && (
            <BatchForm 
              batch={editingBatch} 
              onSave={handleSaveBatch} 
              onCancel={() => setIsDialogOpen(false)} 
              isSaving={isSaving}
            />
          )}
        </DialogContent>
      </Dialog>

      <Table className="border rounded-md">
        <TableHeader>
          <TableRow>
            <TableHead>Batch Title</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Content</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialBatches.map((batch) => (
            <TableRow key={batch.id}>
              <TableCell className="font-medium">{batch.title}</TableCell>
              <TableCell>{batch.price === 0 ? <Badge className="bg-green-600">Free</Badge> : `Rs. ${batch.price}`}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Badge variant="outline">{batch.notes.length} Folders</Badge>
                  <Badge variant="outline">{(batch.downloadContent || []).length} DL</Badge>
                </div>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(batch)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>This will delete "{batch.title}" and all its content associations.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(batch.id)}>Confirm Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function BatchForm({ batch, onSave, onCancel, isSaving }: { batch: Batch, onSave: (batch: Batch) => void, onCancel: () => void, isSaving: boolean }) {
  const [formData, setFormData] = useState<Batch>({
    ...batch,
    includes: batch.includes || [],
    chatEnabled: batch.chatEnabled !== false,
    downloadContent: batch.downloadContent || [],
  });
  const [infoTitle, setInfoTitle] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [infoList, setInfoList] = useState<BatchInformation[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (batch.id) {
        getBatchInformation(batch.id).then(setInfoList);
    }
  }, [batch.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: (name === 'price' || name === 'originalPrice') ? parseFloat(value) || 0 : value }));
  };

  // Main Note Folder handlers
  const addNoteTopic = () => {
    setFormData(prev => ({
      ...prev,
      notes: [...prev.notes, { id: generateId('nt'), title: '', content: [], subFolders: [] }]
    }));
  };

  const removeNoteTopic = (index: number) => {
    setFormData(prev => ({ ...prev, notes: prev.notes.filter((_, i) => i !== index) }));
  };

  const handleNoteChange = (index: number, field: string, value: any) => {
    const newNotes = [...formData.notes];
    (newNotes[index] as any)[field] = value;
    setFormData(prev => ({ ...prev, notes: newNotes }));
  };

  // Sub-folder handlers
  const addSubFolder = (noteIndex: number) => {
    const newNotes = [...formData.notes];
    if (!newNotes[noteIndex].subFolders) newNotes[noteIndex].subFolders = [];
    newNotes[noteIndex].subFolders!.push({ id: generateId('subnt'), title: '', content: [] });
    setFormData(prev => ({ ...prev, notes: newNotes }));
  };

  const removeSubFolder = (noteIndex: number, subIndex: number) => {
    const newNotes = [...formData.notes];
    newNotes[noteIndex].subFolders = newNotes[noteIndex].subFolders!.filter((_, i) => i !== subIndex);
    setFormData(prev => ({ ...prev, notes: newNotes }));
  };

  const handleSubFolderChange = (noteIndex: number, subIndex: number, field: string, value: any) => {
    const newNotes = [...formData.notes];
    (newNotes[noteIndex].subFolders![subIndex] as any)[field] = value;
    setFormData(prev => ({ ...prev, notes: newNotes }));
  };

  // Content Item handlers
  const addContentItem = (noteIndex: number, subFolderIndex?: number) => {
    const newNotes = [...formData.notes];
    if (subFolderIndex !== undefined) {
        newNotes[noteIndex].subFolders![subFolderIndex].content.push({ id: generateId('c'), type: 'pdf', title: '', url: '' });
    } else {
        newNotes[noteIndex].content.push({ id: generateId('c'), type: 'pdf', title: '', url: '' });
    }
    setFormData(prev => ({ ...prev, notes: newNotes }));
  };

  const handleContentChange = (noteIndex: number, itemIndex: number, field: keyof ContentItem, value: string, subFolderIndex?: number) => {
    const newNotes = [...formData.notes];
    if (subFolderIndex !== undefined) {
        (newNotes[noteIndex].subFolders![subFolderIndex].content[itemIndex] as any)[field] = value;
    } else {
        (newNotes[noteIndex].content[itemIndex] as any)[field] = value;
    }
    setFormData(prev => ({ ...prev, notes: newNotes }));
  };

  const removeContentItem = (noteIndex: number, itemIndex: number, subFolderIndex?: number) => {
    const newNotes = [...formData.notes];
    if (subFolderIndex !== undefined) {
        newNotes[noteIndex].subFolders![subFolderIndex].content.splice(itemIndex, 1);
    } else {
        newNotes[noteIndex].content.splice(itemIndex, 1);
    }
    setFormData(prev => ({ ...prev, notes: newNotes }));
  };

  // Downloads & Includes handlers...
  const addDownloadItem = () => setFormData(prev => ({ ...prev, downloadContent: [...(prev.downloadContent || []), { id: generateId('dl'), title: '', url: '' }] }));
  const removeDownloadItem = (idx: number) => setFormData(prev => ({ ...prev, downloadContent: (prev.downloadContent || []).filter((_, i) => i !== idx) }));
  const handleDownloadChange = (idx: number, f: keyof BatchDownloadItem, v: string) => {
    const d = [...(formData.downloadContent || [])];
    (d[idx] as any)[f] = v;
    setFormData(prev => ({ ...prev, downloadContent: d }));
  };

  const handlePostInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch.id) return;
    await saveBatchInformation(batch.id, { title: infoTitle, message: infoMessage });
    setInfoTitle(""); setInfoMessage("");
    getBatchInformation(batch.id).then(setInfoList);
    toast({ title: "Information Posted!" });
  };

  const handleDeleteInfo = async (id: string) => {
    await deleteBatchInformation(batch.id, id);
    getBatchInformation(batch.id).then(setInfoList);
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Title</Label><Input name="title" value={formData.title} onChange={handleChange} required /></div>
        <div className="space-y-2"><Label>Price (Rs.)</Label><Input name="price" type="number" value={formData.price} onChange={handleChange} required /></div>
        <div className="space-y-2"><Label>Original Price</Label><Input name="originalPrice" type="number" value={formData.originalPrice || 0} onChange={handleChange} /></div>
        <div className="space-y-2 col-span-2"><Label>Thumbnail URL</Label><Input name="thumbnail" value={formData.thumbnail} onChange={handleChange} required /></div>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="notes" className="border rounded-md px-4 bg-secondary/30">
          <AccordionTrigger><div className="flex items-center gap-2"><FileText className="h-4 w-4"/> Notes Management (Folders)</div></AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <Button type="button" size="sm" onClick={addNoteTopic} className="w-full"><PlusCircle className="mr-2 h-4 w-4"/> Add Main Folder</Button>
            {formData.notes.map((note, nIdx) => (
                <div key={note.id} className="p-4 border rounded-md bg-background relative space-y-4">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeNoteTopic(nIdx)}><Trash2 className="h-4 w-4"/></Button>
                    <div className="space-y-2"><Label>Folder Title</Label><Input value={note.title} onChange={e => handleNoteChange(nIdx, 'title', e.target.value)} placeholder="e.g. Science Notes"/></div>
                    
                    <div className="pl-6 space-y-4 border-l-2 border-primary/20">
                        <div className="flex justify-between items-center"><h5 className="text-xs font-bold uppercase">Sub-Folders</h5><Button type="button" variant="outline" size="sm" onClick={() => addSubFolder(nIdx)}><Folder className="h-3 w-3 mr-1"/> Add Sub-Folder</Button></div>
                        {note.subFolders?.map((sub, sIdx) => (
                            <div key={sub.id} className="p-3 border rounded bg-secondary/10 relative space-y-3">
                                <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 text-destructive" onClick={() => removeSubFolder(nIdx, sIdx)}><Trash2 className="h-3 w-3"/></Button>
                                <Input value={sub.title} onChange={e => handleSubFolderChange(nIdx, sIdx, 'title', e.target.value)} placeholder="Sub-folder title" className="h-8"/>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center"><span className="text-[10px] font-bold">Files in Sub-Folder</span><Button type="button" variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => addContentItem(nIdx, sIdx)}>+ Add File</Button></div>
                                    {sub.content.map((item, iIdx) => (
                                        <div key={item.id} className="grid grid-cols-4 gap-1 p-2 bg-background border rounded">
                                            <Input className="col-span-2 h-7 text-xs" placeholder="Title" value={item.title} onChange={e => handleContentChange(nIdx, iIdx, 'title', e.target.value, sIdx)}/>
                                            <Input className="col-span-1 h-7 text-xs" placeholder="URL" value={item.url} onChange={e => handleContentChange(nIdx, iIdx, 'url', e.target.value, sIdx)}/>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeContentItem(nIdx, iIdx, sIdx)}><Trash2 className="h-3 w-3"/></Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <Separator/>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center"><h5 className="text-xs font-bold uppercase">Direct Files (No sub-folder)</h5><Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => addContentItem(nIdx)}>+ Add File</Button></div>
                            {note.content.map((item, iIdx) => (
                                <div key={item.id} className="grid grid-cols-4 gap-1 p-2 bg-background border rounded">
                                    <Input className="col-span-2 h-7 text-xs" placeholder="Title" value={item.title} onChange={e => handleContentChange(nIdx, iIdx, 'title', e.target.value)}/>
                                    <Input className="col-span-1 h-7 text-xs" placeholder="URL" value={item.url} onChange={e => handleContentChange(nIdx, iIdx, 'url', e.target.value)}/>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeContentItem(nIdx, iIdx)}><Trash2 className="h-3 w-3"/></Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Existing accordion items for Downloads, Includes, Information... */}
        <AccordionItem value="downloads" className="border rounded-md px-4 bg-secondary/30">
            <AccordionTrigger><div className="flex items-center gap-2"><Download className="h-4 w-4"/> Downloads Management</div></AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
                <Button type="button" variant="outline" size="sm" onClick={addDownloadItem} className="w-full">Add File</Button>
                {formData.downloadContent?.map((item, idx) => (
                    <div key={item.id} className="p-3 border rounded bg-background relative space-y-2">
                        <Button variant="ghost" size="icon" className="absolute top-1 right-1 text-destructive" onClick={() => removeDownloadItem(idx)}><Trash2 className="h-4 w-4"/></Button>
                        <Input value={item.title} onChange={e => handleDownloadChange(idx, 'title', e.target.value)} placeholder="File Title"/>
                        <Input value={item.url} onChange={e => handleDownloadChange(idx, 'url', e.target.value)} placeholder="URL"/>
                    </div>
                ))}
            </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-background py-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData)} disabled={isSaving}>
          {isSaving ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2"/>}
          Save Batch
        </Button>
      </div>
    </div>
  );
}
