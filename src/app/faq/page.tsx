
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

const faqs = [
    {
        question: "StudyScript kya hai?",
        answer: "StudyScript ek modern e-learning platform hai jo academic (jaise Class 8th-12th) aur professional courses pradan karta hai. Hamara maqsad high-quality education ko sabke liye accessible aur engaging banana hai."
    },
    {
        question: "Kya main koi content free mein dekh sakta hoon?",
        answer: "Haan! Hamare structured academic courses mein, har subject ka pehla chapter bilkul free hai. Yeh aapko hamare teaching style ko samajhne mein madad karta hai."
    },
    {
        question: "Poora subject ya course kaise unlock karun?",
        answer: "Pehle chapter ke alawa baaki saare chapters ko access karne ke liye aapko uss subject ko khareedna (purchase) hoga. Professional courses ko bhi aap unke page se khareed sakte hain."
    },
    {
        question: "Maine jo courses khareede hain, woh mujhe kahan milenge?",
        answer: "Aapke saare khareede hue courses aur subjects aapko 'My Courses' section mein milenge. Login karne ke baad yeh option aapko menu mein dikhega."
    },
    {
        question: "Payment ke kya options hain?",
        answer: "Hum Razorpay ke through Card, Netbanking, aur Wallet payments accept karte hain. Saath hi, aap UPI ke through bhi payment kar sakte hain. UPI payment verification mein 24 ghante tak lag sakte hain."
    },
    {
        question: "Kya StudyScript ka mobile app hai?",
        answer: "Haan! Aap hamari website ko apne mobile browser mein kholkar 'Install App' button se PWA (Progressive Web App) install kar sakte hain. Yeh bilkul ek app ki tarah kaam karta hai."
    },
    {
        question: "Agar mujhe koi samasya aati hai to main aapse kaise sampark karun?",
        answer: "Sabse tej sahayata ke liye, login karne ke baad neeche diye gaye chat widget ka istemal karein. Aap humein 'Contact' page par diye gaye email par bhi sampark kar sakte hain."
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
                    Aapke aam sawaalon ke jawab yahan hain.
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
