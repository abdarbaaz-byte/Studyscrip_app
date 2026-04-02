"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Loader2, ArrowRight, Star, Users } from "lucide-react";
import { listenToBatches, type Batch } from "@/lib/data";
import { getGoogleDriveImageUrl } from "@/lib/utils";
import { ScrollAnimation } from "@/components/scroll-animation";

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToBatches((data) => {
      setBatches(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <ScrollAnimation as="h1" className="font-headline text-4xl md:text-5xl font-bold">
          Available <span className="text-primary">Batches</span>
        </ScrollAnimation>
        <ScrollAnimation as="p" delay={100} className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Enroll in our specialized learning groups designed for focused growth.
        </ScrollAnimation>
      </div>

      {batches.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg bg-secondary/20">
          <Layers className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No active batches right now</h2>
          <p className="text-muted-foreground">Check back later for upcoming reasoning and specialized sessions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {batches.map((batch, index) => (
            <ScrollAnimation key={batch.id} delay={index * 100}>
              <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
                <Link href={`/batches/${batch.id}`} className="aspect-[16/9] overflow-hidden block">
                  <Image
                    src={getGoogleDriveImageUrl(batch.thumbnail)}
                    alt={batch.title}
                    width={600}
                    height={400}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint="learning batch"
                  />
                </Link>
                <CardHeader className="flex-grow p-6">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">Active Batch</Badge>
                    <p className="text-xl font-bold text-primary">Rs. {batch.price}</p>
                  </div>
                  <CardTitle className="font-headline text-2xl leading-tight mb-2">
                    {batch.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {batch.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="p-6 pt-0 flex flex-col gap-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1"><FileText className="h-4 w-4" /> {batch.notes.length} Topics</div>
                    <div className="flex items-center gap-1"><BrainCircuit className="h-4 w-4" /> {batch.quizIds.length} Quizzes</div>
                  </div>
                  <Button asChild className="w-full h-11">
                    <Link href={`/batches/${batch.id}`}>
                      View Details & Enroll <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </ScrollAnimation>
          ))}
        </div>
      )}
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { FileText, BrainCircuit } from "lucide-react";
