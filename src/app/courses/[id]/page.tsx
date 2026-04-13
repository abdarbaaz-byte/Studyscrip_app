
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourse, getCourses } from "@/lib/data";
import CourseDetailClientPage from "./course-detail-client-page";

export const revalidate = false; // Never automatically revalidate, wait for manual trigger

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourse(params.id);
  const baseUrl = 'https://studyscript.netlify.app';

  if (!course) return { title: 'Course Not Found' };

  return {
    title: `${course.title} | Exam Resources | StudyScript`,
    description: course.description || `Enroll in ${course.title} on StudyScript. Comprehensive learning resources, notes, and expert guidance for exam preparation.`,
    alternates: {
      canonical: `${baseUrl}/courses/${params.id}`,
    },
    openGraph: {
      title: course.title,
      description: course.description,
      url: `${baseUrl}/courses/${params.id}`,
      images: [course.thumbnail],
    },
  };
}

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((course) => ({
    id: course.docId,
  }));
}

export default async function CourseDetailPage({ params }: Props) {
  const course = await getCourse(params.id);

  if (!course) {
    notFound();
  }

  return <CourseDetailClientPage course={course} />;
}
