
import { Metadata } from "next";
import { getAcademicData } from "@/lib/academics";
import SubjectPageClient from "./subject-page-client";

type Props = {
  params: { classId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const classes = await getAcademicData();
  const academicClass = classes.find(c => c.id === params.classId);
  const baseUrl = 'https://studyscript.netlify.app';

  if (!academicClass) return { title: 'Class Not Found' };

  return {
    title: `${academicClass.name} | NCERT & MP Board Solutions | StudyScript`,
    description: `Complete study material for ${academicClass.name}. Access notes, subjects, and chapter-wise resources for NCERT and MP Board syllabus on StudyScript.`,
    alternates: {
      canonical: `${baseUrl}/class/${params.classId}`,
    },
  };
}

export async function generateStaticParams() {
    const classes = await getAcademicData();
    const params = classes.map((ac) => ({
        classId: ac.id,
    }));
    return params;
}

export default function ClassDetailPage() {
  return <SubjectPageClient />;
}
