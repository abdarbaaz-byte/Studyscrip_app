
import { getAcademicData } from "@/lib/academics";
import ChapterDetailClientPage from "./chapter-detail-client-page";

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

// We keep this page as a Server Component and delegate all client logic
// to the ChapterDetailClientPage component. This page itself doesn't
// need to do much, as the client page will handle fetching its own data
// based on the URL params.

export default function ChapterDetailPage() {
  return <ChapterDetailClientPage />;
}
