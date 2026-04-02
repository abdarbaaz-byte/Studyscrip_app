import { notFound } from "next/navigation";
import { getBatch, getBatches } from "@/lib/data";
import BatchDetailClient from "./batch-detail-client";

export const revalidate = 0;

export async function generateStaticParams() {
  const batches = await getBatches();
  return batches.map((batch) => ({
    id: batch.id,
  }));
}

export default async function BatchDetailPage({ params }: { params: { id: string } }) {
  const batch = await getBatch(params.id);

  if (!batch) {
    notFound();
  }

  return <BatchDetailClient batch={batch} />;
}
