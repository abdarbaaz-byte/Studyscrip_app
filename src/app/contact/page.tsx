
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, LogIn, UserPlus } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 bg-secondary/50">
       <div className="max-w-2xl mx-auto">
         <Card className="text-center shadow-lg">
            <CardHeader>
                 <div className="flex justify-center mb-4">
                    <MessageSquare className="h-16 w-16 text-primary" />
                </div>
                <CardTitle className="font-headline text-3xl md:text-4xl">Contact Us</CardTitle>
                <CardDescription className="text-md md:text-lg text-muted-foreground pt-2">
                    We're here to help. The best way to reach us is through our direct support chat.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                
                {/* English Version */}
                <div className="text-left p-6 border rounded-lg bg-background">
                    <h3 className="font-headline text-2xl mb-4">Get in Touch (English)</h3>
                    <p className="text-lg mb-6">
                        To connect with the owner or our support team directly, please log in to your account and use the chat widget located at the bottom-right of your screen. This ensures we have your details to assist you effectively.
                    </p>
                     <div className="flex items-center justify-center gap-4">
                        <Button asChild>
                            <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> Log In</Link>
                        </Button>
                        <span className="font-semibold">or</span>
                        <Button asChild variant="outline">
                             <Link href="/signup"><UserPlus className="mr-2 h-4 w-4" /> Sign Up</Link>
                        </Button>
                    </div>
                </div>

                {/* Hindi Version */}
                 <div className="text-left p-6 border rounded-lg bg-background">
                    <h3 className="font-headline text-2xl mb-4">संपर्क करें (हिन्दी)</h3>
                    <p className="text-lg mb-6">
                        ओनर या हमारी सपोर्ट टीम से सीधे जुड़ने के लिए, कृपया अपने अकाउंट में लॉग इन करें और अपनी स्क्रीन के निचले-दाएं कोने में स्थित चैट विजेट का उपयोग करें। यह सुनिश्चित करता है कि आपकी प्रभावी ढंग से सहायता करने के लिए हमारे पास आपका विवरण موجود ہے۔
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Button asChild>
                            <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> लॉग इन करें</Link>
                        </Button>
                         <span className="font-semibold">या</span>
                        <Button asChild variant="outline">
                             <Link href="/signup"><UserPlus className="mr-2 h-4 w-4" /> साइन अप करें</Link>
                        </Button>
                    </div>
                </div>

            </CardContent>
         </Card>
       </div>
    </div>
  );
}
