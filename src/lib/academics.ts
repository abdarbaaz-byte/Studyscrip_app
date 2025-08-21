
import { db } from './firebase';
import { collection, getDocs, doc, writeBatch, setDoc, deleteDoc } from 'firebase/firestore';

export type ContentItem = {
  id: string;
  type: 'pdf' | 'video' | 'image';
  title: string;
  url: string;
};

export type Chapter = {
  id: string;
  name: string;
  content: ContentItem[];
};

export type Subject = {
  id: string;
  name: string;
  price: number;
  chapters: Chapter[];
};

export type AcademicClass = {
  id: string;
  name: string;
  description: string;
  subjects: Subject[];
};

export const initialClasses: AcademicClass[] = [
  {
    id: 'class-9',
    name: '9th Class',
    description: 'All subjects for 9th standard curriculum.',
    subjects: [
      {
        id: 'math-9',
        name: 'Mathematics',
        price: 9.99,
        chapters: [
          { id: 'ch-1-9-math', name: 'Number Systems', content: [{id: 'content-1', title: "Intro PDF", type:'pdf', url: '/sample.pdf'}] },
          { id: 'ch-2-9-math', name: 'Polynomials', content: [] },
        ],
      },
      {
        id: 'science-9',
        name: 'Science',
        price: 8.99,
        chapters: [
          { id: 'ch-1-9-sci', name: 'Matter in Our Surroundings', content: [] },
          { id: 'ch-2-9-sci', name: 'The Fundamental Unit of Life', content: [] },
        ],
      },
    ],
  },
  {
    id: 'class-10',
    name: '10th Class',
    description: 'All subjects for 10th standard board exams.',
    subjects: [
      {
        id: 'math-10',
        name: 'Mathematics',
        price: 12.99,
        chapters: [
          { id: 'ch-1-10-math', name: 'Real Numbers', content: [] },
          { id: 'ch-2-10-math', name: 'Trigonometry', content: [] },
        ],
      },
      {
        id: 'science-10',
        name: 'Science',
        price: 11.99,
        chapters: [
          { id: 'ch-1-10-sci', name: 'Chemical Reactions and Equations', content: [] },
          { id: 'ch-2-10-sci', name: 'Life Processes', content: [] },
        ],
      },
       {
        id: 'social-10',
        name: 'Social Science',
        price: 10.99,
        chapters: [
          { id: 'ch-1-10-soc', name: 'The Rise of Nationalism in Europe', content: [] },
          { id: 'ch-2-10-soc', name: 'Resources and Development', content: [] },
        ],
      },
    ],
  },
];

// --- New code for Firestore ---

export async function getAcademicData(): Promise<AcademicClass[]> {
    const classesCol = collection(db, 'academics');
    const classSnapshot = await getDocs(classesCol);
    if (classSnapshot.empty) {
        // If the collection is empty, seed it with initial data
        console.log("No academic data found. Seeding initial data...");
        const batch = writeBatch(db);
        initialClasses.forEach((ac) => {
            const docRef = doc(db, 'academics', ac.id);
            batch.set(docRef, ac);
        });
        await batch.commit();
        return initialClasses;
    }
    const classList = classSnapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure content is a plain object for static generation
      const subjects = data.subjects?.map((subject: any) => ({
        ...subject,
        chapters: subject.chapters?.map((chapter: any) => ({
          ...chapter,
          // Ensure content is always an array
          content: chapter.content ? JSON.parse(JSON.stringify(chapter.content)) : [],
        })),
      }));
      return { ...data, id: doc.id, subjects: subjects || [] } as AcademicClass;
    });

    // Custom sort function
    const extractNumber = (name: string) => {
        const match = name.match(/^\d+/);
        return match ? parseInt(match[0], 10) : Infinity;
    };
    
    return classList.sort((a, b) => {
        const numA = extractNumber(a.name);
        const numB = extractNumber(b.name);

        if (numA !== Infinity && numB !== Infinity) {
            return numA - numB;
        }
        // Fallback to localeCompare if no number is found
        return a.name.localeCompare(b.name);
    });
}

export async function saveAcademicData(data: AcademicClass[]) {
    const batch = writeBatch(db);
    data.forEach(ac => {
        const docRef = doc(db, 'academics', ac.id);
        // Firestore works better without nested arrays being manipulated client-side
        // It's often better to store subjects as a subcollection.
        // For this prototype, we'll overwrite the whole document.
        batch.set(docRef, { ...ac });
    });
    await batch.commit();
}


export async function deleteAcademicClass(classId: string): Promise<void> {
    const docRef = doc(db, 'academics', classId);
    await deleteDoc(docRef);
}

    