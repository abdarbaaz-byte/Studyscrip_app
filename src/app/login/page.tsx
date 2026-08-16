"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Eye, EyeOff, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function LoginPage() {
  const router = useRouter();
  const { logIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);

  const handleLogin = async (e?: React.FormEvent, force: boolean = false) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    const status = await logIn(email, password, force);
    
    if (status === 'conflict') {
      setShowConflictModal(true);
      setLoading(false);
    } else if (status === 'success') {
      // Redirect handled by useAuth
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
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
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log In
            </Button>
          </form>
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
              onClick={() => handleLogin(undefined, true)}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Logout Other Device & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
