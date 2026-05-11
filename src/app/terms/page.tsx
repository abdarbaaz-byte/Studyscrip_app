
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ShieldCheck, Scale, AlertCircle, Gift } from "lucide-react";
import { ScrollAnimation } from "@/components/scroll-animation";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 bg-secondary/50">
      <div className="max-w-4xl mx-auto">
        <ScrollAnimation>
          <Card className="shadow-lg border-none overflow-hidden">
            <CardHeader className="text-center pb-8 border-b bg-background">
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Scale className="h-12 w-12 text-primary" />
                </div>
              </div>
              <CardTitle className="font-headline text-4xl md:text-5xl font-black tracking-tight text-primary">
                Terms & Conditions
              </CardTitle>
              <CardDescription className="text-md md:text-lg text-muted-foreground pt-4 font-medium">
                Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 md:p-12 space-y-12 text-base leading-relaxed bg-white">
              <p className="text-lg text-muted-foreground border-l-4 border-primary/20 pl-6 italic">
                Welcome to StudyScript. By accessing or using our platform, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
              </p>

              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-primary/10 pb-2">
                  <ShieldCheck className="text-primary h-7 w-7" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">1. User Accounts</h2>
                </div>
                <ul className="list-disc list-outside space-y-4 text-muted-foreground pl-5">
                  <li className="pl-2">To access most features, you must register for an account. You are responsible for maintaining the confidentiality of your login credentials.</li>
                  <li className="pl-2"><strong>One Device Policy:</strong> For security reasons, your account can only be active on one device at a time. Simultaneous login from multiple devices will result in automatic logout from previous sessions.</li>
                  <li className="pl-2">You must provide accurate and complete information when creating an account.</li>
                </ul>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-primary/10 pb-2">
                  <FileText className="text-primary h-7 w-7" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">2. Content & Usage</h2>
                </div>
                <ul className="list-disc list-outside space-y-4 text-muted-foreground pl-5">
                  <li className="pl-2">All study materials, including PDFs, videos, and quizzes, are the intellectual property of StudyScript.</li>
                  <li className="pl-2">Unauthorized sharing, distribution, or re-selling of premium content is strictly prohibited and may lead to legal action and account termination.</li>
                  <li className="pl-2">The platform is provided for educational purposes only. While we aim for excellence, we do not guarantee specific exam results.</li>
                </ul>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-primary/10 pb-2">
                  <Scale className="text-primary h-7 w-7" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">3. Payments & Refunds</h2>
                </div>
                <ul className="list-disc list-outside space-y-4 text-muted-foreground pl-5">
                  <li className="pl-2"><strong>Razorpay:</strong> Payments made via Razorpay grant immediate access to the purchased content.</li>
                  <li className="pl-2"><strong>UPI Payments:</strong> For manual UPI payments, access is granted only after verification of the Transaction ID. This process can take up to <strong>24 hours</strong>.</li>
                  <li className="pl-2"><strong>Refund Policy:</strong> Due to the digital nature of our content, all purchases are final and non-refundable once access is granted.</li>
                </ul>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-primary/10 pb-2">
                  <Gift className="text-primary h-7 w-7" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">4. Referral Program</h2>
                </div>
                <p className="text-muted-foreground pl-5 border-l-2 border-primary/10">
                  Users can earn rewards through our "Share & Earn" program. Any attempt to manipulate the system using fake accounts or bots will result in disqualification and loss of earned rewards.
                </p>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-primary/10 pb-2">
                  <AlertCircle className="text-primary h-7 w-7" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">5. User Conduct</h2>
                </div>
                <p className="text-muted-foreground pl-5 border-l-2 border-primary/10">
                  In Batch Discussion Groups and Support Chats, users must maintain decorum. Abusive language, spamming, or sharing irrelevant links will lead to a permanent ban from the chat features.
                </p>
              </section>

              <div className="pt-12 border-t border-primary/20 text-center">
                <p className="text-sm text-muted-foreground bg-secondary/50 p-6 rounded-2xl inline-block max-w-md">
                  If you have any questions regarding these terms, please contact us at <a href="mailto:studyscript001@gmail.com" className="text-primary font-bold hover:underline">studyscript001@gmail.com</a>.
                </p>
              </div>
            </CardContent>
          </Card>
        </ScrollAnimation>
      </div>
    </div>
  );
}
