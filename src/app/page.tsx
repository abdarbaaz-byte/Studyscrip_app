"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import { listenToCourses, getBannerSettings, type BannerSettings, getReviews, type Review, submitReview, listenToAcademics, listenToBatches, type Batch } from "@/lib/data";
import { ArrowRight, BookOpen, Loader2, LayoutGrid, FileText, Store, Radio, BrainCircuit, Star, Send, Users, Headphones, Layers, Circle } from "lucide-react";
import type { Course } from "@/lib/courses";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AcademicClass } from "@/lib/academics";
import { useEffect, useState, useRef } from "react";
import { getGoogleDriveImageUrl } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const coursesAutoplay = Autoplay({ delay: 5000, stopOnInteraction: true });
const batchesAutoplay = Autoplay({ delay: 6000, stopOnInteraction: true });
const reviewsAutoplay = Autoplay({ delay: 5000, stopOnInteraction: true });
const bannerAutoplay = Autoplay({ delay: 5000, stopOnInteraction: true });

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [academicClasses, setAcademicClasses] = useState<AcademicClass[]>([]);
  const [bannerSettings, setBannerSettings] = useState<BannerSettings | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // State for review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewClass, setReviewClass] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  // Carousel APIs
  const [coursesApi, setCoursesApi] = useState<CarouselApi>()
  const [batchesApi, setBatchesApi] = useState<CarouselApi>()
  const [reviewsApi, setReviewsApi] = useState<CarouselApi>()

  // Indicators state
  const [coursesCurrent, setCoursesCurrent] = useState(0)
  const [coursesCount, setCoursesCount] = useState(0)
  const [batchesCurrent, setBatchesCurrent] = useState(0)
  const [batchesCount, setBatchesCount] = useState(0)
  const [reviewsCurrent, setReviewsCurrent] = useState(0)
  const [reviewsCount, setReviewsCount] = useState(0)

  useEffect(() => {
    if (!coursesApi) return
    setCoursesCount(coursesApi.scrollSnapList().length)
    setCoursesCurrent(coursesApi.selectedScrollSnap() + 1)
    coursesApi.on("select", () => {
      setCoursesCurrent(coursesApi.selectedScrollSnap() + 1)
    })
  }, [coursesApi])

  useEffect(() => {
    if (!batchesApi) return
    setBatchesCount(batchesApi.scrollSnapList().length)
    setBatchesCurrent(batchesApi.selectedScrollSnap() + 1)
    batchesApi.on("select", () => {
      setBatchesCurrent(batchesApi.selectedScrollSnap() + 1)
    })
  }, [batchesApi])

  useEffect(() => {
    if (!reviewsApi) return
    setReviewsCount(reviewsApi.scrollSnapList().length)
    setReviewsCurrent(reviewsApi.selectedScrollSnap() + 1)
    reviewsApi.on("select", () => {
      setReviewsCurrent(reviewsApi.selectedScrollSnap() + 1)
    })
  }, [reviewsApi])


  useEffect(() => {
    setLoading(true);
    const unsubCourses = listenToCourses(setCourses);
    const unsubAcademics = listenToAcademics(setAcademicClasses);
    const unsubBatches = listenToBatches(setBatches);
    
    Promise.all([
      getBannerSettings(),
      getReviews('approved'),
    ]).then(([bannerData, reviewsData]) => {
      setBannerSettings(bannerData);
      setReviews(reviewsData);
      setLoading(false);
    });

    return () => {
      unsubCourses();
      unsubAcademics();
      unsubBatches();
    };
  }, []);
  
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewClass || !reviewComment) {
      toast({ variant: 'destructive', title: 'Please fill out all fields.' });
      return;
    }
    setIsSubmittingReview(true);
    try {
      await submitReview({ name: reviewName, className: reviewClass, comment: reviewComment });
      toast({ title: 'Review Submitted!', description: 'Thank you! Your review will appear after approval.' });
      setReviewName('');
      setReviewClass('');
      setReviewComment('');
      setShowReviewForm(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Submission Failed', description: 'Could not submit your review. Please try again.' });
    } finally {
      setIsSubmittingReview(false);
    }
  };


  const featureItems = [
    { icon: LayoutGrid, text: "My Courses", href: "/my-courses" },
    { icon: FileText, text: "Free Notes", href: "/free-notes" },
    { icon: Headphones, text: "Audio", href: "/audio-lectures" },
    { icon: Store, text: "Bookstore", href: "/bookstore" },
    { icon: Radio, text: "Live Classes", href: "/live-classes" },
    { icon: Users, text: "Batches", href: "/batches" },
  ];
  
  const activeBanners = bannerSettings?.banners.filter(b => b.isActive) || [];

  return (
    <>
       <section className="mb-4">
        {loading ? (
             <div className="aspect-[4/1] w-full relative overflow-hidden bg-secondary animate-pulse"></div>
        ) : activeBanners.length > 0 && (
            <Carousel
              plugins={[bannerAutoplay]}
              className="w-full"
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent>
                {activeBanners.map((banner) => (
                  <CarouselItem key={banner.id}>
                    {banner.linkUrl ? (
                      <Link href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="block aspect-[4/1] w-full relative overflow-hidden">
                          <Image
                          src={getGoogleDriveImageUrl(banner.imageUrl)}
                          alt="Promotional Banner"
                          fill
                          className="object-cover"
                          data-ai-hint="advertisement banner"
                          onContextMenu={(e) => e.preventDefault()}
                        />
                      </Link>
                    ) : (
                      <div className="aspect-[4/1] w-full relative overflow-hidden">
                        <Image
                          src={getGoogleDriveImageUrl(banner.imageUrl)}
                          alt="Promotional Banner"
                          fill
                          className="object-cover prevent-long-press"
                          data-ai-hint="advertisement banner"
                          onContextMenu={(e) => e.preventDefault()}
                        />
                      </div>
                    )}
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
        )}
      </section>
      
      <div className="container mx-auto px-4">
        {loading ? (
           <div className="flex justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        ) : (
        <>
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

            <section id="courses" className="pt-8 pb-12">
              <div className="flex justify-between items-center mb-12 px-2">
                <h2 className="font-headline text-3xl md:text-4xl font-bold">
                  Professional <span className="text-primary">Courses</span>
                </h2>
              </div>
              <Carousel
                setApi={setCoursesApi}
                plugins={[coursesAutoplay]}
                className="w-full"
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
              </Carousel>
              {courses.length > 0 && (
                <div className="py-4 text-center text-sm text-muted-foreground flex justify-center gap-2">
                  {Array.from({ length: coursesCount }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => coursesApi?.scrollTo(i)}
                      className={cn(
                        "h-2 w-2 rounded-full transition-all",
                        i === coursesCurrent - 1 ? "w-4 bg-primary" : "bg-primary/50"
                      )}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
              {courses.length === 0 && <p className="text-center text-muted-foreground">No professional courses found.</p>}
            </section>

            <section id="batches" className="pt-8 pb-16">
              <div className="flex justify-between items-center mb-12 px-2">
                <h2 className="font-headline text-3xl md:text-4xl font-bold">
                  Popular <span className="text-primary">Batches</span>
                </h2>
              </div>
              <Carousel
                setApi={setBatchesApi}
                plugins={[batchesAutoplay]}
                className="w-full"
                opts={{
                  align: "start",
                  loop: true,
                }}
              >
                <CarouselContent>
                  {batches.map((batch) => (
                    <CarouselItem key={batch.id} className="sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <div className="p-1 h-full">
                        <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group border-2 border-transparent hover:border-primary/10">
                          <Link href={`/batches/${batch.id}`} className="aspect-[16/9] overflow-hidden block">
                            <Image
                              src={getGoogleDriveImageUrl(batch.thumbnail)}
                              alt={batch.title}
                              width={600}
                              height={400}
                              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            />
                          </Link>
                          <CardHeader className="flex-grow p-5">
                            <div className="flex justify-between items-start mb-2">
                              <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider">Active Batch</Badge>
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">
                                    {batch.price === 0 ? <span className="text-green-600">Free</span> : `Rs. ${batch.price}`}
                                </p>
                              </div>
                            </div>
                            <CardTitle className="font-headline text-xl leading-tight mb-2 line-clamp-1">
                              {batch.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2 text-sm">
                              {batch.description}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter className="p-5 pt-0">
                            <Button asChild className="w-full h-10 text-sm">
                              <Link href={`/batches/${batch.id}`}>
                                View Details & Enroll
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
              {batches.length > 0 && (
                <div className="py-4 text-center text-sm text-muted-foreground flex justify-center gap-2">
                  {Array.from({ length: batchesCount }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => batchesApi?.scrollTo(i)}
                      className={cn(
                        "h-2 w-2 rounded-full transition-all",
                        i === batchesCurrent - 1 ? "w-4 bg-primary" : "bg-primary/50"
                      )}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
              {batches.length === 0 && <p className="text-center text-muted-foreground">No active batches found.</p>}
            </section>

            <section id="reviews" className="pt-8 pb-16">
               <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
                What Our <span className="text-primary">Students</span> Say
              </h2>
              
              {reviews.length > 0 ? (
                <Carousel
                  setApi={setReviewsApi}
                  plugins={[reviewsAutoplay]}
                  className="w-full max-w-4xl mx-auto"
                  opts={{ align: "start", loop: true, }}
                >
                  <CarouselContent className="-ml-4">
                    {reviews.map((review) => (
                      <CarouselItem key={review.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                        <div className="p-1 h-full">
                          <Card className="flex flex-col justify-between h-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30">
                            <CardHeader className="text-center">
                              <p className="font-bold">{review.name}</p>
                              <p className="text-sm text-muted-foreground">({review.className})</p>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center gap-1 justify-center mb-4">
                                {Array(5).fill(0).map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
                              </div>
                              <p className="text-muted-foreground italic text-center">"{review.comment}"</p>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden sm:flex" />
                  <CarouselNext className="hidden sm:flex" />
                </Carousel>
              ) : (
                <p className="text-center text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
              )}

              <div className="text-center mt-12">
                {!showReviewForm ? (
                  <Button onClick={() => setShowReviewForm(true)}>Add Your Review</Button>
                ) : (
                  <Card className="max-w-2xl mx-auto text-left">
                    <CardHeader>
                      <CardTitle className="font-headline text-2xl">Share Your Experience</CardTitle>
                      <CardDescription>We'd love to hear your feedback!</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="review-name">Your Name</Label>
                            <Input 
                              id="review-name" 
                              placeholder="Enter your name" 
                              value={reviewName}
                              onChange={(e) => setReviewName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="review-class">Your Class</Label>
                            <Input 
                              id="review-class" 
                              placeholder="e.g., 10th" 
                              value={reviewClass}
                              onChange={(e) => setReviewClass(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="review-comment">Your Comment</Label>
                          <Textarea 
                            id="review-comment" 
                            placeholder="Tell us what you think..." 
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            maxLength={200}
                            required
                            rows={4}
                          />
                          <p className="text-xs text-muted-foreground text-right">{reviewComment.length}/200</p>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={isSubmittingReview}>
                              {isSubmittingReview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                              Submit Review
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
