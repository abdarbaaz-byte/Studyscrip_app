
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import { getCourses } from "@/lib/data";
import { ArrowRight, BookOpen, Loader2, LayoutGrid, FileText, MessageCircleQuestion, Store, Radio, BrainCircuit } from "lucide-react";
import type { Course } from "@/lib/courses";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getAcademicData, AcademicClass } from "@/lib/academics";
import { useEffect, useState } from "react";

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [academicClasses, setAcademicClasses] = useState<AcademicClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
        setLoading(true);
        const [courseData, academicsData] = await Promise.all([
            getCourses(),
            getAcademicData(),
        ]);
        setCourses(courseData);
        setAcademicClasses(academicsData);
        setLoading(false);
    }
    loadData();
  }, []);

  const featureItems = [
    { icon: LayoutGrid, text: "My Courses", href: "/my-courses" },
    { icon: FileText, text: "Free Notes", href: "/free-notes" },
    { icon: MessageCircleQuestion, text: "Doubt", href: "/doubt-ai" },
    { icon: Store, text: "Bookstore", href: "/bookstore" },
    { icon: Radio, text: "Live Classes", href: "/live-classes" },
    { icon: BrainCircuit, text: "Quiz", href: "/quizzes" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="flex justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <section id="academics" className="pb-16">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
              Choose Your Class
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {academicClasses.map((ac) => (
                <Link href={`/class/${ac.id}`} key={ac.id}>
                  <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full">
                    <CardHeader className="flex-grow flex flex-col justify-center items-center text-center p-6">
                      <BookOpen className="h-12 w-12 text-primary mb-4" />
                      <CardTitle className="font-headline text-2xl mb-2">{ac.name}</CardTitle>
                      <CardDescription>{ac.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
             {academicClasses.length === 0 && <p className="text-center text-muted-foreground">No academic classes found.</p>}
          </section>

          <section id="features" className="py-16">
             <div className="grid grid-cols-3 sm:grid-cols-6 gap-y-8 gap-x-4 text-center">
              {featureItems.map((item, index) => (
                <Link href={item.href} key={index} className="group flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                    <item.icon className="w-10 h-10" />
                  </div>
                  <h3 className="font-headline text-lg font-semibold">{item.text}</h3>
                </Link>
              ))}
            </div>
          </section>

          <section id="courses" className="pt-8 pb-16">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
              Courses
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {courses.map((course) => (
                <CourseCard key={course.docId} course={course} />
              ))}
            </div>
            {courses.length === 0 && <p className="text-center text-muted-foreground">No professional courses found.</p>}
          </section>
        </>
      )}
    </div>
  );
}
