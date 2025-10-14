
"use client";

import { useEffect, useState, Suspense } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { checkUserPurchase, getLiveClass, type LiveClass } from "@/lib/data";
import { Loader2, Lock, ArrowLeft, Video } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

function LiveClassPageContent() {
  const params = useParams();
  const router = useRouter();
  const liveClassId = params.liveClassId as string;

  const { user, loading: authLoading } = useAuth();
  const [liveClass, setLiveClass] = useState<LiveClass | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      if (!liveClassId) {
        notFound();
        return;
      }
      if (authLoading) return;
      if (!user) {
        router.push(`/login?redirect=/live-class/${liveClassId}`);
        return;
      }

      setLoading(true);
      const lc = await getLiveClass(liveClassId);
      if (!lc) {
        notFound();
        return;
      }
      setLiveClass(lc);

      // Anyone can join a live class if it's active, no purchase check needed for now.
      // Or, we can keep the purchase check. Let's keep it.
      const hasPurchase = await checkUserPurchase(user.uid, lc.associatedItemId);
      setHasAccess(hasPurchase);
      
      const now = new Date();
      const startTime = lc.startTime.toDate();
      const endTime = lc.endTime.toDate();

      if (hasPurchase && now >= startTime && now <= endTime) {
        // If access is granted and class is active, redirect to meeting link
        if(lc.meetingLink) {
          window.location.href = lc.meetingLink;
        } else {
            // Handle case where link is missing
            setLoading(false); 
        }
      } else {
        setLoading(false);
      }
    }

    checkAccess();
  }, [liveClassId, user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-lg">Preparing your class...</p>
      </div>
    );
  }

  if (!liveClass) {
     notFound();
  }

  const now = new Date();
  const startTime = liveClass.startTime.toDate();
  const endTime = liveClass.endTime.toDate();
  
  if (now > endTime) {
     return (
        <div className="flex h-screen items-center justify-center bg-secondary">
             <Card className="max-w-md text-center">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Class Has Ended</CardTitle>
                    <CardDescription>This live class is already over.</CardDescription>
                </CardHeader>
                 <CardFooter>
                    <Button variant="ghost" asChild className="w-full">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Home
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
     )
  }
  
   if (now < startTime) {
     return (
        <div className="flex h-screen items-center justify-center bg-secondary">
             <Card className="max-w-md text-center">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Class Has Not Started</CardTitle>
                    <CardDescription>This class is scheduled to start on:</CardDescription>
                     <p className="font-bold text-lg pt-2">{format(startTime, 'PPP p')}</p>
                </CardHeader>
                <CardFooter>
                    <Button variant="ghost" asChild className="w-full">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Home
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
     )
  }

  if (!hasAccess) {
    return (
      <div className="flex h-screen items-center justify-center bg-secondary">
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
                <Lock className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="font-headline text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You must purchase the associated course or subject to join this live class.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
                This class is for the item: <span className="font-bold">{liveClass?.associatedItemName}</span>
            </p>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button asChild>
                <Link href={liveClass?.itemType === 'course' ? `/courses/${liveClass.associatedItemId}` : `/class/${liveClass.classId}/${liveClass.associatedItemId}`}>
                    View Purchase Options
                </Link>
            </Button>
             <Button variant="ghost" asChild>
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4"/> Back to Home
                </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!liveClass.meetingLink) {
     return (
        <div className="flex h-screen items-center justify-center bg-secondary">
             <Card className="max-w-md text-center">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-destructive">Meeting Link Missing</CardTitle>
                    <CardDescription>The link for this live class has not been provided by the instructor.</CardDescription>
                </CardHeader>
                 <CardFooter>
                    <Button variant="ghost" asChild className="w-full">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Home
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
     )
  }
  
  // This part should not be reached if the redirect works, but serves as a fallback.
  return (
    <div className="flex h-screen items-center justify-center bg-secondary">
        <Card className="max-w-md text-center">
            <CardHeader>
                 <div className="flex justify-center mb-4">
                    <Video className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl">Redirecting to Live Class...</CardTitle>
                <CardDescription>If you are not redirected automatically, please click the button below.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild size="lg">
                    <a href={liveClass.meetingLink} target="_blank" rel="noopener noreferrer">Join Now</a>
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}

export default function LiveClassPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <LiveClassPageContent />
        </Suspense>
    )
}
