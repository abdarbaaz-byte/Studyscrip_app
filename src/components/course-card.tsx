import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Course } from "@/lib/courses";
import { getGoogleDriveImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  // Use docId for navigation as it's the unique identifier in Firestore
  const courseId = course.docId || course.id;
  const thumbnailUrl = getGoogleDriveImageUrl(course.thumbnail);

  const discountPercentage = (course.originalPrice && course.price < course.originalPrice) 
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100) 
    : null;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group border-2 border-transparent hover:border-primary/10">
        <Link href={`/courses/${courseId}`} className="aspect-[3/2] overflow-hidden block relative">
          <Image
            src={thumbnailUrl}
            alt={course.title}
            width={600}
            height={400}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105 prevent-long-press"
            data-ai-hint="online course"
            onContextMenu={(e) => e.preventDefault()}
          />
          {discountPercentage && (
             <div className="absolute top-3 right-3">
                <Badge className="bg-orange-600 border-none shadow-md font-bold px-2 py-0.5">{discountPercentage}% OFF</Badge>
             </div>
          )}
        </Link>
      <div className="p-6 flex-grow flex flex-col">
        <div className="mb-2">
            <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-wider mb-2">Exam Resource</Badge>
            <CardTitle className="font-headline text-xl leading-tight">
                <Link href={`/courses/${courseId}`} className="hover:text-primary transition-colors">
                    {course.title}
                </Link>
            </CardTitle>
        </div>
        <CardDescription className="flex-grow line-clamp-2">{course.description}</CardDescription>
        
        <div className="mt-4 flex items-end gap-2">
            <span className="text-2xl font-bold text-primary">Rs. {course.price}</span>
            {course.originalPrice && course.originalPrice > course.price && (
                <span className="text-sm text-muted-foreground line-through mb-1">Rs. {course.originalPrice}</span>
            )}
        </div>
      </div>
      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full">
          <Link href={`/courses/${courseId}`}>View Course</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
