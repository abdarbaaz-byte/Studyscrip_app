import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 bg-secondary/50">
       <div className="max-w-4xl mx-auto">
         <Card className="shadow-lg">
            <CardHeader className="text-center">
                 <div className="flex justify-center mb-4">
                    <ShieldCheck className="h-16 w-16 text-primary" />
                </div>
                <CardTitle className="font-headline text-3xl md:text-4xl">Privacy Policy</CardTitle>
                 <CardDescription className="text-md md:text-lg text-muted-foreground pt-2">
                    Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6 text-base text-justify">
                <p>This Privacy Policy describes how StudyScript ("we", "us", or "our") collects, uses, and shares information about you when you use our web application (the "Service"). Your privacy is important to us, and we are committed to protecting your personal data.</p>
                
                <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">1. Information We Collect</h2>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, and password. We also generate a unique referral code for your account. You may optionally provide details like mobile number, school name, and class in your profile.</li>
                        <li><strong>Payment Information:</strong> For automated purchases, we use Razorpay. We do not store your credit card details. For manual UPI payments, we collect your UPI Reference ID to verify the transaction manually.</li>
                        <li><strong>Referral Data:</strong> We track who referred you (via referral links) and how many users you have successfully referred to our platform to manage rewards.</li>
                        <li><strong>Purchase and Access History:</strong> We maintain a record of the courses, subjects, and batches you purchase to provide you with seamless access.</li>
                        <li><strong>Activity Data:</strong> We store your quiz scores, game progress, and audio lecture usage to display them in your profile and manage rankings.</li>
                        <li><strong>Communication:</strong> Chat messages with our support team are stored to provide better assistance and resolve your queries.</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">2. How We Use Your Information</h2>
                     <ul className="list-disc list-inside space-y-2 pl-4">
                        <li>To process your transactions and verify manual UPI payments.</li>
                        <li>To manage the referral program and award benefits based on your referral count.</li>
                        <li>To provide access to the Bookstore, which requires a logged-in account for security and tracking.</li>
                        <li>To inform you about scheduled Live Classes and show relevant academic content based on your class.</li>
                        <li>To personalize your "My Learning" and profile sections.</li>
                        <li>To respond to your support requests via our integrated chat system.</li>
                    </ul>
                </div>
                
                 <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">3. Data Security & Sharing</h2>
                    <p>We do not sell your personal data. We use Firebase (by Google) for secure authentication and data storage. We share necessary information with Razorpay only to facilitate payments. We ensure that your session is protected, and logging in on a new device will automatically sign you out from previous ones for your security.</p>
                </div>

                <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">4. Your Choices</h2>
                    <p>You can update your profile information at any time through the "My Profile" page. You can also view your full payment history and certificates there. If you have any questions about your data, feel free to contact us through the Support Chat.</p>
                </div>

                 <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please use the chat feature available on our platform or email us at studyscript001@gmail.com.</p>
                </div>

            </CardContent>
         </Card>
       </div>
    </div>
  );
}
