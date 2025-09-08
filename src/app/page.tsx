
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import { getCourses, getBannerSettings, type BannerSettings } from "@/lib/data";
import { ArrowRight, BookOpen, Loader2, LayoutGrid, FileText, MessageCircleQuestion, Store, Radio, BrainCircuit } from "lucide-react";
import type { Course } from "@/lib/courses";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getAcademicData, AcademicClass } from "@/lib/academics";
import { useEffect, useState, useRef } from "react";
import { getGoogleDriveImageUrl } from "@/lib/utils";
import { UserTour } from "@/components/user-tour";
import { useAuth } from "@/hooks/use-auth";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";


export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [academicClasses, setAcademicClasses] = useState<AcademicClass[]>([]);
  const [banner, setBanner] = useState<BannerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const { user } = useAuth();
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));
  
  // State for carousel indicators
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])


  useEffect(() => {
    async function loadData() {
        setLoading(true);
        const [courseData, academicsData, bannerData] = await Promise.all([
            getCourses(),
            getAcademicData(),
            getBannerSettings(),
        ]);
        setCourses(courseData);
        setAcademicClasses(academicsData);
        setBanner(bannerData);
        setLoading(false);
    }
    loadData();

    // Check for new user tour
    if (localStorage.getItem('isNewUser') === 'true') {
        setIsTourOpen(true);
    }
  }, []);
  
  const handleTourFinish = () => {
    localStorage.removeItem('isNewUser');
    setIsTourOpen(false);
  };


  const featureItems = [
    { icon: LayoutGrid, text: "My Courses", href: "/my-courses" },
    { icon: FileText, text: "Free Notes", href: "/free-notes" },
    { icon: MessageCircleQuestion, text: "Doubt", href: "/doubt-ai" },
    { icon: Store, text: "Bookstore", href: "/bookstore" },
    { icon: Radio, text: "Live Classes", href: "/live-classes" },
    { icon: BrainCircuit, text: "Quiz", href: "/quizzes" },
  ];
  
  const BannerContent = () => (
    <div className="aspect-[4/1] w-full relative overflow-hidden rounded-lg">
      <Image
        src={getGoogleDriveImageUrl(banner!.imageUrl)}
        alt="Promotional Banner"
        fill
        className="object-cover"
        data-ai-hint="advertisement banner"
      />
    </div>
  );


  return (
    <div className="container mx-auto px-4">
      {user && <UserTour open={isTourOpen} onOpenChange={setIsTourOpen} onFinish={handleTourFinish} />}
      {loading ? (
        <div className="flex justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {banner?.isActive && banner.imageUrl && (
            <section className="mb-4">
               {banner.linkUrl ? (
                 <Link href={banner.linkUrl} target="_blank" rel="noopener noreferrer">
                   <BannerContent />
                 </Link>
               ) : (
                 <BannerContent />
               )}
            </section>
          )}

          <section id="academics" className="pt-4 pb-8">
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
                  <h3 className="font-headline text-sm sm:text-lg font-semibold">{item.text}</h3>
                </Link>
              ))}
            </div>
          </section>

          <section id="courses" className="pt-8 pb-16">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
              Courses
            </h2>
             <Carousel
              setApi={setApi}
              plugins={[plugin.current]}
              className="w-full"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent>
                {courses.map((course) => (
                  <CarouselItem key={course.docId} className="sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <div className="p-1">
                      <CourseCard course={course} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
             {courses.length > 0 && (
              <div className="py-4 text-center text-sm text-muted-foreground flex justify-center gap-2">
                {Array.from({ length: count }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => api?.scrollTo(i)}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all",
                      i === current - 1 ? "w-4 bg-primary" : "bg-primary/50"
                    )}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
            {courses.length === 0 && <p className="text-center text-muted-foreground mt-8">No professional courses found.</p>}
          </section>
        </>
      )}
    </div>
  );
}
