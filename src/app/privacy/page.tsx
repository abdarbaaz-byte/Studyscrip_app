
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
            <CardContent className="p-8 space-y-6 text-base">
                <p>This Privacy Policy describes how StudyScript ("we", "us", or "our") collects, uses, and shares information about you when you use our web application (the "Service").</p>
                
                <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">1. Information We Collect</h2>
                    <ul className="list-disc list-inside space-y-1 pl-4">
                        <li><strong>Account Information:</strong> When you create an account, we collect your email address and password. Your password is encrypted and we cannot see it.</li>
                        <li><strong>Payment Information:</strong> For course purchases, we use third-party payment processors like Razorpay. We do not store your credit card details. We only store a record of the transaction, including the item purchased and payment status.</li>
                        <li><strong>Purchase History:</strong> We maintain a record of the courses and subjects you purchase to grant you access to the content.</li>
                        <li><strong>Chat Data:</strong> We store your conversations with our support team to provide better service and maintain a history of your queries.</li>
                        <li><strong>Quiz Information:</strong> When you attempt a quiz, we collect your name, school name, class, and place, along with your quiz answers and score. This information is linked to your user account and is used to display your results and for our internal analysis.</li>
                        <li><strong>Live Class Survey Information:</strong> If you participate in a survey for live classes, we collect your name and mobile number, along with your preferences for subjects and timings. This helps us plan our live classes better.</li>
                        <li><strong>Review Information:</strong> If you choose to submit a review, we collect your name, class name, and the comment you provide. Your review will be stored and may be displayed publicly on our website after it has been approved by our team.</li>
                        <li><strong>Usage Information:</strong> We may collect information about how you use the Service, such as the pages you visit and the content you access. This is to improve our app.</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">2. How We Use Your Information</h2>
                     <ul className="list-disc list-inside space-y-1 pl-4">
                        <li>To provide, maintain, and improve our Service.</li>
                        <li>To process your transactions and grant you access to purchased content.</li>
                        <li>To manage and display quiz results.</li>
                        <li>To plan and inform you about live classes based on survey feedback.</li>
                        <li>To communicate with you, including responding to your support requests and sending important notifications.</li>
                        <li>To personalize your learning experience.</li>
                        <li>To display student reviews on our platform to help other users.</li>
                        <li>To enforce our terms and prevent fraudulent activities.</li>
                    </ul>
                </div>
                
                 <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">3. Information Sharing</h2>
                    <p>We do not sell or rent your personal information to third parties. We may share information with:</p>
                     <ul className="list-disc list-inside space-y-1 pl-4">
                        <li>Service providers who perform services on our behalf, such as payment processing (Razorpay) and database management (Firebase).</li>
                        <li>If required by law or to protect the rights and safety of our users and the public.</li>
                    </ul>
                </div>

                 <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">4. Data Security</h2>
                    <p>We take reasonable measures to protect your information from unauthorized access or disclosure. We use services like Firebase Authentication and Firestore which have robust security measures. However, no internet-based service is 100% secure.</p>
                </div>

                <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">5. Your Choices</h2>
                    <p>You can access and update your account information by logging in. You can also contact us through the support chat to inquire about your data.</p>
                </div>
                
                <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">6. Changes to This Policy</h2>
                    <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
                </div>

                 <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please use the chat feature available on our platform after logging in.</p>
                </div>

            </CardContent>
         </Card>
       </div>
    </div>
  );
}
