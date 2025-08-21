
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc, DocumentReference, query, where, Timestamp, orderBy, writeBatch, arrayUnion, onSnapshot, serverTimestamp } from 'firebase/firestore';
import type { Course } from './courses';
import type { ChatMessage, Chat } from './chat';
import type { Notification } from './notifications';
import { getAcademicData } from './academics';

// COURSES
export async function getCourses(): Promise<Course[]> {
  const coursesCol = collection(db, 'courses');
  const courseSnapshot = await getDocs(coursesCol);
  const courseList = courseSnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() } as Course));
  return courseList;
}

export async function getCourse(docId: string): Promise<Course | null> {
  const courseDocRef = doc(db, 'courses', docId);
  const courseSnap = await getDoc(courseDocRef);

  if (courseSnap.exists()) {
    return { docId: courseSnap.id, ...courseSnap.data() } as Course;
  } else {
    return null;
  }
}

export async function saveCourse(courseData: Omit<Course, 'docId'> & { docId?: string }): Promise<DocumentReference | void> {
    const { docId, ...data } = courseData;
    if (docId) {
        const courseDocRef = doc(db, 'courses', docId);
        return await setDoc(courseDocRef, data, { merge: true });
    } else {
        const coursesCol = collection(db, 'courses');
        return await addDoc(coursesCol, data);
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

export type EnrichedPurchase = Purchase & {
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
            userEmail: usersMap.get(purchase.userId) || 'Unknown User',
            itemName,
        };
    });

    return enrichedList;
}

export async function revokePurchase(purchaseId: string): Promise<void> {
    const purchaseDocRef = doc(db, 'purchases', purchaseId);
    await deleteDoc(purchaseDocRef);
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
        timestamp: serverTimestamp(), // Use server timestamp for consistency
        readBy: [] // This will be an array of user IDs who have read it
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
                timestamp: (data.timestamp as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                // 'read' will be handled client-side
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

    