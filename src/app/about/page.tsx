
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenCheck, Target, Video, MessageSquareHeart, GraduationCap } from "lucide-react";
import { ScrollAnimation } from "@/components/scroll-animation";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 bg-secondary/50">
      <div className="max-w-4xl mx-auto">
        <ScrollAnimation>
          <Card className="text-center shadow-lg">
            <CardHeader>
              <div className="flex justify-center mb-4">
                  <GraduationCap className="h-16 w-16 text-primary" />
              </div>
              <CardTitle className="font-headline text-4xl md:text-5xl">About StudyScript</CardTitle>
              <CardDescription className="text-lg md:text-xl text-muted-foreground pt-2">
                Your modern partner in digital learning.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-lg text-left space-y-6 p-8">
              <p>
                Welcome to <strong>StudyScript</strong>, a next-generation e-learning platform designed to make quality education accessible and engaging for everyone. We believe that learning should be flexible, interactive, and tailored to individual needs. Whether you're a student preparing for academic exams or a professional looking to upskill, StudyScript is here to guide you on your journey to success.
              </p>
              <p>
                Our platform is built on the foundation of providing comprehensive and high-quality content, seamlessly delivered through a modern and intuitive interface.
              </p>
            </CardContent>
          </Card>
        </ScrollAnimation>

        <div className="mt-12">
            <ScrollAnimation as="h2" className="text-3xl font-headline font-bold text-center mb-8">
              Our Core Features
            </ScrollAnimation>
            <div className="grid md:grid-cols-2 gap-8">

                <ScrollAnimation>
                  <Card>
                      <CardHeader className="flex flex-row items-center gap-4">
                          <BookOpenCheck className="w-8 h-8 text-primary" />
                          <CardTitle>Structured Academic & Professional Courses</CardTitle>
                      </CardHeader>
                      <CardContent>
                          We offer a wide range of courses, from detailed academic curricula for classes like 9th and 10th to professional courses designed to boost your career.
                      </CardContent>
                  </Card>
                </ScrollAnimation>
                
                <ScrollAnimation delay={100}>
                  <Card>
                      <CardHeader className="flex flex-row items-center gap-4">
                          <Video className="w-8 h-8 text-primary" />
                          <CardTitle>Rich Multimedia Content</CardTitle>
                      </CardHeader>
                      <CardContent>
                          Learn through a variety of formats including high-quality video lectures, detailed PDF notes, and interactive content to suit your learning style.
                      </CardContent>
                  </Card>
                </ScrollAnimation>

                <ScrollAnimation delay={200}>
                  <Card>
                      <CardHeader className="flex flex-row items-center gap-4">
                          <MessageSquareHeart className="w-8 h-8 text-primary" />
                          <CardTitle>Direct Support Chat</CardTitle>
                      </CardHeader>
                      <CardContent>
                          Have a doubt? Our integrated chat support allows you to connect directly with us for quick and easy resolution of your queries.
                      </CardContent>
                  </Card>
                </ScrollAnimation>

                 <ScrollAnimation delay={300}>
                    <Card>
                      <CardHeader className="flex flex-row items-center gap-4">
                          <Target className="w-8 h-8 text-primary" />
                          <CardTitle>Our Mission</CardTitle>
                      </CardHeader>
                      <CardContent>
                          Our mission is to empower learners by providing affordable, high-quality educational resources that are accessible anytime, anywhere. We are committed to helping you achieve your academic and professional goals.
                      </CardContent>
                  </Card>
                 </ScrollAnimation>

            </div>
        </div>

      </div>
    </div>
  );
}
