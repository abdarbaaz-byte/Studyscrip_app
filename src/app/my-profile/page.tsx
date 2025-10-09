
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { getUserProfile, updateUserProfile } from "@/lib/data";
import { Loader2, User, Save, Edit, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function MyProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [userClass, setUserClass] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    setLoadingProfile(true);
    const profile = await getUserProfile(user.uid);
    if (profile) {
      setName(profile.displayName || user.displayName || "");
      setEmail(profile.email || user.email || "");
      setSchool(profile.school || "");
      setUserClass(profile.userClass || "");
      setMobileNumber(profile.mobileNumber || "");
    }
    setLoadingProfile(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    loadProfile();
  }, [user, authLoading, router, loadProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, {
        displayName: name,
        school,
        userClass,
        mobileNumber,
      });
      toast({ title: "Profile Updated!", description: "Your information has been saved." });
      setIsEditing(false); // Switch back to view mode on successful save
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({ variant: "destructive", title: "Update Failed", description: "Could not save your profile." });
    }
    setIsSaving(false);
  };
  
  const totalLoading = authLoading || loadingProfile;

  const renderViewMode = () => (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Full Name</p>
          <p className="text-lg">{name || "Not set"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Email Address</p>
          <p className="text-lg">{email}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Mobile Number</p>
          <p className="text-lg">{mobileNumber || "Not set"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">School Name</p>
          <p className="text-lg">{school || "Not set"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Your Class</p>
          <p className="text-lg">{userClass || "Not set"}</p>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={() => setIsEditing(true)}>
          <Edit className="mr-2 h-5 w-5" />
          Edit Profile
        </Button>
      </div>
    </div>
  );

  const renderEditMode = () => (
     <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={email} disabled readOnly />
            <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
          </div>
           <div className="space-y-2">
            <Label htmlFor="mobileNumber">Mobile Number</Label>
            <Input id="mobileNumber" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="e.g., 9876543210" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="school">School Name</Label>
            <Input id="school" value={school} onChange={(e) => setSchool(e.target.value)} placeholder="e.g., Delhi Public School" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="userClass">Your Class</Label>
            <Input id="userClass" value={userClass} onChange={(e) => setUserClass(e.target.value)} placeholder="e.g., 10th or B.Tech" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
              <X className="mr-2 h-5 w-5" />
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
      </form>
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <User className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl md:text-4xl">My Profile</CardTitle>
            <CardDescription className="text-md md:text-lg text-muted-foreground pt-2">
              View and update your personal details.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {totalLoading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : (
              isEditing ? renderEditMode() : renderViewMode()
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
