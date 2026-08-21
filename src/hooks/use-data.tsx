
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  listenToCourses, 
  listenToBatches, 
  listenToAcademics, 
  listenToFreeNotes, 
  listenToBookstore, 
  listenToAudioLectures,
  listenToQuizzes,
  listenToQuizFolders,
  listenToBannerSettings,
  listenToReviews,
  type Course, 
  type Batch, 
  type AcademicClass, 
  type FreeNote, 
  type BookstoreItem, 
  type AudioLecture,
  type Quiz,
  type QuizFolder,
  type BannerSettings,
  type Review
} from '@/lib/data';

interface DataContextType {
  courses: Course[];
  batches: Batch[];
  academicClasses: AcademicClass[];
  freeNotes: FreeNote[];
  bookstoreItems: BookstoreItem[];
  audioLectures: AudioLecture[];
  quizzes: Quiz[];
  quizFolders: QuizFolder[];
  bannerSettings: BannerSettings | null;
  approvedReviews: Review[];
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [academicClasses, setAcademicClasses] = useState<AcademicClass[]>([]);
  const [freeNotes, setFreeNotes] = useState<FreeNote[]>([]);
  const [bookstoreItems, setBookstoreItems] = useState<BookstoreItem[]>([]);
  const [audioLectures, setAudioLectures] = useState<AudioLecture[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizFolders, setQuizFolders] = useState<QuizFolder[]>([]);
  const [bannerSettings, setBannerSettings] = useState<BannerSettings | null>(null);
  const [approvedReviews, setApprovedReviews] = useState<Review[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState({
    courses: false,
    batches: false,
    academics: false,
    freeNotes: false,
    bookstore: false,
    audio: false,
    quizzes: false,
    folders: false,
    banners: false,
    reviews: false,
  });

  useEffect(() => {
    const unsubCourses = listenToCourses((data) => {
      setCourses(data);
      setInitialized(prev => ({ ...prev, courses: true }));
    });
    const unsubBatches = listenToBatches((data) => {
      setBatches(data);
      setInitialized(prev => ({ ...prev, batches: true }));
    });
    const unsubAcademics = listenToAcademics((data) => {
      setAcademicClasses(data);
      setInitialized(prev => ({ ...prev, academics: true }));
    });
    const unsubFreeNotes = listenToFreeNotes((data) => {
      setFreeNotes(data);
      setInitialized(prev => ({ ...prev, freeNotes: true }));
    });
    const unsubBookstore = listenToBookstore((data) => {
      setBookstoreItems(data);
      setInitialized(prev => ({ ...prev, bookstore: true }));
    });
    const unsubAudio = listenToAudioLectures((data) => {
      setAudioLectures(data);
      setInitialized(prev => ({ ...prev, audio: true }));
    });
    const unsubQuizzes = listenToQuizzes((data) => {
        setQuizzes(data);
        setInitialized(prev => ({ ...prev, quizzes: true }));
    });
    const unsubFolders = listenToQuizFolders((data) => {
        setQuizFolders(data);
        setInitialized(prev => ({ ...prev, folders: true }));
    });
    const unsubBanners = listenToBannerSettings((data) => {
        setBannerSettings(data);
        setInitialized(prev => ({ ...prev, banners: true }));
    });
    const unsubReviews = listenToReviews('approved', (data) => {
        setApprovedReviews(data);
        setInitialized(prev => ({ ...prev, reviews: true }));
    });

    return () => {
      unsubCourses();
      unsubBatches();
      unsubAcademics();
      unsubFreeNotes();
      unsubBookstore();
      unsubAudio();
      unsubQuizzes();
      unsubFolders();
      unsubBanners();
      unsubReviews();
    };
  }, []);

  useEffect(() => {
    // Hide loading once main content is ready
    if (initialized.courses && initialized.batches && initialized.academics) {
      setLoading(false);
    }
  }, [initialized]);

  return (
    <DataContext.Provider value={{ 
      courses, 
      batches, 
      academicClasses, 
      freeNotes, 
      bookstoreItems, 
      audioLectures, 
      quizzes,
      quizFolders,
      bannerSettings,
      approvedReviews,
      loading 
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
