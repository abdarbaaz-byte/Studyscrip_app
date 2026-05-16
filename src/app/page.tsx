
import { Metadata } from "next";
import HomeClient from "./home-client";

export const revalidate = false; // Manual revalidation only

export const metadata: Metadata = {
  title: "StudyScript | NCERT Notes for class 8-12 All Subjects",
  description: "Join StudyScript for NCERT solutions for class 8-12, quizzes, professional Courses and free pdf notes for board exams.",
};

export default function Home() {
  return <HomeClient />;
}
