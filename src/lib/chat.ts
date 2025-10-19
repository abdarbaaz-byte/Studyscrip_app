
import { Timestamp } from "firebase/firestore";

export type ChatMessage = {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  timestamp: string;
  attachment?: {
    type: 'image';
    url: string;
  };
};

export type AdminProfile = {
  id: string;
  name: string;
  avatar: string;
};

export type Chat = {
  id: string; // This will be the userId
  userId: string;
  userName: string;
  admin: AdminProfile;
  messages: ChatMessage[];
  lastMessageTimestamp: string; // Using string to be compatible with Firestore
};

const adminProfile: AdminProfile = {
  id: 'admin-1',
  name: 'StudyScript Support',
  avatar: '/icons/icon-192x192.png'
};

// This initialChats data is now for reference only and is not used in the live app.
// All chat data is now managed via Firestore.
export const initialChats: Chat[] = [
  {
    id: 'user-1',
    userId: 'user-1',
    userName: 'John Doe',
    admin: adminProfile,
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        text: "Hi, I'm having trouble accessing the course materials for the Web Development Bootcamp.",
        timestamp: new Date(Date.now() - 60000 * 5).toISOString(),
      },
       {
        id: 'msg-2',
        sender: 'admin',
        text: "I'm sorry to hear that. Could you please tell me which specific chapter you're having issues with?",
        timestamp: new Date(Date.now() - 60000 * 3).toISOString(),
      },
       {
        id: 'msg-3',
        sender: 'user',
        text: "Chapter 2, the video isn't loading.",
        timestamp: new Date(Date.now() - 60000 * 1).toISOString(),
      }
    ],
    lastMessageTimestamp: new Date().toISOString(),
  },
];
