import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ShieldCheck, Scale, AlertCircle } from "lucide-react";
import { ScrollAnimation } from "@/components/scroll-animation";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 bg-secondary/50">
      <div className="max-w-4xl mx-auto">
        <ScrollAnimation>
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Scale className="h-16 w-16 text-primary" />
              </div>
              <CardTitle className="font-headline text-3xl md:text-4xl">Terms & Conditions</CardTitle>
              <CardDescription className="text-md md:text-lg text-muted-foreground pt-2">
                Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8 text-base">
              <p className="text-muted-foreground italic">
                Welcome to StudyScript. By accessing or using our platform, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
              </p>

              <section className="space-y-4">
                <div className="flex items-center gap-2 font-headline text-2xl font-semibold">
                  <ShieldCheck className="text-primary h-6 w-6" />
                  <h2>1. User Accounts</h2>
                </div>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                  <li>To access most features, you must register for an account. You are responsible for maintaining the confidentiality of your login credentials.</li>
                  <li><strong>One Device Policy:</strong> For security reasons, your account can only be active on one device at a time. Simultaneous login from multiple devices will result in automatic logout from previous sessions.</li>
                  <li>You must provide accurate and complete information when creating an account.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 font-headline text-2xl font-semibold">
                  <FileText className="text-primary h-6 w-6" />
                  <h2>2. Content & Usage</h2>
                </div>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                  <li>All study materials, including PDFs, videos, and quizzes, are the intellectual property of StudyScript.</li>
                  <li>Unauthorized sharing, distribution, or re-selling of premium content is strictly prohibited and may lead to legal action and account termination.</li>
                  <li>The platform is provided for educational purposes only. While we aim for excellence, we do not guarantee specific exam results.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 font-headline text-2xl font-semibold">
                  <AlertCircle className="text-primary h-6 w-6" />
                  <h2>3. Payments & Refunds</h2>
                </div>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                  <li><strong>Razorpay:</strong> Payments made via Razorpay grant immediate access to the purchased content.</li>
                  <li><strong>UPI Payments:</strong> For manual UPI payments, access is granted only after verification of the Transaction ID. This process can take up to <strong>24 hours</strong>.</li>
                  <li><strong>Refund Policy:</strong> Due to the digital nature of our content, all purchases are final and non-refundable once access is granted.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 font-headline text-2xl font-semibold">
                  <FileText className="text-primary h-6 w-6" />
                  <h2>4. Referral Program</h2>
                </div>
                <p className="text-muted-foreground pl-4">
                  Users can earn rewards through our "Share & Earn" program. Any attempt to manipulate the system using fake accounts or bots will result in disqualification and loss of earned rewards.
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 font-headline text-2xl font-semibold">
                  <AlertCircle className="text-primary h-6 w-6" />
                  <h2>5. User Conduct</h2>
                </div>
                <p className="text-muted-foreground pl-4">
                  In Batch Discussion Groups and Support Chats, users must maintain decorum. Abusive language, spamming, or sharing irrelevant links will lead to a permanent ban from the chat features.
                </p>
              </section>

              <div className="pt-8 border-t border-primary/10 text-center">
                <p className="text-sm text-muted-foreground">
                  If you have any questions regarding these terms, please contact us at <a href="mailto:studyscript001@gmail.com" className="text-primary hover:underline">studyscript001@gmail.com</a>.
                </p>
              </div>
            </CardContent>
          </Card>
        </ScrollAnimation>
      </div>
    </div>
  );
}
