
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
                    Important information about our content.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6 text-center">
                <p className="text-lg md:text-xl">
                    The content provided in this application is self-made and is for educational purposes only. All rights to the content are reserved by us.
                </p>
                <p className="text-lg md:text-xl font-hindi">
                    इस एप्लिकेशन में प्रदान की गई सामग्री स्व-निर्मित है और केवल शैक्षिक उद्देश्यों के लिए है। सामग्री के सभी अधिकार हमारे पास सुरक्षित हैं।
                </p>
            </CardContent>
         </Card>
       </div>
    </div>
  );
}
