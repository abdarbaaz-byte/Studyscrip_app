

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Loader2, UserPlus, Users, FileText, BrainCircuit, BarChart3, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getSchool,
  getStudentsForSchool,
  addStudentToSchool,
  removeStudentFromSchool,
  type School,
  type SchoolStudent,
  type SchoolNote,
  saveSchoolNote,
  deleteSchoolNote,
  getSchoolNotes,
  getSchoolTests,
  saveSchoolTest,
  deleteSchoolTest,
  type Quiz,
  getTestAttemptsForSchool,
  type QuizAttempt,
  deleteQuizAttempt,
  updateStudentDetails,
} from "@/lib/data";
import { TeacherNotesForm } from "@/components/teacher-notes-form";
import { AdminQuizForm } from "@/components/admin-quiz-form";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function TeacherDashboardPage() {
  const { user, userRole, userSchoolId, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('students');
  const [school, setSchool] = useState<School | null>(null);
  const [students, setStudents] = useState<SchoolStudent[]>([]);
  const [notes, setNotes] = useState<SchoolNote[]>([]);
  const [tests, setTests] = useState<Quiz[]>([]);
  const [testAttempts, setTestAttempts] = useState<QuizAttempt[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Student form state
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentClass, setNewStudentClass] = useState("");
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  
  const [studentToRemove, setStudentToRemove] = useState<SchoolStudent | null>(null);
  const [attemptToDelete, setAttemptToDelete] = useState<QuizAttempt | null>(null);

  const loadTeacherData = useCallback(async () => {
    if (!userSchoolId) return;
    setLoadingData(true);
    try {
      const [schoolData, studentsData, notesData, testsData, attemptsData] = await Promise.all([
        getSchool(userSchoolId),
        getStudentsForSchool(userSchoolId),
        getSchoolNotes(userSchoolId),
        getSchoolTests(userSchoolId),
        getTestAttemptsForSchool(userSchoolId),
      ]);
      setSchool(schoolData);
      setStudents(studentsData);
      setNotes(notesData);
      setTests(testsData);
      setTestAttempts(attemptsData);
    } catch (error) {
      console.error("Failed to load teacher data:", error);
      toast({ variant: "destructive", title: "Failed to load data" });
    }
    setLoadingData(false);
  }, [userSchoolId, toast]);

  useEffect(() => {
    if (authLoading) return;
    if (userRole !== "teacher") {
      router.push("/");
      return;
    }
    if (userSchoolId) {
      loadTeacherData();
    } else {
      setLoadingData(false);
    }
  }, [userRole, authLoading, router, userSchoolId, loadTeacherData]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSchoolId || !newStudentEmail.trim() || !newStudentName.trim() || !newStudentClass.trim()) {
        toast({variant: "destructive", title: "Please fill all student details."})
        return;
    };

    setIsAddingStudent(true);
    try {
      await addStudentToSchool(userSchoolId, newStudentEmail, newStudentName, newStudentClass);
      toast({
        title: "Student Added",
        description: `${newStudentName} has been added to your school.`,
      });
      setNewStudentEmail("");
      setNewStudentName("");
      setNewStudentClass("");
      loadTeacherData(); // Refresh student list
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Adding Student",
        description: error.message,
      });
    }
    setIsAddingStudent(false);
  };

  const handleRemoveStudentClick = (student: SchoolStudent) => {
    setStudentToRemove(student);
  };

  const confirmRemoveStudent = async () => {
    if (!studentToRemove || !userSchoolId) return;
    try {
      await removeStudentFromSchool(userSchoolId, studentToRemove.uid);
      toast({
        title: "Student Removed",
        description: `${studentToRemove.name} has been removed.`,
      });
      setStudentToRemove(null);
      loadTeacherData(); // Refresh student list
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Removing Student",
        description: error.message,
      });
    }
  };

  const handleSaveNote = async (note: SchoolNote) => {
    if (!userSchoolId) return;
    await saveSchoolNote(userSchoolId, note);
    toast({ title: "Note Saved!" });
    loadTeacherData();
  };
  
  const handleDeleteNote = async (noteId: string) => {
    if (!userSchoolId) return;
    await deleteSchoolNote(userSchoolId, noteId);
    toast({ title: "Note Deleted!" });
    loadTeacherData();
  };

  const handleSaveTest = async (test: Quiz) => {
    if (!userSchoolId) return;
    await saveSchoolTest(userSchoolId, test);
    toast({ title: "Test Saved!" });
    loadTeacherData();
  };

  const handleDeleteTest = async (testId: string) => {
    if (!userSchoolId) return;
    await deleteSchoolTest(userSchoolId, testId);
    toast({ title: "Test Deleted!" });
    loadTeacherData();
  };

  const handleDeleteAttemptClick = (attempt: QuizAttempt) => {
    setAttemptToDelete(attempt);
  };

  const confirmDeleteAttempt = async () => {
    if (attemptToDelete && attemptToDelete.id) {
        try {
            await deleteQuizAttempt(attemptToDelete.id);
            setTestAttempts(prev => prev.filter((a) => a.id !== attemptToDelete!.id));
            toast({ title: "Test attempt deleted successfully." });
        } catch (error) {
            console.error("Failed to delete quiz attempt:", error);
            toast({ variant: "destructive", title: "Failed to delete test attempt." });
        }
      setAttemptToDelete(null);
    }
  };


  if (authLoading || loadingData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (userRole !== "teacher") {
    return null; // Redirect is handled in useEffect
  }

  if (!userSchoolId || !school) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="p-8 text-center">
          <CardTitle className="text-2xl font-bold text-destructive">
            Not Assigned to a School
          </CardTitle>
          <CardDescription className="mt-2">
            Please contact the administrator to be assigned to a school.
          </CardDescription>
        </Card>
      </div>
    );
  }

  const renderStudentManagement = () => (
    <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users /> Student Management
          </CardTitle>
          <CardDescription>
            Add and remove students for your school.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleAddStudent}
            className="mb-6 grid grid-cols-1 md:grid-cols-4 items-end gap-4 rounded-lg border bg-secondary/50 p-4"
          >
            <div className="space-y-1">
              <Label htmlFor="student-email">Student Email</Label>
              <Input
                id="student-email"
                type="email"
                placeholder="student@example.com"
                value={newStudentEmail}
                onChange={(e) => setNewStudentEmail(e.target.value)}
                required
              />
            </div>
             <div className="space-y-1">
              <Label htmlFor="student-name">Student Name</Label>
              <Input
                id="student-name"
                type="text"
                placeholder="Full Name"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                required
              />
            </div>
             <div className="space-y-1">
              <Label htmlFor="student-class">Class</Label>
              <Input
                id="student-class"
                type="text"
                placeholder="e.g., 10th"
                value={newStudentClass}
                onChange={(e) => setNewStudentClass(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isAddingStudent} className="w-full md:w-auto">
              {isAddingStudent ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Add Student
            </Button>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No students added yet.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.uid}>
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                     <TableCell>
                      {student.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.userClass}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveStudentClick(student)}
                          >
                            Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Remove {studentToRemove?.name}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the student's access to your
                              school's content. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setStudentToRemove(null)}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={confirmRemoveStudent}>
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
  );

  const renderNotesManagement = () => (
     <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText /> Notes Management
          </CardTitle>
          <CardDescription>
            Add and manage notes topics for your students.
          </CardDescription>
        </CardHeader>
         <CardContent>
            <TeacherNotesForm
              initialNotes={notes}
              onSave={handleSaveNote}
              onDelete={handleDeleteNote}
            />
        </CardContent>
      </Card>
  );
  
  const renderTestManagement = () => (
     <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit /> Test Management
          </CardTitle>
          <CardDescription>
            Create and manage tests for your students.
          </CardDescription>
        </CardHeader>
         <CardContent>
            <AdminQuizForm
              initialQuizzes={tests}
              onSave={handleSaveTest}
              onDelete={handleDeleteTest}
            />
        </CardContent>
      </Card>
  );

  const renderTestAttempts = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BarChart3 /> Test Attempts
        </CardTitle>
        <CardDescription>View all submitted test results from your students.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Test</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testAttempts.map((attempt) => (
              <TableRow key={attempt.id}>
                <TableCell>
                    <div className="font-medium">{attempt.userName}</div>
                    <div className="text-sm text-muted-foreground">{attempt.userEmail}</div>
                </TableCell>
                <TableCell>{attempt.quizTitle}</TableCell>
                <TableCell>
                    <Badge variant={attempt.percentage >= 50 ? 'default' : 'destructive'} className={cn(attempt.percentage >= 50 && "bg-green-600")}>
                        {attempt.score} / {attempt.totalQuestions} ({attempt.percentage.toFixed(0)}%)
                    </Badge>
                </TableCell>
                <TableCell>{format(attempt.submittedAt.toDate(), "PPP p")}</TableCell>
                <TableCell className="text-right">
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteAttemptClick(attempt)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete Attempt</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Test Attempt?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently delete the attempt by "{attemptToDelete?.userName}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setAttemptToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteAttempt}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
            {testAttempts.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No test attempts have been submitted yet.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );


  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold">
          Teacher Dashboard
        </h1>
        <p className="text-xl text-muted-foreground">{school.name}</p>
      </div>

       <div className="flex items-center gap-2 flex-wrap">
          <Button variant={activeTab === 'students' ? 'default' : 'outline'} onClick={() => setActiveTab('students')}>
              <Users className="mr-2 h-4 w-4" /> Students
          </Button>
          <Button variant={activeTab === 'notes' ? 'default' : 'outline'} onClick={() => setActiveTab('notes')}>
              <FileText className="mr-2 h-4 w-4" /> Notes
          </Button>
          <Button variant={activeTab === 'tests' ? 'default' : 'outline'} onClick={() => setActiveTab('tests')}>
              <BrainCircuit className="mr-2 h-4 w-4" /> Tests
          </Button>
          <Button variant={activeTab === 'attempts' ? 'default' : 'outline'} onClick={() => setActiveTab('attempts')}>
              <BarChart3 className="mr-2 h-4 w-4" /> Test Attempts
          </Button>
      </div>
      
      {activeTab === 'students' && renderStudentManagement()}
      {activeTab === 'notes' && renderNotesManagement()}
      {activeTab === 'tests' && renderTestManagement()}
      {activeTab === 'attempts' && renderTestAttempts()}

    </div>
  );
}
