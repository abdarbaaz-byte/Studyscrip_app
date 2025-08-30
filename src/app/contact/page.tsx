
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, Mail, UserPlus } from "lucide-react";

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
                    We're here to help. Choose the best way to reach us below.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                
                {/* English Version */}
                <div className="text-left p-6 border rounded-lg bg-background">
                    <h3 className="font-headline text-2xl mb-4">Get in Touch (English)</h3>
                    <p className="text-lg mb-6">
                        For the fastest support, please log in to your account and use the chat widget. If you are unable to log in, you can email us directly.
                    </p>
                     <div className="flex items-center justify-center gap-4">
                        <Button asChild>
                            <a href="mailto:studyscript001@gmail.com"><Mail className="mr-2 h-4 w-4" /> Contact by Email</a>
                        </Button>
                    </div>
                </div>

                {/* Hindi Version */}
                 <div className="text-left p-6 border rounded-lg bg-background">
                    <h3 className="font-headline text-2xl mb-4">संपर्क करें (हिन्दी)</h3>
                    <p className="text-lg mb-6">
                        सबसे तेज़ सहायता के लिए, कृपया अपने अकाउंट में लॉग इन करें और चैट विजेट का उपयोग करें। यदि आप लॉग इन नहीं कर पा रहे हैं, तो आप हमें सीधे ईमेल कर सकते हैं।
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Button asChild>
                           <a href="mailto:studyscript001@gmail.com"><Mail className="mr-2 h-4 w-4" /> ईमेल से संपर्क करें</a>
                        </Button>
                    </div>
                </div>

            </CardContent>
         </Card>
       </div>
    </div>
  );
}
