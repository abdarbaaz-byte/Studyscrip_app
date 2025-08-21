
import { getAcademicData } from "@/lib/academics";
import SubjectDetailClientPage from "./subject-detail-client-page";

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

// We keep this page as a Server Component and delegate all client logic
// to the SubjectDetailClientPage component. This page itself doesn't
// need to do much, as the client page will handle fetching its own data
// based on the URL params.

export default function ChapterListPage() {
  return <SubjectDetailClientPage />;
}
