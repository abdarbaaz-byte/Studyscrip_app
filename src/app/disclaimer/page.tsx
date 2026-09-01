import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Info, Scale, CreditCard, BookOpen, ShieldAlert, Smartphone, Users } from "lucide-react";
import { ScrollAnimation } from "@/components/scroll-animation";

export default function DisclaimerPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 bg-secondary/30 min-h-screen">
       <div className="max-w-4xl mx-auto">
         <ScrollAnimation>
            <Card className="shadow-2xl border-none overflow-hidden rounded-[2rem]">
                <CardHeader className="text-center pb-10 border-b bg-background">
                    <div className="flex justify-center mb-6">
                        <div className="bg-orange-100 p-5 rounded-2xl">
                            <AlertTriangle className="h-14 w-14 text-orange-600" />
                        </div>
                    </div>
                    <CardTitle className="font-headline text-4xl md:text-6xl font-black tracking-tight text-primary">
                        Disclaimer
                    </CardTitle>
                    <CardDescription className="text-lg md:text-xl text-muted-foreground pt-4 font-medium max-w-2xl mx-auto">
                        Legal notice regarding platform usage, content accuracy, and user responsibilities.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 md:p-14 space-y-16 bg-white">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Section 1 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-primary">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl font-bold font-headline">Educational Purpose</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                All materials on <strong>StudyScript</strong>, including video lectures, PDF notes, and Tests, are for general educational purposes. These are self-developed resources intended to supplement official textbooks. We do not guarantee specific academic or exam results.
                            </p>
                        </div>

                        {/* Section 2 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-primary">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <CreditCard className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl font-bold font-headline">Payments & Access</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                UPI payments are manually verified by our team. Access is typically granted within <strong>24 hours</strong>. Users must provide the correct Transaction ID. Razorpay payments provide instant access. All digital purchases are non-refundable.
                            </p>
                        </div>

                        {/* Section 3 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-primary">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Users className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl font-bold font-headline">Referral & Credits</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                StudyScript Credits earned via the referral program are subject to manual audit. Manipulation using fake accounts, bots, or multiple registrations on the same device will lead to credit forfeiture and permanent account suspension.
                            </p>
                        </div>

                        {/* Section 4 */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-primary">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <ShieldAlert className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl font-bold font-headline">One-Device Policy</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                For security and content protection, an account can only be active on one device at a time. Simultaneous logins will trigger an automatic logout of the previous session to prevent unauthorized account sharing.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-orange-50 border border-orange-100 p-8 rounded-[2.5rem]">
                             <h4 className="text-xl font-bold mb-4 flex items-center gap-3 text-orange-800 font-headline">
                                <Smartphone className="h-6 w-6"/> Technical Reliability
                             </h4>
                             <p className="text-orange-900/80 leading-relaxed">
                                Live Classes and Test schedules are estimates and may change. While our PWA uses high-priority notifications, delivery depends on your device settings and internet connectivity. StudyScript is not liable for data loss or service interruptions beyond our control.
                             </p>
                        </div>

                        <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[2.5rem]">
                             <h4 className="text-xl font-bold mb-4 flex items-center gap-3 text-indigo-800 font-headline">
                                <BookOpen className="h-6 w-6"/> Bookstore & Free Content
                             </h4>
                             <p className="text-indigo-900/80 leading-relaxed">
                                Free downloads from the Bookstore require mandatory user login to prevent automated bot scraping and ensure fair distribution. Unauthorized commercial redistribution of any StudyScript content is strictly prohibited.
                             </p>
                        </div>
                    </div>

                    <div className="text-center pt-10 border-t">
                         <p className="text-sm text-muted-foreground italic font-medium">
                            By continuing to use StudyScript, you acknowledge that you have read and understood this legal disclaimer. 
                            <br />Last updated: {new Date().getFullYear()}
                         </p>
                    </div>

                </CardContent>
            </Card>
         </ScrollAnimation>
       </div>
    </div>
  );
}
