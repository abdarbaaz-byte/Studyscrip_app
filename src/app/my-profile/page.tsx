"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { getUserProfile, updateUserProfile, getUserPayments, type Payment, type UserCertificate, type UserProfile } from "@/lib/data";
import { Loader2, User, Save, Edit, X, Wallet, Award, Download, Share2, MapPin, Hash, GraduationCap, Phone, Mail, BookOpen, Gift, Users, Copy, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getGoogleDriveImageUrl } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";


export default function MyProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [userClass, setUserClass] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [address, setAddress] = useState("");
  
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [certificates, setCertificates] = useState<UserCertificate[]>([]);
  const [fullProfile, setFullProfile] = useState<Partial<UserProfile> | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSharing, setIsSharing] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    setLoadingProfile(true);
    const [profile, payments] = await Promise.all([
        getUserProfile(user.uid),
        getUserPayments(user.uid)
    ]);
    
    if (profile) {
      setFullProfile(profile);
      setName(profile.displayName || user.displayName || "");
      setEmail(profile.email || user.email || "");
      setSchool(profile.school || "");
      setUserClass(profile.userClass || "");
      setMobileNumber(profile.mobileNumber || "");
      setRollNumber(profile.rollNumber || "");
      setAddress(profile.address || "");
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
        rollNumber,
        address,
      });
      toast({ title: "Profile Updated!", description: "Your information has been saved." });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({ variant: "destructive", title: "Update Failed", description: "Could not save your profile." });
    }
    setIsSaving(false);
  };

  const handleCopyCode = () => {
    if (fullProfile?.referralCode) {
        navigator.clipboard.writeText(fullProfile.referralCode);
        setCopiedCode(true);
        toast({ title: "Code Copied!", description: "Referral code copied to clipboard." });
        setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShareCertificate = async (cert: UserCertificate) => {
    setIsSharing(cert.id);
    try {
      const shareData = {
        title: 'My Certificate!',
        text: `I just earned a certificate for "${cert.title}" from StudyScript!`,
        url: cert.url,
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
         await navigator.clipboard.writeText(cert.url);
         toast({ title: 'Link Copied!', description: 'Certificate link has been copied to your clipboard.' });
      }
    } catch (error) {
      console.error('Error sharing certificate:', error);
    } finally {
      setIsSharing(null);
    }
  };

  const handleDownloadCertificate = (certUrl: string, certTitle: string) => {
    window.open(certUrl, '_blank');
  };
  
  const totalLoading = authLoading || loadingProfile;

  const DetailItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="flex items-start gap-3 p-4 rounded-xl border bg-background/50">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-0.5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-sm md:text-base font-semibold">{value || "Not set"}</p>
        </div>
    </div>
  );

  const renderViewMode = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="text-lg font-bold col-span-full border-b pb-2 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Personal Information
            </h3>
            <DetailItem icon={User} label="Full Name" value={name} />
            <DetailItem icon={Mail} label="Email Address" value={email} />
            <DetailItem icon={Phone} label="Mobile Number" value={mobileNumber} />
            <DetailItem icon={MapPin} label="Full Address" value={address} />
            
            <h3 className="text-lg font-bold col-span-full border-b pb-2 mt-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" /> Academic Details
            </h3>
            <DetailItem icon={GraduationCap} label="School/College" value={school} />
            <DetailItem icon={BookOpen} label="Class/Course" value={userClass} />
            <DetailItem icon={Hash} label="Roll Number" value={rollNumber} />
      </div>
      <div className="flex justify-center pt-4">
        <Button size="lg" onClick={() => setIsEditing(true)} className="rounded-full px-8 shadow-md">
          <Edit className="mr-2 h-5 w-5" />
          Edit Profile
        </Button>
      </div>
    </div>
  );

  const renderEditMode = () => (
     <form onSubmit={handleSave} className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-secondary/30 border">
                <h3 className="text-lg font-bold col-span-full flex items-center gap-2"><User className="h-5 w-5" /> Update Personal Info</h3>
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Enter your full name" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={email} disabled readOnly className="bg-secondary/50 rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="mobileNumber">Mobile Number</Label>
                    <Input id="mobileNumber" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="e.g., 9876543210" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your residential address" className="rounded-xl" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-secondary/30 border">
                <h3 className="text-lg font-bold col-span-full flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Update Academic Info</h3>
                <div className="space-y-2">
                    <Label htmlFor="school">School/College Name</Label>
                    <Input id="school" value={school} onChange={(e) => setSchool(e.target.value)} placeholder="e.g., Delhi Public School" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="userClass">Class/Course</Label>
                    <Input id="userClass" value={userClass} onChange={(e) => setUserClass(e.target.value)} placeholder="e.g., 10th or B.Tech" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="rollNumber">Roll Number</Label>
                    <Input id="rollNumber" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} placeholder="e.g., 2024001" className="rounded-xl" />
                </div>
            </div>
        </div>

        <div className="flex justify-center gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving} className="rounded-full px-8">
              <X className="mr-2 h-5 w-5" />
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={isSaving} className="rounded-full px-10 shadow-lg">
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
      </form>
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 bg-secondary/10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header Card */}
        <Card className="border-none shadow-2xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-indigo-900 text-white">
            <div className="p-8 md:p-12 flex flex-col items-center text-center">
                <div className="relative group mb-6">
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full border-4 border-white/20 bg-background flex items-center justify-center text-primary text-3xl md:text-4xl font-black shadow-inner">
                        {name ? name.charAt(0).toUpperCase() : <User className="h-12 w-12" />}
                    </div>
                </div>
                <div className="space-y-1 mb-8">
                    <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tight">{name || "Anonymous User"}</h1>
                    <p className="text-white/70 text-base md:text-lg font-medium flex items-center justify-center gap-2">
                        <Mail className="h-4 w-4" /> {email}
                    </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 w-full max-w-[280px] text-center space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Referral Program</p>
                    <div className="flex items-center gap-2 justify-center bg-black/20 p-2 rounded-lg border border-white/10">
                        <span className="font-mono text-lg font-bold tracking-widest">{fullProfile?.referralCode || "------"}</span>
                        <button onClick={handleCopyCode} className="hover:text-primary-foreground/80 transition-colors">
                            {copiedCode ? <CheckCircle2 className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
                        </button>
                    </div>
                    <p className="text-[10px] opacity-70">Refer and earn rewards</p>
                </div>
            </div>
        </Card>

        {/* Stats Grid - Focused on Referrals only */}
        <div className="flex justify-center">
            <Card className="border-none shadow-lg bg-white rounded-3xl p-6 flex items-center gap-4 w-full max-w-sm">
                <div className="bg-blue-100 p-4 rounded-2xl text-blue-600">
                    <Users className="h-8 w-8" />
                </div>
                <div>
                    <p className="text-3xl font-black text-blue-900">{fullProfile?.referralCount || 0}</p>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Referrals</p>
                </div>
            </Card>
        </div>

        <Card className="shadow-xl rounded-3xl border-none">
          <CardContent className="p-6 md:p-10">
            {totalLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : (
              isEditing ? renderEditMode() : renderViewMode()
            )}
          </CardContent>
        </Card>

        {!totalLoading && (
           <>
            <Card className="shadow-xl rounded-3xl border-none">
                <CardHeader className="px-8 pt-8">
                    <CardTitle className="font-headline text-2xl flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl text-primary"><Wallet className="h-6 w-6" /></div>
                        Payment History
                    </CardTitle>
                    <CardDescription>A complete record of your transactions.</CardDescription>
                </CardHeader>
                <CardContent className="px-0 sm:px-8 pb-8">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-none hover:bg-transparent">
                                    <TableHead className="font-bold">Item Name</TableHead>
                                    <TableHead className="font-bold">Amount</TableHead>
                                    <TableHead className="font-bold">Date</TableHead>
                                    <TableHead className="text-right font-bold">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paymentHistory.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">
                                            No payment records found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paymentHistory.map((payment) => (
                                        <TableRow key={payment.id} className="hover:bg-secondary/20 transition-colors">
                                            <TableCell className="font-semibold py-4">{payment.itemTitle}</TableCell>
                                            <TableCell className="font-bold text-primary">Rs. {payment.amount}</TableCell>
                                            <TableCell className="text-muted-foreground">{format(payment.paymentDate.toDate(), "PPP")}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge
                                                    variant={payment.status === 'succeeded' ? 'default' : payment.status === 'pending' ? 'secondary' : 'destructive'}
                                                    className={cn(
                                                        "capitalize px-3 py-1 rounded-full",
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
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-xl rounded-3xl border-none">
                 <CardHeader className="px-8 pt-8">
                    <CardTitle className="font-headline text-2xl flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl text-primary"><Award className="h-6 w-6" /></div>
                        My Certificates
                    </CardTitle>
                    <CardDescription>View and share your achievements.</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    {certificates.length === 0 ? (
                        <div className="text-center py-16 bg-secondary/10 rounded-2xl border-2 border-dashed">
                            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                            <p className="text-muted-foreground font-medium">Keep learning to earn certificates!</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {certificates.map((cert) => (
                                <Card key={cert.id} className="overflow-hidden rounded-2xl border bg-background group hover:shadow-lg transition-all duration-300">
                                    <div className="relative aspect-[1.4/1] bg-secondary/30 overflow-hidden">
                                        <Image
                                            src={getGoogleDriveImageUrl(cert.url)}
                                            alt={cert.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <CardContent className="p-4 space-y-4">
                                        <p className="font-bold truncate text-lg">{cert.title}</p>
                                        <div className="flex gap-2">
                                            <Button size="sm" className="flex-1 rounded-lg" onClick={() => handleDownloadCertificate(cert.url, cert.title)}>
                                                <Download className="mr-2 h-4 w-4"/> View
                                            </Button>
                                             <Button size="sm" variant="outline" className="flex-1 rounded-lg" onClick={() => handleShareCertificate(cert)} disabled={isSharing === cert.id}>
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
