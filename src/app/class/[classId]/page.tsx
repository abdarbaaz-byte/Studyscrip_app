
import { getAcademicData } from "@/lib/academics";
import SubjectPageClient from "./subject-page-client";

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
