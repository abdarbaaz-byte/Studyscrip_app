
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import { getCourses, getBannerSettings, type BannerSettings, getReviews, type Review, submitReview } from "@/lib/data";
import { ArrowRight, BookOpen, Loader2, LayoutGrid, FileText, MessageCircleQuestion, Store, Radio, BrainCircuit, Star, Send } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";


export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [academicClasses, setAcademicClasses] = useState<AcademicClass[]>([]);
  const [bannerSettings, setBannerSettings] = useState<BannerSettings | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const coursesAutoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));
  const reviewsAutoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));
  const bannerAutoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));


  // State for review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewClass, setReviewClass] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  // State for courses carousel indicators
  const [coursesApi, setCoursesApi] = useState<CarouselApi>()
  const [coursesCurrent, setCoursesCurrent] = useState(0)
  const [coursesCount, setCoursesCount] = useState(0)

   // State for reviews carousel indicators
  const [reviewsApi, setReviewsApi] = useState<CarouselApi>()
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
    if (!reviewsApi) return
    setReviewsCount(reviewsApi.scrollSnapList().length)
    setReviewsCurrent(reviewsApi.selectedScrollSnap() + 1)
    reviewsApi.on("select", () => {
      setReviewsCurrent(reviewsApi.selectedScrollSnap() + 1)
    })
  }, [reviewsApi])


  useEffect(() => {
    async function loadData() {
        setLoading(true);
        const [courseData, academicsData, bannerData, reviewsData] = await Promise.all([
            getCourses(),
            getAcademicData(),
            getBannerSettings(),
            getReviews('approved'),
        ]);
        setCourses(courseData);
        setAcademicClasses(academicsData);
        setBannerSettings(bannerData);
        setReviews(reviewsData);
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
    { icon: MessageCircleQuestion, text: "Doubt", href: "/doubt-ai" },
    { icon: Store, text: "Bookstore", href: "/bookstore" },
    { icon: Radio, text: "Live Classes", href: "/live-classes" },
    { icon: BrainCircuit, text: "Quiz", href: "/quizzes" },
  ];
  
  const activeBanners = bannerSettings?.banners.filter(b => b.isActive) || [];

  return (
    <>
      {user && <UserTour open={isTourOpen} onOpenChange={setIsTourOpen} onFinish={handleTourFinish} />}
      {loading ? (
        <div className="flex justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {activeBanners.length > 0 && (
            <section className="mb-4">
              <Carousel
                plugins={[bannerAutoplay.current]}
                className="w-full"
                onMouseEnter={bannerAutoplay.current.stop}
                onMouseLeave={bannerAutoplay.current.reset}
                opts={{
                  align: "start",
                  loop: true,
                }}
              >
                <CarouselContent>
                  {activeBanners.map((banner) => (
                    <CarouselItem key={banner.id}>
                      <div className="aspect-[3/1] w-full relative overflow-hidden">
                        {banner.linkUrl ? (
                          <Link href={banner.linkUrl} target="_blank" rel="noopener noreferrer">
                             <Image
                              src={getGoogleDriveImageUrl(banner.imageUrl)}
                              alt="Promotional Banner"
                              fill
                              className="object-cover"
                              data-ai-hint="advertisement banner"
                            />
                          </Link>
                        ) : (
                           <Image
                              src={getGoogleDriveImageUrl(banner.imageUrl)}
                              alt="Promotional Banner"
                              fill
                              className="object-cover"
                              data-ai-hint="advertisement banner"
                            />
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </section>
          )}

          <div className="container mx-auto px-4">
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
                setApi={setCoursesApi}
                plugins={[coursesAutoplay.current]}
                className="w-full"
                onMouseEnter={coursesAutoplay.current.stop}
                onMouseLeave={coursesAutoplay.current.reset}
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
              {courses.length === 0 && <p className="text-center text-muted-foreground mt-8">No professional courses found.</p>}
            </section>

            <section id="reviews" className="pt-8 pb-16">
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
                What Our Students Say
              </h2>
              
              {reviews.length > 0 ? (
                <Carousel
                  setApi={setReviewsApi}
                  plugins={[reviewsAutoplay.current]}
                  className="w-full max-w-4xl mx-auto"
                  onMouseEnter={reviewsAutoplay.current.stop}
                  onMouseLeave={reviewsAutoplay.current.reset}
                  opts={{ align: "start", loop: true, }}
                >
                  <CarouselContent className="-ml-4">
                    {reviews.map((review) => (
                      <CarouselItem key={review.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                        <div className="p-1 h-full">
                          <Card className="flex flex-col justify-between h-full bg-gradient-to-br from-primary/10 to-secondary/10">
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
          </div>
        </>
      )}
    </>
  );
}
