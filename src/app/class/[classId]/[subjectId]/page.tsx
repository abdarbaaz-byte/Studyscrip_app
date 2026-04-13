
import { Metadata } from "next";
import { getAcademicData } from "@/lib/academics";
import SubjectDetailClientPage from "./subject-detail-client-page";

export const revalidate = false; // Manual revalidation only

type Props = {
  params: { classId: string; subjectId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const classes = await getAcademicData();
  const academicClass = classes.find(c => c.id === params.classId);
  const subject = academicClass?.subjects.find(s => s.id === params.subjectId);
  const baseUrl = 'https://studyscript.netlify.app';

  if (!subject) return { title: 'Subject Not Found' };

  return {
    title: `${subject.name} - ${academicClass?.name} | Notes & Resources | StudyScript`,
    description: `Get chapter-wise notes and video lectures for ${subject.name} (${academicClass?.name}). High-quality study material for board exam preparation on StudyScript.`,
    alternates: {
      canonical: `${baseUrl}/class/${params.classId}/${params.subjectId}`,
    },
  };
}

export async function generateStaticParams() {
    const classes = await getAcademicData();
    const params = classes.flatMap((ac) => 
        ac.subjects.map((subject) => ({
            classId: ac.id,
            subjectId: subject.id,
        }))
    );
    return params;
}

export default function ChapterListPage() {
  return <SubjectDetailClientPage />;
}
