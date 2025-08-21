
import { notFound } from "next/navigation";
import { getCourse, getCourses } from "@/lib/data";
import CourseDetailClientPage from "./course-detail-client-page";


export async function generateStaticParams() {
  const courses = await getCourses();
  // The docId is what is used in the URL now
  return courses.map((course) => ({
    id: course.docId,
  }));
}

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  // The id from params is the Firestore document ID
  const course = await getCourse(params.id);

  if (!course) {
    notFound();
  }

  return <CourseDetailClientPage course={course} />;
}
