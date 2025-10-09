
import { Timestamp } from "firebase/firestore";

export type Notification = {
  id: string;
  title: string;
  description: string;
  timestamp: string; // ISO String
  link?: string; // Optional link
  read?: boolean; // Optional: this will be determined on the client
};

// This mock data is no longer used by the live application but is kept for reference.
export const notifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Welcome to StudyScript!',
    description: 'We are excited to have you on board. Explore our courses and start learning today.',
    timestamp: new Date().toISOString(),
    read: false,
  },
  {
    id: 'notif-2',
    title: 'New Course Available',
    description: 'Check out our new "Advanced TypeScript" course. Enroll now for a 20% discount!',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
  }
];

    
