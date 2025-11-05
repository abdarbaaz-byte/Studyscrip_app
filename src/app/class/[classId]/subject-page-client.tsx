
"use client";

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { listenToAcademics, type AcademicClass } from "@/lib/academics";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Book, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export default function SubjectPageClient() {
  const params = useParams();
  const classId = params.classId as string;
  const [academicClass, setAcademicClass] = useState<AcademicClass | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classId) return;

    setLoading(true);
    const unsubscribe = listenToAcademics((classes) => {
        const foundClass = classes.find(c => c.id === classId);
        setAcademicClass(foundClass);
        setLoading(false);
    });
    
    return () => unsubscribe();
  }, [classId]);

  if (loading) {
    return (
        <div className="container mx-auto px-4 py-8 flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  if (!academicClass) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center">
            <ChevronRight className="h-4 w-4 transform rotate-180 mr-1" />
            Back to Home
        </Link>
        <h1 className="font-headline text-4xl md:text-5xl font-bold mt-2">{academicClass.name}</h1>
        <p className="text-lg text-muted-foreground">{academicClass.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {academicClass.subjects.map(subject => (
            <Link href={`/class/${academicClass.id}/${subject.id}`} key={subject.id} className="group">
                 <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                    <CardHeader className="flex-grow p-6">
                        <div className="flex items-center justify-between">
                             <Book className="h-8 w-8 text-primary mb-4" />
                             <Badge variant="outline">{subject.chapters.length} Chapters</Badge>
                        </div>
                        <CardTitle className="font-headline text-xl mb-1">{subject.name}</CardTitle>
                        <CardDescription>Chapters and content for {subject.name}.</CardDescription>
                    </CardHeader>
                 </Card>
            </Link>
        ))}
      </div>
       {academicClass.subjects.length === 0 && (
          <div className="text-center col-span-full py-16">
            <p className="text-muted-foreground">No subjects found for this class yet.</p>
          </div>
        )}
    </div>
  );
}
