
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LinkPasswordModal } from "@/components/link-password-modal";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, logIn, signInWithGoogle, linkPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [showLinkPasswordModal, setShowLinkPasswordModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'google'>('email');

  useEffect(() => {
    if (!authLoading && user && !loading && !showConflictModal && !showLinkPasswordModal) {
      router.replace("/");
    }
  }, [user, authLoading, router, loading, showConflictModal, showLinkPasswordModal]);

  const handleLogin = async (e?: React.FormEvent, force: boolean = false) => {
    if (e) e.preventDefault();
    if (!acceptedTerms) return;

    setLoading(true);
    setAuthMethod('email');
    
    const status = await logIn(email, password, force);
    
    if (status === 'conflict') {
      setShowConflictModal(true);
      setLoading(false);
    } else if (status === 'success') {
      // Redirect handled by useEffect
    } else {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (force: boolean = false) => {
    setLoading(true);
    setAuthMethod('google');
    const status = await signInWithGoogle(force);
    if (status === 'conflict') {
        setShowConflictModal(true);
        setLoading(false);
    } else if (status === 'success') {
        // Post-login check for password provider
        const currentUser = authMethod === 'google' ? authLoading === false && user : null; 
        // Note: useAuth state might not be updated yet, so we use a check in the effect or manual
        // But for better UX, we'll let the user land, then effect will handle it.
        // Actually, we'll manually check after a small delay or use the hook properly.
    } else {
        setLoading(false);
    }
  };

  // Effect to trigger Link Modal for Google users
  useEffect(() => {
    if (user && authMethod === 'google') {
        const hasPassword = user.providerData.some(p => p.providerId === 'password');
        if (!hasPassword) {
            setShowLinkPasswordModal(true);
        }
    }
  }, [user, authMethod]);

  const handleConfirmLink = async (pwd: string) => {
    const success = await linkPassword(pwd);
    if (success) {
        setShowLinkPasswordModal(false);
        router.push("/");
    }
  };

  if (authLoading || (user && !loading && !showConflictModal && !showLinkPasswordModal)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="your@gmail.com" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
               <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm font-medium text-primary hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                 <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox 
                id="terms" 
                checked={acceptedTerms} 
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                required
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-xs font-medium text-muted-foreground leading-normal cursor-pointer"
                >
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">Terms & Conditions</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading || !acceptedTerms}>
              {loading && authMethod === 'email' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log In
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-11 font-semibold rounded-xl" 
            onClick={() => handleGoogleLogin()}
            disabled={loading}
          >
            {loading && authMethod === 'google' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
            <span className="ml-2">Sign in with Google</span>
          </Button>

          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
               New Account
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Session Conflict Modal */}
      <Dialog open={showConflictModal} onOpenChange={setShowConflictModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="bg-orange-100 p-3 rounded-full mb-4 text-orange-600">
              <ShieldAlert className="h-10 w-10" />
            </div>
            <DialogTitle className="text-xl font-bold">Active Session Detected</DialogTitle>
            <DialogDescription className="text-base pt-2">
              आपका अकाउंट किसी अन्य डिवाइस पर एक्टिव है। क्या आप उस डिवाइस से लॉगआउट करके इस डिवाइस पर लॉगिन करना चाहते हैं?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button 
              variant="outline" 
              className="flex-1 rounded-xl"
              onClick={() => setShowConflictModal(false)}
            >
              Back
            </Button>
            <Button 
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl"
              onClick={() => authMethod === 'google' ? handleGoogleLogin(true) : handleLogin(undefined, true)}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Logout Other Device & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Password Modal */}
      <LinkPasswordModal
        open={showLinkPasswordModal}
        email={user?.email || ""}
        onClose={() => { setShowLinkPasswordModal(false); router.push("/"); }}
        onConfirm={handleConfirmLink}
      />
    </div>
  );
}
