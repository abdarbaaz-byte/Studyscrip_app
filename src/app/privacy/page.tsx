import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Lock, Eye, Database, Bell, UserCheck, MessageCircle } from "lucide-react";
import { ScrollAnimation } from "@/components/scroll-animation";

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 bg-secondary/30 min-h-screen">
       <div className="max-w-4xl mx-auto">
         <ScrollAnimation>
            <Card className="shadow-2xl border-none overflow-hidden rounded-[2.5rem]">
                <CardHeader className="text-center pb-10 border-b bg-background">
                    <div className="flex justify-center mb-6">
                        <div className="bg-primary/10 p-5 rounded-2xl">
                            <ShieldCheck className="h-14 w-14 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="font-headline text-4xl md:text-6xl font-black tracking-tight text-primary">
                        Privacy Policy
                    </CardTitle>
                    <CardDescription className="text-lg md:text-xl text-muted-foreground pt-4 font-medium max-w-2xl mx-auto">
                        Hamari priority aapki privacy aur data security hai. Jaaniye hum aapki jaankari ko kaise handle karte hain.
                    </CardDescription>
                    <div className="mt-4 inline-block px-4 py-1.5 bg-secondary rounded-full text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Last Updated: {lastUpdated}
                    </div>
                </CardHeader>
                
                <CardContent className="p-8 md:p-14 space-y-12 bg-white">
                    
                    {/* Section 1: Information Collection */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-primary border-b border-primary/10 pb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Database className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold font-headline">1. Information We Collect</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            StudyScript ka upyog karne ke liye hum niche di gayi jaankari collect karte hain:
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <li className="p-4 bg-secondary/50 rounded-2xl border text-sm">
                                <strong>Account Info:</strong> Registration ke waqt aapka naam aur email address. (Passwords Firebase dwara encrypted hote hain).
                            </li>
                            <li className="p-4 bg-secondary/50 rounded-2xl border text-sm">
                                <strong>Profile Details:</strong> Mobile number, school/college ka naam, class, roll number aur address (optional).
                            </li>
                            <li className="p-4 bg-secondary/50 rounded-2xl border text-sm">
                                <strong>Referral Data:</strong> Aapka unique referral code aur aapke link se join karne wale users ki sankhya.
                            </li>
                            <li className="p-4 bg-secondary/50 rounded-2xl border text-sm">
                                <strong>Transaction Info:</strong> Razorpay payment details ya manual UPI verification ke liye Transaction/Reference ID.
                            </li>
                        </ul>
                    </div>

                    {/* Section 2: Usage */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-primary border-b border-primary/10 pb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <UserCheck className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold font-headline">2. How We Use Your Data</h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p>Hum collect ki gayi jaankari ka upyog in kaamo ke liye karte hain:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Aapke purchased courses aur academic materials tak access pradan karne ke liye.</li>
                                <li>Referral rewards aur "Share & Earn" program ko manage karne ke liye.</li>
                                <li>UPI payments ko manually verify karke aapko access dene ke liye.</li>
                                <li>Personalized updates aur dashboard experience ke liye.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 3: Tech Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 bg-blue-50 rounded-3xl space-y-3">
                            <div className="flex items-center gap-2 text-blue-800 font-bold">
                                <Bell className="h-5 w-5" /> Push Notifications
                            </div>
                            <p className="text-sm text-blue-900/70">
                                Hum FCM (Firebase Cloud Messaging) ka upyog karte hain taaki aapko live classes, naye courses aur important updates ke notifications mil sakein. Iske liye hum ek unique device token store karte hain.
                            </p>
                        </div>
                        <div className="p-6 bg-purple-50 rounded-3xl space-y-3">
                            <div className="flex items-center gap-2 text-purple-800 font-bold">
                                <MessageCircle className="h-5 w-5" /> Support Chat
                            </div>
                            <p className="text-sm text-purple-900/70">
                                Hamara in-app support chat aapke doubts clear karne ke liye hai. Chat history ko store kiya jata hai taaki aapko behtar aur fast response mil sake.
                            </p>
                        </div>
                    </div>

                    {/* Section 4: Security */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-primary border-b border-primary/10 pb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Lock className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold font-headline">3. Data Security & Storage</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            Hum aapka data <strong>Google Firebase</strong> ke secure servers par store karte hain jo industry-standard encryption pradan karta hai. Hum aapka koi bhi personal data kisi third-party marketing agency ko nahi bechte hain. Payment processing sirf authorized partners (Razorpay) dwara ki jati hai.
                        </p>
                    </div>

                    {/* Section 5: Control */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-primary border-b border-primary/10 pb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Eye className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold font-headline">4. Your Control & Rights</h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p>Aapke paas apne data par pura control hai:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Profile Update:</strong> Aap "My Profile" section mein jaakar kabhi bhi apni details badal sakte hain.</li>
                                <li><strong>Device Security:</strong> Hamari "One Device Policy" aapke account ko unauthorized access se bachati hai.</li>
                                <li><strong>Account Deletion:</strong> Agar aap apna account delete karna chahte hain, toh hamari support team ko message kar sakte hain.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="text-center pt-10 border-t">
                         <p className="text-sm text-muted-foreground font-medium">
                            Privacy Policy ke bare mein sawal hone par humein support chat ya email par sampark karein.
                            <br />
                            <a href="mailto:studyscript001@gmail.com" className="text-primary hover:underline font-bold">studyscript001@gmail.com</a>
                         </p>
                    </div>

                </CardContent>
            </Card>
         </ScrollAnimation>
       </div>
    </div>
  );
}
