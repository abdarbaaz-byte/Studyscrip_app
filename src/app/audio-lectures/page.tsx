
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Headphones, PlayCircle } from "lucide-react";
import { getAudioLectures, type AudioLecture } from "@/lib/data";
import Link from "next/link";
import { ScrollAnimation } from "@/components/scroll-animation";

export default function AudioLecturesPage() {
  const [lectures, setLectures] = useState<AudioLecture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const audioData = await getAudioLectures();
      setLectures(audioData);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <ScrollAnimation as="h1" className="font-headline text-4xl md:text-5xl font-bold">
          Audio Lectures
        </ScrollAnimation>
        <ScrollAnimation as="p" delay={100} className="text-lg text-muted-foreground mt-2">
          Listen and learn on the go.
        </ScrollAnimation>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {lectures.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lectures.map((lecture, index) => (
                <ScrollAnimation key={lecture.id} delay={index * 100}>
                  <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                           <Headphones className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="font-headline text-xl">{lecture.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <CardDescription>{lecture.description}</CardDescription>
                       <div className="text-sm text-muted-foreground mt-4">{lecture.audios.length} tracks</div>
                    </CardContent>
                    <CardContent>
                       <Link href={`#`} className="w-full inline-flex items-center justify-center h-10 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
                            <PlayCircle className="mr-2 h-5 w-5"/>
                            Start Listening
                       </Link>
                    </CardContent>
                  </Card>
                </ScrollAnimation>
              ))}
            </div>
          ) : (
             <div className="text-center col-span-full py-16">
              <Headphones className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold">No Audio Lectures Found</h3>
              <p className="text-muted-foreground">
                Check back later for new audio content!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
