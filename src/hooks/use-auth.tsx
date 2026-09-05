
"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
  useCallback,
} from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithCredential,
  EmailAuthProvider,
  type User,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { processReferral } from "@/lib/data";


export type UserRole = 'admin' | 'employee' | 'teacher' | null;
export type UserPermission = 
  | 'manage_academics'
  | 'manage_courses'
  | 'manage_batches'
  | 'manage_free_notes'
  | 'manage_bookstore'
  | 'manage_payment_requests'
  | 'manage_manual_access'
  | 'view_purchases'
  | 'view_payments'
  | 'send_notifications'
  | 'manage_chat'
  | 'manage_quizzes'
  | 'view_quiz_attempts'
  | 'manage_site_settings'
  | 'view_live_class_surveys'
  | 'manage_reviews'
  | 'manage_live_classes'
  | 'manage_certificates'
  | 'manage_schools'
  | 'manage_students'
  | 'manage_games'
  | 'manage_audio_lectures';

export type LoginStatus = 'success' | 'conflict' | 'error';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  userRole: UserRole;
  userSchoolId: string | null;
  permissions: UserPermission[];
  loading: boolean;
  hasPermission: (permission: UserPermission) => boolean;
  signUp: (name: string, email: string, password: string, userClass: string, referralCode?: string) => Promise<boolean>;
  logIn: (email: string, password: string, force?: boolean) => Promise<LoginStatus>;
  signInWithGoogle: (force?: boolean) => Promise<LoginStatus>;
  logOut: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  linkPassword: (password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUPER_ADMIN_EMAIL = "abdarbaaz@gmail.com";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  
  const isAdmin = userRole === 'admin' || userRole === 'employee';

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setUserRole(null);
        setPermissions([]);
        setUserSchoolId(null);
        // Only set loading false if there's no user. 
        // If there IS a user, wait for the Firestore role check.
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);
  
  useEffect(() => {
    if (user) { 
      // Start fetching extra data, keep loading true
      setLoading(true);
      
      if (user.email === SUPER_ADMIN_EMAIL) {
          setUserRole('admin');
          setPermissions([
            'manage_academics', 'manage_courses', 'manage_free_notes', 
            'manage_bookstore', 'manage_payment_requests', 'manage_manual_access', 
            'view_purchases', 'view_payments', 'send_notifications', 'manage_chat',
            'manage_quizzes', 'view_quiz_attempts', 'manage_site_settings',
            'view_live_class_surveys', 'manage_reviews', 'manage_live_classes',
            'manage_certificates', 'manage_schools', 'manage_students',
            'manage_games', 'manage_audio_lectures'
          ]);
          setLoading(false);
          return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserRole(data.role || null);
          setUserSchoolId(data.schoolId || null);
          if (data.role === 'teacher') {
            setPermissions(['manage_students']);
          } else {
            setPermissions(data.permissions || []);
          }
        } else {
          setUserRole(null);
          setPermissions([]);
          setUserSchoolId(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Firestore Auth Sync Error:", error);
        setLoading(false);
      });
      return () => unsubscribeFirestore();
    }
  }, [user]);

   useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const storedToken = localStorage.getItem('sessionToken');
        
        if (data.activeSessionToken && storedToken && data.activeSessionToken !== storedToken) {
          signOut(auth).then(() => {
            localStorage.removeItem('sessionToken');
            toast({
              variant: 'destructive',
              title: 'Logged Out',
              description: 'You have been logged out because you signed in on another device.',
            });
            router.push('/login');
          });
        }
      }
    });

    return () => unsubscribe();
  }, [user, router, toast]);

  const signUp = async (name: string, email: string, password: string, userClass: string, referralCode?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });
      
      const userDocRef = doc(db, "users", user.uid);
      const sessionToken = Date.now().toString();
      localStorage.setItem('sessionToken', sessionToken);
      
      const myReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: name,
          createdAt: new Date().toISOString(),
          readNotifications: [],
          role: null,
          permissions: [],
          school: "",
          userClass: userClass,
          mobileNumber: "",
          certificates: [],
          activeSessionToken: sessionToken,
          schoolId: null,
          referralCode: myReferralCode,
          referralCount: 0,
          referredBy: null,
          creditBalance: 0,
      });

      if (referralCode) {
          await processReferral(referralCode, user.uid);
      }

      toast({ 
        title: "Account Created!",
        description: "Welcome to StudyScript. You are now logged in."
      });

      router.push("/");
      return true;

    } catch (error: any) {
      toast({ variant: "destructive", title: "Sign-up failed", description: error.message });
      return false;
    }
  };

  const logIn = async (email: string, password: string, force: boolean = false): Promise<LoginStatus> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;
      
      const userDocRef = doc(db, 'users', loggedInUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const existingData = userDoc.data();
        if (existingData.activeSessionToken && !force) {
          await signOut(auth);
          return 'conflict';
        }
      }

      const sessionToken = Date.now().toString();
      localStorage.setItem('sessionToken', sessionToken);

      const userData: any = { activeSessionToken: sessionToken };
      if (loggedInUser.email === SUPER_ADMIN_EMAIL && (!userDoc.exists() || !userDoc.data().role)) {
        userData.role = 'admin';
      }

      if (!userDoc.exists()) {
         await setDoc(userDocRef, {
            uid: loggedInUser.uid,
            email: loggedInUser.email,
            displayName: loggedInUser.displayName,
            createdAt: new Date().toISOString(),
            readNotifications: [],
            school: "",
            userClass: "",
            mobileNumber: "",
            certificates: [],
            referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            referralCount: 0,
            creditBalance: 0,
            ...userData
         });
      } else {
         const existingData = userDoc.data();
         if (!existingData.referralCode) {
             userData.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
             userData.referralCount = 0;
         }
         await setDoc(userDocRef, userData, { merge: true });
      }

      toast({ title: "Logged in successfully!" });
      return 'success';
    } catch (error: any) {
      let description = "An unexpected error occurred. Please try again.";
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-email':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          description = "Incorrect email or password. Please check your credentials and try again.";
          break;
        default:
          description = error.message;
          break;
      }
      toast({ variant: "destructive", title: "Login failed", description });
      return 'error';
    }
  };

  const signInWithGoogle = async (force: boolean = false): Promise<LoginStatus> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;

      const userDocRef = doc(db, 'users', loggedInUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const existingData = userDoc.data();
        if (existingData.activeSessionToken && !force) {
          await signOut(auth);
          return 'conflict';
        }
      }

      const sessionToken = Date.now().toString();
      localStorage.setItem('sessionToken', sessionToken);

      const userData: any = { activeSessionToken: sessionToken };
      
      if (loggedInUser.email === SUPER_ADMIN_EMAIL) {
          userData.role = 'admin';
      }

      if (!userDoc.exists()) {
          const myReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          
          await setDoc(userDocRef, {
              uid: loggedInUser.uid,
              email: loggedInUser.email,
              displayName: loggedInUser.displayName,
              photoURL: loggedInUser.photoURL,
              createdAt: new Date().toISOString(),
              readNotifications: [],
              school: "",
              userClass: "",
              mobileNumber: "",
              certificates: [],
              referralCode: myReferralCode,
              referralCount: 0,
              creditBalance: 0,
              ...userData
          });

          const urlParams = new URLSearchParams(window.location.search);
          const refFromUrl = urlParams.get('ref');
          if (refFromUrl) {
              await processReferral(refFromUrl, loggedInUser.uid);
          }
      } else {
          await updateDoc(userDocRef, userData);
      }

      toast({ title: "Signed in with Google!" });
      return 'success';
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
          return 'error';
      }
      toast({ variant: "destructive", title: "Google Sign-In Failed", description: error.message });
      return 'error';
    }
  };

  const logOut = async () => {
    router.push("/login");
    try {
      if(user) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { activeSessionToken: null });
      }
      await signOut(auth);
      localStorage.removeItem('sessionToken');
      toast({ title: "Logged out successfully." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Logout failed", description: error.message });
    }
  };

  const resetPassword = async (email: string) => {
     try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: "Password reset email sent." });
      router.push("/login");
      return true;
    } catch (error: any)
      {
      toast({ variant: "destructive", title: "Failed to send reset email", description: error.message });
      return false;
    }
  };

  const linkPassword = async (password: string) => {
    if (!auth.currentUser || !auth.currentUser.email) return false;
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
      await linkWithCredential(auth.currentUser, credential);
      toast({ title: "Password Linked!", description: "You can now login with this password as well." });
      return true;
    } catch (error: any) {
      console.error("Link password error:", error);
      toast({ variant: "destructive", title: "Linking Failed", description: error.message });
      return false;
    }
  };

  const hasPermission = useCallback((permission: UserPermission) => {
    if (user?.email === SUPER_ADMIN_EMAIL) return true;
    return permissions.includes(permission);
  }, [permissions, user]);

  const value = {
    user,
    isAdmin,
    userRole,
    userSchoolId,
    permissions,
    loading,
    hasPermission,
    signUp,
    logIn,
    signInWithGoogle,
    logOut,
    resetPassword,
    linkPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
