
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBatch, getBatches } from "@/lib/data";
import BatchDetailClient from "./batch-detail-client";

export const revalidate = 0;

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const batch = await getBatch(params.id);
  const baseUrl = 'https://studyscript.netlify.app';

  if (!batch) return { title: 'Batch Not Found' };

  return {
    title: `${batch.title} | Popular Batches | StudyScript`,
    description: batch.description || `Join the ${batch.title} batch on StudyScript. Focused learning group with notes, quizzes, and live discussion support.`,
    alternates: {
      canonical: `${baseUrl}/batches/${params.id}`,
    },
    openGraph: {
      title: batch.title,
      description: batch.description,
      url: `${baseUrl}/batches/${params.id}`,
      images: [batch.thumbnail],
    },
  };
}

export async function generateStaticParams() {
  const batches = await getBatches();
  return batches.map((batch) => ({
    id: batch.id,
  }));
}

export default async function BatchDetailPage({ params }: Props) {
  const batch = await getBatch(params.id);

  if (!batch) {
    notFound();
  }

  return <BatchDetailClient batch={batch} />;
}
