import { db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc, DocumentReference, query, where, Timestamp, orderBy, writeBatch, arrayUnion, onSnapshot, serverTimestamp, limit, arrayRemove, increment, runTransaction } from 'firebase/firestore';
import type { Course, CourseFolder, CourseContent } from './courses';
import type { ChatMessage, Chat } from './chat';
import type { Notification } from './notifications';
import { getAcademicData, type AcademicClass, type Subject } from './academics';
import { UserPermission } from '@/hooks/use-auth';

// Helper for Manual Revalidation
async function triggerRevalidation(path: string = '/') {
    try {
        await fetch('/api/revalidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path, secret: 'studyscript-revalidate-secret' }),
        });
    } catch (e) {
        console.warn("Manual revalidation trigger failed (This is normal in local development)", e);
    }
}

// Re-export for convenience
export const listenToAcademics = (callback: (classes: AcademicClass[]) => void) => {
    const classesCol = collection(db, 'academics');
    return onSnapshot(classesCol, (snapshot) => {
        const classList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AcademicClass));
        const extractNumber = (name: string) => {
            const match = name.match(/^\d+/);
            return match ? parseInt(match[0], 10) : Infinity;
        };
        const sortedList = classList.sort((a, b) => {
            const numA = extractNumber(a.name);
            const numB = extractNumber(b.name);
            return numA !== Infinity && numB !== Infinity ? numA - numB : a.name.localeCompare(b.name);
        });
        callback(sortedList);
    });
};
export { getAcademicData };
export type { AcademicClass, Subject } from './academics';

// Re-export ContentItem for use in other modules
export type { ContentItem } from './academics';

// --- BATCHES ---
export type BatchNote = {
    id: string;
    title: string;
    content: ContentItem[];
    subFolders?: BatchNote[]; // Recursive for nested folders
};

export type BatchInformation = {
    id: string;
    title: string;
    message: string;
    createdAt: Timestamp;
};

export type BatchMessage = {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: Timestamp;
};

export type BatchDownloadItem = {
    id: string;
    title: string;
    url: string;
};

export type Batch = {
    id: string; // docId
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    thumbnail: string;
    createdAt: Timestamp;
    notes: BatchNote[];
    downloadContent?: BatchDownloadItem[];
    quizIds: string[];
    includes: string[];
    chatEnabled?: boolean;
};

export async function getBatches(): Promise<Batch[]> {
    const batchesCol = collection(db, 'batches');
    const q = query(batchesCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch));
}

export function listenToBatches(callback: (batches: Batch[]) => void) {
    const batchesCol = collection(db, 'batches');
    const q = query(batchesCol, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const batchList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch));
        callback(batchList);
    });
}

export async function getBatch(id: string): Promise<Batch | null> {
    const docRef = doc(db, 'batches', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return { id: docSnap.id, ...data } as Batch;
    }
    return null;
}

export async function saveBatch(batch: Omit<Batch, 'id' | 'createdAt'> & { id?: string }): Promise<void> {
    const { id, ...data } = batch;
    if (id) {
        await setDoc(doc(db, 'batches', id), data, { merge: true });
        triggerRevalidation(`/batches/${id}`);
    } else {
        const docRef = await addDoc(collection(db, 'batches'), { ...data, createdAt: serverTimestamp(), chatEnabled: true });
        triggerRevalidation(`/batches/${docRef.id}`);
    }
    triggerRevalidation('/');
}

export async function deleteBatch(id: string): Promise<void> {
    await deleteDoc(doc(db, 'batches', id));
    triggerRevalidation('/batches');
    triggerRevalidation('/');
}

export async function getBatchInformation(batchId: string): Promise<BatchInformation[]> {
    const infoCol = collection(db, 'batches', batchId, 'information');
    const q = query(infoCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BatchInformation));
}

export async function saveBatchInformation(batchId: string, info: Omit<BatchInformation, 'id' | 'createdAt'>): Promise<void> {
    const infoCol = collection(db, 'batches', batchId, 'information');
    await addDoc(infoCol, { ...info, createdAt: serverTimestamp() });
    triggerRevalidation(`/batches/${batchId}`);
}

export async function deleteBatchInformation(batchId: string, infoId: string): Promise<void> {
    await deleteDoc(doc(db, 'batches', batchId, 'information', infoId));
    triggerRevalidation(`/batches/${batchId}`);
}

export function listenToBatchMessages(batchId: string, callback: (messages: BatchMessage[]) => void) {
    const messagesCol = collection(db, 'batches', batchId, 'messages');
    const q = query(messagesCol, orderBy('timestamp', 'asc'), limit(100));
    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BatchMessage));
        callback(messages);
    });
}

export async function sendBatchMessage(batchId: string, senderId: string, senderName: string, text: string) {
    const messagesCol = collection(db, 'batches', batchId, 'messages');
    await addDoc(messagesCol, {
        senderId,
        senderName,
        text,
        timestamp: serverTimestamp(),
    });
}

// --- AUDIO LECTURES ---
export type AudioTrack = {
  id: string;
  title: string;
  url: string;
  duration: string;
};

export type AudioLecture = {
  id: string;
  title: string;
  description: string;
  audios: AudioTrack[];
};

export function listenToAudioLectures(callback: (lectures: AudioLecture[]) => void) {
  const lecturesCol = collection(db, 'audioLectures');
  const q = query(lecturesCol, orderBy('title'));
  return onSnapshot(q, (snapshot) => {
    const lectureList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AudioLecture));
    callback(lectureList);
  });
}

// --- SCHOOLS & TEACHERS ---
export type SchoolTeacher = {
  uid: string;
  email: string;
};

export type School = {
  id?: string;
  name: string;
  teachers: SchoolTeacher[];
  students?: SchoolStudent[];
};

export type SchoolStudent = {
    uid: string;
    email: string;
    name: string;
    userClass: string;
};

// --- School Content ---
export type SchoolNote = {
    id: string;
    title: string;
    content: ContentItem[];
    targetClass: string;
};

export type SchoolInformation = {
  id: string;
  title: string;
  message: string;
  targetClass: string;
  createdAt: Timestamp;
};

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
    options: string[];
    matchOptions: MatchOption[];
    correctAnswer: number;
    answerText: string;
    explanation: string;
    marks: number;
    negativeMarks: number;
    imageUrl?: string;
};


export type Quiz = {
    id: string;
    title: string;
    description: string;
    duration?: number;
    questions: Question[];
    startTime?: Timestamp;
    endTime?: Timestamp;
    resultAnnounceTime?: Timestamp;
    targetClass: string;
    targetClasses?: string[];
    createdAt?: Timestamp;
    folderId?: string;
};

export type QuizFolder = {
    id: string;
    name: string;
    createdAt: Timestamp;
};

export type QuizAttempt = {
  id?: string;
  quizId: string;
  quizTitle: string;
  userId: string | null;
  userEmail: string | null;
  userName: string;
  userClass: string;
  userSchool?: string;
  answers: { [questionId: string]: number | string | { [matchId: string]: string } };
  score: number;
  totalQuestions: number;
  maxMarks: number;
  percentage: number;
  submittedAt: Timestamp;
  schoolId?: string | null;
};

// --- REVIEWS ---
export type Review = {
    id: string;
    name: string;
    className: string;
    comment: string;
    status: 'pending' | 'approved';
    submittedAt: Timestamp;
};

export function listenToReviews(status: 'approved' | 'pending' | 'all', callback: (reviews: Review[]) => void) {
  const reviewsCol = collection(db, 'reviews');
  const q = query(reviewsCol, orderBy('submittedAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    let allReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    if (status !== 'all') {
        allReviews = allReviews.filter(review => review.status === status);
    }
    callback(allReviews);
  });
}

// --- USER PROFILE & CREDITS ---
export type CreditTransaction = {
    id: string;
    amount: number;
    type: 'credit' | 'debit';
    reason: string;
    timestamp: Timestamp;
    relatedUser?: string; // For referral rewards
};

export type UserCertificate = {
    id: string;
    title: string;
    url: string;
};

export type UserProfile = {
    uid: string;
    email: string;
    displayName: string;
    school?: string;
    userClass?: string;
    mobileNumber?: string;
    rollNumber?: string;
    address?: string;
    certificates?: UserCertificate[];
    role?: 'admin' | 'employee' | 'teacher' | null;
    schoolId?: string | null;
    referralCode: string;
    referredBy?: string | null;
    referralCount: number;
    creditBalance: number;
    firstPurchaseRewardGiven?: boolean;
};

// COURSES
export function listenToCourses(callback: (courses: Course[]) => void) {
  const coursesCol = collection(db, 'courses');
  const q = query(coursesCol, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const courseList = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() } as Course));
    callback(courseList);
  });
}

export async function getCourses(): Promise<Course[]> {
  const coursesCol = collection(db, 'courses');
  const q = query(coursesCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() } as Course));
}

export async function getCourse(docId: string): Promise<Course | null> {
  if (docId === 'no-courses') return null;
  const courseDocRef = doc(db, 'courses', docId);
  const courseSnap = await getDoc(courseDocRef);

  if (courseSnap.exists()) {
    const data = courseSnap.data();
    
    const sanitizedData = {
      ...data,
      createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : null,
    };

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
        const { createdAt, ...updateData } = data;
        const res = await setDoc(courseDocRef, updateData, { merge: true });
        triggerRevalidation(`/courses/${docId}`);
        triggerRevalidation('/');
        return res;
    } else {
        const coursesCol = collection(db, 'courses');
        const docRef = await addDoc(coursesCol, { ...data, createdAt: serverTimestamp() });
        triggerRevalidation(`/courses/${docRef.id}`);
        triggerRevalidation('/');
        return docRef;
    }
}


export async function deleteCourse(docId: string): Promise<void> {
    const courseDocRef = doc(db, 'courses', docId);
    await deleteDoc(courseDocRef);
    triggerRevalidation('/');
}


// --- Purchase & Payment Logic ---
export type Purchase = {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'course' | 'subject' | 'batch';
  purchaseDate: Timestamp;
  expiryDate: Timestamp;
  creditUsed?: number;
};

export type EnrichedPurchase = Omit<Purchase, 'itemId'> & {
    itemId: string;
    item: any;
    userEmail: string;
    itemName: string;
};

export type Payment = {
  id?: string;
  userId: string;
  userName: string;
  itemId: string;
  itemTitle: string;
  itemType: 'course' | 'subject' | 'batch';
  amount: number;
  status: 'succeeded' | 'pending' | 'failed';
  paymentDate: Timestamp;
  razorpayPaymentId: string;
};

export type PaymentRequest = {
    id: string;
    userId: string;
    userName: string;
    itemId: string;
    itemTitle: string;
    itemType: 'course' | 'subject' | 'batch';
    itemPrice: number;
    upiReferenceId: string;
    status: 'pending' | 'approved' | 'rejected';
    requestDate: Timestamp;
    actionDate?: Timestamp;
    adminNotes?: string;
    creditUsed?: number;
    amountToPay?: number;
};

export async function createPurchase(
    userId: string, 
    userName: string,
    itemId: string, 
    itemTitle: string,
    itemType: 'course' | 'subject' | 'batch',
    amount: number,
    razorpayPaymentId: string,
    creditUsed: number = 0
): Promise<string> {
  const now = new Date();
  const expiry = new Date(new Date().setFullYear(now.getFullYear() + 1));

  return await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', userId);
      
      // 1. Deduct Credit if used
      if (creditUsed > 0) {
          transaction.update(userRef, {
              creditBalance: increment(-creditUsed)
          });
          // Add debit history
          const histRef = doc(collection(db, 'users', userId, 'creditHistory'));
          transaction.set(histRef, {
              amount: creditUsed,
              type: 'debit',
              reason: `Used for ${itemTitle}`,
              timestamp: serverTimestamp(),
          });
      }

      // 2. Create Purchase
      const purchasesCol = collection(db, 'purchases');
      const newPurchaseRef = doc(purchasesCol);
      const newPurchase: Omit<Purchase, 'id'> = {
          userId,
          itemId,
          itemType,
          purchaseDate: Timestamp.fromDate(now),
          expiryDate: Timestamp.fromDate(expiry),
          creditUsed,
      };
      transaction.set(newPurchaseRef, newPurchase);
      
      // 3. Create Payment Record
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
          paymentDate: Timestamp.fromDate(now),
          razorpayPaymentId,
      };
      transaction.set(newPaymentRef, newPayment);

      return newPurchaseRef.id;
  });
}


export async function grantManualAccess(
  userEmail: string,
  itemId: string,
  itemType: 'course' | 'subject' | 'batch',
  expiryDate: Date
): Promise<void> {
  const user = await findUserByEmail(userEmail);

  if (!user) {
    throw new Error(`No user found with email: ${userEmail}`);
  }

  const userId = user.uid;

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
    return false;
  }

  const now = new Date();
  for (const docSnap of querySnapshot.docs) {
    const purchase = docSnap.data() as Purchase;
    if (purchase.expiryDate.toDate() > now) {
      return true;
    }
  }

  return false;
}

export async function getPayments(): Promise<Payment[]> {
    const paymentsCol = collection(db, 'payments');
    const q = query(paymentsCol, orderBy('paymentDate', 'desc'));
    const paymentSnapshot = await getDocs(q);
    const paymentList = paymentSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Payment));
    return paymentList;
}

export async function getUserPayments(userId: string): Promise<Payment[]> {
    const paymentsCol = collection(db, 'payments');
    const q = query(paymentsCol, where('userId', '==', userId));
    const paymentSnapshot = await getDocs(q);
    const payments = paymentSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Payment));
    return payments.sort((a, b) => b.paymentDate.toMillis() - a.paymentDate.toMillis());
}


export async function getAllPurchases(): Promise<EnrichedPurchase[]> {
    const purchasesCol = collection(db, 'purchases');
    const q = query(purchasesCol, orderBy('purchaseDate', 'desc'));
    const purchaseSnapshot = await getDocs(q);
    
    if (purchaseSnapshot.empty) return [];

    const allCourses = await getCourses();
    const allAcademicData = await getAcademicData();
    const allBatches = await getBatches();
    const allSubjects = allAcademicData.flatMap(doc => (doc.subjects || []).map((s: Subject) => ({...s, className: doc.name})));

    const allCoursesMap = new Map(allCourses.map(course => [course.docId, course]));
    const allSubjectsMap = new Map(allSubjects.map(s => [s.id, s]));
    const allBatchesMap = new Map(allBatches.map(b => [b.id, b]));

    const usersCol = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCol);
    const usersMap = new Map(usersSnapshot.docs.map(doc => [doc.id, doc.data().email]));

    const enrichedList: EnrichedPurchase[] = purchaseSnapshot.docs.map(docSnap => {
        const purchase = { id: docSnap.id, ...docSnap.data() } as Purchase;
        
        let itemName = 'Unknown Item';
        if(purchase.itemType === 'course') {
            const course = allCoursesMap.get(purchase.itemId);
            itemName = course ? course.title : purchase.itemId;
        } else if (purchase.itemType === 'subject') {
            const subject = allSubjectsMap.get(purchase.itemId);
            itemName = subject ? `${subject.name} (${subject.className})` : purchase.itemId;
        } else if (purchase.itemType === 'batch') {
            const batch = allBatchesMap.get(purchase.itemId);
            itemName = batch ? batch.title : purchase.itemId;
        }

        return {
            ...purchase,
            item: {
                id: purchase.itemId,
                name: itemName,
                title: itemName,
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
    const purchaseSnapshot = await getDocs(userId ? q : query(purchasesCol, limit(0)));
    
    if (purchaseSnapshot.empty) return [];

    const allCourses = await getCourses();
    const allAcademicData = await getAcademicData();
    const allBatches = await getBatches();
    const allSubjects = allAcademicData.flatMap(doc => (doc.subjects || []).map((s: Subject) => ({ ...s, classId: doc.id, className: doc.name })));
    
    const allCoursesMap = new Map(allCourses.map(course => [course.docId, course]));
    const allSubjectsMap = new Map(allSubjects.map(s => [s.id, s]));
    const allBatchesMap = new Map(allBatches.map(b => [b.id, b]));


    const now = new Date();
    const enrichedList: EnrichedPurchase[] = [];

    for (const docSnap of purchaseSnapshot.docs) {
        const purchase = { id: docSnap.id, ...docSnap.data() } as Purchase;
        
        if (purchase.expiryDate.toDate() < now) {
            continue;
        }

        let itemData: any = null;
        if (purchase.itemType === 'course') {
            itemData = allCoursesMap.get(purchase.itemId);
        } else if (purchase.itemType === 'subject') {
            itemData = allSubjectsMap.get(purchase.itemId);
        } else if (purchase.itemType === 'batch') {
            itemData = allBatchesMap.get(purchase.itemId);
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
    await runTransaction(db, async (transaction) => {
        const now = new Date();

        // ALL READS MUST HAPPEN FIRST IN A TRANSACTION
        const buyerRef = doc(db, 'users', request.userId);
        const buyerDoc = await transaction.get(buyerRef);
        
        let referrerDoc = null;
        let referrerRef = null;
        let buyerData = null;

        if (buyerDoc.exists()) {
            buyerData = buyerDoc.data() as UserProfile;
            if (buyerData.referredBy && !buyerData.firstPurchaseRewardGiven) {
                referrerRef = doc(db, 'users', buyerData.referredBy);
                referrerDoc = await transaction.get(referrerRef);
            }
        }

        // WRITES START HERE

        // 1. Create Purchase
        const purchasesCol = collection(db, 'purchases');
        const newPurchaseRef = doc(purchasesCol);
        const expiry = new Date(new Date().setFullYear(now.getFullYear() + 1));
        const newPurchase = {
            userId: request.userId,
            itemId: request.itemId,
            itemType: request.itemType,
            purchaseDate: Timestamp.fromDate(now),
            expiryDate: Timestamp.fromDate(expiry),
            creditUsed: request.creditUsed || 0,
        };
        transaction.set(newPurchaseRef, newPurchase);

        // 2. Create Payment Record
        const paymentsCol = collection(db, 'payments');
        const newPaymentRef = doc(paymentsCol);
        const newPayment = {
            userId: request.userId,
            userName: request.userName,
            itemId: request.itemId,
            itemTitle: request.itemTitle,
            itemType: request.itemType,
            amount: request.amountToPay ?? request.itemPrice,
            status: 'succeeded',
            paymentDate: Timestamp.fromDate(now),
            razorpayPaymentId: `UPI: ${request.upiReferenceId}`,
        };
        transaction.set(newPaymentRef, newPayment);

        // 3. Update Request Status
        const requestDocRef = doc(db, 'paymentRequests', request.id);
        transaction.update(requestDocRef, {
            status: 'approved',
            actionDate: Timestamp.fromDate(now),
        });

        // 4. Handle Referral Reward (only for the first purchase)
        if (referrerDoc && referrerDoc.exists() && referrerRef && buyerData) {
            // Award ₹20 to Referrer
            transaction.update(referrerRef, {
                creditBalance: increment(20)
            });

            // Add to Referrer History
            const histRef = doc(collection(db, 'users', buyerData.referredBy!, 'creditHistory'));
            transaction.set(histRef, {
                amount: 20,
                type: 'credit',
                reason: `Referral reward for ${buyerData.displayName || buyerData.email}`,
                timestamp: serverTimestamp(),
                relatedUser: request.userId
            });
            
            // Mark buyer as rewarded
            transaction.update(buyerRef, { firstPurchaseRewardGiven: true });
        }

        // 5. Deduct used credits from Buyer Wallet (Fix for partial credits not deducting)
        if (request.creditUsed && request.creditUsed > 0) {
            transaction.update(buyerRef, {
                creditBalance: increment(-request.creditUsed)
            });
            // Add debit history for buyer
            const buyerHistRef = doc(collection(db, 'users', request.userId, 'creditHistory'));
            transaction.set(buyerHistRef, {
                amount: request.creditUsed,
                type: 'debit',
                reason: `Used for ${request.itemTitle}`,
                timestamp: serverTimestamp(),
            });
        }
    });
}


export async function rejectPaymentRequest(requestId: string, reason: string, request: PaymentRequest): Promise<void> {
    const batch = writeBatch(db);
    const now = new Date();
    
    const paymentsCol = collection(db, 'payments');
    const newPaymentRef = doc(paymentsCol);
    const newPayment: Omit<Payment, 'id'> = {
        userId: request.userId,
        userName: request.userName,
        itemId: request.itemId,
        itemTitle: request.itemTitle,
        itemType: request.itemType,
        amount: request.amountToPay ?? request.itemPrice,
        status: 'failed',
        paymentDate: Timestamp.fromDate(now),
        razorpayPaymentId: `UPI: ${request.upiReferenceId}`,
    };
    batch.set(newPaymentRef, newPayment);
    
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
  
  const userDocRef = doc(db, 'users', userInfo.userId);
  const userDoc = await getDoc(userDocRef);
  if (!userDoc.exists()) {
    await setDoc(userDocRef, {
      uid: userInfo.userId,
      email: userInfo.userName,
      createdAt: new Date().toISOString(),
      readNotifications: [],
      referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      referralCount: 0,
      creditBalance: 0
    });
  }

  const updateData: { [key: string]: any } = {
      messages: arrayUnion(message),
      lastMessageTimestamp: message.timestamp,
  };

  if (message.sender === 'admin') {
      updateData.unreadCount = increment(1);
  }

  const chatDoc = await getDoc(chatDocRef);
  if (chatDoc.exists()) {
    await updateDoc(chatDocRef, updateData);
  } else {
    await setDoc(chatDocRef, {
      id: chatId,
      userId: userInfo.userId,
      userName: userInfo.userName,
      admin: { id: 'admin-1', name: 'StudyScript Support', avatar: '/icons/icon-192x192.png' },
      messages: [message],
      lastMessageTimestamp: message.timestamp,
      unreadCount: message.sender === 'admin' ? 1 : 0,
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

export async function markChatAsRead(userId: string) {
    const chatDocRef = doc(db, 'chats', userId);
    const chatDoc = await getDoc(chatDocRef);
    if (chatDoc.exists()) {
        await updateDoc(chatDocRef, {
            unreadCount: 0
        });
    }
}


export async function deleteChat(chatId: string): Promise<void> {
    const chatDocRef = doc(db, 'chats', chatId);
    await deleteDoc(chatDocRef);
}

// --- NOTIFICATIONS ---

export async function sendNotification(title: string, description: string, link?: string) {
    const notificationsCol = collection(db, 'notifications');
    const notificationData: { title: string; description: string; timestamp: string; link?: string } = {
        title,
        description,
        timestamp: new Date().toISOString(),
    };
    if (link) {
        notificationData.link = link;
    }
    await addDoc(notificationsCol, notificationData);
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
                timestamp: data.timestamp,
                link: data.link,
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
    await setDoc(userDocRef, {
        readNotifications: arrayUnion(notificationId)
    }, { merge: true });
}

// --- FREE NOTES ---
export type FreeNote = {
  id: string;
  title: string;
  description: string;
  content: CourseContent[];
  category: 'online' | 'offline';
};

export function listenToFreeNotes(callback: (notes: FreeNote[]) => void) {
  const notesCol = collection(db, 'freeNotes');
  const q = query(notesCol, orderBy('title'));
  return onSnapshot(q, (snapshot) => {
    const noteList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FreeNote));
    callback(noteList);
  });
}

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
        await addDoc(collection(db, 'freeNotes'), { ...data, category: data.category || 'online' });
    }
    triggerRevalidation('/free-notes');
}

export async function deleteFreeNote(id: string): Promise<void> {
    await deleteDoc(doc(db, 'freeNotes', id));
    triggerRevalidation('/free-notes');
}


// --- BOOKSTORE ---
export type BookstoreItem = {
    id: string;
    title: string;
    url: string;
    thumbnailUrl: string;
    createdAt?: Timestamp;
};

export type BookRequest = {
    id: string;
    userId: string;
    userName: string;
    bookName: string;
    createdAt: Timestamp;
};

export function listenToBookstore(callback: (items: BookstoreItem[]) => void) {
    const itemsCol = collection(db, 'bookstore');
    const q = query(itemsCol, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const itemList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookstoreItem));
        callback(itemList);
    });
}

export async function getBookstoreItems(): Promise<BookstoreItem[]> {
    const itemsCol = collection(db, 'bookstore');
    const q = query(itemsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookstoreItem));
}

export async function saveBookstoreItem(item: BookstoreItem): Promise<void> {
    const { id, ...data } = item;
    if (id) {
        await setDoc(doc(db, 'bookstore', id), data, { merge: true });
    } else {
        await addDoc(collection(db, 'bookstore'), { ...data, createdAt: serverTimestamp() });
    }
    triggerRevalidation('/bookstore');
}

export async function deleteBookstoreItem(id: string): Promise<void> {
    await deleteDoc(doc(db, 'bookstore', id));
    triggerRevalidation('/bookstore');
}

export async function saveBookRequest(userId: string, userName: string, bookName: string): Promise<void> {
    const requestsCol = collection(db, 'bookRequests');
    await addDoc(requestsCol, {
        userId,
        userName,
        bookName,
        createdAt: serverTimestamp(),
    });
}

export function listenToBookRequests(callback: (requests: BookRequest[]) => void) {
    const requestsCol = collection(db, 'bookRequests');
    const q = query(requestsCol, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const requestList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookRequest));
        callback(requestList);
    });
}

export async function deleteBookRequest(id: string): Promise<void> {
    await deleteDoc(doc(db, 'bookRequests', id));
}

// --- AUDIO LECTURES ---
export async function getAudioLectures(): Promise<AudioLecture[]> {
  const lecturesCol = collection(db, 'audioLectures');
  const q = query(lecturesCol, orderBy('title'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AudioLecture));
}

export async function saveAudioLecture(lecture: AudioLecture): Promise<void> {
    const { id, ...data } = lecture;
    if (id) {
        await setDoc(doc(db, 'audioLectures', id), data, { merge: true });
    } else {
        await addDoc(collection(db, 'audioLectures'), data);
    }
}

export async function deleteAudioLecture(id: string): Promise<void> {
    await deleteDoc(doc(db, 'audioLectures', id));
}

// --- QUIZZES ---
export async function getQuiz(id: string): Promise<Quiz | null> {
    const quizDocRef = doc(db, 'quizzes', id);
    const quizSnap = await getDoc(quizDocRef);
    if (quizSnap.exists()) {
        const data = quizSnap.data();
        return { 
            id: quizSnap.id, 
            ...data,
        } as Quiz;
    }

    const schoolsSnapshot = await getDocs(collection(db, 'schools'));
    for (const schoolDoc of schoolsSnapshot.docs) {
        const testDocRef = doc(db, 'schools', schoolDoc.id, 'tests', id);
        const testSnap = await getDoc(testDocRef);
        if (testSnap.exists()) {
            return { id: testSnap.id, ...testSnap.data() } as Quiz;
        }
    }
    
    return null;
}

export async function getQuizzes(): Promise<Quiz[]> {
    const quizzesCol = collection(db, 'quizzes');
    const snapshot = await getDocs(quizzesCol);
    const quizzes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
    
    return quizzes.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
    });
}

export function listenToQuizzes(callback: (quizzes: Quiz[]) => void) {
    const quizzesCol = collection(db, 'quizzes');
    return onSnapshot(quizzesCol, (snapshot) => {
        const quizzes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
        const sorted = quizzes.sort((a, b) => {
            const timeA = a.createdAt?.toMillis() || 0;
            const timeB = b.createdAt?.toMillis() || 0;
            return timeB - timeA;
        });
        callback(sorted);
    });
}

export async function getQuizzesForTarget(targetId: string): Promise<Quiz[]> {
    const quizzesCol = collection(db, 'quizzes');
    const q = query(quizzesCol, where('targetClasses', 'array-contains', targetId));
    const snapshot = await getDocs(q);
    const quizzes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
    
    return quizzes.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
    });
}

export async function saveQuiz(quiz: Quiz): Promise<void> {
    const { id, ...data } = quiz;

    const dataToSave: { [key: string]: any } = { ...data };

    if (data.startTime) {
        dataToSave.startTime = data.startTime instanceof Timestamp ? data.startTime : Timestamp.fromDate(data.startTime as any);
    } else {
        delete dataToSave.startTime;
    }

    if (data.endTime) {
        dataToSave.endTime = data.endTime instanceof Timestamp ? data.endTime : Timestamp.fromDate(data.endTime as any);
    } else {
        delete dataToSave.endTime;
    }

    if (data.resultAnnounceTime) {
        dataToSave.resultAnnounceTime = data.resultAnnounceTime instanceof Timestamp ? data.resultAnnounceTime : Timestamp.fromDate(data.resultAnnounceTime as any);
    } else {
        delete dataToSave.resultAnnounceTime;
    }

    if (id) {
        await setDoc(doc(db, 'quizzes', id), dataToSave, { merge: true });
        triggerRevalidation(`/quizzes/${id}`);
    } else {
        dataToSave.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, 'quizzes'), dataToSave);
        triggerRevalidation(`/quizzes/${docRef.id}`);
    }
}

export async function deleteQuiz(id: string): Promise<void> {
    await deleteDoc(doc(db, 'quizzes', id));
    triggerRevalidation('/quizzes');
}

export async function getQuizFolders(): Promise<QuizFolder[]> {
    const foldersCol = collection(db, 'quizFolders');
    const q = query(foldersCol, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizFolder));
}

export function listenToQuizFolders(callback: (folders: QuizFolder[]) => void) {
    const foldersCol = collection(db, 'quizFolders');
    const q = query(foldersCol, orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const folderList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizFolder));
        callback(folderList);
    });
}

export async function saveQuizFolder(folder: { id?: string, name: string }): Promise<void> {
    if (folder.id) {
        await setDoc(doc(db, 'quizFolders', folder.id), { name: folder.name }, { merge: true });
    } else {
        await addDoc(collection(db, 'quizFolders'), { name: folder.name, createdAt: serverTimestamp() });
    }
}

export async function deleteQuizFolder(id: string): Promise<void> {
    await deleteDoc(doc(db, 'quizFolders', id));
    const quizzesCol = collection(db, 'quizzes');
    const q = query(quizzesCol, where('folderId', '==', id));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { folderId: null });
    });
    await batch.commit();
}

export async function saveQuizAttempt(attemptData: Omit<QuizAttempt, 'id' | 'submittedAt'>): Promise<string> {
    const attemptsCol = collection(db, 'quizAttempts');

    const dataToSave: Omit<QuizAttempt, 'id' | 'submittedAt' > = { ...attemptData };

    if (dataToSave.schoolId && dataToSave.userId) {
        const school = await getSchool(dataToSave.schoolId);
        const studentInfo = school?.students?.find(s => s.uid === dataToSave.userId);
        if (studentInfo) {
            dataToSave.userName = studentInfo.name;
            dataToSave.userClass = studentInfo.userClass;
        }
    }

    const docRef = await addDoc(attemptsCol, {
        ...dataToSave,
        submittedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function getQuizAttempts(options?: { generalOnly?: boolean }): Promise<QuizAttempt[]> {
    const attemptsCol = collection(db, 'quizAttempts');
    let q;
    if (options?.generalOnly) {
        q = query(attemptsCol, where('schoolId', '==', null), orderBy('submittedAt', 'desc'));
    } else {
        q = query(attemptsCol, orderBy('submittedAt', 'desc'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttempt));
}

export async function getQuizAttemptsForQuiz(quizId: string): Promise<QuizAttempt[]> {
    const attemptsCol = collection(db, 'quizAttempts');
    const q = query(attemptsCol, where('quizId', '==', quizId));
    const snapshot = await getDocs(q);
    const attempts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttempt));
    
    return attempts.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return a.submittedAt.toMillis() - b.submittedAt.toMillis();
    });
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

export async function findUserByEmail(email: string): Promise<UserProfile | null> {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('email', '==', email), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const userDoc = snapshot.docs[0];
    return {
        uid: userDoc.id,
        ...userDoc.data()
    } as UserProfile;
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
  referralBanner?: BannerItem;
};

export async function getBannerSettings(): Promise<BannerSettings> {
    const settingsDocRef = doc(db, 'settings', 'homeBanner');
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
            banners: data.banners || [],
            referralBanner: data.referralBanner || undefined
        };
    }
    return { banners: [] };
}

export function listenToBannerSettings(callback: (settings: BannerSettings) => void) {
    const settingsDocRef = doc(db, 'settings', 'homeBanner');
    return onSnapshot(settingsDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            callback({ 
                banners: data.banners || [],
                referralBanner: data.referralBanner || undefined
            });
        } else {
            callback({ banners: [] });
        }
    });
}

export async function saveBannerSettings(settings: BannerSettings): Promise<void> {
    const settingsDocRef = doc(db, 'settings', 'homeBanner');
    await setDoc(settingsDocRef, settings, { merge: true });
    triggerRevalidation('/');
}

// --- STUDENT REVIEWS ---
export async function getReviews(status: 'approved' | 'pending' | 'all' = 'approved'): Promise<Review[]> {
    const reviewsCol = collection(db, 'reviews');
    const q = query(reviewsCol, orderBy('submittedAt', 'desc'));
    const snapshot = await getDocs(q);
    let allReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));

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
    triggerRevalidation('/');
}

export async function deleteReview(id: string): Promise<void> {
    const reviewDocRef = doc(db, 'reviews', id);
    await deleteDoc(reviewDocRef);
    triggerRevalidation('/');
}

// --- LIVE CLASSES ---
export type LiveClass = {
    id: string;
    title: string;
    startTime: Timestamp;
    endTime: Timestamp;
    meetingLink: string;
    associatedItemId: string;
    itemType: 'course' | 'subject';
    associatedItemName: string;
    classId?: string;
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
    const liveClassesCol = collection(db, 'liveClasses');
    const q = query(liveClassesCol, where('associatedItemId', '==', itemId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        return null;
    }

    const now = new Date();
    const upcomingClasses = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as LiveClass))
        .filter(lc => lc.endTime.toDate() > now)
        .sort((a, b) => a.startTime.toDate().getTime() - b.startTime.toDate().getTime());

    return upcomingClasses.length > 0 ? upcomingClasses[0] : null;
}


export async function deleteLiveClass(id: string): Promise<void> {
    const docRef = doc(db, 'liveClasses', id);
    await deleteDoc(docRef);
}
    
// --- USER PROFILE & CERTIFICATES ---
export async function getUserProfile(userId: string): Promise<Partial<UserProfile> | null> {
  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    return docSnap.data() as Partial<UserProfile>;
  }
  return null;
}

export async function updateUserProfile(userId: string, data: Partial<{ 
    displayName: string; 
    school: string; 
    userClass: string; 
    mobileNumber: string;
    rollNumber: string;
    address: string;
}>): Promise<void> {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, data);
}

export async function updateUserCertificates(userId: string, certificates: UserCertificate[]): Promise<void> {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { certificates });
}

export function listenToUserCreditHistory(userId: string, callback: (history: CreditTransaction[]) => void) {
    const histCol = collection(db, 'users', userId, 'creditHistory');
    const q = query(histCol, orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CreditTransaction));
        callback(history);
    });
}

// --- REFERRALS ---
export async function processReferral(referralCode: string, newUserId: string) {
    if (!referralCode) return;
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('referralCode', '==', referralCode.toUpperCase()), limit(1));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
        const referrerDoc = snapshot.docs[0];
        const referrerId = referrerDoc.id;
        
        const batch = writeBatch(db);
        batch.update(referrerDoc.ref, { referralCount: increment(1) });
        batch.update(doc(db, 'users', newUserId), { referredBy: referrerId, creditBalance: 0 });
        
        await batch.commit();
    }
}

// --- SECURE CREDIT PURCHASE ---
export async function processCreditPurchase(
    userId: string,
    userEmail: string,
    itemId: string,
    itemTitle: string,
    itemType: 'course' | 'subject' | 'batch',
    totalPrice: number,
    creditToUse: number
): Promise<boolean> {
    try {
        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, 'users', userId);
            const userDoc = await transaction.get(userRef);
            
            if (!userDoc.exists()) throw new Error("User not found");
            
            const userData = userDoc.data() as UserProfile;
            const actualBalance = userData.creditBalance || 0;
            
            if (actualBalance < creditToUse) {
                throw new Error("Insufficient credit balance");
            }

            const now = new Date();
            const expiry = new Date(new Date().setFullYear(now.getFullYear() + 1));

            // 1. Deduct Credit
            transaction.update(userRef, {
                creditBalance: increment(-creditToUse)
            });

            // 2. Add Credit History (Debit)
            const histRef = doc(collection(db, 'users', userId, 'creditHistory'));
            transaction.set(histRef, {
                amount: creditToUse,
                type: 'debit',
                reason: `Used for ${itemTitle}`,
                timestamp: serverTimestamp(),
            });

            // 3. Create Purchase
            const purchaseRef = doc(collection(db, 'purchases'));
            transaction.set(purchaseRef, {
                userId,
                itemId,
                itemType,
                purchaseDate: Timestamp.fromDate(now),
                expiryDate: Timestamp.fromDate(expiry),
                creditUsed: creditToUse,
            });

            // 4. Create Payment Record (Success)
            const paymentRef = doc(collection(db, 'payments'));
            transaction.set(paymentRef, {
                userId,
                userName: userEmail,
                itemId,
                itemTitle,
                itemType,
                amount: 0, // Fully covered
                status: 'succeeded',
                paymentDate: Timestamp.fromDate(now),
                razorpayPaymentId: `CREDIT_FULL: ${creditToUse}`,
            });

            // 5. Trigger Referral Reward for first purchase if applicable
            if (!userData.firstPurchaseRewardGiven && userData.referredBy) {
                const referrerRef = doc(db, 'users', userData.referredBy);
                const referrerDoc = await transaction.get(referrerRef);
                
                if (referrerDoc.exists()) {
                    transaction.update(referrerRef, { creditBalance: increment(20) });
                    const rHistRef = doc(collection(db, 'users', userData.referredBy, 'creditHistory'));
                    transaction.set(rHistRef, {
                        amount: 20,
                        type: 'credit',
                        reason: `Referral reward for ${userData.displayName || userData.email}`,
                        timestamp: serverTimestamp(),
                        relatedUser: userId
                    });
                }
                transaction.update(userRef, { firstPurchaseRewardGiven: true });
            }
        });
        return true;
    } catch (e) {
        console.error("Credit purchase failed:", e);
        throw e;
    }
}

// --- SCHOOLS / INSTITUTES ---
export async function getSchools(): Promise<School[]> {
  const schoolsCol = collection(db, 'schools');
  const q = query(schoolsCol, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));
}

export async function getSchool(id: string): Promise<School | null> {
  const schoolDocRef = doc(db, 'schools', id);
  const schoolSnap = await getDoc(schoolDocRef);
  if (schoolSnap.exists()) {
    return { id: schoolSnap.id, ...schoolSnap.data() } as School;
  }
  return null;
}

export async function saveSchool(school: Omit<School, 'id'>): Promise<string> {
  const schoolsCol = collection(db, 'schools');
  const docRef = await addDoc(schoolsCol, school);
  return docRef.id;
}

export async function deleteSchool(schoolId: string): Promise<void> {
    const schoolDocRef = doc(db, 'schools', schoolId);
    const schoolSnap = await getDoc(schoolDocRef);

    if (!schoolSnap.exists()) {
        throw new Error("School not found.");
    }

    const schoolData = schoolSnap.data() as School;
    const batch = writeBatch(db);

    if (schoolData.teachers && schoolData.teachers.length > 0) {
        schoolData.teachers.forEach(teacher => {
            const userDocRef = doc(db, 'users', teacher.uid);
            batch.update(userDocRef, { role: null, schoolId: null });
        });
    }

    if (schoolData.students && schoolData.students.length > 0) {
        schoolData.students.forEach(student => {
            const userDocRef = doc(db, 'users', student.uid);
            batch.update(userDocRef, { schoolId: null });
        });
    }
    
    batch.delete(schoolDocRef);

    await batch.commit();
}


export async function addTeacherToSchool(schoolId: string, teacherEmail: string): Promise<void> {
  const teacherUser = await findUserByEmail(teacherEmail);
  if (!teacherUser) {
    throw new Error(`User with email ${teacherEmail} not found. Please ask them to register first.`);
  }

  const batch = writeBatch(db);

  const userDocRef = doc(db, 'users', teacherUser.uid);
  batch.update(userDocRef, {
    role: 'teacher',
    schoolId: schoolId
  });

  const schoolDocRef = doc(db, 'schools', schoolId);
  batch.update(schoolDocRef, {
    teachers: arrayUnion({
      uid: teacherUser.uid,
      email: teacherUser.email
    })
  });
  
  await batch.commit();
}

export async function removeTeacherFromSchool(schoolId: string, teacherId: string): Promise<void> {
  const schoolDocRef = doc(db, 'schools', schoolId);
  const schoolSnap = await getDoc(schoolDocRef);
  if (!schoolSnap.exists()) {
    throw new Error("School not found.");
  }

  const schoolData = schoolSnap.data() as School;
  const teacherToRemove = schoolData.teachers.find(t => t.uid === teacherId);

  if (!teacherToRemove) {
    throw new Error("Teacher not found in this school.");
  }

  const batch = writeBatch(db);

  const userDocRef = doc(db, 'users', teacherId);
  batch.update(userDocRef, {
    role: null,
    schoolId: null
  });

  batch.update(schoolDocRef, {
    teachers: arrayRemove(teacherToRemove)
  });

  await batch.commit();
}

export async function addStudentToSchool(schoolId: string, studentEmail: string, studentName: string, studentClass: string): Promise<void> {
    const studentUser = await findUserByEmail(studentEmail);
    if (!studentUser) {
        throw new Error(`User with email ${studentEmail} not found. Please ask them to register first.`);
    }

    const batch = writeBatch(db);

    const userDocRef = doc(db, 'users', studentUser.uid);
    batch.update(userDocRef, {
        schoolId: schoolId,
        displayName: studentName,
        userClass: studentClass,
    });
    
    const schoolDocRef = doc(db, 'schools', schoolId);
    const schoolData = (await getDoc(schoolDocRef)).data() as School;
    const existingStudent = schoolData.students?.find(s => s.uid === studentUser.uid);
    if (existingStudent) {
        batch.update(schoolDocRef, { students: arrayRemove(existingStudent) });
    }
    
    batch.update(schoolDocRef, {
        students: arrayUnion({
            uid: studentUser.uid,
            email: studentUser.email,
            name: studentName,
            userClass: studentClass,
        })
    });

    await batch.commit();
}

export async function updateStudentDetails(schoolId: string, student: SchoolStudent): Promise<void> {
    const schoolDocRef = doc(db, 'schools', schoolId);
    const schoolSnap = await getDoc(schoolDocRef);
    if (!schoolSnap.exists()) throw new Error("School not found.");

    const schoolData = schoolSnap.data() as School;
    const students = schoolData.students || [];
    const studentIndex = students.findIndex(s => s.uid === student.uid);
    
    if(studentIndex === -1) throw new Error("Student not found in school.");

    students[studentIndex] = student;

    await updateDoc(schoolDocRef, { students });
}


export async function removeStudentFromSchool(schoolId: string, studentId: string): Promise<void> {
    const schoolDocRef = doc(db, 'schools', schoolId);
    const schoolSnap = await getDoc(schoolDocRef);
    if (!schoolSnap.exists()) throw new Error("School not found.");

    const schoolData = schoolSnap.data() as School;
    const studentToRemove = schoolData.students?.find(s => s.uid === studentId);

    if (!studentToRemove) throw new Error("Student not found in this school.");

    const batch = writeBatch(db);

    const userDocRef = doc(db, 'users', studentId);
    batch.update(userDocRef, {
        schoolId: null
    });
    
    batch.update(schoolDocRef, {
        students: arrayRemove(studentToRemove)
    });

    await batch.commit();
}

export async function getStudentsForSchool(schoolId: string): Promise<SchoolStudent[]> {
  const schoolDoc = await getSchool(schoolId);
  return schoolDoc?.students || [];
}

// --- SCHOOL CONTENT ---

export async function saveSchoolNote(schoolId: string, note: SchoolNote): Promise<void> {
    const { id, ...data } = note;
    const notesCollectionRef = collection(db, 'schools', schoolId, 'notes');
    
    if (id) {
        const noteDocRef = doc(notesCollectionRef, id);
        await setDoc(noteDocRef, data, { merge: true });
    } else {
        await addDoc(notesCollectionRef, data);
    }
}

export async function getSchoolNotes(schoolId: string): Promise<SchoolNote[]> {
    const notesCollectionRef = collection(db, 'schools', schoolId, 'notes');
    const q = query(notesCollectionRef, orderBy('title'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolNote));
}

export async function deleteSchoolNote(schoolId: string, noteId: string): Promise<void> {
    const noteDocRef = doc(db, 'schools', schoolId, 'notes', noteId);
    await deleteDoc(noteDocRef);
}


export async function getSchoolTests(schoolId:string): Promise<Quiz[]> {
    const testsCollectionRef = collection(db, 'schools', schoolId, 'tests');
    const q = query(testsCollectionRef, orderBy('title'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
}


export async function saveSchoolTest(schoolId: string, test: Quiz): Promise<void> {
    const { id, ...data } = test;
    const testsCollectionRef = collection(db, 'schools', schoolId, 'tests');

    const dataToSave: { [key: string]: any } = { ...data };

    if (data.startTime) dataToSave.startTime = data.startTime instanceof Timestamp ? data.startTime : Timestamp.fromDate(data.startTime as any);
    else delete dataToSave.startTime;

    if (data.endTime) dataToSave.endTime = data.endTime instanceof Timestamp ? data.endTime : Timestamp.fromDate(data.endTime as any);
    else delete dataToSave.endTime;

    if (id) {
        const testDocRef = doc(testsCollectionRef, id);
        await setDoc(testDocRef, dataToSave, { merge: true });
    } else {
        await addDoc(testsCollectionRef, dataToSave);
    }
}

export async function deleteSchoolTest(schoolId: string, testId: string): Promise<void> {
    const testDocRef = doc(db, 'schools', schoolId, 'tests', testId);
    await deleteDoc(testDocRef);
}

export async function getSchoolInformation(schoolId: string): Promise<SchoolInformation[]> {
  const infoColRef = collection(db, 'schools', schoolId, 'information');
  const q = query(infoColRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolInformation));
}

export async function saveSchoolInformation(schoolId: string, info: Omit<SchoolInformation, 'id' | 'createdAt'>): Promise<void> {
  const infoColRef = collection(db, 'schools', schoolId, 'information');
  await addDoc(infoColRef, { ...info, createdAt: serverTimestamp() });
}

export async function deleteSchoolInformation(schoolId: string, infoId: string): Promise<void> {
    const infoDocRef = doc(db, 'schools', schoolId, 'information', infoId);
    await deleteDoc(infoDocRef);
}
