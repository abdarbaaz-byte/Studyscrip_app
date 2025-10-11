"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getSchool, type School } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, School as SchoolIcon, FileText, BrainCircuit } from "lucide-react";
import { useRouter } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Placeholder types for school content
type SchoolNote = { id: string, title: string };
type SchoolTest = { id: string, title: string };

export default function MySchoolPage() {
  const { user, userSchoolId, loading: authLoading } = useAuth();
  const router = useRouter();
  const [school, setSchool] = useState<School | null>(null);
  const [notes, setNotes] = useState<SchoolNote[]>([]);
  const [tests, setTests] = useState<SchoolTest[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!userSchoolId) {
      setLoadingData(false);
      return;
    }

    async function loadSchoolData() {
      try {
        const schoolData = await getSchool(userSchoolId!);
        setSchool(schoolData);
        // Placeholder calls - will return empty arrays for now
        // const schoolNotes = await getSchoolNotes(userSchoolId!);
        // const schoolTests = await getSchoolTests(userSchoolId!);
        // setNotes(schoolNotes);
        // setTests(schoolTests);
      } catch (error) {
        console.error("Failed to load school data:", error);
      } finally {
        setLoadingData(false);
      }
    }

    loadSchoolData();
  }, [user, userSchoolId, authLoading, router]);

  if (authLoading || loadingData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!userSchoolId || !school) {
    return (
      <div className="container mx-auto py-10 text-center">
        <Card className="max-w-md mx-auto p-8">
            <CardHeader>
                <CardTitle>Not Enrolled in a School</CardTitle>
                <CardDescription>
                    You are not currently enrolled in any school or institute on this platform.
                    Please contact your teacher to get access.
                </CardDescription>
            </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="text-center">
        <SchoolIcon className="h-16 w-16 mx-auto text-primary mb-4" />
        <h1 className="font-headline text-4xl font-bold">{school.name}</h1>
        <p className="text-xl text-muted-foreground">Your School Portal</p>
      </div>

      <Accordion type="multiple" defaultValue={["notes", "tests"]} className="w-full max-w-4xl mx-auto space-y-4">
        <AccordionItem value="notes" className="border rounded-lg bg-card">
          <AccordionTrigger className="p-6 text-xl font-headline hover:no-underline">
            <div className="flex items-center gap-4">
                <FileText />
                Notes
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
             {notes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                    Your teacher has not added any notes yet.
                </p>
             ) : (
                <div className="space-y-2">
                    {/* Map through notes here */}
                </div>
             )}
          </AccordionContent>
        </AccordionItem>

         <AccordionItem value="tests" className="border rounded-lg bg-card">
          <AccordionTrigger className="p-6 text-xl font-headline hover:no-underline">
             <div className="flex items-center gap-4">
                <BrainCircuit />
                Tests
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 pt-0">
             {tests.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                    No tests have been assigned yet.
                </p>
             ) : (
                <div className="space-y-2">
                    {/* Map through tests here */}
                </div>
             )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

    </div>
  );
}
