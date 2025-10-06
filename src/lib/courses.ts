import { Timestamp } from 'firebase/firestore';

export type CourseContent = {
  id: string;
  type: 'pdf' | 'video' | 'image';
  title: string;
  url: string;
};

export type CourseFolder = {
  id: string;
  name: string;
  content: CourseContent[];
};

export type Course = {
  id: string; // Original mock ID, can be deprecated
  docId?: string; // Firestore document ID
  title: string;
  description: string;
  longDescription: string;
  thumbnail: string;
  price: number;
  folders: CourseFolder[];
  createdAt?: Timestamp; // Added for sorting
};

// This is now just a reference for structure, actual data comes from Firestore.
export const courses: Course[] = [
  {
    id: 'web-dev-101',
    title: 'Web Development Bootcamp',
    description: 'Master HTML, CSS, JavaScript, and React from scratch.',
    longDescription: 'This comprehensive bootcamp covers everything you need to become a job-ready web developer. We start with the fundamentals of HTML5 and CSS3, move on to modern JavaScript (ES6+), and finish with an in-depth exploration of the React ecosystem, including hooks, context, and Redux.',
    thumbnail: 'https://placehold.co/600x400.png',
    price: 49.99,
    folders: [
        {
            id: 'folder-1',
            name: 'Introduction',
            content: [
              { id: 'content-1', type: 'pdf', title: 'Chapter 1: Introduction to HTML', url: '/sample.pdf' },
              { id: 'content-2', type: 'video', title: 'Chapter 2: CSS Fundamentals', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            ]
        },
        {
            id: 'folder-2',
            name: 'Advanced Topics',
            content: [
                 { id: 'content-3', type: 'pdf', title: 'Chapter 3: JavaScript Basics', url: '/sample.pdf' },
                 { id: 'content-4', type: 'video', title: 'Chapter 4: Advanced React', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            ]
        }
    ],
  },
];
