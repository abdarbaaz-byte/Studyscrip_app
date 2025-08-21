
"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";


interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<boolean>;
  logIn: (email: string, password: string) => Promise<boolean>;
  logOut: () => void;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the admin email here.
// IMPORTANT: Replace this with your actual admin email address.
const ADMIN_EMAIL = "abdarbaaz@gmail.com";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser?.email === ADMIN_EMAIL);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Effect for single-device session management
   useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const storedToken = localStorage.getItem('sessionToken');
        
        if (data.activeSessionToken && storedToken && data.activeSessionToken !== storedToken) {
          // Tokens don't match, another device has logged in.
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

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create a user document in Firestore right after sign-up
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          createdAt: new Date().toISOString(),
          readNotifications: [] // Initialize read notifications
      });

      toast({ title: "Account created successfully!" });
      // Redirect to login after successful signup so they can log in
      router.push("/login");
      return true;
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sign-up failed", description: error.message });
      return false;
    }
  };

  const logIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;

      // Check if user doc exists, if not, create one (for legacy users)
      const userDocRef = doc(db, 'users', loggedInUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      const sessionToken = Date.now().toString();
      localStorage.setItem('sessionToken', sessionToken);

      if (!userDoc.exists()) {
         await setDoc(userDocRef, {
            uid: loggedInUser.uid,
            email: loggedInUser.email,
            createdAt: new Date().toISOString(),
            readNotifications: [],
            activeSessionToken: sessionToken,
         });
      } else {
         await setDoc(userDocRef, { activeSessionToken: sessionToken }, { merge: true });
      }

      toast({ title: "Logged in successfully!" });
      
      if (email === ADMIN_EMAIL) {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
      return true;
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login failed", description: error.message });
      return false;
    }
  };

  const logOut = async () => {
    try {
      if(user) {
        const userDocRef = doc(db, 'users', user.uid);
        // Clear session token on logout
        await setDoc(userDocRef, { activeSessionToken: null }, { merge: true });
      }
      await signOut(auth);
      localStorage.removeItem('sessionToken');
      toast({ title: "Logged out successfully." });
      router.push("/login");
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

  const value = {
    user,
    isAdmin,
    loading,
    signUp,
    logIn,
    logOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
