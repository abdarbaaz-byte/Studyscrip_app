
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported, getToken } from "firebase/messaging";

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

// This is your VAPID key that you get from your Firebase project settings.
const VAPID_KEY = 'BD4y20p9x-4F2T0g-u8r2J93hA5Qv-E4hHqX5yZ3R6g8sW7bC4p3fJ1z2N0kK9a4zJ7lX6vC6yO8g4';

// Initialize Firebase
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Helper function to get the messaging instance
const getMessagingInstance = async () => {
    const isMessagingSupported = await isSupported();
    if (typeof window !== "undefined" && isMessagingSupported) {
        return getMessaging(app);
    }
    return null;
};

// New function to request permission
export const requestNotificationPermission = async (): Promise<boolean> => {
    try {
        const messagingInstance = await getMessagingInstance();
        if (!messagingInstance) {
            console.log("Firebase Messaging is not supported in this browser.");
            return false;
        }
        
        await navigator.serviceWorker.ready;
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            // Get the token right after permission is granted
            await getFCMToken();
            return true;
        } else {
            console.log('Unable to get permission to notify.');
            return false;
        }
    } catch (error) {
        console.error('An error occurred while requesting permission. ', error);
        return false;
    }
};

// New function to just get the token
export const getFCMToken = async () => {
    try {
        const messagingInstance = await getMessagingInstance();
        if (!messagingInstance) return;

        const currentToken = await getToken(messagingInstance, { vapidKey: VAPID_KEY });
        if (currentToken) {
            console.log('FCM Token:', currentToken);
            // You would typically send this token to your server here to store it against the current user.
        } else {
            console.log('No registration token available. Request permission to generate one.');
        }
    } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
    }
};


export { app, auth, db, storage };
