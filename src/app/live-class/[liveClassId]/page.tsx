
"use client";

import { useEffect, useState, Suspense } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { checkUserPurchase, getLiveClass, type LiveClass } from "@/lib/data";
import { Loader2, Lock, ArrowLeft } from "lucide-react";
import LiveClassClient from "./live-class-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

      const hasPurchase = await checkUserPurchase(user.uid, lc.associatedItemId);
      setHasAccess(hasPurchase);
      setLoading(false);
    }

    checkAccess();
  }, [liveClassId, user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
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

  if (!liveClass) {
     notFound();
  }
  
  const now = new Date();
  const startTime = liveClass.startTime.toDate();
  const endTime = liveClass.endTime.toDate();

  if (now < startTime) {
    return <div className="text-center py-16">This class has not started yet.</div>;
  }
  if (now > endTime) {
    return <div className="text-center py-16">This class has ended.</div>;
  }

  return (
    <div className="h-screen w-screen">
      <LiveClassClient liveClassId={liveClassId} className={liveClass.title} />
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
