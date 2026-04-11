
import { Metadata } from "next";
import { getAcademicData } from "@/lib/academics";
import ChapterDetailClientPage from "./chapter-detail-client-page";

type Props = {
  params: { classId: string; subjectId: string; chapterId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const classes = await getAcademicData();
  const academicClass = classes.find(c => c.id === params.classId);
  const subject = academicClass?.subjects.find(s => s.id === params.subjectId);
  const chapter = subject?.chapters.find(ch => ch.id === params.chapterId);
  const baseUrl = 'https://studyscript.netlify.app';

  if (!chapter) return { title: 'Chapter Not Found' };

  return {
    title: `${chapter.name} (${subject?.name}) - ${academicClass?.name} | StudyScript`,
    description: `Detailed notes, PDF, and video lectures for ${chapter.name} from ${subject?.name} (${academicClass?.name}). Best resources for self-study and exam success.`,
    alternates: {
      canonical: `${baseUrl}/class/${params.classId}/${params.subjectId}/${params.chapterId}`,
    },
  };
}

export async function generateStaticParams() {
    const classes = await getAcademicData();
    const params = classes.flatMap((ac) => 
        ac.subjects.flatMap((subject) => 
            subject.chapters.map((chapter) => ({
                classId: ac.id,
                subjectId: subject.id,
                chapterId: chapter.id,
            }))
        )
    );
    return params;
}

export default function ChapterDetailPage() {
  return <ChapterDetailClientPage />;
}
