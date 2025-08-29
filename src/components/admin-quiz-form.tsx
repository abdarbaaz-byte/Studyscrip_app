
"use client";

import { useState } from "react";
import type { Quiz, Question } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, PlusCircle, Save, Loader2, Edit } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AdminQuizFormProps {
  initialQuizzes: Quiz[];
  onSave: (quiz: Quiz) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const emptyQuiz: Omit<Quiz, 'id'> = {
  title: "",
  description: "",
  questions: [],
};

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

export function AdminQuizForm({ initialQuizzes, onSave, onDelete }: AdminQuizFormProps) {
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = async (quizData: Quiz) => {
    setIsSaving(true);
    await onSave(quizData);
    setIsSaving(false);
    setIsDialogOpen(false);
    setEditingQuiz(null);
  };
  
  const handleAddNew = () => {
    setEditingQuiz({ ...emptyQuiz, id: '' });
    setIsDialogOpen(true);
  };
  
  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) setEditingQuiz(null); setIsDialogOpen(isOpen); }}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>{editingQuiz?.id ? "Edit Quiz" : "Add New Quiz"}</DialogTitle>
              <DialogDescription>
                Fill in the details for the quiz and its questions.
              </DialogDescription>
            </DialogHeader>
            <QuizForm
              quiz={editingQuiz}
              onSave={handleSave}
              onCancel={() => setIsDialogOpen(false)}
              isSaving={isSaving}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-3">
        {initialQuizzes.map(quiz => (
          <AccordionItem value={quiz.id} key={quiz.id} className="border rounded-md px-4 bg-secondary/50">
            <div className="flex items-center w-full">
              <AccordionTrigger className="flex-grow hover:no-underline py-3 text-lg font-medium text-left">
                <div>
                    {quiz.title}
                    <p className="text-sm font-normal text-muted-foreground">{quiz.description}</p>
                </div>
              </AccordionTrigger>
              <div className="flex items-center gap-3 ml-4">
                 <Button variant="outline" size="sm" onClick={() => handleEdit(quiz)}>
                    <Edit className="mr-2 h-4 w-4"/> Edit
                 </Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" onClick={(e) => e.stopPropagation()}><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{quiz.title}"?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete the quiz and all its questions.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(quiz.id)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <AccordionContent>
              <div className="space-y-4 p-2 border-t mt-3">
                <h4 className="font-semibold">{quiz.questions.length} Questions</h4>
                {quiz.questions.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No questions yet. Edit the quiz to add some.</p>}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {initialQuizzes.length === 0 && <p className="text-muted-foreground text-center py-8">No quizzes found. Add one to get started.</p>}
    </div>
  );
}


// Sub-component for the form itself
function QuizForm({ quiz, onSave, onCancel, isSaving }: { quiz: Quiz | null, onSave: (quiz: Quiz) => void, onCancel: () => void, isSaving: boolean }) {
  const [formData, setFormData] = useState<Omit<Quiz, 'id'>>(quiz || emptyQuiz);

  useState(() => {
    setFormData(quiz || emptyQuiz);
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const addQuestion = () => {
    const newQuestion: Question = {
        id: generateId('q'),
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0
    };
    setFormData(prev => ({...prev, questions: [...prev.questions, newQuestion]}));
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index)}));
  };
  
  const handleQuestionChange = (qIndex: number, text: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].text = text;
    setFormData(prev => ({...prev, questions: newQuestions}));
  };
  
  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options[optIndex] = text;
    setFormData(prev => ({...prev, questions: newQuestions}));
  };
  
  const handleCorrectAnswerChange = (qIndex: number, correctIndex: number) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].correctAnswer = correctIndex;
    setFormData(prev => ({...prev, questions: newQuestions}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: quiz?.id || '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-4">
      <div className="space-y-2">
        <Label htmlFor="title">Quiz Title</Label>
        <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Questions</h3>
            <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Question
            </Button>
        </div>
        <div className="space-y-4">
          {formData.questions.map((q, qIndex) => (
            <div key={q.id || qIndex} className="p-4 border rounded-md space-y-3 relative bg-secondary/50">
               <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => removeQuestion(qIndex)}>
                  <Trash2 className="h-4 w-4" />
               </Button>
               <div className="space-y-2">
                 <Label htmlFor={`q-text-${qIndex}`}>Question {qIndex + 1}</Label>
                 <Textarea id={`q-text-${qIndex}`} value={q.text} onChange={e => handleQuestionChange(qIndex, e.target.value)} required />
               </div>
               <div className="space-y-3">
                 <Label>Options & Correct Answer</Label>
                 <RadioGroup value={q.correctAnswer.toString()} onValueChange={value => handleCorrectAnswerChange(qIndex, parseInt(value))}>
                    {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                            <RadioGroupItem value={optIndex.toString()} id={`q-${qIndex}-opt-${optIndex}`} />
                            <Input 
                                id={`q-${qIndex}-opt-input-${optIndex}`}
                                placeholder={`Option ${optIndex + 1}`}
                                value={opt}
                                onChange={e => handleOptionChange(qIndex, optIndex, e.target.value)}
                                required
                            />
                        </div>
                    ))}
                 </RadioGroup>
               </div>
            </div>
          ))}
          {formData.questions.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No questions yet.</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Quiz
        </Button>
      </div>
    </form>
  );
}
