import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, BookOpen, CreditCard, Award, Smartphone, ShieldCheck } from "lucide-react";
import { ScrollAnimation } from "@/components/scroll-animation";

const faqSections = [
    {
        title: "General Information",
        icon: BookOpen,
        items: [
            {
                question: "StudyScript kya hai?",
                answer: "StudyScript ek professional e-learning platform hai jo Class 5th se 12th tak ke students aur competitive exams (Exam Resources) ki taiyari karne waalon ke liye high-quality digital content pradan karta hai. Humara lakshya har student tak affordable education pahunchana hai."
            },
            {
                question: "Kya StudyScript ka content free hai?",
                answer: "Haan! Humare platform par 'Free Notes', 'Bookstore', aur 'Audio Lectures' sections sabhi ke liye free hain. Iske alawa, har paid subject ka pehla chapter (Chapter 1) bilkul free hai taaki aap content ki quality check kar sakein."
            },
            {
                question: "Bookstore se PDF download kyu nahi ho raha?",
                answer: "Bookstore se koi bhi material download karne ke liye 'Login' karna anivarya (mandatory) hai. Agar aapne login nahi kiya hai, toh aapko download button nahi dikhega. Signup karein aur phir try karein."
            }
        ]
    },
    {
        title: "Payments & Access",
        icon: CreditCard,
        items: [
            {
                question: "Payment ke kaun-kaun se tarike available hain?",
                answer: "Aap do tarah se payment kar sakte hain: 1. Razorpay (Instant Access) - Isme aap Card, Netbanking, ya Wallet se pay kar sakte hain. 2. UPI Payment (Manual) - Isme aapko QR code scan karke pay karna hota hai aur phir Transaction ID submit karni hoti hai."
            },
            {
                question: "UPI payment ke baad access kab milega?",
                answer: "UPI payments ko humari team manually verify karti hai. Is process mein aamtaur par 1 se 24 ghante ka samay lagta hai. Verification hote hi aapko notification mil jayega aur course unlock ho jayega."
            },
            {
                question: "Refund policy kya hai?",
                answer: "Kyonki humara content digital (PDF/Video) hai, isliye ek baar access milne ke baad hum refund pradan nahi karte hain. Hum aapse anurodh karte hain ki kharidne se pehle free previews zaroor dekhein."
            },
            {
                question: "Course/Batch ki validity kitni hoti hai?",
                answer: "Humare zyadatar courses aur batches ki validity purchase ki tarikh se 1 saal (12 mahine) tak hoti hai. Validity khatam hone ke baad aapko usey renew karna hoga."
            }
        ]
    },
    {
        title: "Learning & Rewards",
        icon: Award,
        items: [
            {
                question: "Maine jo khareeda hai wo kahan dikhega?",
                answer: "Aapka saara purchased content 'My Learning' section mein dikhayi dega. Iske alawa aap apni profile mein jaakar 'Payment History' bhi check kar sakte hain."
            },
            {
                question: "Certificate kaise milega?",
                answer: "Jab aap koi specialized course poora karte hain, toh admin aapko ek certificate assign karta hai. Yeh certificate aapko 'My Profile' page par 'My Certificates' section mein milega, jahan se aap ise download ya share kar sakte hain."
            },
            {
                question: "Share & Earn (Referral) program kya hai?",
                answer: "Aap apne dosto ko apna referral link bhej sakte hain. Jab koi aapke link se join karta hai, toh aapka referral count badhta hai. Zyada referrals hone par aap 'Chat Support' par message karke free course access ya rewards maang sakte hain."
            }
        ]
    },
    {
        title: "Technical & Security",
        icon: ShieldCheck,
        items: [
            {
                question: "One-Device policy kya hai?",
                answer: "Security ke liye, ek account ko ek waqt mein sirf ek hi device par chalaya ja sakta hai. Agar aap dusre phone mein login karenge, toh purane phone se apne aap logout ho jayega. Baar-baar aisa karne par account block ho sakta hai."
            },
            {
                question: "StudyScript App kaise install karein?",
                answer: "StudyScript ek PWA (Progressive Web App) hai. Jab aap website open karte hain, toh niche 'Install App' ka button dikhayi deta hai. Us par click karke aap ise apne phone ki home screen par app ki tarah save kar sakte hain."
            },
            {
                question: "Doubt hone par help kaise milegi?",
                answer: "Aapko koi bhi doubt ya samasya ho, toh login karke screen ke niche diye gaye 'Chat Widget' ka upyog karein. Humari support team aapko wahan turant sahayata pradan karegi."
            }
        ]
    }
];

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 bg-secondary/30 min-h-screen">
       <div className="max-w-4xl mx-auto space-y-12">
         
         <ScrollAnimation>
            <div className="text-center space-y-4">
                 <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-2">
                    <HelpCircle className="h-12 w-12 text-primary" />
                </div>
                <h1 className="font-headline text-4xl md:text-6xl font-black tracking-tight text-primary">Help Center</h1>
                 <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                    StudyScript se jude aapke har sawaal ka jawab yahan milega.
                </p>
            </div>
         </ScrollAnimation>

         <div className="space-y-12">
            {faqSections.map((section, sIndex) => (
                <ScrollAnimation key={sIndex} delay={sIndex * 100}>
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-primary/10 pb-4">
                            <div className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                                <section.icon className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold font-headline">{section.title}</h2>
                        </div>

                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {section.items.map((faq, index) => (
                                <AccordionItem 
                                    value={`item-${sIndex}-${index}`} 
                                    key={index} 
                                    className="border-none bg-white rounded-2xl shadow-sm px-6 overflow-hidden transition-all hover:shadow-md"
                                >
                                    <AccordionTrigger className="text-left font-bold text-lg py-5 hover:no-underline hover:text-primary">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-base text-muted-foreground pb-6 leading-relaxed">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </ScrollAnimation>
            ))}
         </div>

         <ScrollAnimation delay={500}>
            <Card className="bg-primary text-primary-foreground border-none rounded-[2rem] overflow-hidden shadow-2xl">
                <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div className="space-y-2">
                        <h3 className="text-2xl md:text-3xl font-black font-headline">Abhi bhi koi sawaal hai?</h3>
                        <p className="text-primary-foreground/80 font-medium">Humari team aapki madad ke liye taiyar hai.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <a href="mailto:studyscript001@gmail.com">
                            <button className="bg-white text-primary font-bold px-8 py-3 rounded-full hover:bg-opacity-90 transition-all shadow-lg">
                                Email Us
                            </button>
                        </a>
                        <button 
                            onClick={() => {
                                const toggle = document.getElementById('chat-widget-toggle');
                                if(toggle) toggle.click();
                            }}
                            className="bg-primary-foreground/10 border-2 border-white/20 text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition-all"
                        >
                            Open Chat
                        </button>
                    </div>
                </CardContent>
            </Card>
         </ScrollAnimation>

       </div>
    </div>
  );
}
