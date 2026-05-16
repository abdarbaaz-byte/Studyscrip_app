import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mail, PhoneCall, Clock, MapPin, Send } from "lucide-react";
import { ScrollAnimation } from "@/components/scroll-animation";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 bg-secondary/30 min-h-screen">
       <div className="max-w-5xl mx-auto space-y-12">
        
         {/* Top Hero Section */}
         <ScrollAnimation>
            <Card className="text-center shadow-2xl border-none overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary to-indigo-900 text-white">
                <CardHeader className="pt-12 pb-10 px-6">
                    <div className="flex justify-center mb-6">
                        <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md">
                            <MessageSquare className="h-12 w-12 text-white" />
                        </div>
                    </div>
                    <CardTitle className="font-headline text-4xl md:text-6xl font-black tracking-tight">Get in Touch</CardTitle>
                    <CardDescription className="text-lg md:text-xl text-white/80 pt-4 font-medium max-w-2xl mx-auto leading-relaxed">
                        Have a question or feedback? We'd love to hear from you. Our team is dedicated to providing you with the best learning experience.
                    </CardDescription>
                </CardHeader>
            </Card>
         </ScrollAnimation>

        <div className="grid md:grid-cols-3 gap-8">
            {/* Email Support Card */}
            <ScrollAnimation delay={100}>
                <Card className="h-full flex flex-col border-none shadow-xl rounded-3xl group hover:-translate-y-2 transition-transform duration-300">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary/10 p-4 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 mb-2">
                            <Mail className="h-8 w-8" />
                        </div>
                        <CardTitle className="font-headline text-2xl pt-2">Email Us</CardTitle>
                        <CardDescription>We aim to respond within 24 hours.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col items-center justify-center p-6 pt-0">
                        <p className="font-bold text-primary mb-6">studyscript001@gmail.com</p>
                        <Button asChild className="w-full rounded-xl h-12">
                            <a href="mailto:studyscript001@gmail.com"><Send className="mr-2 h-4 w-4" /> Send Email</a>
                        </Button>
                    </CardContent>
                </Card>
            </ScrollAnimation>

            {/* Live Chat Card */}
            <ScrollAnimation delay={200}>
                <Card className="h-full flex flex-col border-none shadow-xl rounded-3xl group hover:-translate-y-2 transition-transform duration-300 bg-primary/5">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary p-4 rounded-2xl text-white mb-2 shadow-lg shadow-primary/30">
                            <MessageSquare className="h-8 w-8" />
                        </div>
                        <CardTitle className="font-headline text-2xl pt-2">Live Chat</CardTitle>
                        <CardDescription>Available for registered users.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col items-center justify-center p-6 pt-0 text-center">
                        <p className="text-sm text-muted-foreground mb-6">
                            For the fastest support, login to your account and use the chat widget at the bottom right.
                        </p>
                        <div className="flex items-center gap-2 text-xs font-bold text-green-600 uppercase tracking-widest bg-green-100 px-3 py-1 rounded-full">
                            <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse" /> Online
                        </div>
                    </CardContent>
                </Card>
            </ScrollAnimation>

            {/* Support Hours Card */}
            <ScrollAnimation delay={300}>
                <Card className="h-full flex flex-col border-none shadow-xl rounded-3xl group hover:-translate-y-2 transition-transform duration-300">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-orange-100 p-4 rounded-2xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300 mb-2">
                            <Clock className="h-8 w-8" />
                        </div>
                        <CardTitle className="font-headline text-2xl pt-2">Support Hours</CardTitle>
                        <CardDescription>When we are most active.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow p-6 pt-0 space-y-4">
                        <div className="flex justify-between items-center text-sm border-b pb-2">
                            <span className="font-medium text-muted-foreground">Mon - Sat</span>
                            <span className="font-bold">10 AM - 8 PM</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-muted-foreground">Sunday</span>
                            <span className="font-bold text-orange-600">Limited Support</span>
                        </div>
                    </CardContent>
                </Card>
            </ScrollAnimation>
        </div>

        {/* Hindi Info Section */}
        <ScrollAnimation delay={400}>
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                <div className="grid md:grid-cols-2">
                    <div className="bg-indigo-50 p-8 md:p-12 flex flex-col justify-center">
                        <div className="bg-white p-3 rounded-2xl shadow-sm w-fit mb-6">
                            <PhoneCall className="h-8 w-8 text-indigo-600" />
                        </div>
                        <CardTitle className="font-headline text-3xl md:text-4xl font-bold text-indigo-900 mb-4">संपर्क जानकारी</CardTitle>
                        <p className="text-indigo-800/70 text-lg leading-relaxed mb-6">
                            StudyScript आपकी शिक्षा यात्रा को आसान बनाने के लिए हमेशा तत्पर है। यदि आपको लॉग इन करने या किसी कोर्स को एक्सेस करने में समस्या हो रही है, तो आप बेझिझक हमसे संपर्क कर सकते हैं।
                        </p>
                        <Button asChild variant="outline" className="w-fit border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl px-8 h-12">
                           <a href="mailto:studyscript001@gmail.com"><Mail className="mr-2 h-4 w-4" /> ईमेल से संपर्क करें</a>
                        </Button>
                    </div>
                    <div className="p-8 md:p-12 space-y-8">
                        <div className="flex gap-4">
                            <div className="bg-primary/10 h-10 w-10 rounded-xl flex items-center justify-center shrink-0">
                                <span className="font-bold text-primary">1</span>
                            </div>
                            <p className="text-muted-foreground font-medium pt-1">
                                सबसे तेज़ सहायता के लिए, कृपया अपने अकाउंट में लॉग इन करें और <strong>Chat Widget</strong> का उपयोग करें।
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-primary/10 h-10 w-10 rounded-xl flex items-center justify-center shrink-0">
                                <span className="font-bold text-primary">2</span>
                            </div>
                            <p className="text-muted-foreground font-medium pt-1">
                                यदि आप लॉग इन नहीं कर पा रहे हैं, तो हमें अपनी समस्या के स्क्रीनशॉट के साथ ईमेल भेजें।
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-primary/10 h-10 w-10 rounded-xl flex items-center justify-center shrink-0">
                                <span className="font-bold text-primary">3</span>
                            </div>
                            <p className="text-muted-foreground font-medium pt-1">
                                पेमेंट संबंधी किसी भी समस्या के लिए अपना <strong>Transaction ID</strong> जरूर शेयर करें।
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </ScrollAnimation>

       </div>
    </div>
  );
}
