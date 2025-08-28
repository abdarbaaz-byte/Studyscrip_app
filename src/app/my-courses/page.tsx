
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { getUserPurchases, EnrichedPurchase } from "@/lib/data";
import { CourseCard } from "@/components/course-card";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Book, User, ShoppingCart, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MyCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [purchases, setPurchases] = useState<EnrichedPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      router.push("/login");
      return;
    }

    async function loadPurchases() {
      setLoading(true);
      if (user) {
        const userPurchases = await getUserPurchases(user.uid);
        setPurchases(userPurchases);
      }
      setLoading(false);
    }

    loadPurchases();
  }, [user, authLoading, router]);

  const purchasedCourses = purchases.filter(p => p.itemType === 'course');
  const purchasedSubjects = purchases.filter(p => p.itemType === 'subject');

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold">My Learning</h1>
            <p className="text-lg text-muted-foreground mt-2">All your purchased courses and subjects in one place.</p>
        </div>
        {user && (
            <div className="flex items-center gap-2 mt-4 sm:mt-0 p-3 rounded-lg bg-secondary">
                <User className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">{user.email}</span>
            </div>
        )}
      </div>

      {purchases.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your learning space is empty</h2>
          <p className="text-muted-foreground mb-6">You haven't purchased any courses or subjects yet.</p>
          <Button asChild size="lg">
            <Link href="/">Explore Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-12">
            {purchasedCourses.length > 0 && (
                <section>
                    <h2 className="font-headline text-3xl font-bold mb-6">Courses</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                       {purchasedCourses.map((purchase) => (
                         <CourseCard key={purchase.id} course={{
                            docId: purchase.item.id,
                            title: purchase.item.title,
                            description: purchase.item.description,
                            price: purchase.item.price,
                            thumbnail: purchase.item.thumbnail,
                         } as any} />
                       ))}
                    </div>
                </section>
            )}

            {purchasedSubjects.length > 0 && (
                 <section>
                    <h2 className="font-headline text-3xl font-bold mb-6">Subjects</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {purchasedSubjects.map((purchase) => (
                             <Card key={purchase.id} className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
                                <CardHeader className="flex-grow">
                                    <Book className="h-8 w-8 text-primary mb-4" />
                                    <CardTitle className="font-headline text-xl">{purchase.item.name}</CardTitle>
                                    <CardDescription>{purchase.item.className}</CardDescription>
                                </CardHeader>
                                <CardFooter>
                                    <Button asChild className="w-full">
                                        <Link href={`/class/${purchase.item.classId}/${purchase.itemId}`}>
                                            View Subject <ArrowRight className="ml-2 h-4 w-4"/>
                                        </Link>
                                    </Button>
                                </CardFooter>
                             </Card>
                        ))}
                    </div>
                </section>
            )}
        </div>
      )}
    </div>
  );
}
