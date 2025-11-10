
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
                    Important information about our platform and content.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">

                <div className="space-y-4">
                    <h2 className="font-headline text-2xl font-semibold">Disclaimer</h2>
                    <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground">
                        <li className="text-justify">
                            <strong>Educational Purpose Only:</strong> The information and materials provided on StudyScript are for general educational and informational purposes only. The content is self-made and is not intended to be a substitute for professional advice.
                        </li>
                        <li className="text-justify">
                            <strong>No Guarantee of Accuracy:</strong> While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information, products, or services contained in the application. Any reliance you place on such information is strictly at your own risk.
                        </li>
                        <li className="text-justify">
                            <strong>Personal Responsibility:</strong> You are responsible for your own learning and the application of knowledge. We are not liable for any academic or career outcomes. The results from quizzes and courses are for self-assessment and do not guarantee success in formal examinations.
                        </li>
                        <li className="text-justify">
                            <strong>For Minors (Under 18):</strong> If you are a minor, you must use our Service under the supervision and with the consent of a parent or legal guardian. Please do not provide any personal information without their permission and guidance.
                        </li>
                        <li className="text-justify">
                            <strong>External Links:</strong> Our application may contain links to external websites that are not provided or maintained by or in any way affiliated with us. Please note that we do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
                        </li>
                         <li className="text-justify">
                            <strong>Content Ownership:</strong> All content, including text, videos, PDFs, and quiz questions, is the property of StudyScript unless otherwise stated. Unauthorized use, reproduction, or distribution is strictly prohibited.
                        </li>
                        <li className="text-justify">
                            <strong>Changes to Content:</strong> We reserve the right to modify, update, or remove content from the application at any time without prior notice.
                        </li>
                    </ul>
                </div>
            </CardContent>
         </Card>
       </div>
    </div>
  );
}
