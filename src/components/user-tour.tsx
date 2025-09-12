
"use client";

import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuth } from '@/hooks/use-auth';

interface UserTourProps {
  active: boolean;
  onFinish: () => void;
}

export function UserTour({ active, onFinish }: UserTourProps) {
  const { user } = useAuth();

  useEffect(() => {
    if (!active) {
      return;
    }

    const steps = [
      {
        element: '#tour-my-courses',
        popover: {
          title: 'My Courses',
          description: "All your purchased courses and subjects will appear here. It's your personal library for everything you've unlocked.",
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#tour-doubt-ai',
        popover: {
          title: 'AI Doubt Solver',
          description: "Have a question? Our AI Doubt Solver is here to help you 24/7 with any academic or platform-related query.",
        },
      },
       {
        element: '#tour-notifications',
        popover: {
          title: 'Notifications',
          description: 'Stay updated with important announcements and new course alerts right here.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#tour-whatsapp',
        popover: {
          title: 'Join our WhatsApp Channel',
          description: 'Join our WhatsApp channel to get the latest updates directly on your phone.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#tour-chat-widget',
        popover: {
          title: 'Live Chat Support',
          description: 'Need help from a person? Use this chat widget to talk directly with our support team.',
          side: 'top',
          align: 'end',
        },
      },
    ];

    // If user is logged in, show the My Courses button in header as well
    if (user) {
        steps.unshift({
             element: '#tour-header-my-courses',
             popover: {
                title: 'Access Your Learning',
                description: 'You can always access your purchased content from the "My Courses" button in the header.',
                side: 'bottom',
                align: 'start',
             }
        });
    }


    const driverObj = driver({
      showProgress: true,
      steps: steps,
      onDestroyStarted: () => {
        onFinish();
        driverObj.destroy();
      },
    });

    driverObj.drive();

  }, [active, onFinish, user]);

  return null; // This component does not render anything itself
}
