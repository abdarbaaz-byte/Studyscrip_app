
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
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

// Set long-term persistence for authentication
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Auth persistence error:", error);
  });
}

/**
 * Modern Firestore initialization with persistent cache configuration for v11+
 * We use a self-executing function to ensure we only call initializeFirestore once.
 * If it's already been initialized (e.g. during HMR), we fall back to getFirestore().
 */
const db = (() => {
  if (typeof window === 'undefined') {
    return getFirestore(app);
  }

  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch (e: any) {
    // If Firestore is already initialized, initializeFirestore will throw.
    // In that case, we simply return the existing firestore instance.
    return getFirestore(app);
  }
})();

const storage = getStorage(app);
let messaging: any;

if (typeof window !== 'undefined') {
  try {
    // Messaging initialization
    messaging = getMessaging(app);
  } catch (error) {
    console.error("Error initializing Firebase messaging:", error);
  }
}

export { app, auth, db, storage, messaging };
