
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
            <CardContent className="p-8 space-y-8 text-left">

                <div className="space-y-4">
                    <h2 className="font-headline text-2xl font-semibold">Disclaimer (English)</h2>
                    <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground">
                        <li>
                            <strong>Educational Purpose Only:</strong> The information and materials provided on StudyScript are for general educational and informational purposes only. The content is self-made and is not intended to be a substitute for professional advice.
                        </li>
                        <li>
                            <strong>No Guarantee of Accuracy:</strong> While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information, products, or services contained in the application. Any reliance you place on such information is strictly at your own risk.
                        </li>
                        <li>
                            <strong>Personal Responsibility:</strong> You are responsible for your own learning and the application of knowledge. We are not liable for any academic or career outcomes. The results from quizzes and courses are for self-assessment and do not guarantee success in formal examinations.
                        </li>
                        <li>
                            <strong>For Minors (Under 18):</strong> If you are a minor, you must use our Service under the supervision and with the consent of a parent or legal guardian. Please do not provide any personal information without their permission and guidance.
                        </li>
                        <li>
                            <strong>External Links:</strong> Our application may contain links to external websites that are not provided or maintained by or in any way affiliated with us. Please note that we do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
                        </li>
                         <li>
                            <strong>Content Ownership:</strong> All content, including text, videos, PDFs, and quiz questions, is the property of StudyScript unless otherwise stated. Unauthorized use, reproduction, or distribution is strictly prohibited.
                        </li>
                        <li>
                            <strong>Changes to Content:</strong> We reserve the right to modify, update, or remove content from the application at any time without prior notice.
                        </li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h2 className="font-headline text-2xl font-semibold">अस्वीकरण (हिन्दी)</h2>
                    <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground">
                        <li>
                            <strong>केवल शैक्षिक उद्देश्य:</strong> स्टडीस्क्रिप्ट पर प्रदान की गई जानकारी और सामग्री केवल सामान्य शैक्षिक और सूचनात्मक उद्देश्यों के लिए है। यह सामग्री स्व-निर्मित है और इसका उद्देश्य किसी भी प्रकार की पेशेवर सलाह का विकल्प बनना नहीं है।
                        </li>
                        <li>
                            <strong>सटीकता की कोई गारंटी नहीं:</strong> यद्यपि हम सटीक और नवीनतम जानकारी प्रदान करने का प्रयास करते हैं, हम आवेदन में निहित जानकारी, उत्पादों, या सेवाओं की पूर्णता, सटीकता, विश्वसनीयता, या उपयुक्तता के बारे में किसी भी प्रकार की कोई वारंटी, व्यक्त या निहित, नहीं देते हैं। ऐसी जानकारी पर आपका कोई भी भरोसा सख्ती से आपके अपने जोखिम पर है।
                        </li>
                        <li>
                            <strong>व्यक्तिगत जिम्मेदारी:</strong> आप अपने सीखने और ज्ञान के उपयोग के लिए स्वयं जिम्मेदार हैं। हम किसी भी अकादमिक या करियर परिणाम के लिए उत्तरदायी नहीं हैं। क्विज़ और पाठ्यक्रमों के परिणाम स्व-मूल्यांकन के लिए हैं और औपचारिक परीक्षाओं में सफलता की गारंटी नहीं देते हैं।
                        </li>
                        <li>
                            <strong>नाबालिगों के लिए (18 वर्ष से कम):</strong> यदि आप नाबालिग हैं, तो आपको हमारी सेवा का उपयोग माता-पिता या कानूनी अभिभावक की देखरेख और सहमति से ही करना चाहिए। कृपया उनकी अनुमति और मार्गदर्शन के बिना कोई भी व्यक्तिगत जानकारी प्रदान न करें।
                        </li>
                        <li>
                            <strong>बाहरी लिंक:</strong> हमारे आवेदन में बाहरी वेबसाइटों के लिंक हो सकते हैं जो हमारे द्वारा प्रदान या अनुरक्षित नहीं हैं और न ही किसी भी तरह से हमसे संबद्ध हैं। कृपया ध्यान दें कि हम इन बाहरी वेबसाइटों पर किसी भी जानकारी की सटीकता, प्रासंगिकता, समयबद्धता, या पूर्णता की गारंटी नहीं देते हैं।
                        </li>
                        <li>
                            <strong>सामग्री का स्वामित्व:</strong> पाठ, वीडियो, पीडीएफ और प्रश्नोत्तरी प्रश्नों सहित सभी सामग्री, स्टडीस्क्रिप्ट की संपत्ति है, जब तक कि अन्यथा न कहा गया हो। अनधिकृत उपयोग, पुनरुत्पादन, या वितरण सख्त वर्जित है।
                        </li>
                        <li>
                            <strong>सामग्री में परिवर्तन:</strong> हम बिना किसी पूर्व सूचना के किसी भी समय आवेदन से सामग्री को संशोधित करने, अद्यतन करने, या हटाने का अधिकार सुरक्षित रखते हैं।
                        </li>
                    </ul>
                </div>
            </CardContent>
         </Card>
       </div>
    </div>
  );
}
