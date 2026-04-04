"use client";

import { useState, useEffect } from "react";
import type { Batch, BatchNote, BatchInformation, ContentItem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, PlusCircle, Save, Loader2, Edit, Megaphone, FileText, ListPlus, MessageSquare } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { saveBatchInformation, getBatchInformation, deleteBatchInformation } from "@/lib/data";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
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
        <DialogContent className="sm:max-w-4xl">
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
                  <Badge variant="outline">{batch.notes.length} Topics</Badge>
                  {batch.chatEnabled === false && <Badge variant="destructive">Chat Off</Badge>}
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
                      <AlertDialogDescription>This will delete "{batch.title}" and all its content associations. This action cannot be undone.</AlertDialogDescription>
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
          {initialBatches.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No batches created yet.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function BatchForm({ batch, onSave, onCancel, isSaving }: { batch: Batch, onSave: (batch: Batch) => void, onCancel: () => void, isSaving: boolean }) {
  const [formData, setFormData] = useState<Batch>({
    ...batch,
    includes: batch.includes || [],
    chatEnabled: batch.chatEnabled !== false, // default to true
  });
  const [infoTitle, setInfoTitle] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [infoList, setInfoList] = useState<BatchInformation[]>([]);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (batch.id) {
        setLoadingInfo(true);
        getBatchInformation(batch.id).then(data => {
            setInfoList(data);
            setLoadingInfo(false);
        });
    }
  }, [batch.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: (name === 'price' || name === 'originalPrice') ? parseFloat(value) || 0 : value }));
  };

  const handleNoteChange = (index: number, field: string, value: any) => {
    const newNotes = [...formData.notes];
    (newNotes[index] as any)[field] = value;
    setFormData(prev => ({ ...prev, notes: newNotes }));
  };

  const addNoteTopic = () => {
    setFormData(prev => ({
      ...prev,
      notes: [...prev.notes, { id: generateId('nt'), title: '', content: [] }]
    }));
  };

  const removeNoteTopic = (index: number) => {
    setFormData(prev => ({ ...prev, notes: prev.notes.filter((_, i) => i !== index) }));
  };

  const addContentItem = (noteIndex: number) => {
    const newNotes = [...formData.notes];
    newNotes[noteIndex].content.push({ id: generateId('c'), type: 'pdf', title: '', url: '' });
    setFormData(prev => ({ ...prev, notes: newNotes }));
  };

  const removeContentItem = (noteIndex: number, itemIndex: number) => {
    const newNotes = [...formData.notes];
    newNotes[noteIndex].content.splice(itemIndex, 1);
    setFormData(prev => ({ ...prev, notes: newNotes }));
  };

  const handleContentItemChange = (noteIndex: number, itemIndex: number, field: keyof ContentItem, value: string) => {
    const newNotes = [...formData.notes];
    (newNotes[noteIndex].content[itemIndex] as any)[field] = value;
    setFormData(prev => ({ ...prev, notes: newNotes }));
  };

  const addIncludePoint = () => {
    setFormData(prev => ({ ...prev, includes: [...prev.includes, ''] }));
  };

  const updateIncludePoint = (index: number, value: string) => {
    const newIncludes = [...formData.includes];
    newIncludes[index] = value;
    setFormData(prev => ({ ...prev, includes: newIncludes }));
  };

  const removeIncludePoint = (index: number) => {
    setFormData(prev => ({ ...prev, includes: prev.includes.filter((_, i) => i !== index) }));
  };

  const handlePostInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch.id) {
        toast({ variant: "destructive", title: "Save the batch first before posting information." });
        return;
    }
    if (!infoTitle || !infoMessage) return;
    
    await saveBatchInformation(batch.id, { title: infoTitle, message: infoMessage });
    setInfoTitle("");
    setInfoMessage("");
    const updatedInfo = await getBatchInformation(batch.id);
    setInfoList(updatedInfo);
    toast({ title: "Information Posted!" });
  };

  const handleDeleteInfo = async (infoId: string) => {
    await deleteBatchInformation(batch.id, infoId);
    const updatedInfo = await getBatchInformation(batch.id);
    setInfoList(updatedInfo);
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Batch Title</Label>
          <Input name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label>Selling Price (Rs.) - Set 0 for Free</Label>
          <Input name="price" type="number" value={formData.price} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label>Original Price (Rs.) - For Discount display</Label>
          <Input name="originalPrice" type="number" value={formData.originalPrice || 0} onChange={handleChange} placeholder="e.g. 1999" />
        </div>
        <div className="space-y-2 flex flex-col justify-end">
            <div className="flex items-center space-x-2 p-3 border rounded-md bg-secondary/20">
                <Switch 
                    id="chat-enabled" 
                    checked={formData.chatEnabled} 
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, chatEnabled: checked }))} 
                />
                <Label htmlFor="chat-enabled" className="flex items-center gap-2 cursor-pointer">
                    <MessageSquare className="h-4 w-4"/> Enable Group Chat
                </Label>
            </div>
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Description</Label>
          <Textarea name="description" value={formData.description} onChange={handleChange} required />
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Thumbnail URL</Label>
          <Input name="thumbnail" value={formData.thumbnail} onChange={handleChange} required />
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="includes" className="border rounded-md px-4 bg-secondary/30">
          <AccordionTrigger><div className="flex items-center gap-2"><ListPlus className="h-4 w-4"/> Includes / Features</div></AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm">Feature Points (e.g. Lifetime access)</h4>
                <Button type="button" variant="outline" size="sm" onClick={addIncludePoint}><PlusCircle className="h-4 w-4 mr-2"/> Add Point</Button>
            </div>
            <div className="space-y-2">
                {formData.includes.map((point, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                        <Input value={point} onChange={(e) => updateIncludePoint(idx, e.target.value)} placeholder={`Point ${idx + 1}`} />
                        <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeIncludePoint(idx)}><Trash2 className="h-4 w-4"/></Button>
                    </div>
                ))}
                {formData.includes.length === 0 && <p className="text-xs text-muted-foreground text-center">No includes points added.</p>}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="notes" className="border rounded-md px-4 bg-secondary/30">
          <AccordionTrigger><div className="flex items-center gap-2"><FileText className="h-4 w-4"/> Notes Management</div></AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold">Note Topics</h4>
                <Button type="button" size="sm" onClick={addNoteTopic}><PlusCircle className="h-4 w-4 mr-2"/> Add Topic</Button>
            </div>
            {formData.notes.map((note, nIdx) => (
                <div key={note.id} className="p-4 border rounded-md bg-background relative space-y-4">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeNoteTopic(nIdx)}><Trash2 className="h-4 w-4"/></Button>
                    <div className="space-y-2">
                        <Label>Topic Title</Label>
                        <Input value={note.title} onChange={e => handleNoteChange(nIdx, 'title', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs">Content Items</Label>
                            <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => addContentItem(nIdx)}>Add Link/File</Button>
                        </div>
                        {note.content.map((item, iIdx) => (
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end p-2 border rounded-sm bg-secondary/20">
                                <div className="md:col-span-2"><Input placeholder="Title" value={item.title} onChange={e => handleContentItemChange(nIdx, iIdx, 'title', e.target.value)}/></div>
                                <div>
                                    <Select value={item.type} onValueChange={v => handleContentItemChange(nIdx, iIdx, 'type', v as any)}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pdf">PDF</SelectItem>
                                            <SelectItem value="video">Video</SelectItem>
                                            <SelectItem value="image">Image</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-1">
                                    <Input placeholder="URL" value={item.url} onChange={e => handleContentItemChange(nIdx, iIdx, 'url', e.target.value)}/>
                                    <Button variant="ghost" size="icon" onClick={() => removeContentItem(nIdx, iIdx)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {batch.id && (
            <AccordionItem value="info" className="border rounded-md px-4 bg-secondary/30">
                <AccordionTrigger><div className="flex items-center gap-2"><Megaphone className="h-4 w-4"/> Information (Announcements)</div></AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                    <form onSubmit={handlePostInfo} className="space-y-3 p-4 border rounded-md bg-background">
                        <div className="space-y-1">
                            <Label>Announcement Title</Label>
                            <Input value={infoTitle} onChange={e => setInfoTitle(e.target.value)} placeholder="e.g. Next class scheduled" />
                        </div>
                        <div className="space-y-1">
                            <Label>Message</Label>
                            <Textarea value={infoMessage} onChange={e => setInfoMessage(e.target.value)} placeholder="Type your message..." />
                        </div>
                        <Button type="submit">Post Announcement</Button>
                    </form>
                    <div className="space-y-2">
                        {loadingInfo ? <Loader2 className="animate-spin mx-auto"/> : infoList.map(info => (
                            <div key={info.id} className="p-3 border rounded-md bg-background relative">
                                <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => handleDeleteInfo(info.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                <p className="font-bold text-sm">{info.title}</p>
                                <p className="text-xs text-muted-foreground">{info.message}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">{format(info.createdAt.toDate(), "PPP p")}</p>
                            </div>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
        )}
      </Accordion>

      <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-background py-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData)} disabled={isSaving}>
          {isSaving ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2"/>}
          {formData.id ? "Update Batch" : "Create Batch"}
        </Button>
      </div>
    </div>
  );
}
