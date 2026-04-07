import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

const faqs = [
    {
        question: "StudyScript kya hai?",
        answer: "StudyScript ek modern e-learning platform hai jo academic (Class 5th-12th) aur professional 'Exam Resources' pradan karta hai. Hamara maqsad quality education ko sabke liye affordable aur digital banana hai."
    },
    {
        question: "Kya main koi content free mein dekh sakta hoon?",
        answer: "Haan! Academic courses mein har subject ka pehla chapter bilkul free hai. Iske alawa 'Free Notes', 'Bookstore', 'Games', aur 'Audio Lectures' sections bhi sabhi users ke liye available hain."
    },
    {
        question: "Bookstore se download kaise karein?",
        answer: "Bookstore se koi bhi PDF download karne ke liye aapka 'Login' hona zaroori hai. Agar aapne account nahi banaya hai, toh pehle signup karein aur phir bookstore ka upyog karein."
    },
    {
        question: "Payment ke kya options hain?",
        answer: "Hum do tarah ke payments accept karte hain: 1. Razorpay (Card, Netbanking, Wallets) jo turant access deta hai. 2. UPI Payment, jahan aapko payment ke baad Transaction ID submit karni hogi. UPI verification mein 24 ghante lag sakte hain."
    },
    {
        question: "Referral System kya hai aur rewards kaise milenge?",
        answer: "Har user ka ek unique referral code hota hai jo 'Share & Earn' page par mil jayega. Jab aapke link se koi naya user join karta hai, toh aapka referral count badh jayega. Rewards (jaise Free Access) paane ke liye aapko hamare Chat Support par message karna hoga."
    },
    {
        question: "Maine jo khareeda hai woh kahan dikhega?",
        answer: "Aapke saare purchased courses, subjects aur batches aapko 'My Learning' section mein milenge. Aap apni profile mein jaakar apni payment history bhi dekh sakte hain."
    },
    {
        question: "Live Classes aur Quizzes mein kaise judein?",
        answer: "Live classes ka schedule dashboard aur notifications mein dikhayi deta hai. Agar aapne wo course khareeda hai, toh class shuru hone par aapko 'Join Live' button dikhega. Live quizzes fix time par hote hain jahan aap apni rank dekh sakte hain."
    },
    {
        question: "Ek account ko kitne devices par chala sakte hain?",
        answer: "Security ke liye, ek account ek waqt mein ek hi device par chal sakta hai. Agar aap kisi dusre phone mein login karenge, toh purane waale se apne aap logout ho jayega."
    },
    {
        question: "Doubt hone par support kaise milega?",
        answer: "Sabse tej sahayata ke liye login karke niche diye gaye 'Chat Widget' ka istemal karein. Hamari support team aapke sawalon ka jawab wahi degi."
    },
];


export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 bg-secondary/50">
       <div className="max-w-4xl mx-auto">
         <Card className="shadow-lg">
            <CardHeader className="text-center">
                 <div className="flex justify-center mb-4">
                    <HelpCircle className="h-16 w-16 text-primary" />
                </div>
                <CardTitle className="font-headline text-3xl md:text-4xl">Frequently Asked Questions (FAQs)</CardTitle>
                 <CardDescription className="text-md md:text-lg text-muted-foreground pt-2">
                    StudyScript se jude aapke aam sawaalon ke jawab yahan hain.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, index) => (
                         <AccordionItem value={`item-${index}`} key={index} className="border rounded-lg bg-background px-4">
                            <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground pt-2">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
         </Card>
       </div>
    </div>
  );
}
