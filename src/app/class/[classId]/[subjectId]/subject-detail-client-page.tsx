

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { type AcademicClass, type Subject, getAcademicData } from "@/lib/academics";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { FileText, ChevronRight, Lock, Unlock, Loader2, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useParams, notFound, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { checkUserPurchase, createPurchase, getScheduledLiveClassesForItem, type LiveClass } from "@/lib/data";
import { PaymentDialog } from "@/components/payment-dialog";
import { format } from "date-fns";

export default function SubjectDetailClientPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const subjectId = params.subjectId as string;

  const [academicClass, setAcademicClass] = useState<AcademicClass | undefined>();
  const [subject, setSubject] = useState<Subject | undefined>();
  const [liveClass, setLiveClass] = useState<LiveClass | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();


  useEffect(() => {
    async function loadSubjectData() {
        if (classId && subjectId) {
            setLoading(true);
            const classes = await getAcademicData();
            const foundClass = classes.find(c => c.id === classId);
            const foundSubject = foundClass?.subjects.find(s => s.id === subjectId);
            setAcademicClass(foundClass);
            setSubject(foundSubject);

            const scheduledClass = await getScheduledLiveClassesForItem(subjectId);
            if (scheduledClass) {
              setLiveClass(scheduledClass);
            }

            if (user) {
              const hasAccess = await checkUserPurchase(user.uid, subjectId);
              setIsPurchased(hasAccess);
            }
        }
        setLoading(false);
    }
    loadSubjectData();
  }, [classId, subjectId, user]);

  const handleBuyClick = () => {
     if (!user) {
        toast({
            variant: "destructive",
            title: "Not Logged In",
            description: "You must be logged in to make a purchase.",
        });
        router.push("/login");
        return;
    }
    setIsPaymentDialogOpen(true);
  };

  const handlePurchaseConfirm = async (razorpayPaymentId: string) => {
    if (!subject || !user) return;
    
    setIsBuying(true);
    try {
        await createPurchase(
          user.uid,
          user.email || 'Anonymous',
          subject.id,
          subject.name,
          'subject',
          subject.price,
          razorpayPaymentId
        );
        setIsPurchased(true);
        toast({
          title: "Purchase Successful!",
          description: `You have unlocked all chapters for ${subject.name}.`
        });
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Purchase Failed",
            description: "Something went wrong. Please try again.",
        });
        console.error("Purchase failed:", error);
    }
    setIsBuying(false);
    setIsPaymentDialogOpen(false);
  };

  if (loading) {
    return (
        <div className="container mx-auto px-4 py-8 flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  if (!academicClass || !subject) {
    notFound();
  }

  const isLiveClassActive = liveClass && new Date() >= liveClass.startTime.toDate() && new Date() <= liveClass.endTime.toDate();

  return (
    <>
      <div className="container mx-auto px-4 py-8">
       <div className="mb-8">
         <Link href={`/class/${academicClass.id}`} className="text-sm text-muted-foreground hover:text-primary flex items-center">
            <ChevronRight className="h-4 w-4 transform rotate-180 mr-1" />
            Back to {academicClass.name} Subjects
        </Link>
        <h1 className="font-headline text-4xl md:text-5xl font-bold mt-2">{subject.name}</h1>
        <p className="text-lg text-muted-foreground">Browse chapters for {subject.name}.</p>
      </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {subject.chapters.map((chapter, index) => {
          const isLocked = index > 0 && !isPurchased;
          return (
            <Link 
              href={`/class/${academicClass.id}/${subject.id}/${chapter.id}`} 
              key={chapter.id} 
              className={`group ${isLocked ? 'pointer-events-none' : ''}`}
              aria-disabled={isLocked}
              tabIndex={isLocked ? -1 : undefined}
            >
              <Card className={`flex flex-col h-full overflow-hidden transition-all duration-300 ${isLocked ? 'bg-secondary/50 cursor-not-allowed' : 'group-hover:shadow-lg group-hover:-translate-y-1'}`}>
                  <CardHeader>
                       <div className="flex justify-between items-center">
                          <FileText className="h-8 w-8 text-primary mb-4" />
                          {isLocked ? <Lock className="h-5 w-5 text-muted-foreground" /> : <Unlock className="h-5 w-5 text-green-500" />}
                       </div>
                       <CardTitle className="font-headline text-xl leading-tight">{chapter.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                       {index === 0 && <p className="text-sm font-semibold text-green-600">Free Preview</p>}
                  </CardContent>
                  <CardFooter>
                      <Button className="w-full" disabled={isLocked}>
                          {isLocked ? 'Locked' : 'View Chapter'}
                      </Button>
                  </CardFooter>
              </Card>
            </Link>
          )
        })}
         {subject.chapters.length === 0 && (
          <div className="text-center col-span-full py-16">
            <p className="text-muted-foreground">No chapters found for this subject yet.</p>
          </div>
        )}
      </div>

      {!isPurchased && subject.chapters.length > 0 && (
         <Card className="mt-12 max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-2xl">Unlock All Chapters</CardTitle>
              <CardDescription>Get access to all {subject.chapters.length} chapters of {subject.name} with a single purchase.</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary mb-4">Rs. {subject.price}</div>
                {isLiveClassActive && (
                    <div className="p-4 bg-red-100 rounded-lg">
                        <p className="font-semibold text-red-700">A live class is currently active for this subject!</p>
                        <p className="text-sm text-red-600">Purchase now to join immediately.</p>
                    </div>
                )}
                <Button size="lg" onClick={handleBuyClick} disabled={isBuying}>
                   {isBuying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlock className="mr-2 h-4 w-4" />}
                   {isBuying ? "Processing..." : "Buy Subject Now"}
                </Button>
            </CardContent>
         </Card>
      )}
       {isPurchased && subject.chapters.length > 0 && (
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="text-center font-semibold text-green-600 p-4 rounded-md bg-green-100">
              You have access to all chapters in this subject!
          </div>

          {liveClass && (
             <Card className="mt-6 text-center">
                <CardHeader>
                  <CardTitle className="font-headline text-xl">Upcoming Live Class</CardTitle>
                  <CardDescription>{liveClass.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Starts on: <span className="font-semibold">{format(liveClass.startTime.toDate(), "PPP p")}</span></p>
                  {isLiveClassActive && (
                    <Button asChild size="lg" className="mt-4 bg-red-600 hover:bg-red-700 animate-pulse">
                      <Link href={`/live-class/${liveClass.id}`}>
                        <Radio className="mr-2 h-4 w-4"/> Join Live Now
                      </Link>
                    </Button>
                  )}
                </CardContent>
             </Card>
          )}

        </div>
      )}
    </div>
     {subject && (
        <PaymentDialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          itemName={subject.name}
          itemPrice={subject.price}
          isProcessing={isBuying}
          onConfirm={handlePurchaseConfirm}
          itemId={subject.id}
          itemType="subject"
        />
      )}
    </>
  );
}
