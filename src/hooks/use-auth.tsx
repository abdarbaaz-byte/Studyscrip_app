
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
  sendEmailVerification,
  type User,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";


export type UserRole = 'admin' | 'employee' | 'teacher' | null;
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
  | 'manage_games';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  userRole: UserRole;
  userSchoolId: string | null;
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
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);
  
  useEffect(() => {
    if (user) { // Removed user.emailVerified check
      if (user.email === SUPER_ADMIN_EMAIL) {
          setUserRole('admin');
          setPermissions([
            'manage_academics', 'manage_courses', 'manage_free_notes', 
            'manage_bookstore', 'manage_payment_requests', 'manage_manual_access', 
            'view_purchases', 'view_payments', 'send_notifications', 'manage_chat',
            'manage_quizzes', 'view_quiz_attempts', 'manage_site_settings',
            'view_live_class_surveys', 'manage_reviews', 'manage_live_classes',
            'manage_certificates', 'manage_schools', 'manage_students',
            'manage_games'
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
          // Teachers get student management permission by default
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
      });
      return () => unsubscribeFirestore();
    } else {
      setUserRole(null);
      setPermissions([]);
      setUserSchoolId(null);
      setLoading(false);
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

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });
      
      const userDocRef = doc(db, "users", user.uid);
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
          school: "",
          userClass: "",
          mobileNumber: "",
          certificates: [],
          activeSessionToken: sessionToken,
          schoolId: null,
      });

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

  const logIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;
      
      const userDocRef = doc(db, 'users', loggedInUser.uid);
      const userDoc = await getDoc(userDocRef);
      
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
            ...userData
         });
      } else {
         await setDoc(userDocRef, userData, { merge: true });
      }

      toast({ title: "Logged in successfully!" });
      
      const docData = userDoc.exists() ? userDoc.data() : {};
      if (docData.role === 'admin' || loggedInUser.email === SUPER_ADMIN_EMAIL) {
        router.push("/admin/dashboard");
      } else if (docData.role === 'teacher') {
        router.push("/teacher/dashboard");
      }
      else {
        router.push("/");
      }
      return true;
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
      return false;
    }
  };

  const logOut = async () => {
    // Redirect first to avoid client-side error on state change
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
