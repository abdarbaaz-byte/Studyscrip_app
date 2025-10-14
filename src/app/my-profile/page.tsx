
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { getUserProfile, updateUserProfile, getUserPayments, type Payment, type UserCertificate } from "@/lib/data";
import { Loader2, User, Save, Edit, X, Wallet, Award, Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getGoogleDriveImageUrl } from "@/lib/utils";


export default function MyProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [userClass, setUserClass] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [certificates, setCertificates] = useState<UserCertificate[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSharing, setIsSharing] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    setLoadingProfile(true);
    const [profile, payments] = await Promise.all([
        getUserProfile(user.uid),
        getUserPayments(user.uid)
    ]);
    
    if (profile) {
      setName(profile.displayName || user.displayName || "");
      setEmail(profile.email || user.email || "");
      setSchool(profile.school || "");
      setUserClass(profile.userClass || "");
      setMobileNumber(profile.mobileNumber || "");
      setCertificates(profile.certificates || []);
    }

    setPaymentHistory(payments);
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

  const handleShareCertificate = async (cert: UserCertificate) => {
    setIsSharing(cert.id);
    const imageUrl = getGoogleDriveImageUrl(cert.url);
    const proxyUrl = `/api/download?url=${encodeURIComponent(imageUrl)}&name=${encodeURIComponent(cert.title)}.jpg`;

    try {
      // Fetch the image as a blob
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob();
      
      // Create a File object
      const file = new File([blob], `${cert.title}.jpg`, { type: blob.type });

      // Prepare share data with the file
      const shareData = {
        title: 'My Certificate!',
        text: `I just earned a certificate for "${cert.title}" from StudyScript!`,
        files: [file],
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support file sharing
         await navigator.clipboard.writeText(cert.url);
         toast({ title: 'Link Copied!', description: 'File sharing is not supported, so the certificate link has been copied to your clipboard.' });
      }

    } catch (error) {
      console.error('Error sharing certificate:', error);
      toast({ variant: 'destructive', title: 'Could not share', description: 'There was an error trying to share your certificate.' });
    } finally {
      setIsSharing(null);
    }
  };

  const handleDownloadCertificate = (certUrl: string, certTitle: string) => {
    // We use our API proxy to handle the download and bypass CORS.
    const downloadUrl = `/api/download?url=${encodeURIComponent(getGoogleDriveImageUrl(certUrl))}&name=${encodeURIComponent(certTitle)}.jpg`;
    window.location.href = downloadUrl;
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
      <div className="max-w-4xl mx-auto space-y-8">
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

        {!totalLoading && (
           <>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Wallet /> Payment History
                    </CardTitle>
                    <CardDescription>A record of all your transactions on StudyScript.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item Name</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paymentHistory.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        You have not made any payments yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paymentHistory.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-medium">{payment.itemTitle}</TableCell>
                                        <TableCell>Rs. {payment.amount}</TableCell>
                                        <TableCell>{format(payment.paymentDate.toDate(), "PPP")}</TableCell>
                                        <TableCell className="text-right">
                                             <Badge
                                                variant={
                                                payment.status === 'succeeded'
                                                    ? 'default'
                                                    : payment.status === 'pending'
                                                    ? 'secondary'
                                                    : 'destructive'
                                                }
                                                className={cn(
                                                "capitalize",
                                                payment.status === 'succeeded' && "bg-green-600",
                                                payment.status === 'pending' && "bg-orange-500",
                                                )}
                                            >
                                                {payment.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Award /> My Certificates
                    </CardTitle>
                    <CardDescription>All your earned certificates in one place.</CardDescription>
                </CardHeader>
                <CardContent>
                    {certificates.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            You have not earned any certificates yet. Keep learning!
                        </p>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {certificates.map((cert) => (
                                <Card key={cert.id} className="overflow-hidden">
                                    <CardHeader className="p-0">
                                        <div className="aspect-video relative bg-secondary">
                                            <Image
                                                src={getGoogleDriveImageUrl(cert.url)}
                                                alt={cert.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <p className="font-semibold truncate">{cert.title}</p>
                                        <div className="flex gap-2 mt-3">
                                            <Button size="sm" className="w-full" onClick={() => handleDownloadCertificate(cert.url, cert.title)}>
                                                <Download className="mr-2 h-4 w-4"/> Download
                                            </Button>
                                             <Button size="sm" variant="outline" className="w-full" onClick={() => handleShareCertificate(cert)} disabled={isSharing === cert.id}>
                                                {isSharing === cert.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Share2 className="mr-2 h-4 w-4"/>}
                                                Share
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
           </>
        )}
      </div>
    </div>
  );
}
