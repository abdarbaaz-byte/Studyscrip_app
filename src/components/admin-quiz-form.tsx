

"use client";

import { useState, useEffect } from "react";
import type { Quiz, Question, QuestionType, MatchOption } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, PlusCircle, Save, Loader2, Edit, Calendar as CalendarIcon, GripVertical } from "lucide-react";
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
import { Timestamp } from "firebase/firestore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface AdminQuizFormProps {
  initialQuizzes: Quiz[];
  onSave: (quiz: Quiz) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const CLASS_OPTIONS = ["all", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

const emptyQuiz: Omit<Quiz, 'id'> = {
  title: "",
  description: "",
  duration: 10,
  questions: [],
  startTime: undefined,
  endTime: undefined,
  targetClass: 'all',
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
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{quiz.questions.length} Questions</span>
                    <span>{quiz.duration ? `${quiz.duration} Minutes` : 'No time limit'}</span>
                    <span className="font-semibold">For: {quiz.targetClass === 'all' ? 'All Classes' : quiz.targetClass}</span>
                </div>
                 <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                        Starts: {quiz.startTime ? format((quiz.startTime as any).toDate(), "PPP p") : 'Always open'}
                    </span>
                     <span>
                        Ends: {quiz.endTime ? format((quiz.endTime as any).toDate(), "PPP p") : 'No expiry'}
                    </span>
                </div>
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


function QuizForm({ quiz, onSave, onCancel, isSaving }: { quiz: Quiz | null, onSave: (quiz: Quiz) => void, onCancel: () => void, isSaving: boolean }) {
  const [formData, setFormData] = useState<Omit<Quiz, 'id' | 'startTime' | 'endTime'>>({
      title: "",
      description: "",
      duration: 10,
      questions: [],
      targetClass: 'all'
  });
  const [startTime, setStartTime] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState<Date | undefined>();

  useEffect(() => {
    if (quiz) {
        const { id, startTime: st, endTime: et, ...rest } = quiz;
        const initialData = { ...rest };
        if (!initialData.targetClass) {
            initialData.targetClass = 'all';
        }
        setFormData(initialData);
        setStartTime(st ? (st as Timestamp).toDate() : undefined);
        setEndTime(et ? (et as Timestamp).toDate() : undefined);
    } else {
        setFormData(emptyQuiz);
        setStartTime(undefined);
        setEndTime(undefined);
    }
  }, [quiz]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'duration' ? parseInt(value) || 0 : value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (date: Date | undefined, timeString: string, setter: (d: Date | undefined) => void) => {
    if (!timeString) {
        setter(date);
        return;
    };
    const newDate = date ? new Date(date) : new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    newDate.setHours(hours, minutes, 0, 0);
    setter(newDate);
  };
  
  const addQuestion = () => {
    const newQuestion: Question = {
        id: generateId('q'),
        text: '',
        type: 'mcq',
        options: ['', '', '', ''],
        matchOptions: [{id: generateId('match'), question: '', answer: ''}],
        correctAnswer: 0,
        answerText: '',
        explanation: ''
    };
    setFormData(prev => ({...prev, questions: [...prev.questions, newQuestion]}));
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index)}));
  };
  
  const handleQuestionChange = (qIndex: number, field: keyof Question, value: string | number) => {
    const newQuestions = [...formData.questions];
    (newQuestions[qIndex] as any)[field] = value;
    setFormData(prev => ({...prev, questions: newQuestions}));
  };
  
  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options[optIndex] = text;
    setFormData(prev => ({...prev, questions: newQuestions}));
  };

  const addMatchOption = (qIndex: number) => {
    const newQuestions = [...formData.questions];
    if (!newQuestions[qIndex].matchOptions) {
        newQuestions[qIndex].matchOptions = [];
    }
    newQuestions[qIndex].matchOptions.push({id: generateId('match'), question: '', answer: ''});
    setFormData(prev => ({...prev, questions: newQuestions}));
  };

  const removeMatchOption = (qIndex: number, matchIndex: number) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].matchOptions.splice(matchIndex, 1);
    setFormData(prev => ({...prev, questions: newQuestions}));
  };
  
  const handleMatchOptionChange = (qIndex: number, matchIndex: number, field: 'question' | 'answer', value: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].matchOptions[matchIndex][field] = value;
    setFormData(prev => ({...prev, questions: newQuestions}));
  };
  
  const handleCorrectAnswerChange = (qIndex: number, correctIndex: number) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].correctAnswer = correctIndex;
    setFormData(prev => ({...prev, questions: newQuestions}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
        ...formData, 
        id: quiz?.id || '',
        startTime: startTime,
        endTime: endTime,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (in minutes)</Label>
            <Input id="duration" name="duration" type="number" value={formData.duration} onChange={handleChange} placeholder="e.g., 30" />
          </div>
           <div className="space-y-2">
                <Label htmlFor="startTime">Start Time (Optional)</Label>
                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="startTime"
                                variant={"outline"}
                                className={cn("flex-1 justify-start text-left font-normal", !startTime && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startTime ? format(startTime, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={startTime} onSelect={setStartTime} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <Input 
                        type="time" 
                        value={startTime ? format(startTime, "HH:mm") : ""}
                        onChange={(e) => handleTimeChange(startTime, e.target.value, setStartTime)}
                        className="w-[120px]"
                    />
                </div>
          </div>
           <div className="space-y-2">
                <Label htmlFor="endTime">End Time (Optional)</Label>
                <div className="flex gap-2">
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="endTime"
                                variant={"outline"}
                                className={cn("flex-1 justify-start text-left font-normal", !endTime && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endTime ? format(endTime, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={endTime} onSelect={setEndTime} initialFocus />
                        </PopoverContent>
                    </Popover>
                     <Input 
                        type="time" 
                        value={endTime ? format(endTime, "HH:mm") : ""}
                        onChange={(e) => handleTimeChange(endTime, e.target.value, setEndTime)}
                        className="w-[120px]"
                    />
                </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetClass">Target Class</Label>
             <Select value={formData.targetClass} onValueChange={(value) => handleSelectChange('targetClass', value)}>
                <SelectTrigger id="targetClass">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {CLASS_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt === 'all' ? 'For All Classes' : opt}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
          </div>
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
            <div key={q.id || qIndex} className="p-4 border rounded-md space-y-4 relative bg-secondary/50">
               <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => removeQuestion(qIndex)}>
                  <Trash2 className="h-4 w-4" />
               </Button>
               <div className="space-y-2">
                 <Label htmlFor={`q-text-${qIndex}`}>Question {qIndex + 1}</Label>
                 <Textarea id={`q-text-${qIndex}`} value={q.text} onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)} required />
               </div>

                <div className="space-y-2">
                    <Label>Question Type</Label>
                    <Select value={q.type} onValueChange={(value: QuestionType) => handleQuestionChange(qIndex, 'type', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="mcq">Multiple Choice</SelectItem>
                            <SelectItem value="true_false">True / False</SelectItem>
                            <SelectItem value="fill_in_blank">Fill in the Blank</SelectItem>
                            <SelectItem value="match">Match the Following</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
               
                {q.type === 'mcq' && (
                    <div className="space-y-3">
                        <Label>Options & Correct Answer</Label>
                        <RadioGroup value={q.correctAnswer?.toString()} onValueChange={value => handleCorrectAnswerChange(qIndex, parseInt(value))}>
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
                )}

                 {q.type === 'true_false' && (
                    <div className="space-y-3">
                        <Label>Correct Answer</Label>
                         <RadioGroup value={q.correctAnswer?.toString()} onValueChange={value => handleCorrectAnswerChange(qIndex, parseInt(value))}>
                             <div className="flex items-center gap-2">
                                <RadioGroupItem value="0" id={`q-${qIndex}-opt-true`} />
                                <Label htmlFor={`q-${qIndex}-opt-true`}>True</Label>
                            </div>
                             <div className="flex items-center gap-2">
                                <RadioGroupItem value="1" id={`q-${qIndex}-opt-false`} />
                                <Label htmlFor={`q-${qIndex}-opt-false`}>False</Label>
                            </div>
                        </RadioGroup>
                    </div>
                )}
                
                {q.type === 'fill_in_blank' && (
                    <div className="space-y-2">
                        <Label htmlFor={`q-answer-text-${qIndex}`}>Correct Answer Text</Label>
                        <Input 
                            id={`q-answer-text-${qIndex}`} 
                            value={q.answerText || ''} 
                            onChange={(e) => handleQuestionChange(qIndex, 'answerText', e.target.value)} 
                            placeholder="Enter the exact answer"
                            required
                        />
                         <p className="text-xs text-muted-foreground">Note: The answer check is case-insensitive. "Delhi" and "delhi" are treated as the same.</p>
                    </div>
                )}

                {q.type === 'match' && (
                    <div className="space-y-3">
                        <Label>Matching Pairs</Label>
                        <div className="space-y-2">
                            {(q.matchOptions || []).map((matchOpt, matchIndex) => (
                                <div key={matchOpt.id} className="flex items-center gap-2">
                                    <GripVertical className="h-5 w-5 text-muted-foreground"/>
                                    <Input 
                                        placeholder={`Question ${matchIndex + 1}`} 
                                        value={matchOpt.question}
                                        onChange={(e) => handleMatchOptionChange(qIndex, matchIndex, 'question', e.target.value)}
                                    />
                                    <Input 
                                        placeholder={`Answer ${matchIndex + 1}`} 
                                        value={matchOpt.answer}
                                        onChange={(e) => handleMatchOptionChange(qIndex, matchIndex, 'answer', e.target.value)}
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeMatchOption(qIndex, matchIndex)}>
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => addMatchOption(qIndex)}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Add Pair
                        </Button>
                    </div>
                )}


                <div className="space-y-2">
                 <Label htmlFor={`q-explanation-${qIndex}`}>Explanation (Optional)</Label>
                 <Textarea id={`q-explanation-${qIndex}`} value={q.explanation || ''} onChange={e => handleQuestionChange(qIndex, 'explanation', e.target.value)} placeholder="Explain why this is the correct answer."/>
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
