export type CourseContent = {
  type: 'pdf' | 'video' | 'image';
  title: string;
  url: string;
};

export type Course = {
  id: string; // Original mock ID, can be deprecated
  docId?: string; // Firestore document ID
  title: string;
  description: string;
  longDescription: string;
  thumbnail: string;
  price: number;
  content: CourseContent[];
};

export const courses: Course[] = [
  {
    id: 'web-dev-101',
    title: 'Web Development Bootcamp',
    description: 'Master HTML, CSS, JavaScript, and React from scratch.',
    longDescription: 'This comprehensive bootcamp covers everything you need to become a job-ready web developer. We start with the fundamentals of HTML5 and CSS3, move on to modern JavaScript (ES6+), and finish with an in-depth exploration of the React ecosystem, including hooks, context, and Redux.',
    thumbnail: 'https://placehold.co/600x400.png',
    price: 49.99,
    content: [
      { type: 'pdf', title: 'Chapter 1: Introduction to HTML', url: '/sample.pdf' },
      { type: 'video', title: 'Chapter 2: CSS Fundamentals', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { type: 'pdf', title: 'Chapter 3: JavaScript Basics', url: '/sample.pdf' },
      { type: 'video', title: 'Chapter 4: Advanced React', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    ],
  },
  {
    id: 'data-science-pro',
    title: 'Data Science with Python',
    description: 'Learn data analysis, visualization, and machine learning.',
    longDescription: 'Dive into the world of data science using Python. This course covers essential libraries like Pandas, NumPy, Matplotlib, and Scikit-learn. You will work on real-world datasets to build predictive models and create insightful data visualizations.',
    thumbnail: 'https://placehold.co/600x400.png',
    price: 79.99,
    content: [
      { type: 'pdf', title: 'Module 1: Python for Data Science', url: '/sample.pdf' },
      { type: 'video', title: 'Module 2: Data Wrangling with Pandas', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { type: 'pdf', title: 'Module 3: Visualization with Matplotlib', url: '/sample.pdf' },
      { type: 'video', title: 'Module 4: Machine Learning Fundamentals', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    ],
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Design Masterclass',
    description: 'Principles of user-centric design and prototyping.',
    longDescription: 'Become a UI/UX designer with this masterclass. Learn the entire design process from user research and wireframing to creating high-fidelity prototypes and user testing. You will master tools like Figma and understand the principles of creating intuitive and beautiful user interfaces.',
    thumbnail: 'https://placehold.co/600x400.png',
    price: 39.99,
    content: [
      { type: 'pdf', title: 'Part 1: The Design Process', url: '/sample.pdf' },
      { type: 'video', title: 'Part 2: Figma for Beginners', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { type: 'pdf', title: 'Part 3: Advanced Prototyping', url: '/sample.pdf' },
    ],
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing Fundamentals',
    description: 'Explore SEO, content marketing, and social media strategy.',
    longDescription: 'This course provides a complete overview of digital marketing. You will learn how to create effective marketing strategies, optimize websites for search engines (SEO), run social media campaigns, and create compelling content that drives engagement and conversions.',
    thumbnail: 'https://placehold.co/600x400.png',
    price: 29.99,
    content: [
      { type: 'pdf', title: 'Intro to SEO', url: '/sample.pdf' },
      { type: 'video', title: 'Social Media Strategy', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    ],
  },
];
