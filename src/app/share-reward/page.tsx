"use client";

import { useAuth } from "@/hooks/use-auth";
import { getUserProfile, UserProfile } from "@/lib/data";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Gift, Users, Trophy, Loader2, Copy, CheckCircle2 } from "lucide-react";
import { ScrollAnimation } from "@/components/scroll-animation";
import { useToast } from "@/hooks/use-toast";

export default function ShareRewardPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      if (user) {
        const data = await getUserProfile(user.uid);
        setProfile(data);
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  const referralCode = profile?.referralCode || "";
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareText = `Hey! Join me on StudyScript for amazing courses. Use my referral code: ${referralCode} to join. Download now: ${shareUrl}`;

  const handleShare = async () => {
    const shareData = {
      title: 'StudyScript Referral',
      text: shareText,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    toast({ title: "Link Copied!", description: "Share it with your friends!" });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || authLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 bg-secondary/10">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <ScrollAnimation>
          <Card className="border-none shadow-2xl overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-center p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 p-4 rounded-full backdrop-blur-md">
                <Gift className="h-12 w-12" />
              </div>
            </div>
            <CardTitle className="text-3xl md:text-4xl font-black font-headline mb-2">Refer & Earn Rewards!</CardTitle>
            <CardDescription className="text-white/80 text-lg">
              Invite your friends to StudyScript and unlock exclusive benefits together.
            </CardDescription>
          </Card>
        </ScrollAnimation>

        <ScrollAnimation delay={100}>
          <Card className="shadow-xl rounded-3xl border-none">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">Your Referral Code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-4 bg-secondary/50 px-8 py-4 rounded-2xl border-2 border-dashed border-primary/30">
                <span className="text-3xl font-black font-mono tracking-widest text-primary">{referralCode || "------"}</span>
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  {copied ? <CheckCircle2 className="h-6 w-6 text-green-600" /> : <Copy className="h-6 w-6" />}
                </Button>
              </div>
              
              <Button size="lg" className="w-full rounded-full h-14 text-lg font-bold shadow-lg" onClick={handleShare}>
                <Share2 className="mr-2 h-5 w-5" /> Share with Friends
              </Button>
            </CardContent>
          </Card>
        </ScrollAnimation>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScrollAnimation delay={200}>
            <Card className="h-full">
              <CardHeader>
                <div className="bg-orange-100 text-orange-600 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Invite Friends</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Apne dosto ko app share karein aur unhe apna referral code use karne ko kahein.
              </CardContent>
            </Card>
          </ScrollAnimation>

          <ScrollAnimation delay={300}>
            <Card className="h-full">
              <CardHeader>
                <div className="bg-green-100 text-green-600 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
                  <Trophy className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Earn Points</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Har successful referral par aapko points milenge jo aap premium courses unlock karne ke liye use kar sakte hain.
              </CardContent>
            </Card>
          </ScrollAnimation>
        </div>

        <ScrollAnimation delay={400}>
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Reward Details / इनाम की जानकारी</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Har 5 referral par aapko 1 "Free Practice Quiz" access milega.</li>
                <li>10 referral poore hone par ek specialized "Audio Lecture" topic unlock hoga.</li>
                <li>Top referrers ke liye mahine ke ant mein special prizes diye jayenge.</li>
                <li>Aapne abhi tak <strong>{profile?.referralCount || 0}</strong> referrals kiye hain.</li>
              </ul>
            </CardContent>
          </Card>
        </ScrollAnimation>

      </div>
    </div>
  );
}
