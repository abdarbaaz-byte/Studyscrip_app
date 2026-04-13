
import { Metadata } from "next";
import FreeNotesClient from "./free-notes-client";

export const revalidate = false; // Manual revalidation only

export const metadata: Metadata = {
  title: "Free Notes | StudyScript",
  description: "Access high-quality free PDF notes, video lectures, and images for various academic and professional topics on StudyScript.",
};

export default function FreeNotesPage() {
  return <FreeNotesClient />;
}
