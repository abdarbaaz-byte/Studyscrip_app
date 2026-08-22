
"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Download, Search, PlusCircle, Send } from "lucide-react";
import { useData } from "@/hooks/use-data";
import { getGoogleDriveImageUrl } from "@/lib/utils";
import { ScrollAnimation } from "@/components/scroll-animation";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { saveBookRequest } from "@/lib/data";

export default function BookstoreClient() {
  const { bookstoreItems: items, loading } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [requestedBookName, setRequestedBookName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleDownload = (url: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please login to download books from the bookstore.",
      });
      router.push(`/login?redirect=/bookstore`);
      return;
    }
    // Open the URL in a new tab for download
    window.open(url, "_blank");
  };

  const handleRequestClick = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please login to request a book.",
      });
      router.push(`/login?redirect=/bookstore`);
      return;
    }
    setIsRequestDialogOpen(true);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedBookName.trim() || !user) return;

    setIsSubmitting(true);
    try {
        await saveBookRequest(user.uid, user.displayName || user.email || 'Anonymous', requestedBookName);
        toast({ title: "Request Submitted!", description: "We will try to add your requested book soon." });
        setRequestedBookName("");
        setIsRequestDialogOpen(false);
    } catch (error) {
        console.error("Failed to submit request:", error);
        toast({ variant: "destructive", title: "Submission Failed", description: "Could not save your request. Please try again." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <ScrollAnimation as="h1" className="font-headline text-4xl md:text-5xl font-bold">
          Bookstore
        </ScrollAnimation>
        <ScrollAnimation as="p" delay={100} className="text-lg text-muted-foreground mt-2">
          Download useful PDFs and books.
        </ScrollAnimation>
      </div>

      <div className="max-w-md mx-auto mb-12 flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for a book..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={handleRequestClick}>
           Request Book
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredItems.map((item, index) => (
                <ScrollAnimation key={item.id} delay={index * 50}>
                  <Card className="flex flex-col overflow-hidden group h-full">
                    <CardHeader className="p-0 relative flex-grow">
                      <div 
                        onClick={() => handleDownload(item.url)} 
                        className="block aspect-[3/4] h-full cursor-pointer"
                      >
                        <Image
                          src={getGoogleDriveImageUrl(item.thumbnailUrl) || `https://placehold.co/600x800.png/E2E8F0/A0AEC0?text=${item.title.split(' ').join('+')}`}
                          alt={item.title}
                          width={600}
                          height={800}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105 prevent-long-press"
                          onContextMenu={(e) => e.preventDefault()}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col">
                      <CardTitle className="font-headline text-base h-10 flex items-center">{item.title}</CardTitle>
                      <Button 
                        onClick={() => handleDownload(item.url)} 
                        className="w-full mt-3"
                      >
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    </CardContent>
                  </Card>
                </ScrollAnimation>
              ))}
            </div>
          ) : (
             <div className="text-center col-span-full py-16 flex flex-col items-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-xl font-semibold">No Books Found</h3>
              <p className="text-muted-foreground mb-6">
                Your search for "{searchTerm}" did not match any books.
              </p>
              <Button onClick={handleRequestClick}>
                 <PlusCircle className="mr-2 h-4 w-4" /> Request this Book
              </Button>
            </div>
          )}
        </>
      )}

      {/* Request Book Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Request a Book</DialogTitle>
                <DialogDescription>
                    Can't find what you're looking for? Let us know and we'll try to add it.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRequestSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                    <Label htmlFor="book-name">Book Name / Topic</Label>
                    <Input 
                        id="book-name" 
                        value={requestedBookName} 
                        onChange={(e) => setRequestedBookName(e.target.value)} 
                        placeholder="e.g., 10th Class Physics NCERT"
                        required
                    />
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsRequestDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                        Submit Request
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
