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
                <p>This Privacy Policy describes how StudyScript ("we", "us", or "our") protects your privacy when you use our web application. We are committed to maintaining the confidentiality and security of your personal data.</p>
                
                <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">1. Information We Collect</h2>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        <li><strong>Account Information:</strong> When you create an account, we collect your name and email address. <strong>We do NOT collect or store your password;</strong> all authentication is securely handled by Firebase (Google), and your password is never visible to us.</li>
                        <li><strong>Optional Profile Details:</strong> You may choose to provide your mobile number, school name, class, and address to personalize your experience.</li>
                        <li><strong>Referral Data:</strong> We track your unique referral code and the number of users joined through your link to manage rewards.</li>
                        <li><strong>Payment Information:</strong> For automated purchases, we use Razorpay. We do not store your credit card or banking details. For manual UPI, we only collect the Reference ID for verification.</li>
                        <li><strong>Activity Data:</strong> We store your quiz scores and course progress to show your performance in your profile.</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">2. How We Use Your Information</h2>
                     <ul className="list-disc list-inside space-y-2 pl-4">
                        <li>To provide access to your purchased courses and academic content.</li>
                        <li>To manage the referral system and verify rewards.</li>
                        <li>To provide customer support via our integrated chat widget.</li>
                        <li>To keep you informed about important updates and live classes.</li>
                    </ul>
                </div>
                
                 <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">3. Data Security & Sharing</h2>
                    <p><strong>Your trust is our priority.</strong> We do not sell, rent, or share your personal details with any third parties for marketing or any other purposes. We use Firebase for industry-standard data encryption and security. Information is only shared with payment processors (Razorpay) when you initiate a transaction.</p>
                </div>

                <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">4. Your Control</h2>
                    <p>You have full control over your profile data. You can update or change your information anytime through the "My Profile" section. If you wish to delete your account or have any privacy concerns, you can contact us directly.</p>
                </div>

                 <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please use the <strong>Support Chat</strong> widget or email us at <strong>studyscript001@gmail.com</strong>.</p>
                </div>

            </CardContent>
         </Card>
       </div>
    </div>
  );
}
