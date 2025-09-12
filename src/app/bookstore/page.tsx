
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Download } from "lucide-react";
import { getBookstoreItems, type BookstoreItem } from "@/lib/data";
import { getGoogleDriveImageUrl } from "@/lib/utils";
import { ScrollAnimation } from "@/components/scroll-animation";

export default function BookstorePage() {
  const [items, setItems] = useState<BookstoreItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const bookstoreData = await getBookstoreItems();
      setItems(bookstoreData);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <ScrollAnimation as="h1" className="font-headline text-4xl md:text-5xl font-bold">
          Bookstore
        </ScrollAnimation>
        <ScrollAnimation as="p" delay={100} className="text-lg text-muted-foreground mt-2">
          Download useful PDFs and books.
        </ScrollAnimation>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {items.map((item, index) => (
            <ScrollAnimation key={item.id} delay={index * 50}>
              <Card className="flex flex-col overflow-hidden group h-full">
                <CardHeader className="p-0 relative flex-grow">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="block aspect-[3/4] h-full">
                    <Image
                      src={getGoogleDriveImageUrl(item.thumbnailUrl) || `https://placehold.co/600x800.png/E2E8F0/A0AEC0?text=${item.title.split(' ').join('+')}`}
                      alt={item.title}
                      width={600}
                      height={800}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                  </a>
                </CardHeader>
                <CardContent className="p-4 flex flex-col">
                  <CardTitle className="font-headline text-base h-10 flex items-center">{item.title}</CardTitle>
                  <Button asChild className="w-full mt-3">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" download>
                      <Download className="mr-2 h-4 w-4" /> Download
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </ScrollAnimation>
          ))}
          {items.length === 0 && (
            <div className="text-center col-span-full py-16">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">The bookstore is empty right now. Check back later!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
