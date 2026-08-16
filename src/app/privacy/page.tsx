import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Lock, Eye, Database, Bell, UserCheck, MessageCircle, Globe, CreditCard } from "lucide-react";
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
                        Your privacy is our priority. This policy outlines how StudyScript collects, uses, and protects your information.
                    </CardDescription>
                    <div className="mt-4 inline-block px-4 py-1.5 bg-secondary rounded-full text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Last Updated: {lastUpdated}
                    </div>
                </CardHeader>
                
                <CardContent className="p-8 md:p-14 space-y-12 bg-white">
                    
                    {/* Introduction */}
                    <div className="prose prose-neutral max-w-none">
                        <p className="text-lg text-muted-foreground leading-relaxed italic border-l-4 border-primary/20 pl-6">
                            At StudyScript, we are committed to protecting the privacy of our students and educators. This Privacy Policy describes our practices regarding the collection, use, and disclosure of information through our digital learning platform.
                        </p>
                    </div>

                    {/* Section 1: Information Collection */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-primary border-b border-primary/10 pb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Database className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold font-headline">1. Information We Collect</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            To provide a personalized learning experience, we collect the following types of information:
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                            <li className="p-4 bg-secondary/50 rounded-2xl border text-sm">
                                <strong>Account Data:</strong> Name, email address, and encrypted password provided during registration via Google Firebase Authentication.
                            </li>
                            <li className="p-4 bg-secondary/50 rounded-2xl border text-sm">
                                <strong>Profile Information:</strong> Mobile number, school/institute name, class/grade, roll number, and residential address.
                            </li>
                            <li className="p-4 bg-secondary/50 rounded-2xl border text-sm">
                                <strong>Transactional Data:</strong> Payment confirmation details, including Razorpay Order IDs or manual UPI Transaction/Reference IDs for course access verification.
                            </li>
                            <li className="p-4 bg-secondary/50 rounded-2xl border text-sm">
                                <strong>Referral Data:</strong> Unique referral codes assigned to your account and the number of successful sign-ups attributed to your link.
                            </li>
                        </ul>
                    </div>

                    {/* Section 2: Use of Data */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-primary border-b border-primary/10 pb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <UserCheck className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold font-headline">2. How We Use Your Information</h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p>StudyScript uses the collected data for the following legitimate business purposes:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Service Delivery:</strong> To provide access to purchased academic courses, notes, and interactive quizzes.</li>
                                <li><strong>Manual Verification:</strong> To verify UPI payments manually and grant access to premium content within the stipulated time frame (typically 24 hours).</li>
                                <li><strong>Referral Management:</strong> To track referral milestones and reward users through our "Share & Earn" program.</li>
                                <li><strong>Communication:</strong> To send critical updates regarding live classes, test schedules, and account security.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 3: Technical Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 bg-blue-50 rounded-3xl space-y-3">
                            <div className="flex items-center gap-2 text-blue-800 font-bold">
                                <Bell className="h-5 w-5" /> Push Notifications
                            </div>
                            <p className="text-sm text-blue-900/70">
                                We utilize Firebase Cloud Messaging (FCM) to deliver real-time push notifications. We store a unique device token to ensure you receive timely alerts about live sessions and new content.
                            </p>
                        </div>
                        <div className="p-6 bg-purple-50 rounded-3xl space-y-3">
                            <div className="flex items-center gap-2 text-purple-800 font-bold">
                                <MessageCircle className="h-5 w-5" /> Support Chat
                            </div>
                            <p className="text-sm text-purple-900/70">
                                Our integrated support chat stores conversation history to provide efficient technical assistance. This data is used solely for troubleshooting and quality assurance.
                            </p>
                        </div>
                    </div>

                    {/* Section 4: Data Security */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-primary border-b border-primary/10 pb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Lock className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold font-headline">3. Security and Protection</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            We implement industry-standard security measures to safeguard your data:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex gap-3 items-start">
                                <div className="mt-1 bg-green-100 p-1 rounded-full"><UserCheck className="h-4 w-4 text-green-600" /></div>
                                <p className="text-sm"><strong>One-Device Policy:</strong> To prevent unauthorized access, accounts are restricted to one active session at a time.</p>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="mt-1 bg-green-100 p-1 rounded-full"><Globe className="h-4 w-4 text-green-600" /></div>
                                <p className="text-sm"><strong>Encrypted Storage:</strong> All user data is hosted on secure Google Firebase servers with multi-layer encryption.</p>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="mt-1 bg-green-100 p-1 rounded-full"><CreditCard className="h-4 w-4 text-green-600" /></div>
                                <p className="text-sm"><strong>Secure Payments:</strong> We do not store full credit card information; all digital transactions are processed by PCI-compliant partners like Razorpay.</p>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="mt-1 bg-green-100 p-1 rounded-full"><Eye className="h-4 w-4 text-green-600" /></div>
                                <p className="text-sm"><strong>Data Privacy:</strong> StudyScript never sells your personal information to third-party marketing agencies.</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 5: User Rights */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-primary border-b border-primary/10 pb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold font-headline">4. Your Rights and Controls</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            You maintain full control over your personal data on StudyScript:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li><strong>Access and Rectification:</strong> You can update your profile information at any time through the "My Profile" section.</li>
                            <li><strong>Data Portability:</strong> You may request a summary of your payment history and enrolled courses.</li>
                            <li><strong>Account Deletion:</strong> If you wish to permanently delete your account, please contact our support team through the in-app chat.</li>
                        </ul>
                    </div>

                    {/* Contact Footer */}
                    <div className="text-center pt-10 border-t">
                         <p className="text-sm text-muted-foreground font-medium">
                            If you have any questions or concerns regarding this Privacy Policy, please reach out to us at:
                            <br />
                            <a href="mailto:studyscript001@gmail.com" className="text-primary hover:underline font-bold text-lg mt-2 inline-block">studyscript001@gmail.com</a>
                         </p>
                    </div>

                </CardContent>
            </Card>
         </ScrollAnimation>
       </div>
    </div>
  );
}
