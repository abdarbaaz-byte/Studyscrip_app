
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
        question: "Quizzes kaise kaam karte hain? Kya live quizzes mein rank aati hai?",
        answer: "Humare paas do tarah ke quizzes hain: Practice aur Live. Practice quizzes aap kabhi bhi de sakte hain apni taiyari check karne ke liye. Live quizzes ek fix time par hote hain aur sabhi students ek saath hissa lete hain. Live quiz ke baad aapki rank bhi list mein dikhai jaati hai."
    },
    {
        question: "'AI Doubt Solver' kya hai?",
        answer: "Yeh aapka personal AI study partner hai. Aap padhai se juda koi bhi sawaal (kisi bhi subject ka) isse pooch sakte hain aur yeh aapko aasan bhasha mein samjhane ki koshish karega. Yeh 24/7 aapki madad ke liye uplabdh hai."
    },
    {
        question: "'Free Notes' aur 'Bookstore' structured courses se kaise alag hain?",
        answer: "Courses mein chapter-wise video, PDF, aur images hote hain. 'Free Notes' section mein extra study material hota hai jo courses ka hissa nahi hai. 'Bookstore' ek free digital library hai jahan se aap PDF books download kar sakte hain."
    },
    {
        question: "Live Classes kya hain aur main unhe kaise join kar sakta hoon?",
        answer: "Yeh real-time interactive classes hain jo hum schedule karte hain. Agar aapne koi aisa course ya subject khareeda hai jiske liye live class hai, to class shuru hone par aapko join karne ka button dikhega. Aap 'Live Classes' survey form bhar kar bhi bata sakte hain ki aap kis topic par live class chahte hain."
    },
    {
        question: "Course poora karne ke baad kya mujhe certificate milega?",
        answer: "Haan! Kai courses poora karne par aapko certificate milta hai. Admin aapke liye certificate assign kar sakte hain. Aap apne saare certificates 'My Profile' page par dekh aur download kar sakte hain."
    },
    {
        question: "Kya StudyScript Google Play Store ya Apple App Store par available hai?",
        answer: "Abhi nahi, lekin hum is par tezi se kaam kar rahe hain! Hamari team dedicatedly Play Store aur App Store ke liye kaam kar rahi hai. Jald hi aap wahan se bhi StudyScript download kar payenge. Tab tak, aap hamari website ko apne mobile browser mein kholkar 'Install App' button se App install kar sakte hain."
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
