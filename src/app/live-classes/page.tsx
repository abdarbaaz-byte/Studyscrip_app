
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Radio, Send, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { saveLiveClassSurvey } from "@/lib/data";
import { Input } from "@/components/ui/input";

export default function LiveClassesPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(event.currentTarget);
    const surveyData = {
        userName: formData.get('user_name') as string,
        userMobile: formData.get('user_mobile') as string,
        subjectInterest: formData.get('subject_interest') as string,
        otherTopics: formData.get('other_topics') as string,
        preferredTime: formData.get('preferred_time') as string,
        userId: user?.uid || null,
        userEmail: user?.email || null,
    };

    try {
      await saveLiveClassSurvey(surveyData);
      toast({
        title: "Thank You!",
        description: "Your feedback has been submitted successfully.",
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit survey:", error);
       toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Could not save your feedback. Please try again.",
      });
    } finally {
        setIsSubmitting(false);
    }
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <Label htmlFor="user_name">Full Name</Label>
                        <Input id="user_name" name="user_name" placeholder="Your full name" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="user_mobile">Mobile Number</Label>
                        <Input id="user_mobile" name="user_mobile" type="tel" placeholder="Your mobile number" required />
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-lg font-semibold">Which subjects are you most interested in for live classes?</Label>
                    <RadioGroup name="subject_interest" defaultValue="math" required>
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
                    <RadioGroup name="preferred_time" defaultValue="evening" required>
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

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                    {isSubmitting ? 'Submitting...' : 'Submit Survey'}
                </Button>

              </form>
            </CardContent>
         </Card>
       </div>
    </div>
  );
}
