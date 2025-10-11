
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
import { Loader2, PlusCircle, Trash2, UserPlus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getSchool,
  getStudentsForSchool,
  addStudentToSchool,
  removeStudentFromSchool,
  type School,
  type SchoolStudent,
} from "@/lib/data";

export default function TeacherDashboardPage() {
  const { user, userRole, userSchoolId, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [school, setSchool] = useState<School | null>(null);
  const [students, setStudents] = useState<SchoolStudent[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<SchoolStudent | null>(
    null
  );

  const loadTeacherData = useCallback(async () => {
    if (!userSchoolId) return;
    setLoadingData(true);
    try {
      const [schoolData, studentsData] = await Promise.all([
        getSchool(userSchoolId),
        getStudentsForSchool(userSchoolId),
      ]);
      setSchool(schoolData);
      setStudents(studentsData);
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
    if (!userSchoolId || !newStudentEmail.trim()) return;

    setIsAddingStudent(true);
    try {
      await addStudentToSchool(userSchoolId, newStudentEmail);
      toast({
        title: "Student Added",
        description: `${newStudentEmail} has been added to your school.`,
      });
      setNewStudentEmail("");
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
        description: `${studentToRemove.email} has been removed.`,
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

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold">
          Teacher Dashboard
        </h1>
        <p className="text-xl text-muted-foreground">{school.name}</p>
      </div>

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
            className="mb-6 flex items-center gap-4 rounded-lg border bg-secondary/50 p-4"
          >
            <div className="flex-grow space-y-1">
              <Label htmlFor="student-email" className="sr-only">
                Student Email
              </Label>
              <Input
                id="student-email"
                type="email"
                placeholder="student@example.com"
                value={newStudentEmail}
                onChange={(e) => setNewStudentEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isAddingStudent}>
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
                <TableHead>Student Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No students added yet.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.uid}>
                    <TableCell className="font-medium">
                      {student.email}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveStudentClick(student)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Remove {studentToRemove?.email}?
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

      {/* Placeholder for future sections */}
      <Card>
        <CardHeader>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>Coming soon: Add notes and tests for your students here.</CardDescription>
        </CardHeader>
         <CardContent>
            <div className="text-center text-muted-foreground py-8">
                Feature under construction.
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
