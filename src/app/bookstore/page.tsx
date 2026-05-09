
import { Metadata } from "next";
import BookstoreClient from "./bookstore-client";

export const revalidate = false; // Manual revalidation only

export const metadata: Metadata = {
  title: "Download Free pdf Books | StudyScript",
  description: "Download academic and professional PDF books for free on StudyScript. Comprehensive collection of useful study material.",
};

export default function BookstorePage() {
  return <BookstoreClient />;
}
