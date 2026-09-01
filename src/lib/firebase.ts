
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  indexedDbLocalCache 
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

function createFirebaseApp(config: object): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(config);
}

const app: FirebaseApp = createFirebaseApp(firebaseConfig);
const auth = getAuth(app);

// Modern Firestore initialization with persistent cache configuration
// This replaces the deprecated enableIndexedDbPersistence()
const db = typeof window !== 'undefined' 
  ? initializeFirestore(app, {
      cache: persistentLocalCache({
        tabManager: indexedDbLocalCache()
      })
    })
  : getFirestore(app);

const storage = getStorage(app);
let messaging: any;

if (typeof window !== 'undefined') {
  try {
    // Messaging initialization
    // We only initialize messaging object here, registration is handled in use-fcm.ts
    messaging = getMessaging(app);
    console.log("Firestore persistent cache enabled.");
  } catch (error) {
    console.error("Error initializing Firebase services:", error);
  }
}

export { app, auth, db, storage, messaging };
