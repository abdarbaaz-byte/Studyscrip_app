
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, MailCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendEmailVerification, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [resendLoading, setResendLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // If the user is verified, redirect them to the homepage.
    if (user?.emailVerified) {
      router.push("/");
    }
  }, [user, router]);
  
  // Periodically check verification status
  useEffect(() => {
    if (authLoading || !user || user.emailVerified) return;

    const interval = setInterval(async () => {
      await user.reload();
      if (user.emailVerified) {
        toast({ title: "Email Verified!", description: "Redirecting you to the homepage..." });
        router.push("/");
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [user, authLoading, router, toast]);

  const handleResendEmail = async () => {
    if (!auth.currentUser) {
        toast({
            variant: "destructive",
            title: "Not Logged In",
            description: "Cannot resend email. Please log in again.",
        });
        router.push("/login");
        return;
    }
    setResendLoading(true);
    try {
        await sendEmailVerification(auth.currentUser);
        toast({
            title: "Verification Email Sent",
            description: "A new verification link has been sent to your email address.",
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to resend verification email. Please try again later.",
        });
    }
    setResendLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="h-8 w-8" />
          </div>
          <CardTitle className="font-headline text-2xl mt-4">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to your email address. Please check your inbox (and spam folder) to continue.
             <br /> This page will automatically redirect after you verify.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Didn't receive an email?
            </p>
            <Button onClick={handleResendEmail} className="w-full" disabled={resendLoading}>
              {resendLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resend Verification Email
            </Button>
           <div className="mt-4 text-center">
             <Link href="/login" passHref>
               <Button variant="link">Back to Login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
