// This file is now deprecated as payment logic and types are handled in src/lib/data.ts
// It is kept for historical reference but can be deleted.

export type Payment = {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  status: 'succeeded' | 'pending' | 'failed';
  date: string;
};

export const payments: Payment[] = [
  {
    id: 'payment-1',
    userId: 'user-1',
    userName: 'John Doe',
    courseId: 'web-dev-101',
    courseTitle: 'Web Development Bootcamp',
    amount: 49.99,
    status: 'succeeded',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'payment-2',
    userId: 'user-2',
    userName: 'Jane Smith',
    courseId: 'data-science-pro',
    courseTitle: 'Data Science with Python',
    amount: 79.99,
    status: 'succeeded',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'payment-3',
    userId: 'user-3',
    userName: 'Peter Jones',
    courseId: 'ui-ux-design',
    courseTitle: 'UI/UX Design Masterclass',
    amount: 39.99,
    status: 'pending',
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'payment-4',
    userId: 'user-4',
    userName: 'Mary Johnson',
    courseId: 'digital-marketing',
    courseTitle: 'Digital Marketing Fundamentals',
    amount: 29.99,
    status: 'failed',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];
