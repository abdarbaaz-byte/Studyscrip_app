
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function FeedbackPage() {
  // Added &embedded=true to the URL for a better embedded experience
  const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSeCCWptdyHiXdAB0CbtuD7RT73XrRvtGQ88_w9wIoOVLmN7Cg/viewform?usp=header&embedded=true";

  return (
    <div className="container mx-auto px-0 py-4 md:px-4 md:py-8">
      <Card>
        <CardHeader className="text-center pb-2 md:pb-6">
          <CardTitle className="font-headline text-2xl md:text-4xl">Feedback Form</CardTitle>
          <CardDescription className="text-md md:text-lg text-muted-foreground pt-2">
            Your feedback is valuable to us.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-6 md:pt-0">
          <iframe
            src={formUrl}
            width="100%"
            height="1200px" // Increased height to show full form
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            className="w-full border-0 md:border rounded-lg"
            title="Feedback Form"
          >
            Loading…
          </iframe>
        </CardContent>
      </Card>
    </div>
  );
}
