
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
                        <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, and password. Your password is encrypted and we cannot see it. We may also collect optional details like your mobile number, school name, and class.</li>
                        <li><strong>Payment Information:</strong> For purchases, we use third-party payment processors (e.g., Razorpay). We do not store your full credit card details. We only store a record of the transaction, including the item purchased and payment status. For UPI payments, we collect and store your UPI reference ID for verification.</li>
                        <li><strong>Purchase and Access History:</strong> We maintain a record of the courses and subjects you purchase to grant you access to the content and manage your access rights.</li>
                        <li><strong>Game and Quiz Information:</strong> When you play games or attempt a quiz, we may collect your name, school name, class, and place, along with your answers and score. This information is linked to your user account and is used to display your results and for ranking in live quizzes.</li>
                        <li><strong>Chat Data:</strong> We store your conversations with our support team to provide better service and maintain a history of your queries.</li>
                        <li><strong>Live Class Survey Information:</strong> If you participate in a survey for live classes, we collect your name and mobile number, along with your preferences for subjects and timings. This helps us plan our live classes better.</li>
                        <li><strong>Review Information:</strong> If you choose to submit a review, we collect your name, class name, and the comment you provide. Your review will be stored and may be displayed publicly on our website after it has been approved by our team.</li>
                        <li><strong>Certificate Information:</strong> We may assign certificates to your profile. We store the certificate's title and its image URL, which are linked to your user account.</li>
                        <li><strong>Usage and Session Information:</strong> We may collect information about how you use the Service, such as pages visited. We also use a session token to ensure your account is not used on multiple devices simultaneously for security reasons.</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">2. How We Use Your Information</h2>
                     <ul className="list-disc list-inside space-y-2 pl-4">
                        <li>To provide, maintain, and improve our Service.</li>
                        <li>To process your transactions and grant you access to purchased content.</li>
                        <li>To create and manage your user account.</li>
                        <li>To display your quiz and game results, certificates, and manage rankings.</li>
                        <li>To plan and inform you about live classes based on survey feedback.</li>
                        <li>To communicate with you, including responding to your support requests and sending important notifications.</li>
                        <li>To personalize your learning experience.</li>
                        <li>To display student reviews on our platform to help other users.</li>
                        <li>To enforce our terms, prevent fraudulent activities, and maintain the security of our Service.</li>
                    </ul>
                </div>
                
                 <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">3. Information Sharing</h2>
                    <p>We do not sell or rent your personal information to third parties. We may share information with:</p>
                     <ul className="list-disc list-inside space-y-2 pl-4">
                        <li>Service providers who perform services on our behalf, such as payment processing (Razorpay), database management (Firebase), and AI model hosting.</li>
                        <li>Our authorized employees who require access to data to perform their duties, such as providing support or managing the platform. Access is granted on a need-to-know basis.</li>
                        <li>If required by law or to protect the rights and safety of our users and the public.</li>
                    </ul>
                </div>

                 <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">4. Data Security</h2>
                    <p>We take reasonable measures to protect your information from unauthorized access or disclosure. We use services like Firebase Authentication and Firestore which have robust security measures. However, no internet-based service is 100% secure.</p>
                </div>

                <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">5. Your Choices</h2>
                    <p>You can access and update your personal information through the "My Profile" page after logging in. You can also contact us through the support chat to inquire about your data.</p>
                </div>
                
                <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">6. Changes to This Policy</h2>
                    <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and, if the changes are significant, we may provide a more prominent notice.</p>
                </div>

                 <div className="space-y-2">
                    <h2 className="font-headline text-2xl font-semibold">Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please use the chat feature available on our platform after logging in or email us at our support address mentioned on the Contact page.</p>
                </div>

            </CardContent>
         </Card>
       </div>
    </div>
  );
}
