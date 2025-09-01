
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, doc, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported, getToken, onMessage, Unsubscribe } from "firebase/messaging";
import { toast } from "@/hooks/use-toast";

// Your web app's Firebase configuration - This is automatically generated
const firebaseConfig = {
  apiKey: "AIzaSyAogMOncvmZLqQ1qom0d3RDihdqOB9XRiY",
  authDomain: "studyscript.firebaseapp.com",
  projectId: "studyscript",
  storageBucket: "studyscript.appspot.com",
  messagingSenderId: "891979418045",
  appId: "1:891979418045:web:bd3903f3dfd23dc54dead4",
  measurementId: "G-7WJ302P118"
};

// Initialize Firebase
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence
if (typeof window !== 'undefined') {
  try {
    enableIndexedDbPersistence(db)
      .then(() => console.log("Firestore offline persistence enabled."))
      .catch((err) => {
        if (err.code == 'failed-precondition') {
          console.warn("Firestore offline persistence could not be enabled: Multiple tabs open?");
        } else if (err.code == 'unimplemented') {
          console.warn("Firestore offline persistence is not supported in this browser.");
        }
      });
  } catch (error) {
    console.error("Error enabling Firestore persistence:", error);
  }
}

// NOTE: All Firebase Cloud Messaging (FCM) related logic has been removed from this file.
// Push notifications are now handled by OneSignal. See OneSignalProvider.tsx.

export { app, auth, db, storage };
