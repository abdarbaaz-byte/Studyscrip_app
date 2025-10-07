

import { db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc, DocumentReference, query, where, Timestamp, orderBy, writeBatch, arrayUnion, onSnapshot, serverTimestamp, limit } from 'firebase/firestore';
import type { Course } from './courses';
import type { ChatMessage, Chat } from './chat';
import type { Notification } from './notifications';
import { getAcademicData, type AcademicClass, type Subject } from './academics';
import { UserPermission } from '@/hooks/use-auth';


// Re-export ContentItem for use in other modules
export type { ContentItem } from './academics';

// --- QUIZ ---
export type QuestionType = 'mcq' | 'true_false' | 'fill_in_blank' | 'match';

export type MatchOption = {
    id: string;
    question: string;
    answer: string;
};

export type Question = {
    id: string;
    text: string;
    type: QuestionType;
    options: string[]; // Used for MCQ
    matchOptions: MatchOption[]; // Used for Match the Following
    correctAnswer: number; // Index for MCQ, 0 for True/1 for False
    answerText: string; // Used for fill_in_blank
    explanation: string;
};


export type Quiz = {
    id: string; // docId
    title: string;
    description: string;
    duration?: number; // Duration in minutes
    questions: Question[];
    startTime?: Timestamp; // Optional start time for the quiz
    endTime?: Timestamp;   // Optional end time for the quiz
};

// This type will be used to store a user's attempt in Firestore
export type QuizAttempt = {
  id?: string; // Firestore doc ID
  quizId: string;
  quizTitle: string;
  userId: string | null;
  userEmail: string | null;
  userName: string;
  userSchool: string;
  userClass: string;
  userPlace: string;
  answers: { [questionId: string]: number | string | { [matchId: string]: string } };
  score: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: Timestamp;
};

// --- REVIEWS ---
export type Review = {
    id: string; // Firestore doc ID
    name: string;
    className: string;
    comment: string;
    status: 'pending' | 'approved';
    submittedAt: Timestamp;
};


// COURSES
export async function getCourses(): Promise<Course[]> {
  const coursesCol = collection(db, 'courses');
  const q = query(coursesCol, orderBy('createdAt', 'desc'));
  const courseSnapshot = await getDocs(q);
  const courseList = courseSnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() } as Course));
  return courseList;
}

export async function getCourse(docId: string): Promise<Course | null> {
  const courseDocRef = doc(db, 'courses', docId);
  const courseSnap = await getDoc(courseDocRef);

  if (courseSnap.exists()) {
    const data = courseSnap.data();
    
    // Serialize Firestore Timestamp to a plain string
    const sanitizedData = {
      ...data,
      createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : null,
    };

    // Ensure nested folders and content arrays are properly serialized for Next.js server components
    const folders = sanitizedData.folders ? JSON.parse(JSON.stringify(sanitizedData.folders)) : [];
    return { docId: courseSnap.id, ...sanitizedData, folders } as Course;
  } else {
    return null;
  }
}

export async function saveCourse(courseData: Omit<Course, 'docId'> & { docId?: string }): Promise<DocumentReference | void> {
    const { docId, ...data } = courseData;
    if (docId) {
        const courseDocRef = doc(db, 'courses', docId);
        // Don't update createdAt when editing an existing course
        const { createdAt, ...updateData } = data;
        return await setDoc(courseDocRef, updateData, { merge: true });
    } else {
        const coursesCol = collection(db, 'courses');
        return await addDoc(coursesCol, { ...data, createdAt: serverTimestamp() });
    }
}


export async function deleteCourse(docId: string): Promise<void> {
    const courseDocRef = doc(db, 'courses', docId);
    return await deleteDoc(courseDocRef);
}


// --- Purchase & Payment Logic ---
export type Purchase = {
  id: string; // The document ID
  userId: string;
  itemId: string; // Can be courseId or subjectId
  itemType: 'course' | 'subject';
  purchaseDate: Timestamp;
  expiryDate: Timestamp;
};

// This type is enriched with full object details for displaying in "My Courses"
export type EnrichedPurchase = Omit<Purchase, 'itemId'> & {
    itemId: string;
    item: any; // Can be a Course or Subject object
    userEmail: string;
    itemName: string;
};

export type Payment = {
  id?: string;
  userId: string;
  userName: string;
  itemId: string;
  itemTitle: string;
  itemType: 'course' | 'subject';
  amount: number;
  status: 'succeeded' | 'pending' | 'failed';
  paymentDate: Timestamp;
  razorpayPaymentId: string;
};

// For Manual UPI Verification
export type PaymentRequest = {
    id: string; // doc id
    userId: string;
    userName: string;
    itemId: string;
    itemTitle: string;
    itemType: 'course' | 'subject';
    itemPrice: number;
    upiReferenceId: string;
    status: 'pending' | 'approved' | 'rejected';
    requestDate: Timestamp;
    actionDate?: Timestamp;
    adminNotes?: string;
};

export async function createPurchase(
    userId: string, 
    userName: string,
    itemId: string, 
    itemTitle: string,
    itemType: 'course' | 'subject',
    amount: number,
    razorpayPaymentId: string
): Promise<string> {

  const batch = writeBatch(db);

  // 1. Create Purchase Record
  const purchasesCol = collection(db, 'purchases');
  const newPurchaseRef = doc(purchasesCol);
  const expiry = new Date(new Date().setFullYear(new Date().getFullYear() + 1)); // 1 year access


  const newPurchase: Omit<Purchase, 'id'> = {
    userId,
    itemId,
    itemType,
    purchaseDate: Timestamp.fromDate(new Date()),
    expiryDate: Timestamp.fromDate(expiry),
  };
  batch.set(newPurchaseRef, newPurchase);
  
  // 2. Create Payment Record
  const paymentsCol = collection(db, 'payments');
  const newPaymentRef = doc(paymentsCol);
  const newPayment: Omit<Payment, 'id'> = {
    userId,
    userName,
    itemId,
    itemTitle,
    itemType,
    amount,
    status: 'succeeded',
    paymentDate: Timestamp.fromDate(new Date()),
    razorpayPaymentId,
  };
  batch.set(newPaymentRef, newPayment);

  await batch.commit();

  return newPurchaseRef.id;
}


export async function grantManualAccess(
  userEmail: string,
  itemId: string,
  itemType: 'course' | 'subject',
  expiryDate: Date
): Promise<void> {
  // 1. Find user by email
  const usersCol = collection(db, 'users');
  const q = query(usersCol, where('email', '==', userEmail));
  const userSnapshot = await getDocs(q);

  if (userSnapshot.empty) {
    throw new Error(`No user found with email: ${userEmail}`);
  }

  const userDoc = userSnapshot.docs[0];
  const userId = userDoc.id;

  // 2. Create a purchase record for the user
  const purchasesCol = collection(db, 'purchases');
  const newPurchase: Omit<Purchase, 'id'> = {
    userId,
    itemId,
    itemType,
    purchaseDate: Timestamp.fromDate(new Date()),
    expiryDate: Timestamp.fromDate(expiryDate),
  };

  await addDoc(purchasesCol, newPurchase);
}

export async function checkUserPurchase(userId: string, itemId: string): Promise<boolean> {
  if (!userId || !itemId) {
    return false;
  }
  
  const purchasesCol = collection(db, 'purchases');
  const q = query(
    purchasesCol,
    where('userId', '==', userId),
    where('itemId', '==', itemId)
  );

  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return false; // No purchase record found
  }

  // Check if any of the purchases is still valid
  const now = new Date();
  for (const docSnap of querySnapshot.docs) {
    const purchase = docSnap.data() as Purchase;
    if (purchase.expiryDate.toDate() > now) {
      return true; // Found a valid, non-expired purchase
    }
  }

  return false; // All purchases found are expired
}

export async function getPayments(): Promise<Payment[]> {
    const paymentsCol = collection(db, 'payments');
    const q = query(paymentsCol, orderBy('paymentDate', 'desc'));
    const paymentSnapshot = await getDocs(q);
    const paymentList = paymentSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Payment));
    return paymentList;
}


export async function getAllPurchases(): Promise<EnrichedPurchase[]> {
    const purchasesCol = collection(db, 'purchases');
    const q = query(purchasesCol, orderBy('purchaseDate', 'desc'));
    const purchaseSnapshot = await getDocs(q);
    
    if (purchaseSnapshot.empty) return [];

    const allCourses = await getCourses();
    const allAcademicData = await getAcademicData();
    const allSubjects = allAcademicData.flatMap(ac => ac.subjects.map(s => ({...s, className: ac.name})));

    const usersCol = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCol);
    const usersMap = new Map(usersSnapshot.docs.map(doc => [doc.id, doc.data().email]));

    const enrichedList: EnrichedPurchase[] = purchaseSnapshot.docs.map(docSnap => {
        const purchase = { id: docSnap.id, ...docSnap.data() } as Purchase;
        
        let itemName = 'Unknown Item';
        if(purchase.itemType === 'course') {
            const course = allCourses.find(c => c.docId === purchase.itemId);
            itemName = course ? course.title : purchase.itemId;
        } else {
            const subject = allSubjects.find(s => s.id === purchase.itemId);
            itemName = subject ? `${subject.name} (${subject.className})` : purchase.itemId;
        }

        return {
            ...purchase,
            item: {
                id: purchase.itemId,
                name: itemName,
                title: itemName, // for course card compatibility
            },
            userEmail: usersMap.get(purchase.userId) || 'Unknown User',
            itemName,
        };
    });

    return enrichedList;
}

export async function getUserPurchases(userId: string): Promise<EnrichedPurchase[]> {
    const purchasesCol = collection(db, 'purchases');
    const q = query(purchasesCol, where('userId', '==', userId));
    const purchaseSnapshot = await getDocs(q);
    
    if (purchaseSnapshot.empty) return [];

    // Fetch all courses and subjects once to avoid multiple reads
    const allCourses = await getCourses();
    const allAcademicData = await getAcademicData();
    const allSubjects = allAcademicData.flatMap(ac => ac.subjects.map(s => ({ ...s, classId: ac.id, className: ac.name })));

    const now = new Date();
    const enrichedList: EnrichedPurchase[] = [];

    for (const docSnap of purchaseSnapshot.docs) {
        const purchase = { id: docSnap.id, ...docSnap.data() } as Purchase;
        
        // Filter out expired purchases
        if (purchase.expiryDate.toDate() < now) {
            continue;
        }

        let itemData: any = null;
        if (purchase.itemType === 'course') {
            itemData = allCourses.find(c => c.docId === purchase.itemId);
        } else {
            itemData = allSubjects.find(s => s.id === purchase.itemId);
        }

        if (itemData) {
            enrichedList.push({
                ...purchase,
                item: itemData,
            } as EnrichedPurchase);
        }
    }

    return enrichedList;
}

export async function revokePurchase(purchaseId: string): Promise<void> {
    const purchaseDocRef = doc(db, 'purchases', purchaseId);
    await deleteDoc(purchaseDocRef);
}


// --- UPI Payment Requests ---

export async function createPaymentRequest(
    data: Omit<PaymentRequest, 'id' | 'status' | 'requestDate'>
) {
    const requestsCol = collection(db, 'paymentRequests');
    await addDoc(requestsCol, {
        ...data,
        status: 'pending',
        requestDate: serverTimestamp(),
    });
}

export function listenToPaymentRequests(callback: (requests: PaymentRequest[]) => void) {
    const requestsCol = collection(db, 'paymentRequests');
    const q = query(requestsCol, where('status', '==', 'pending'), orderBy('requestDate', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                requestDate: data.requestDate,
            } as PaymentRequest;
        });
        callback(requests);
    });
}

export async function approvePaymentRequest(request: PaymentRequest): Promise<void> {
    const batch = writeBatch(db);
    const now = new Date();

    // 1. Create a purchase record for the user
    const purchasesCol = collection(db, 'purchases');
    const newPurchaseRef = doc(purchasesCol);
    const expiry = new Date(new Date().setFullYear(now.getFullYear() + 1)); // 1 year access

    const newPurchase: Omit<Purchase, 'id'> = {
        userId: request.userId,
        itemId: request.itemId,
        itemType: request.itemType,
        purchaseDate: Timestamp.fromDate(now),
        expiryDate: Timestamp.fromDate(expiry),
    };
    batch.set(newPurchaseRef, newPurchase);

    // 2. Create a "succeeded" payment record for history
    const paymentsCol = collection(db, 'payments');
    const newPaymentRef = doc(paymentsCol);
    const newPayment: Omit<Payment, 'id'> = {
        userId: request.userId,
        userName: request.userName,
        itemId: request.itemId,
        itemTitle: request.itemTitle,
        itemType: request.itemType,
        amount: request.itemPrice,
        status: 'succeeded',
        paymentDate: Timestamp.fromDate(now),
        razorpayPaymentId: `UPI: ${request.upiReferenceId}`, // Store UPI ref ID here
    };
    batch.set(newPaymentRef, newPayment);

    // 3. Update the request status to 'approved'
    const requestDocRef = doc(db, 'paymentRequests', request.id);
    batch.update(requestDocRef, {
        status: 'approved',
        actionDate: Timestamp.fromDate(now),
    });

    await batch.commit();
}


export async function rejectPaymentRequest(requestId: string, reason: string, request: PaymentRequest): Promise<void> {
    const batch = writeBatch(db);
    const now = new Date();
    
    // 1. Create a "failed" payment record for history
    const paymentsCol = collection(db, 'payments');
    const newPaymentRef = doc(paymentsCol);
    const newPayment: Omit<Payment, 'id'> = {
        userId: request.userId,
        userName: request.userName,
        itemId: request.itemId,
        itemTitle: request.itemTitle,
        itemType: request.itemType,
        amount: request.itemPrice,
        status: 'failed',
        paymentDate: Timestamp.fromDate(now),
        razorpayPaymentId: `UPI: ${request.upiReferenceId}`, // Store UPI ref ID here
    };
    batch.set(newPaymentRef, newPayment);
    
    // 2. Update the request status to 'rejected'
    const requestDocRef = doc(db, 'paymentRequests', requestId);
    batch.update(requestDocRef, {
        status: 'rejected',
        adminNotes: reason,
        actionDate: Timestamp.fromDate(now),
    });

    await batch.commit();
}


// --- Chat Logic ---

export async function sendMessage(chatId: string, message: ChatMessage, userInfo: { userId: string; userName: string }) {
  const chatDocRef = doc(db, 'chats', chatId);
  
  // Ensure the user's document exists first
  const userDocRef = doc(db, 'users', userInfo.userId);
  const userDoc = await getDoc(userDocRef);
  if (!userDoc.exists()) {
    await setDoc(userDocRef, {
      uid: userInfo.userId,
      email: userInfo.userName,
      createdAt: new Date().toISOString(),
      readNotifications: []
    });
  }

  const chatDoc = await getDoc(chatDocRef);
  if (chatDoc.exists()) {
    await updateDoc(chatDocRef, {
      messages: arrayUnion(message),
      lastMessageTimestamp: message.timestamp,
    });
  } else {
    await setDoc(chatDocRef, {
      id: chatId,
      userId: userInfo.userId,
      userName: userInfo.userName,
      admin: { id: 'admin-1', name: 'StudyScript Support', avatar: '/logo-icon.svg' },
      messages: [message],
      lastMessageTimestamp: message.timestamp,
    });
  }
}

export function listenToAllChats(callback: (chats: Chat[]) => void) {
    const chatsCol = collection(db, 'chats');
    const q = query(chatsCol, orderBy('lastMessageTimestamp', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map(docSnap => docSnap.data() as Chat);
        callback(chats);
    });
}

export function listenToChat(chatId: string, callback: (chat: Chat | null) => void) {
  const chatDocRef = doc(db, 'chats', chatId);
  return onSnapshot(chatDocRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as Chat);
    } else {
      callback(null);
    }
  });
}

// --- NOTIFICATIONS ---

export async function sendNotification(title: string, description: string) {
    const notificationsCol = collection(db, 'notifications');
    await addDoc(notificationsCol, {
        title,
        description,
        timestamp: new Date().toISOString(),
    });
}

export function listenToNotifications(callback: (notifications: Notification[]) => void) {
    const notificationsCol = collection(db, 'notifications');
    const q = query(notificationsCol, orderBy('timestamp', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                title: data.title,
                description: data.description,
                timestamp: data.timestamp, // Keep as ISO string
            } as Notification;
        });
        callback(notifications);
    });
}

export async function deleteNotification(notificationId: string): Promise<void> {
    const docRef = doc(db, 'notifications', notificationId);
    await deleteDoc(docRef);
}

export function listenToUserReadNotifications(userId: string, callback: (readIds: string[]) => void) {
    const userDocRef = doc(db, 'users', userId);
    return onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            callback(data.readNotifications || []);
        } else {
            callback([]);
        }
    });
}

export async function markNotificationAsRead(userId: string, notificationId: string) {
    const userDocRef = doc(db, 'users', userId);
    // Use setDoc with merge:true to avoid error if document doesn't exist
    await setDoc(userDocRef, {
        readNotifications: arrayUnion(notificationId)
    }, { merge: true });
}

// --- FREE NOTES ---
export type FreeNote = {
  id: string; // docId
  title: string;
  description: string;
  content: CourseContent[];
};

export async function getFreeNotes(): Promise<FreeNote[]> {
  const notesCol = collection(db, 'freeNotes');
  const q = query(notesCol, orderBy('title'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FreeNote));
}

export async function saveFreeNotes(note: FreeNote): Promise<void> {
    const { id, ...data } = note;
    if (id) {
        await setDoc(doc(db, 'freeNotes', id), data, { merge: true });
    } else {
        await addDoc(collection(db, 'freeNotes'), data);
    }
}

export async function deleteFreeNote(id: string): Promise<void> {
    await deleteDoc(doc(db, 'freeNotes', id));
}


// --- BOOKSTORE ---
export type BookstoreItem = {
    id: string; // docId
    title: string;
    url: string; // PDF URL
    thumbnailUrl: string; // Image URL
};

export async function getBookstoreItems(): Promise<BookstoreItem[]> {
    const itemsCol = collection(db, 'bookstore');
    const q = query(itemsCol, orderBy('title'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookstoreItem));
}

export async function saveBookstoreItem(item: BookstoreItem): Promise<void> {
    const { id, ...data } = item;
    if (id) {
        await setDoc(doc(db, 'bookstore', id), data, { merge: true });
    } else {
        await addDoc(collection(db, 'bookstore'), data);
    }
}

export async function deleteBookstoreItem(id: string): Promise<void> {
    await deleteDoc(doc(db, 'bookstore', id));
}

// --- QUIZZES ---
export async function getQuiz(id: string): Promise<Quiz | null> {
    const quizDocRef = doc(db, 'quizzes', id);
    const quizSnap = await getDoc(quizDocRef);
    if (quizSnap.exists()) {
        const data = quizSnap.data();
        // Manually convert Timestamps to Dates for client-side usage if needed
        return { 
            id: quizSnap.id, 
            ...data,
            // No need to convert here, let components handle it if they need Date objects
        } as Quiz;
    }
    return null;
}

export async function getQuizzes(): Promise<Quiz[]> {
    const quizzesCol = collection(db, 'quizzes');
    const q = query(quizzesCol, orderBy('title'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
}

export async function saveQuiz(quiz: Quiz): Promise<void> {
    const { id, ...data } = quiz;

    // Create a mutable copy to work with
    const dataToSave: { [key: string]: any } = { ...data };

    // Convert Date objects to Timestamps and handle undefined values
    if (data.startTime) {
        dataToSave.startTime = data.startTime instanceof Timestamp ? data.startTime : Timestamp.fromDate(data.startTime as any);
    } else {
        delete dataToSave.startTime; // Remove if undefined or null
    }

    if (data.endTime) {
        dataToSave.endTime = data.endTime instanceof Timestamp ? data.endTime : Timestamp.fromDate(data.endTime as any);
    } else {
        delete dataToSave.endTime; // Remove if undefined or null
    }

    if (id) {
        await setDoc(doc(db, 'quizzes', id), dataToSave, { merge: true });
    } else {
        await addDoc(collection(db, 'quizzes'), dataToSave);
    }
}

export async function deleteQuiz(id: string): Promise<void> {
    await deleteDoc(doc(db, 'quizzes', id));
}

export async function saveQuizAttempt(attemptData: Omit<QuizAttempt, 'id' | 'submittedAt'>): Promise<string> {
    const attemptsCol = collection(db, 'quizAttempts');
    const docRef = await addDoc(attemptsCol, {
        ...attemptData,
        submittedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function getQuizAttempts(): Promise<QuizAttempt[]> {
    const attemptsCol = collection(db, 'quizAttempts');
    const q = query(attemptsCol, orderBy('submittedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttempt));
}

export async function deleteQuizAttempt(id: string): Promise<void> {
    if (!id) return;
    await deleteDoc(doc(db, 'quizAttempts', id));
}

// --- LIVE CLASS SURVEYS ---
export type LiveClassSurvey = {
    id?: string;
    userId: string | null;
    userEmail: string | null;
    userName: string;
    userMobile: string;
    subjectInterest: string;
    otherTopics: string;
    preferredTime: string;
    submittedAt: Timestamp;
};

export async function saveLiveClassSurvey(data: Omit<LiveClassSurvey, 'id' | 'submittedAt'>): Promise<void> {
    const surveysCol = collection(db, 'liveClassSurveys');
    await addDoc(surveysCol, {
        ...data,
        submittedAt: serverTimestamp(),
    });
}

export async function getLiveClassSurveys(): Promise<LiveClassSurvey[]> {
    const surveysCol = collection(db, 'liveClassSurveys');
    const q = query(surveysCol, orderBy('submittedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LiveClassSurvey));
}


// --- EMPLOYEE MANAGEMENT (RBAC) ---
export type EmployeeData = {
    uid: string;
    email: string;
    role: 'employee' | null;
    permissions: UserPermission[];
};

export async function getEmployees(): Promise<EmployeeData[]> {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('role', 'in', ['employee', 'admin']));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            uid: doc.id,
            email: data.email,
            role: data.role,
            permissions: data.permissions || [],
        };
    });
}

export async function updateEmployeePermissions(uid: string, data: Partial<EmployeeData>): Promise<void> {
    if (!uid) throw new Error("User ID is required to update employee.");
    const userDocRef = doc(db, 'users', uid);
    
    const updateData: any = {};
    if (data.role !== undefined) updateData.role = data.role;
    if (data.permissions !== undefined) updateData.permissions = data.permissions;

    if(Object.keys(updateData).length === 0) {
        console.warn("No data provided to update for employee:", uid);
        return;
    }

    await updateDoc(userDocRef, updateData);
}

export async function findUserByEmail(email: string): Promise<{uid: string, email: string} | null> {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('email', '==', email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const userDoc = snapshot.docs[0];
    return {
        uid: userDoc.id,
        email: userDoc.data().email
    };
}


// --- SITE SETTINGS ---
export type BannerItem = {
  id: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
};

export type BannerSettings = {
  banners: BannerItem[];
};

export async function getBannerSettings(): Promise<BannerSettings> {
    const settingsDocRef = doc(db, 'settings', 'homeBanner');
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
        // Ensure it returns the full object with an array, even if empty
        const data = docSnap.data();
        return { banners: data.banners || [] };
    }
    // Return a default structure if the document doesn't exist
    return { banners: [] };
}

export async function saveBannerSettings(settings: BannerSettings): Promise<void> {
    const settingsDocRef = doc(db, 'settings', 'homeBanner');
    await setDoc(settingsDocRef, settings, { merge: true });
}

// --- STUDENT REVIEWS ---
export async function getReviews(status: 'approved' | 'pending' | 'all' = 'approved'): Promise<Review[]> {
    const reviewsCol = collection(db, 'reviews');
    // Fetch all reviews first
    const q = query(reviewsCol, orderBy('submittedAt', 'desc'));
    const snapshot = await getDocs(q);
    let allReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));

    // Then filter in code
    if (status !== 'all') {
        allReviews = allReviews.filter(review => review.status === status);
    }

    return allReviews;
}

export async function submitReview(reviewData: { name: string; className: string; comment: string; }): Promise<void> {
    const reviewsCol = collection(db, 'reviews');
    await addDoc(reviewsCol, {
        ...reviewData,
        status: 'pending',
        submittedAt: serverTimestamp(),
    });
}

export async function approveReview(id: string): Promise<void> {
    const reviewDocRef = doc(db, 'reviews', id);
    await updateDoc(reviewDocRef, { status: 'approved' });
}

export async function deleteReview(id: string): Promise<void> {
    const reviewDocRef = doc(db, 'reviews', id);
    await deleteDoc(reviewDocRef);
}

// --- LIVE CLASSES ---
export type LiveClass = {
    id: string; // docId
    title: string;
    startTime: Timestamp;
    endTime: Timestamp;
    associatedItemId: string; // course or subject id
    itemType: 'course' | 'subject';
    associatedItemName: string; // denormalized for display
    classId?: string; // only for subjects
};

export async function saveLiveClass(liveClass: Omit<LiveClass, 'id'>): Promise<void> {
    const liveClassesCol = collection(db, 'liveClasses');
    
    const dataToSave: { [key: string]: any } = { ...liveClass };

    if (dataToSave.classId === undefined) {
        delete dataToSave.classId;
    }

    await addDoc(liveClassesCol, dataToSave);
}

export async function getLiveClass(id: string): Promise<LiveClass | null> {
    const docRef = doc(db, 'liveClasses', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as LiveClass;
    }
    return null;
}

export async function getLiveClasses(): Promise<LiveClass[]> {
    const liveClassesCol = collection(db, 'liveClasses');
    const q = query(liveClassesCol, orderBy('startTime', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LiveClass));
}

export async function getScheduledLiveClassesForItem(itemId: string): Promise<LiveClass | null> {
    const now = new Date();
    const liveClassesCol = collection(db, 'liveClasses');
    const q = query(
        liveClassesCol, 
        where('associatedItemId', '==', itemId),
        where('endTime', '>', Timestamp.fromDate(now)),
        limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as LiveClass;
}

export async function deleteLiveClass(id: string): Promise<void> {
    const docRef = doc(db, 'liveClasses', id);
    await deleteDoc(docRef);
}
    
