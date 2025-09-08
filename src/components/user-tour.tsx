
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, BookOpen, MessageCircleQuestion, LayoutGrid, CheckCircle } from 'lucide-react';
import { Progress } from './ui/progress';

interface UserTourProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: () => void;
}

const tourSteps = [
  {
    icon: BookOpen,
    title: 'Start Your Learning Journey',
    description: "Welcome to StudyScript! Here you'll find all the subjects for your class. Just click on a class to see the available subjects and chapters.",
  },
  {
    icon: MessageCircleQuestion,
    title: 'AI Doubt Solver',
    description: "Have a question? Our AI Doubt Solver is here to help you 24/7 with any academic or platform-related query. You can find it in the main menu.",
  },
  {
    icon: LayoutGrid,
    title: 'Access Your Content',
    description: "All your purchased courses and subjects will appear in the 'My Courses' section. It's your personal library for everything you've unlocked.",
  },
  {
    icon: CheckCircle,
    title: "You're All Set!",
    description: "You are ready to explore and learn. We wish you all the best on your learning journey. Happy learning!",
  }
];

export function UserTour({ open, onOpenChange, onFinish }: UserTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    onFinish();
    onOpenChange(false);
  }

  const { icon: Icon, title, description } = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
             <Icon className="w-8 h-8" />
          </div>
          <DialogTitle className="font-headline text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-base">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className='py-4'>
            <Progress value={progress} />
        </div>

        <DialogFooter className="flex justify-between w-full">
          {currentStep > 0 && !isLastStep && (
            <Button variant="outline" onClick={handlePrev}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
          )}

          {isLastStep ? (
             <Button onClick={handleFinish} className="w-full">
                Let's Get Started!
             </Button>
          ) : (
            <Button onClick={handleNext} className={currentStep === 0 ? 'w-full' : ''}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
