
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Radio, Send, CheckCircle } from "lucide-react";

export default function LiveClassesPage() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // In a real app, you would send this data to your backend.
    // For this prototype, we'll just show a success message.
    console.log("Survey submitted:", new FormData(event.currentTarget));
    toast({
      title: "Thank You!",
      description: "Your feedback has been submitted successfully.",
    });
    setSubmitted(true);
  };
  
  if (submitted) {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12 flex items-center justify-center min-h-[60vh]">
             <div className="max-w-2xl mx-auto">
                <Card className="text-center shadow-lg p-8">
                     <div className="flex justify-center mb-4">
                        <CheckCircle className="h-20 w-20 text-green-500" />
                    </div>
                    <CardTitle className="font-headline text-3xl md:text-4xl">Thank You!</CardTitle>
                    <CardDescription className="text-md md:text-lg text-muted-foreground pt-2">
                       Your survey has been submitted. We will notify you when live classes are available.
                    </CardDescription>
                 </Card>
            </div>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
       <div className="max-w-2xl mx-auto">
         <Card className="shadow-lg">
            <CardHeader className="text-center">
                 <div className="flex justify-center mb-4">
                    <Radio className="h-16 w-16 text-primary" />
                </div>
                <CardTitle className="font-headline text-3xl md:text-4xl">Live Classes Survey</CardTitle>
                <CardDescription className="text-md md:text-lg text-muted-foreground pt-2">
                    Help us understand what you want to learn. Your feedback is important!
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="space-y-4">
                    <Label className="text-lg font-semibold">Which subjects are you most interested in for live classes?</Label>
                    <RadioGroup name="subject_interest" defaultValue="math">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="math" id="math" />
                            <Label htmlFor="math">Mathematics</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <RadioGroupItem value="science" id="science" />
                            <Label htmlFor="science">Science (Physics, Chemistry, Biology)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="social" id="social" />
                            <Label htmlFor="social">Social Studies / History</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="language" id="language" />
                            <Label htmlFor="language">English / Hindi</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <RadioGroupItem value="professional" id="professional" />
                            <Label htmlFor="professional">Professional Skills (e.g., Web Development)</Label>
                        </div>
                    </RadioGroup>
                </div>
                
                 <div className="space-y-4">
                    <Label className="text-lg font-semibold" htmlFor="other_topics">Are there any other specific topics you'd like to see covered in live classes?</Label>
                     <Textarea 
                        id="other_topics"
                        name="other_topics"
                        placeholder="e.g., Exam preparation strategies, advanced coding, etc." 
                        rows={4}
                     />
                </div>

                <div className="space-y-4">
                    <Label className="text-lg font-semibold">What is the best time for you to attend live classes?</Label>
                    <RadioGroup name="preferred_time" defaultValue="evening">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="morning" id="morning" />
                            <Label htmlFor="morning">Morning (8 AM - 12 PM)</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <RadioGroupItem value="afternoon" id="afternoon" />
                            <Label htmlFor="afternoon">Afternoon (1 PM - 5 PM)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="evening" id="evening" />
                            <Label htmlFor="evening">Evening (6 PM - 9 PM)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="weekends" id="weekends" />
                            <Label htmlFor="weekends">Weekends Only</Label>
                        </div>
                    </RadioGroup>
                </div>

                <Button type="submit" size="lg" className="w-full">
                    <Send className="mr-2 h-5 w-5" />
                    Submit Survey
                </Button>

              </form>
            </CardContent>
         </Card>
       </div>
    </div>
  );
}
