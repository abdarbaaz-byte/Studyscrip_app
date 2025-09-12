
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
  type User,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";


export type UserRole = 'admin' | 'employee' | null;
export type UserPermission = 
  | 'manage_academics'
  | 'manage_courses'
  | 'manage_free_notes'
  | 'manage_bookstore'
  | 'manage_payment_requests'
  | 'manage_manual_access'
  | 'view_purchases'
  | 'view_payments'
  | 'send_notifications'
  | 'view_messages'
  | 'manage_quizzes'
  | 'view_quiz_attempts'
  | 'manage_site_settings'
  | 'view_live_class_surveys'
  | 'manage_reviews';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  userRole: UserRole;
  permissions: UserPermission[];
  loading: boolean;
  hasPermission: (permission: UserPermission) => boolean;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  logIn: (email: string, password: string) => Promise<boolean>;
  logOut: () => void;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The primary super admin email. This user will always have all permissions.
const SUPER_ADMIN_EMAIL = "abdarbaaz@gmail.com";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  
  // This derived state is now based on userRole
  const isAdmin = userRole === 'admin' || userRole === 'employee';

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // If user is logged out, clear roles and stop loading
        setUserRole(null);
        setPermissions([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);
  
  // Effect to listen to user's role and permissions from Firestore
  useEffect(() => {
    if (user) {
      // Check for super admin first
      if (user.email === SUPER_ADMIN_EMAIL) {
          setUserRole('admin');
          // Super admin has all permissions
          setPermissions([
            'manage_academics', 'manage_courses', 'manage_free_notes', 
            'manage_bookstore', 'manage_payment_requests', 'manage_manual_access', 
            'view_purchases', 'view_payments', 'send_notifications', 'view_messages',
            'manage_quizzes', 'view_quiz_attempts', 'manage_site_settings',
            'view_live_class_surveys', 'manage_reviews'
          ]);
          setLoading(false);
          return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserRole(data.role || null);
          setPermissions(data.permissions || []);
        } else {
          // If user doc doesn't exist for some reason
          setUserRole(null);
          setPermissions([]);
        }
        setLoading(false);
      });
      return () => unsubscribeFirestore();
    } else {
      // No user, clear role data
      setUserRole(null);
      setPermissions([]);
      setLoading(false);
    }
  }, [user]);

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

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firebase Auth user profile with display name
      await updateProfile(user, { displayName: name });
      
      const userDocRef = doc(db, "users", user.uid);
      
      // Create a new session token for the new user
      const sessionToken = Date.now().toString();
      localStorage.setItem('sessionToken', sessionToken);
      
      await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: name,
          createdAt: new Date().toISOString(),
          readNotifications: [],
          role: null,
          permissions: [],
          activeSessionToken: sessionToken,
      });

      toast({ title: "Account created successfully!" });
      
      // User is already logged in by createUserWithEmailAndPassword,
      // so we can just redirect them.
      router.push("/");

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

      const userDocRef = doc(db, 'users', loggedInUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      const sessionToken = Date.now().toString();
      localStorage.setItem('sessionToken', sessionToken);

      const userData: any = { activeSessionToken: sessionToken };
      // On first login, check if this user should be the superadmin
      if (loggedInUser.email === SUPER_ADMIN_EMAIL && (!userDoc.exists() || !userDoc.data().role)) {
        userData.role = 'admin';
      }

      if (!userDoc.exists()) {
         await setDoc(userDocRef, {
            uid: loggedInUser.uid,
            email: loggedInUser.email,
            displayName: loggedInUser.displayName, // Carry over display name
            createdAt: new Date().toISOString(),
            readNotifications: [],
            ...userData
         });
      } else {
         await setDoc(userDocRef, userData, { merge: true });
      }

      toast({ title: "Logged in successfully!" });
      
      if (email === SUPER_ADMIN_EMAIL) {
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
        await updateDoc(userDocRef, { activeSessionToken: null });
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

  const hasPermission = useCallback((permission: UserPermission) => {
    if (user?.email === SUPER_ADMIN_EMAIL) return true;
    return permissions.includes(permission);
  }, [permissions, user]);

  const value = {
    user,
    isAdmin,
    userRole,
    permissions,
    loading,
    hasPermission,
    signUp,
    logIn,
    logOut,
    resetPassword,
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
