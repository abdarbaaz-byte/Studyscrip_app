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

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  // Use docId for navigation as it's the unique identifier in Firestore
  const courseId = course.docId || course.id;
  const thumbnailUrl = getGoogleDriveImageUrl(course.thumbnail);

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
        <Link href={`/courses/${courseId}`} className="aspect-[3/2] overflow-hidden block">
          <Image
            src={thumbnailUrl}
            alt={course.title}
            width={600}
            height={400}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="online course"
          />
        </Link>
      <div className="p-6 flex-grow flex flex-col">
        <CardTitle className="font-headline text-xl mb-2 leading-tight">
          <Link href={`/courses/${courseId}`} className="hover:text-primary transition-colors">
            {course.title}
          </Link>
        </CardTitle>
        <CardDescription className="flex-grow">{course.description}</CardDescription>
        <p className="text-2xl font-bold text-primary mt-4">
          ₹{course.price}
        </p>
      </div>
      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full">
          <Link href={`/courses/${courseId}`}>View Course</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

    