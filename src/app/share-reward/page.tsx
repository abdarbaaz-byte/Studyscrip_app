
"use client";

import { useAuth } from "@/hooks/use-auth";
import { getUserProfile, UserProfile } from "@/lib/data";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Gift, Users, Trophy, Loader2, Copy, CheckCircle2, MessageCircle, ArrowRightCircle } from "lucide-react";
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
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${baseUrl}/signup?ref=${referralCode}`;
  const shareText = `Hey! Join me on StudyScript for amazing courses. Click my link to join and get exclusive benefits! 🚀\n\nJoin here: ${shareUrl}`;

  const handleShare = async () => {
    const shareData = {
      title: 'Join StudyScript',
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
              <CardTitle className="text-xl">Your Referral Link</CardTitle>
              <CardDescription>Share this link to automatically apply your code</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-4 bg-secondary/50 px-6 py-4 rounded-2xl border-2 border-dashed border-primary/30 w-full overflow-hidden">
                <span className="text-sm font-mono truncate text-primary flex-1">{shareUrl}</span>
                <Button variant="ghost" size="icon" onClick={handleCopy} className="shrink-0">
                  {copied ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
              
              <Button size="lg" className="w-full rounded-full h-14 text-lg font-bold shadow-lg" onClick={handleShare}>
                <Share2 className="mr-2 h-5 w-5" /> Share with Friends
              </Button>
            </CardContent>
          </Card>
        </ScrollAnimation>

        <ScrollAnimation delay={200}>
          <Card className="border-none shadow-lg bg-white rounded-3xl">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <ArrowRightCircle className="text-primary h-6 w-6" /> Referral Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center shrink-0 font-bold">1</div>
                <div>
                  <p className="font-bold">Link Share Karein</p>
                  <p className="text-sm text-muted-foreground">'Share with Friends' button par click karein aur apne dosto ko link bhejein.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center shrink-0 font-bold">2</div>
                <div>
                  <p className="font-bold">Dost Join Karein</p>
                  <p className="text-sm text-muted-foreground">Aapka dost uss link par click karke signup karega toh aapka code auto-fill ho jayega.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center shrink-0 font-bold">3</div>
                <div>
                  <p className="font-bold">Referral Count Badhayein</p>
                  <p className="text-sm text-muted-foreground">Jaise hi wo signup karenge, aapka referral count badh jayega. Aapne abhi tak <span className="font-bold text-primary">{profile?.referralCount || 0}</span> referral kiye hain.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollAnimation>

        <ScrollAnimation delay={300}>
          <Card className="bg-orange-50 border-orange-100 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-orange-800 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" /> Important Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-900 leading-relaxed">
                Referral points se **Free Access** ya rewards paane ke liye, kripya StudyScript ke **Chat Support** mein message karein. Hamari team aapke referrals verify karke aapko reward pradan karegi.
              </p>
            </CardContent>
          </Card>
        </ScrollAnimation>

      </div>
    </div>
  );
}
