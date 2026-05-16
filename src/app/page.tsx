
import { Metadata } from "next";
import HomeClient from "./home-client";

export const revalidate = false; // Manual revalidation only

export const metadata: Metadata = {
  title: "StudyScript | Home - NCERT Notes for class 8-12",
  description: "Join StudyScript for live NCERT solutions for class 8 to 12, Free pdf notes, Professional Courses, Online test and Download pdf books.",
};

export default function Home() {
  return <HomeClient />;
}
