import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 bg-secondary/50">
       <div className="max-w-4xl mx-auto">
         <Card className="shadow-lg">
            <CardHeader className="text-center">
                 <div className="flex justify-center mb-4">
                    <AlertTriangle className="h-16 w-16 text-primary" />
                </div>
                <CardTitle className="font-headline text-3xl md:text-4xl">Disclaimer</CardTitle>
                 <CardDescription className="text-md md:text-lg text-muted-foreground pt-2">
                    Important information about StudyScript platform and content.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">

                <div className="space-y-4">
                    <h2 className="font-headline text-2xl font-semibold">General Disclaimer</h2>
                    <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground">
                        <li className="text-justify">
                            <strong>Educational Purpose Only:</strong> The content provided on StudyScript, including videos, PDFs, and notes, is for general educational purposes. While we strive for accuracy, the content is self-made and should not be treated as official textbook material.
                        </li>
                        <li className="text-justify">
                            <strong>UPI Payments:</strong> Manual UPI payments are verified by our team. Please note that it may take up to <strong>24 hours</strong> to grant access after you submit your UPI Reference ID. Ensure you provide the correct ID to avoid delays.
                        </li>
                        <li className="text-justify">
                            <strong>Referral Program:</strong> Referral rewards and "Free Access" are subject to verification. Users found using fraudulent methods to increase referral counts will be disqualified, and their access may be revoked.
                        </li>
                        <li className="text-justify">
                            <strong>Bookstore Downloads:</strong> Access to the Bookstore is free but requires a mandatory user login. This is done to prevent bot downloads and maintain the quality of our service.
                        </li>
                        <li className="text-justify">
                            <strong>Live Classes & Quizzes:</strong> Scheduled times for Live Classes and Live Quizzes are subject to change. While we aim to provide a stable experience, we are not responsible for technical issues arising from the user's internet connection or device compatibility.
                        </li>
                         <li className="text-justify">
                            <strong>Content Ownership:</strong> All materials on this platform are owned by StudyScript. Unauthorized distribution or copying of our premium content is strictly prohibited and may lead to legal action.
                        </li>
                    </ul>
                </div>
            </CardContent>
         </Card>
       </div>
    </div>
  );
}
