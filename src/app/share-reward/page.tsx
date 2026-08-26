"use client";

import { useAuth } from "@/hooks/use-auth";
import { getUserProfile, UserProfile, getBannerSettings, BannerItem } from "@/lib/data";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Gift, Users, Trophy, Loader2, Copy, CheckCircle2, MessageCircle, ArrowRightCircle, Coins } from "lucide-react";
import { ScrollAnimation } from "@/components/scroll-animation";
import { useToast } from "@/hooks/use-toast";
import { getGoogleDriveImageUrl } from "@/lib/utils";

export default function ShareRewardPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [referralBanner, setReferralBanner] = useState<BannerItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      if (user) {
        const [profileData, bannerData] = await Promise.all([
            getUserProfile(user.uid),
            getBannerSettings()
        ]);
        setProfile(profileData);
        if (bannerData.referralBanner && bannerData.referralBanner.isActive) {
            setReferralBanner(bannerData.referralBanner);
        }
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
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join StudyScript',
          text: shareText,
          url: shareUrl,
        });
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
        
        {/* Header Card */}
        <ScrollAnimation>
          <Card className="border-none shadow-2xl overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-center p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 p-4 rounded-full backdrop-blur-md">
                <Coins className="h-12 w-12" />
              </div>
            </div>
            <CardTitle className="text-3xl md:text-4xl font-black font-headline mb-2">Refer & Earn Credits!</CardTitle>
            <CardDescription className="text-white/80 text-lg">
              Earn ₹20 StudyScript Credits for every friend who joins and makes their first purchase.
            </CardDescription>
          </Card>
        </ScrollAnimation>

        {/* Link Box */}
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

        {/* Steps Section */}
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
                  <p className="text-sm text-muted-foreground">Upar diye gaye button se apna referral link WhatsApp ya anya social media par apne dosto ko bhejein.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center shrink-0 font-bold">2</div>
                <div>
                  <p className="font-bold">Dost Join Karein</p>
                  <p className="text-sm text-muted-foreground">Aapka dost link par click karke signup karega toh aapka referral code automatically apply ho jayega.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center shrink-0 font-bold">3</div>
                <div>
                  <p className="font-bold">₹20 Credits Payein</p>
                  <p className="text-sm text-muted-foreground">Jaise hi aapka dost koi **Course ya Batch** pehli baar khareedega, aapke wallet mein ₹20 credits turant add ho jayenge.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollAnimation>

        {/* Note Box */}
        <ScrollAnimation delay={300}>
          <Card className="bg-orange-50 border-orange-100 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-orange-800 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" /> Important Note
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-orange-900 leading-relaxed">
                StudyScript Credits ka upyog aap kisi bhi course ya batch ko khareedte waqt **Discount** paane ke liye kar sakte hain. 
              </p>
              <p className="text-sm text-orange-900 leading-relaxed font-semibold">
                Yadi aapke paas adhik referrals hain aur aap **Free Access** ya anya rewards chahte hain, toh kripya **Chat Support** mein hamari team ko message karein.
              </p>
            </CardContent>
          </Card>
        </ScrollAnimation>

        {/* Bottom Banner Setup */}
        {referralBanner && (
            <ScrollAnimation delay={400}>
                {referralBanner.linkUrl ? (
                    <Link href={referralBanner.linkUrl} target="_blank" className="block relative aspect-[21/9] w-full overflow-hidden rounded-3xl shadow-lg border-4 border-white">
                        <Image 
                            src={getGoogleDriveImageUrl(referralBanner.imageUrl)} 
                            alt="Promotion"
                            fill
                            className="object-cover"
                        />
                    </Link>
                ) : (
                    <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl shadow-lg border-4 border-white">
                        <Image 
                            src={getGoogleDriveImageUrl(referralBanner.imageUrl)} 
                            alt="Promotion"
                            fill
                            className="object-cover"
                        />
                    </div>
                )}
            </ScrollAnimation>
        )}

      </div>
    </div>
  );
}