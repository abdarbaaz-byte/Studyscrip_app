import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mail } from "lucide-react";
import { ScrollAnimation } from "@/components/scroll-animation";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 bg-secondary/50">
       <div className="max-w-4xl mx-auto space-y-12">
        
         <ScrollAnimation>
            <Card className="text-center shadow-lg">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <MessageSquare className="h-16 w-16 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-3xl md:text-4xl">Get in Touch</CardTitle>
                    <CardDescription className="text-md md:text-lg text-muted-foreground pt-2">
                        We're here to help you on your learning journey.
                    </CardDescription>
                </CardHeader>
            </Card>
         </ScrollAnimation>

        <div className="grid md:grid-cols-2 gap-8">
            <ScrollAnimation>
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Email Support</CardTitle>
                        <CardDescription>For any inquiries, reach out to us via email.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="flex flex-col items-center justify-center text-center p-6 border-2 border-dashed rounded-lg h-full">
                            <Mail className="h-12 w-12 text-primary mb-4" />
                            <p className="font-semibold text-lg">studyscript001@gmail.com</p>
                            <p className="text-muted-foreground text-sm">We'll get back to you as soon as possible.</p>
                             <Button asChild className="mt-4">
                                <a href="mailto:studyscript001@gmail.com">Send Email</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </ScrollAnimation>
             <ScrollAnimation delay={100}>
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Fastest Support</CardTitle>
                        <CardDescription>Use our in-app chat for instant help.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                         <div className="flex flex-col items-center justify-center text-center p-6 border-2 border-dashed rounded-lg h-full bg-primary/5">
                            <MessageSquare className="h-12 w-12 text-primary mb-4" />
                            <p className="font-semibold text-lg">Live Chat Widget</p>
                            <p className="text-muted-foreground text-sm">Log in and use the chat icon at the bottom right for the quickest response.</p>
                        </div>
                    </CardContent>
                </Card>
            </ScrollAnimation>
        </div>

        <ScrollAnimation delay={200}>
            <Card>
                <CardHeader>
                     <CardTitle className="font-headline text-2xl">संपर्क जानकारी (हिन्दी)</CardTitle>
                     <CardDescription>आप हमसे इन तरीकों से संपर्क कर सकते हैं।</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-lg text-muted-foreground">
                        सबसे तेज़ सहायता के लिए, कृपया अपने अकाउंट में लॉग इन करें और चैट विजेट (Chat Widget) का उपयोग करें। यदि आप लॉग इन नहीं कर पा रहे हैं, तो आप हमें सीधे ईमेल कर सकते हैं।
                    </p>
                     <div className="flex items-center justify-center gap-4">
                        <Button asChild>
                           <a href="mailto:studyscript001@gmail.com"><Mail className="mr-2 h-4 w-4" /> ईमेल से संपर्क करें</a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </ScrollAnimation>

       </div>
    </div>
  );
}
