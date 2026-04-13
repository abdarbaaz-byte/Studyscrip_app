
import { Metadata } from "next";
import HomeClient from "./home-client";

export const revalidate = false; // Manual revalidation only

export const metadata: Metadata = {
  title: "StudyScript | Home - NCERT & MP Board Solutions",
  description: "Join StudyScript for live classes, quizzes, and free pdf notes. Your partner in digital learning for NCERT and MP Board.",
};

export default function Home() {
  return <HomeClient />;
}
