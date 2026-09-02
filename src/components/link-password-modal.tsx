
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, ShieldCheck, Mail } from "lucide-react";

interface LinkPasswordModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
  onConfirm: (password: string) => Promise<void>;
}

export function LinkPasswordModal({ open, onClose, email, onConfirm }: LinkPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleConfirm = async () => {
    if (password.length < 6) return;
    setIsSaving(true);
    await onConfirm(password);
    setIsSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isSaving && !val && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="bg-primary/10 p-3 rounded-full mb-4 text-primary">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <DialogTitle className="text-xl font-bold font-headline">Secure Your Account</DialogTitle>
          <DialogDescription className="text-base pt-2">
            Create a password to enable traditional email login alongside Google.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
              <Mail className="h-3 w-3" /> Account Email
            </Label>
            <div className="p-3 rounded-xl bg-secondary/50 border font-medium text-sm">
              {email}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-password">Choose Password</Label>
            <div className="relative">
              <Input
                id="link-password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="rounded-xl pr-10"
                disabled={isSaving}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="ghost" 
            className="flex-1 rounded-xl text-muted-foreground"
            onClick={onClose}
            disabled={isSaving}
          >
            Skip for now
          </Button>
          <Button 
            className="flex-1 rounded-xl shadow-lg font-bold"
            onClick={handleConfirm}
            disabled={isSaving || password.length < 6}
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? "Saving..." : "Set Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
