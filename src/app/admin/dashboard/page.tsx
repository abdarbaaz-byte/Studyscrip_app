

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AdminCourseForm } from "@/components/admin-course-form";
import type { Course } from "@/lib/courses";
import { type Chat, type ChatMessage } from "@/lib/chat";
import { PlusCircle, Edit, Trash2, Eye, Send, BookCopy, Loader2, BellRing, UserCheck, Calendar as CalendarIcon, ShoppingCart, ShieldCheck, ShieldAlert, FileText, BookOpen, UserCog, BrainCircuit, BarChart3, Settings, Radio, MessageSquareQuote, CheckCircle, Search, Award, Link as LinkIcon, School as SchoolIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getAcademicData, saveAcademicData, deleteAcademicClass, type AcademicClass, type Subject } from "@/lib/academics";
import { getCourses, saveCourse, deleteCourse, getPayments, type Payment, listenToAllChats, sendMessage, sendNotification, listenToNotifications, deleteNotification, grantManualAccess, getAllPurchases, revokePurchase, type EnrichedPurchase, listenToPaymentRequests, type PaymentRequest, approvePaymentRequest, rejectPaymentRequest, getFreeNotes, saveFreeNotes, deleteFreeNote, getBookstoreItems, saveBookstoreItem, deleteBookstoreItem, type FreeNote, type BookstoreItem, getEmployees, updateEmployeePermissions, type EmployeeData, getQuizzes, saveQuiz, deleteQuiz, type Quiz, getQuizAttempts, type QuizAttempt, getBannerSettings, saveBannerSettings, type BannerSettings, deleteQuizAttempt, getLiveClassSurveys, type LiveClassSurvey, getReviews, type Review, approveReview, deleteReview, getLiveClasses, saveLiveClass, deleteLiveClass, type LiveClass, BannerItem, findUserByEmail, listenToChat, deleteChat, getUserProfile, updateUserCertificates, type UserCertificate, UserProfile, getSchools, type School, saveSchool, addTeacherToSchool, removeTeacherFromSchool, deleteSchool } from "@/lib/data";
import type { Notification } from "@/lib/notifications";
import { AdminAcademicsForm } from "@/components/admin-academics-form";
import { AdminEmployeesForm } from "@/components/admin-employees-form";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { AdminFreeNotesForm } from "@/components/admin-freenotes-form";
import { AdminBookstoreForm } from "@/components/admin-bookstore-form";
import { AdminQuizForm } from "@/components/admin-quiz-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


type FormattedPayment = Omit<Payment, 'paymentDate'> & { paymentDate: string };
type SelectableItem = {
    id: string;
    name: string;
    type: 'course' | 'subject';
    classId?: string; // For subjects
};


export default function AdminDashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [purchases, setPurchases] = useState<EnrichedPurchase[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [freeNotes, setFreeNotes] = useState<FreeNote[]>([]);
  const [bookstoreItems, setBookstoreItems] = useState<BookstoreItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [liveSurveys, setLiveSurveys] = useState<LiveClassSurvey[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);
  const [academicClasses, setAcademicClasses] = useState<AcademicClass[]>([]);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationLink, setNotificationLink] = useState("");
  const [formattedPayments, setFormattedPayments] = useState<FormattedPayment[]>([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [purchaseToRevoke, setPurchaseToRevoke] = useState<EnrichedPurchase | null>(null);
  const [requestToActOn, setRequestToActOn] = useState<PaymentRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('academics');
  const [loading, setLoading] = useState(true);
  const { user, isAdmin, loading: authLoading, hasPermission, userRole } = useAuth();
  const router = useRouter();

  // State for Manual Access Grant
  const [accessEmail, setAccessEmail] = useState("");
  const [accessItemId, setAccessItemId] = useState("");
  const [accessExpiryDate, setAccessExpiryDate] = useState<Date | undefined>();
  const [isGrantingAccess, setIsGrantingAccess] = useState(false);
  const [selectableItems, setSelectableItems] = useState<SelectableItem[]>([]);

  // State for Banner Settings
  const [bannerSettings, setBannerSettings] = useState<BannerSettings>({ banners: [] });
  const [isSavingBanner, setIsSavingBanner] = useState(false);

  // State for deleting quiz attempts
  const [attemptToDelete, setAttemptToDelete] = useState<QuizAttempt | null>(null);

  // State for Live Classes
  const [liveClassTitle, setLiveClassTitle] = useState('');
  const [liveClassStartTime, setLiveClassStartTime] = useState<Date | undefined>();
  const [liveClassEndTime, setLiveClassEndTime] = useState<Date | undefined>();
  const [liveClassAssociatedItem, setLiveClassAssociatedItem] = useState<string>('');
  const [isSavingLiveClass, setIsSavingLiveClass] = useState(false);
  const [liveClassToDelete, setLiveClassToDelete] = useState<LiveClass | null>(null);

  // State for initiating chat
  const [chatSearchEmail, setChatSearchEmail] = useState('');
  const [isSearchingChat, setIsSearchingChat] = useState(false);

  // State for Certificates
  const [certSearchEmail, setCertSearchEmail] = useState('');
  const [isSearchingCertUser, setIsSearchingCertUser] = useState(false);
  const [certUser, setCertUser] = useState<Partial<UserProfile> | null>(null);
  const [userCertificates, setUserCertificates] = useState<UserCertificate[]>([]);
  const [isSavingCerts, setIsSavingCerts] = useState(false);

  // State for Schools
  const [schools, setSchools] = useState<School[]>([]);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [isAddingSchool, setIsAddingSchool] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);


  useEffect(() => {
    // Redirect non-admin/employee users
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      const unsubscribeChats = hasPermission('manage_chat') ? listenToAllChats((liveChats) => setChats(liveChats)) : () => {};
      const unsubscribeNotifications = hasPermission('send_notifications') ? listenToNotifications((liveNotifications) => setNotifications(liveNotifications)) : () => {};
      const unsubscribePaymentRequests = hasPermission('manage_payment_requests') ? listenToPaymentRequests((requests) => setPaymentRequests(requests)) : () => {};
      
      return () => {
        unsubscribeChats();
        unsubscribeNotifications();
        unsubscribePaymentRequests();
      };
    }
  }, [authLoading, isAdmin, hasPermission]);

  const loadAdminData = useCallback(async () => {
      if (!isAdmin) return;
      setLoading(true);
      try {
          const promises = [];
          if (hasPermission('manage_academics')) promises.push(getAcademicData()); else promises.push(Promise.resolve([]));
          if (hasPermission('manage_courses')) promises.push(getCourses()); else promises.push(Promise.resolve([]));
          if (hasPermission('view_payments')) promises.push(getPayments()); else promises.push(Promise.resolve([]));
          if (hasPermission('view_purchases')) promises.push(getAllPurchases()); else promises.push(Promise.resolve([]));
          if (hasPermission('manage_free_notes')) promises.push(getFreeNotes()); else promises.push(Promise.resolve([]));
          if (hasPermission('manage_bookstore')) promises.push(getBookstoreItems()); else promises.push(Promise.resolve([]));
          if (hasPermission('manage_quizzes')) promises.push(getQuizzes()); else promises.push(Promise.resolve([]));
          if (hasPermission('view_quiz_attempts')) promises.push(getQuizAttempts()); else promises.push(Promise.resolve([]));
          if (hasPermission('view_live_class_surveys')) promises.push(getLiveClassSurveys()); else promises.push(Promise.resolve([]));
          if (hasPermission('manage_site_settings')) promises.push(getBannerSettings()); else promises.push(Promise.resolve(null));
          if (hasPermission('manage_reviews')) promises.push(getReviews('pending')); else promises.push(Promise.resolve([]));
          if (hasPermission('manage_live_classes')) promises.push(getLiveClasses()); else promises.push(Promise.resolve([]));
          if (hasPermission('manage_schools')) promises.push(getSchools()); else promises.push(Promise.resolve([]));
          if (userRole === 'admin') promises.push(getEmployees()); else promises.push(Promise.resolve([]));
          

          const [academicsData, coursesData, paymentsData, purchasesData, freeNotesData, bookstoreData, quizzesData, quizAttemptsData, surveysData, bannerData, reviewsData, liveClassesData, schoolsData, employeesData] = await Promise.all(promises);
          
          setAcademicClasses(academicsData as AcademicClass[]);
          setCourses(coursesData as Course[]);
          setPayments(paymentsData as Payment[]);
          setPurchases(purchasesData as EnrichedPurchase[]);
          setFreeNotes(freeNotesData as FreeNote[]);
          setBookstoreItems(bookstoreData as BookstoreItem[]);
          setQuizzes(quizzesData as Quiz[]);
          setQuizAttempts(quizAttemptsData as QuizAttempt[]);
          setLiveSurveys(surveysData as LiveClassSurvey[]);
          setPendingReviews(reviewsData as Review[]);
          setLiveClasses(liveClassesData as LiveClass[]);
          setSchools(schoolsData as School[]);
          setEmployees(employeesData as EmployeeData[]);
          if(bannerData) setBannerSettings(bannerData as BannerSettings);

          // Populate selectable items for manual access & live classes
          if (hasPermission('manage_manual_access') || hasPermission('manage_live_classes')) {
            const courseItems: SelectableItem[] = (coursesData as Course[]).map(c => ({ id: c.docId!, name: `(Course) ${c.title}`, type: 'course' }));
            const subjectItems: SelectableItem[] = (academicsData as AcademicClass[]).flatMap(ac => 
                ac.subjects.map(s => ({ id: s.id, name: `(${ac.name}) ${s.name}`, type: 'subject', classId: ac.id }))
            );
            setSelectableItems([...courseItems, ...subjectItems]);
          }

      } catch (error) {
          console.error("Failed to load data:", error);
          toast({ variant: "destructive", title: "Failed to load data" });
      }
      setLoading(false);
  }, [isAdmin, hasPermission, userRole, toast]);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      loadAdminData();
    }
  }, [authLoading, isAdmin, loadAdminData]);


  useEffect(() => {
    if (payments) {
        const formattedP = payments.map(p => ({
            ...p,
            paymentDate: p.paymentDate.toDate().toLocaleDateString()
        }));
        setFormattedPayments(formattedP as any);
    }
  }, [payments]);

  const handleSaveCourse = async (courseData: Course) => {
    try {
        await saveCourse(courseData);
        await loadAdminData();
        toast({ title: "Course saved successfully!" });
    } catch (error) {
        console.error("Failed to save course:", error);
        toast({ variant: "destructive", title: "Failed to save course" });
    }
    setEditingCourse(null);
    setIsFormDialogOpen(false);
  };

  const handleSaveAcademics = async (updatedClasses: AcademicClass[]) => {
    try {
        await saveAcademicData(updatedClasses);
        await loadAdminData();
        toast({ title: "Academic structure saved!", description: "Changes have been saved to the database." });
    } catch (error) {
        console.error("Failed to save academic data:", error);
        toast({ variant: "destructive", title: "Failed to save changes" });
    }
  };
  
  const handleSaveFreeNotes = async (note: FreeNote) => {
    try {
      await saveFreeNotes(note);
      await loadAdminData();
      toast({ title: "Free Note saved successfully!" });
    } catch (error) {
      console.error("Failed to save free note:", error);
      toast({ variant: "destructive", title: "Failed to save Free Note" });
    }
  };

  const handleDeleteFreeNote = async (noteId: string) => {
    try {
      await deleteFreeNote(noteId);
      await loadAdminData();
      toast({ title: "Free Note deleted successfully." });
    } catch (error) {
      console.error("Failed to delete free note:", error);
      toast({ variant: "destructive", title: "Failed to delete Free Note" });
    }
  };

  const handleSaveBookstoreItem = async (item: BookstoreItem) => {
    try {
      await saveBookstoreItem(item);
      await loadAdminData();
      toast({ title: "Bookstore item saved successfully!" });
    } catch (error) {
      console.error("Failed to save bookstore item:", error);
      toast({ variant: "destructive", title: "Failed to save Bookstore Item" });
    }
  };

  const handleDeleteBookstoreItem = async (itemId: string) => {
    try {
      await deleteBookstoreItem(itemId);
      await loadAdminData();
      toast({ title: "Bookstore item deleted successfully." });
    } catch (error) {
      console.error("Failed to delete bookstore item:", error);
      toast({ variant: "destructive", title: "Failed to delete Bookstore Item" });
    }
  };
  
  const handleSaveQuiz = async (quiz: Quiz) => {
    try {
      await saveQuiz(quiz);
      await loadAdminData();
      toast({ title: "Quiz saved successfully!" });
    } catch (error) {
      console.error("Failed to save quiz:", error);
      toast({ variant: "destructive", title: "Failed to save Quiz" });
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await deleteQuiz(quizId);
      await loadAdminData();
      toast({ title: "Quiz deleted successfully." });
    } catch (error) {
      console.error("Failed to delete quiz:", error);
      toast({ variant: "destructive", title: "Failed to delete Quiz" });
    }
  };

  const handleLiveClassTimeChange = (date: Date | undefined, timeString: string, setter: (d: Date | undefined) => void) => {
    if (!timeString) { // If time is cleared, just update the date part
      setter(date);
      return;
    };
    const newDate = date ? new Date(date) : new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    newDate.setHours(hours, minutes, 0, 0);
    setter(newDate);
  };


  const handleSaveLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveClassTitle || !liveClassStartTime || !liveClassEndTime || !liveClassAssociatedItem) {
        toast({ variant: "destructive", title: "Please fill all fields for the live class." });
        return;
    }

    const selectedItem = selectableItems.find(item => item.id === liveClassAssociatedItem);
    if (!selectedItem) {
        toast({ variant: "destructive", title: "Associated item not found." });
        return;
    }

    const liveClassData: Partial<LiveClass> = {
        title: liveClassTitle,
        startTime: liveClassStartTime as any,
        endTime: liveClassEndTime as any,
        associatedItemId: selectedItem.id,
        itemType: selectedItem.type,
        associatedItemName: selectedItem.name,
    };
    if (selectedItem.classId) {
        liveClassData.classId = selectedItem.classId;
    }

    setIsSavingLiveClass(true);
    try {
        await saveLiveClass(liveClassData as any);
        toast({ title: "Live Class Scheduled!" });
        setLiveClassTitle('');
        setLiveClassStartTime(undefined);
        setLiveClassEndTime(undefined);
        setLiveClassAssociatedItem('');
        loadAdminData(); // Refresh the list
    } catch (error) {
        console.error("Failed to save live class:", error);
        toast({ variant: "destructive", title: "Failed to schedule class." });
    }
    setIsSavingLiveClass(false);
  };

  const handleDeleteLiveClassClick = (liveClass: LiveClass) => {
    setLiveClassToDelete(liveClass);
  };
  
  const confirmDeleteLiveClass = async () => {
      if (liveClassToDelete) {
          try {
              await deleteLiveClass(liveClassToDelete.id);
              toast({ title: "Live Class Deleted" });
              setLiveClassToDelete(null);
              loadAdminData();
          } catch (error) {
              console.error("Failed to delete live class:", error);
              toast({ variant: "destructive", title: "Failed to delete class." });
          }
      }
  };

  const handleDeleteClass = async (classId: string) => {
    try {
      await deleteAcademicClass(classId);
      setAcademicClasses(prev => prev.filter(c => c.id !== classId));
      toast({ title: "Class deleted successfully." });
    } catch (error) {
      console.error("Failed to delete class:", error);
      toast({ variant: "destructive", title: "Failed to delete class." });
    }
  };

  const handleAddNew = () => {
    setEditingCourse(null);
    setIsFormDialogOpen(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
  };
  
  const confirmDelete = async () => {
    if (courseToDelete && courseToDelete.docId) {
        try {
            await deleteCourse(courseToDelete.docId);
            setCourses(courses.filter((c) => c.docId !== courseToDelete.docId));
            toast({ title: "Course deleted successfully." });
        } catch (error) {
            console.error("Failed to delete course:", error);
            toast({ variant: "destructive", title: "Failed to delete course." });
        }
      setCourseToDelete(null);
    }
  };

  const handleViewChat = (chat: Chat) => {
    setSelectedChat(chat);
    setIsChatDialogOpen(true);
  };

  const handleDeleteChatClick = (chat: Chat) => {
    setChatToDelete(chat);
  };

  const confirmDeleteChat = async () => {
    if (chatToDelete) {
      try {
        await deleteChat(chatToDelete.id);
        toast({ title: "Chat history deleted successfully." });
        setChatToDelete(null);
      } catch (error) {
        console.error("Failed to delete chat:", error);
        toast({ variant: "destructive", title: "Failed to delete chat." });
      }
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedChat || !user) return;

    const adminMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "admin",
      text: replyMessage,
      timestamp: new Date().toISOString(),
    };

    try {
      await sendMessage(selectedChat.id, adminMessage, {userId: selectedChat.userId, userName: selectedChat.userName});
      setReplyMessage("");
    } catch (error) {
      console.error("Failed to send reply:", error);
      toast({ variant: "destructive", title: "Failed to send reply" });
    }
  };

  const handleInitiateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatSearchEmail.trim()) {
        toast({ variant: "destructive", title: "Please enter an email." });
        return;
    }
    setIsSearchingChat(true);
    try {
        const foundUser = await findUserByEmail(chatSearchEmail);
        if (!foundUser) {
            throw new Error("User not found.");
        }
        
        // Listen to the chat to get its data or create it if it doesn't exist
        listenToChat(foundUser.uid, (chatData) => {
            if (chatData) {
                setSelectedChat(chatData);
            } else {
                // If chat doesn't exist, create a new one to show in the dialog
                const newChat: Chat = {
                    id: foundUser.uid,
                    userId: foundUser.uid,
                    userName: foundUser.email,
                    messages: [],
                    admin: { id: 'admin-1', name: 'StudyScript Support', avatar: '/logo-icon.svg' },
                    lastMessageTimestamp: new Date().toISOString()
                };
                setSelectedChat(newChat);
            }
            setIsChatDialogOpen(true);
            setChatSearchEmail('');
        });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Chat Error", description: error.message });
    } finally {
        setIsSearchingChat(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationTitle || !notificationMessage) return;

    try {
        await sendNotification(notificationTitle, notificationMessage, notificationLink);
        toast({
            title: "Notification Sent!",
            description: "Your notification has been sent to all users.",
        });
        setNotificationTitle("");
        setNotificationMessage("");
        setNotificationLink("");
    } catch (error) {
        console.error("Failed to send notification:", error);
        toast({ variant: "destructive", title: "Failed to send notification." });
    }
  }

  const handleDeleteNotificationClick = (notification: Notification) => {
    setNotificationToDelete(notification);
  };

  const confirmDeleteNotification = async () => {
    if (notificationToDelete) {
      try {
        await deleteNotification(notificationToDelete.id);
        toast({ title: "Notification deleted successfully." });
        setNotificationToDelete(null); // This will close the dialog, state update will handle removal from list
      } catch (error) {
        console.error("Failed to delete notification:", error);
        toast({ variant: "destructive", title: "Failed to delete notification." });
      }
    }
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessEmail || !accessItemId || !accessExpiryDate) {
        toast({ variant: "destructive", title: "Please fill all fields." });
        return;
    }
    
    setIsGrantingAccess(true);
    try {
        const selectedItem = selectableItems.find(item => item.id === accessItemId);
        if (!selectedItem) throw new Error("Selected item not found.");
        
        await grantManualAccess(accessEmail, selectedItem.id, selectedItem.type, accessExpiryDate);
        toast({ title: "Access Granted!", description: `Access to ${selectedItem.name} granted to ${accessEmail} until ${format(accessExpiryDate, "PPP")}.`});
        setAccessEmail("");
        setAccessItemId("");
        setAccessExpiryDate(undefined);
        loadAdminData(); // Refresh purchases list
    } catch (error: any) {
        console.error("Failed to grant access:", error);
        toast({ variant: "destructive", title: "Failed to grant access", description: error.message });
    }
    setIsGrantingAccess(false);
  };
  
  const handleRevokeClick = (purchase: EnrichedPurchase) => {
    setPurchaseToRevoke(purchase);
  };
  
  const confirmRevokeAccess = async () => {
    if (purchaseToRevoke) {
        try {
            await revokePurchase(purchaseToRevoke.id);
            setPurchases(purchases.filter(p => p.id !== purchaseToRevoke.id));
            toast({ title: "Access Revoked", description: `Access for ${purchaseToRevoke.userEmail} has been revoked.` });
        } catch (error) {
            console.error("Failed to revoke access:", error);
            toast({ variant: "destructive", title: "Failed to revoke access" });
        }
        setPurchaseToRevoke(null);
    }
  };

  const handleApproveRequest = async (request: PaymentRequest) => {
      try {
          await approvePaymentRequest(request);
          toast({ title: "Request Approved", description: `Access granted to ${request.userName}.`, className: "bg-green-100 border-green-500"});
          loadAdminData(); // Refresh purchases and payments
      } catch (error) {
          console.error("Failed to approve request:", error);
          toast({ variant: "destructive", title: "Approval Failed" });
      }
  };

  const handleRejectRequest = async () => {
      if (!requestToActOn || !rejectionReason.trim()) {
          toast({ variant: "destructive", title: "Rejection reason cannot be empty." });
          return;
      }
      setIsRejecting(true);
      try {
          await rejectPaymentRequest(requestToActOn.id, rejectionReason, requestToActOn);
          toast({ title: "Request Rejected" });
          loadAdminData(); // Refresh payments
          setRequestToActOn(null);
          setRejectionReason("");
      } catch (error) {
           console.error("Failed to reject request:", error);
           toast({ variant: "destructive", title: "Rejection Failed" });
      }
      setIsRejecting(false);
  };
  
  const handleSaveEmployee = async (employeeData: EmployeeData) => {
    try {
      await updateEmployeePermissions(employeeData.uid, employeeData);
      toast({ title: "Employee Updated", description: "Permissions have been saved." });
      loadAdminData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBanner(true);
    try {
      await saveBannerSettings(bannerSettings);
      toast({ title: "Banner Settings Saved!" });
    } catch (error) {
      console.error("Failed to save banner settings:", error);
      toast({ variant: "destructive", title: "Failed to save settings" });
    }
    setIsSavingBanner(false);
  };

  const handleAddBanner = () => {
    const newBanner: BannerItem = {
      id: `banner-${Date.now()}`,
      imageUrl: '',
      linkUrl: '',
      isActive: true,
    };
    setBannerSettings(prev => ({ banners: [...prev.banners, newBanner] }));
  };

  const handleUpdateBanner = (id: string, field: keyof Omit<BannerItem, 'id'>, value: string | boolean) => {
    setBannerSettings(prev => ({
      banners: prev.banners.map(b => b.id === id ? { ...b, [field]: value } : b)
    }));
  };
  
  const handleDeleteBanner = (id: string) => {
    setBannerSettings(prev => ({
      banners: prev.banners.filter(b => b.id !== id)
    }));
  };

  const handleDeleteAttemptClick = (attempt: QuizAttempt) => {
    setAttemptToDelete(attempt);
  };

  const confirmDeleteAttempt = async () => {
    if (attemptToDelete && attemptToDelete.id) {
        try {
            await deleteQuizAttempt(attemptToDelete.id);
            setQuizAttempts(quizAttempts.filter((a) => a.id !== attemptToDelete.id));
            toast({ title: "Quiz attempt deleted successfully." });
        } catch (error) {
            console.error("Failed to delete quiz attempt:", error);
            toast({ variant: "destructive", title: "Failed to delete quiz attempt." });
        }
      setAttemptToDelete(null);
    }
  };
  
  const handleApproveReview = async (reviewId: string) => {
    try {
        await approveReview(reviewId);
        toast({ title: "Review Approved!", description: "The review will now appear on the homepage."});
        loadAdminData();
    } catch (error) {
        console.error("Failed to approve review:", error);
        toast({ variant: "destructive", title: "Failed to approve review" });
    }
  };

  const handleDeleteReviewClick = (review: Review) => {
    setReviewToDelete(review);
  };

  const confirmDeleteReview = async () => {
    if (reviewToDelete) {
        try {
            await deleteReview(reviewToDelete.id);
            toast({ title: "Review Deleted", description: "The review has been permanently removed."});
            setReviewToDelete(null);
            loadAdminData();
        } catch (error) {
            console.error("Failed to delete review:", error);
            toast({ variant: "destructive", title: "Failed to delete review" });
        }
    }
  };

  // Certificate Handlers
  const handleSearchCertificateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certSearchEmail) return;
    setIsSearchingCertUser(true);
    setCertUser(null);
    setUserCertificates([]);

    try {
        const foundUser = await findUserByEmail(certSearchEmail);
        if (!foundUser) {
            throw new Error("User not found.");
        }
        setCertUser(foundUser);
        setUserCertificates(foundUser.certificates || []);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setIsSearchingCertUser(false);
    }
  };

  const handleAddCertificate = () => {
      const newCert: UserCertificate = {
          id: `cert-${Date.now()}`,
          title: '',
          url: ''
      };
      setUserCertificates(prev => [...prev, newCert]);
  };

  const handleUpdateCertificate = (index: number, field: 'title' | 'url', value: string) => {
      setUserCertificates(prev => {
          const newCerts = [...prev];
          newCerts[index][field] = value;
          return newCerts;
      });
  };

  const handleDeleteCertificate = (id: string) => {
      setUserCertificates(prev => prev.filter(c => c.id !== id));
  };
  
  const handleSaveCertificates = async () => {
    if (!certUser || !certUser.uid) return;
    setIsSavingCerts(true);
    try {
        await updateUserCertificates(certUser.uid, userCertificates);
        toast({ title: 'Success', description: `Certificates for ${certUser.email} have been updated.`});
    } catch (error) {
        console.error("Failed to save certificates:", error);
        toast({ variant: "destructive", title: "Failed to save certificates" });
    } finally {
        setIsSavingCerts(false);
    }
  };

  // School Handlers
  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;
    setIsAddingSchool(true);
    try {
      await saveSchool({ name: newSchoolName, teachers: [] });
      setNewSchoolName("");
      toast({ title: "School Added!", description: `The school "${newSchoolName}" has been created.` });
      loadAdminData(); // Refresh
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
    setIsAddingSchool(false);
  };

  const handleAddTeacher = async (schoolId: string, email: string) => {
    if (!email.trim()) return;
    try {
      await addTeacherToSchool(schoolId, email);
      toast({ title: "Teacher Added", description: `${email} has been assigned as a teacher.` });
      loadAdminData(); // Refresh
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error Adding Teacher", description: error.message });
    }
  };

  const handleRemoveTeacher = async (schoolId: string, teacherId: string) => {
    try {
      await removeTeacherFromSchool(schoolId, teacherId);
      toast({ title: "Teacher Removed", description: "The teacher's access has been revoked." });
      loadAdminData(); // Refresh
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error Removing Teacher", description: error.message });
    }
  };

  const handleDeleteSchool = async () => {
    if (!schoolToDelete) return;
    try {
        await deleteSchool(schoolToDelete.id!);
        toast({ title: "School Deleted", description: `The school "${schoolToDelete.name}" and all its associations have been removed.` });
        loadAdminData();
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error Deleting School", description: error.message });
    } finally {
        setSchoolToDelete(null);
    }
  };


  if (loading || authLoading) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
      );
  }

  if (!isAdmin) {
    return (
       <div className="flex items-center justify-center min-h-screen">
            <Card className="p-8 text-center">
              <CardTitle className="text-2xl font-bold text-destructive">Access Denied</CardTitle>
              <CardDescription className="mt-2">You do not have permission to view this page.</CardDescription>
            </Card>
        </div>
    );
  }


  const renderAcademicsManagement = () => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Academics Management</CardTitle>
        <CardDescription>Manage classes, subjects, and chapters. Changes are saved to Firestore.</CardDescription>
      </CardHeader>
      <CardContent>
        {academicClasses.length > 0 ? (
           <AdminAcademicsForm 
             initialClasses={academicClasses} 
             onSave={handleSaveAcademics}
             onDeleteClass={handleDeleteClass}
            />
        ) : (
            <p>Loading academic data...</p>
        )}
      </CardContent>
    </Card>
  );

  const renderCourseManagement = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-headline text-2xl">Course Management</CardTitle>
            <CardDescription>Add, edit, or delete courses from Firestore.</CardDescription>
          </div>
          <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>{editingCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
                <DialogDescription>
                  {editingCourse ? "Update the details of the existing course." : "Fill in the details for the new course."}
                </DialogDescription>
              </DialogHeader>
              <AdminCourseForm
                course={editingCourse}
                onSave={handleSaveCourse}
                onCancel={() => setIsFormDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Content Items</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.docId}>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>Rs. {course.price}</TableCell>
                <TableCell>
                  <Badge variant="outline">{(course.folders || []).reduce((acc, folder) => acc + folder.content.length, 0)}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(course)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(course)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the
                          course "{courseToDelete?.title}" from the database.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCourseToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderFreeNotesManagement = () => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Free Notes Management</CardTitle>
        <CardDescription>Manage free notes topics and their content (PDFs, videos, images).</CardDescription>
      </CardHeader>
      <CardContent>
        <AdminFreeNotesForm 
          initialNotes={freeNotes}
          onSave={handleSaveFreeNotes}
          onDelete={handleDeleteFreeNote}
        />
      </CardContent>
    </Card>
  );
  
  const renderBookstoreManagement = () => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Bookstore Management</CardTitle>
        <CardDescription>Manage PDF books available in the bookstore.</CardDescription>
      </CardHeader>
      <CardContent>
        <AdminBookstoreForm
          initialItems={bookstoreItems}
          onSave={handleSaveBookstoreItem}
          onDelete={handleDeleteBookstoreItem}
        />
      </CardContent>
    </Card>
  );

  const renderQuizManagement = () => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Quiz Management</CardTitle>
        <CardDescription>Manage quizzes and their questions.</CardDescription>
      </CardHeader>
      <CardContent>
        <AdminQuizForm
          initialQuizzes={quizzes}
          onSave={handleSaveQuiz}
          onDelete={handleDeleteQuiz}
        />
      </CardContent>
    </Card>
  );

  const renderLiveClassManagement = () => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Live Class Management</CardTitle>
        <CardDescription>Schedule and manage live classes for your courses and subjects.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveLiveClass} className="space-y-6 bg-secondary/50 p-6 rounded-lg border">
            <h3 className="text-lg font-medium">Schedule a New Live Class</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="live-class-title">Class Title</Label>
                    <Input id="live-class-title" value={liveClassTitle} onChange={(e) => setLiveClassTitle(e.target.value)} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="live-class-item">Associated Course/Subject</Label>
                    <Select value={liveClassAssociatedItem} onValueChange={setLiveClassAssociatedItem} required>
                        <SelectTrigger id="live-class-item">
                            <SelectValue placeholder="Select an item..." />
                        </SelectTrigger>
                        <SelectContent>
                             {selectableItems.map(item => (
                                 <SelectItem key={`${item.type}-${item.id}`} value={item.id}>
                                    {item.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Start Time</Label>
                    <div className="flex gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("flex-1 justify-start text-left font-normal", !liveClassStartTime && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {liveClassStartTime ? format(liveClassStartTime, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={liveClassStartTime} onSelect={setLiveClassStartTime} initialFocus /></PopoverContent>
                        </Popover>
                        <Input 
                            type="time" 
                            value={liveClassStartTime ? format(liveClassStartTime, "HH:mm") : ""}
                            onChange={(e) => handleLiveClassTimeChange(liveClassStartTime, e.target.value, setLiveClassStartTime)}
                            className="w-[120px]"
                        />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>End Time</Label>
                     <div className="flex gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("flex-1 justify-start text-left font-normal", !liveClassEndTime && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {liveClassEndTime ? format(liveClassEndTime, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={liveClassEndTime} onSelect={setLiveClassEndTime} initialFocus /></PopoverContent>
                        </Popover>
                        <Input 
                            type="time" 
                            value={liveClassEndTime ? format(liveClassEndTime, "HH:mm") : ""}
                            onChange={(e) => handleLiveClassTimeChange(liveClassEndTime, e.target.value, setLiveClassEndTime)}
                            className="w-[120px]"
                        />
                    </div>
                </div>
             </div>
             <div className="text-center text-muted-foreground text-sm pt-2">Selected Start: {liveClassStartTime ? format(liveClassStartTime, "PPP p") : "Not set"}</div>
             <div className="text-center text-muted-foreground text-sm">Selected End: {liveClassEndTime ? format(liveClassEndTime, "PPP p") : "Not set"}</div>
             <Button type="submit" disabled={isSavingLiveClass}>
                {isSavingLiveClass ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Schedule Class
            </Button>
        </form>

        <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Scheduled Classes</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Associated Item</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {liveClasses.map(lc => (
                        <TableRow key={lc.id}>
                            <TableCell>{lc.title}</TableCell>
                            <TableCell>{lc.associatedItemName}</TableCell>
                            <TableCell>{format(lc.startTime.toDate(), "PPP p")}</TableCell>
                            <TableCell>{format(lc.endTime.toDate(), "PPP p")}</TableCell>
                            <TableCell className="text-right">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" onClick={() => handleDeleteLiveClassClick(lc)}><Trash2 className="h-4 w-4 text-destructive"/></Button></AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete "{liveClassToDelete?.title}"?</AlertDialogTitle>
                                            <AlertDialogDescription>This action cannot be undone and will remove the scheduled live class.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => setLiveClassToDelete(null)}>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={confirmDeleteLiveClass}>Confirm</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                    {liveClasses.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No live classes scheduled.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
  
  const renderQuizAttempts = () => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Quiz Attempts</CardTitle>
        <CardDescription>View all submitted quiz results and user details.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Quiz</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizAttempts.map((attempt) => (
              <TableRow key={attempt.id}>
                <TableCell>
                    <div className="font-medium">{attempt.userName} ({attempt.userClass})</div>
                    {attempt.userEmail && <div className="text-xs text-muted-foreground">{attempt.userEmail}</div>}
                </TableCell>
                <TableCell>{attempt.quizTitle}</TableCell>
                <TableCell>
                    <Badge variant={attempt.percentage >= 50 ? 'default' : 'destructive'} className={cn(attempt.percentage >= 50 && "bg-green-600")}>
                        {attempt.score} / {attempt.totalQuestions} ({attempt.percentage.toFixed(0)}%)
                    </Badge>
                </TableCell>
                <TableCell>{format(attempt.submittedAt.toDate(), "PPP p")}</TableCell>
                <TableCell className="text-right">
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteAttemptClick(attempt)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete Attempt</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Quiz Attempt?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the attempt by "{attemptToDelete?.userName}" for the quiz "{attemptToDelete?.quizTitle}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setAttemptToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteAttempt}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
            {quizAttempts.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No quiz attempts have been submitted yet.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderLiveSurveys = () => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Live Class Surveys</CardTitle>
        <CardDescription>View user feedback for upcoming live classes.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Details</TableHead>
              <TableHead>Subject Interest</TableHead>
              <TableHead>Preferred Time</TableHead>
              <TableHead>Other Topics</TableHead>
              <TableHead>Submitted At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {liveSurveys.map((survey) => (
              <TableRow key={survey.id}>
                <TableCell>
                    <div className="font-medium">{survey.userName}</div>
                    <div className="text-sm text-muted-foreground">{survey.userMobile}</div>
                    <div className="text-xs text-muted-foreground">{survey.userEmail || 'No Email'}</div>
                </TableCell>
                <TableCell className="capitalize">{survey.subjectInterest.replace(/_/g, ' ')}</TableCell>
                <TableCell className="capitalize">{survey.preferredTime.replace(/_/g, ' ')}</TableCell>
                <TableCell className="text-muted-foreground">{survey.otherTopics || 'N/A'}</TableCell>
                <TableCell>{format(survey.submittedAt.toDate(), "PPP p")}</TableCell>
              </TableRow>
            ))}
            {liveSurveys.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No survey responses have been submitted yet.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderReviewManagement = () => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Review Management</CardTitle>
        <CardDescription>Approve or delete pending student reviews.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[15%]">Name</TableHead>
              <TableHead className="w-[55%]">Comment</TableHead>
              <TableHead className="w-[15%]">Submitted At</TableHead>
              <TableHead className="text-right w-[15%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingReviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <div className="font-medium">{review.name}</div>
                  <div className="text-sm text-muted-foreground">Class: {review.className}</div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{review.comment}</TableCell>
                <TableCell>{format(review.submittedAt.toDate(), "PPP")}</TableCell>
                <TableCell className="text-right space-x-2">
                   <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveReview(review.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button size="sm" variant="destructive" onClick={() => handleDeleteReviewClick(review)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete this review?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the review by <span className="font-bold">{reviewToDelete?.name}</span>. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setReviewToDelete(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmDeleteReview}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
             {pendingReviews.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No pending reviews.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );


  const renderPaymentRequests = () => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">UPI Payment Requests</CardTitle>
        <CardDescription>Verify and approve or reject manual UPI payment submissions.</CardDescription>
      </CardHeader>
      <CardContent>
         <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Ref. ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentRequests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>
                    <div className="font-medium">{req.userName}</div>
                    <div className="text-sm text-muted-foreground">Rs. {req.itemPrice}</div>
                </TableCell>
                <TableCell>
                    <div className="font-medium">{req.itemTitle}</div>
                    <div className="text-sm text-muted-foreground capitalize">{req.itemType}</div>
                </TableCell>
                <TableCell className="font-mono">{req.upiReferenceId}</TableCell>
                <TableCell>{format(req.requestDate.toDate(), 'PPP p')}</TableCell>
                <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-100 hover:text-green-700" onClick={() => handleApproveRequest(req)}>
                        <ShieldCheck className="mr-2 h-4 w-4" /> Approve
                    </Button>
                    <Dialog open={requestToActOn?.id === req.id} onOpenChange={(isOpen) => !isOpen && setRequestToActOn(null)}>
                        <DialogTrigger asChild>
                           <Button size="sm" variant="destructive" onClick={() => setRequestToActOn(req)}>
                                <ShieldAlert className="mr-2 h-4 w-4" /> Reject
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reject Payment Request?</DialogTitle>
                                <DialogDescription>
                                    Please provide a reason for rejecting this request for user <span className="font-bold">{requestToActOn?.userName}</span>.
                                </DialogDescription>
                            </DialogHeader>
                             <div className="py-4">
                                <Textarea 
                                    placeholder="e.g., Transaction ID not found, incorrect amount..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => {setRequestToActOn(null); setRejectionReason("");}}>Cancel</Button>
                                <Button variant="destructive" onClick={handleRejectRequest} disabled={isRejecting}>
                                    {isRejecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                    Confirm Rejection
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TableCell>
              </TableRow>
            ))}
            {paymentRequests.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No pending payment requests.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderManualAccessGrant = () => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Manual Access Management</CardTitle>
        <CardDescription>Grant access to a course or subject to a user manually without payment.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGrantAccess} className="space-y-6">
            <div className="space-y-2">
                <label htmlFor="user-email" className="font-medium">User Email</label>
                <Input
                    id="user-email"
                    type="email"
                    placeholder="student@example.com"
                    value={accessEmail}
                    onChange={(e) => setAccessEmail(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                 <label htmlFor="access-item" className="font-medium">Course or Subject to Grant</label>
                <Select value={accessItemId} onValueChange={setAccessItemId} required>
                    <SelectTrigger id="access-item">
                        <SelectValue placeholder="Select a course or subject..." />
                    </SelectTrigger>
                    <SelectContent>
                         {selectableItems.map(item => (
                             <SelectItem key={`${item.type}-${item.id}`} value={item.id}>
                                {item.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <label htmlFor="expiry-date" className="font-medium">Access Expiry Date</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="expiry-date"
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !accessExpiryDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {accessExpiryDate ? format(accessExpiryDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={accessExpiryDate}
                            onSelect={setAccessExpiryDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <Button type="submit" className="w-full" disabled={isGrantingAccess}>
                {isGrantingAccess ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
                {isGrantingAccess ? "Granting Access..." : "Grant Manual Access"}
            </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderPurchaseManagement = () => (
     <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">User Purchases</CardTitle>
        <CardDescription>View and manage all user purchases and manually granted access.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Email</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Purchase Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell className="font-medium">{purchase.userEmail}</TableCell>
                <TableCell>{purchase.itemName}</TableCell>
                <TableCell><Badge variant="secondary" className="capitalize">{purchase.itemType}</Badge></TableCell>
                <TableCell>{format(purchase.purchaseDate.toDate(), "PPP")}</TableCell>
                <TableCell>{format(purchase.expiryDate.toDate(), "PPP")}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="destructive" size="sm" onClick={() => handleRevokeClick(purchase)}>
                            <Trash2 className="mr-2 h-4 w-4"/> Revoke
                         </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Revoke Access?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  Are you sure you want to revoke access for <span className="font-bold">{purchase.userEmail}</span> to the item <span className="font-bold">{purchase.itemName}</span>? This action cannot be undone.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setPurchaseToRevoke(null)}>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={confirmRevokeAccess}>Revoke Access</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
             {purchases.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No purchases found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderEmployeeManagement = () => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Employee Management</CardTitle>
        <CardDescription>Grant dashboard access permissions to your employees.</CardDescription>
      </CardHeader>
      <CardContent>
        <AdminEmployeesForm 
          employees={employees}
          onSave={handleSaveEmployee}
        />
      </CardContent>
    </Card>
  );

  const renderSchoolManagement = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New School/Institute</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSchool} className="flex gap-4">
            <Input 
              placeholder="Enter school name..."
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              required
            />
            <Button type="submit" disabled={isAddingSchool}>
              {isAddingSchool ? <Loader2 className="animate-spin mr-2" /> : <PlusCircle className="mr-2" />}
              Add School
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {schools.map(school => (
          <Card key={school.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{school.name}</CardTitle>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" onClick={() => setSchoolToDelete(school)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete School
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{schoolToDelete?.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the school and unlink all its teachers and students. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSchoolToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSchool}>Confirm Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold mb-2">Manage Teachers</h4>
              <form onSubmit={(e) => { e.preventDefault(); handleAddTeacher(school.id!, teacherEmail); setTeacherEmail(''); }} className="flex gap-4 mb-4">
                <Input
                  type="email"
                  placeholder="teacher@example.com"
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  required
                />
                <Button type="submit">Add Teacher</Button>
              </form>
              <div className="space-y-2">
                <h5 className="font-medium">Assigned Teachers:</h5>
                {school.teachers && school.teachers.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {school.teachers.map(teacher => (
                      <li key={teacher.uid} className="flex justify-between items-center">
                        <span>{teacher.email}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveTeacher(school.id!, teacher.uid)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No teachers assigned yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCertificateManagement = () => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Certificate Management</CardTitle>
        <CardDescription>Assign and manage certificates for your users.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearchCertificateUser} className="mb-6 flex gap-2">
            <Input 
                type="email"
                placeholder="Search user by email..."
                value={certSearchEmail}
                onChange={(e) => setCertSearchEmail(e.target.value)}
                required
            />
            <Button type="submit" disabled={isSearchingCertUser}>
                {isSearchingCertUser ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>}
            </Button>
        </form>
        
        {certUser && (
            <div className="space-y-4">
                <h3 className="font-semibold">Certificates for <span className="text-primary">{certUser.email}</span></h3>
                <div className="space-y-4">
                    {userCertificates.map((cert, index) => (
                        <div key={cert.id} className="p-4 border rounded-lg bg-secondary/50 relative">
                             <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-2 right-2 h-7 w-7 text-destructive" 
                                onClick={() => handleDeleteCertificate(cert.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                             </Button>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`cert-title-${index}`}>Certificate Title</Label>
                                    <Input
                                        id={`cert-title-${index}`}
                                        value={cert.title}
                                        onChange={(e) => handleUpdateCertificate(index, 'title', e.target.value)}
                                        placeholder="e.g., Course Completion"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`cert-url-${index}`}>Image URL</Label>
                                    <Input
                                        id={`cert-url-${index}`}
                                        value={cert.url}
                                        onChange={(e) => handleUpdateCertificate(index, 'url', e.target.value)}
                                        placeholder="https://example.com/cert.jpg"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="flex justify-between items-center mt-4">
                    <Button type="button" variant="outline" onClick={handleAddCertificate}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Certificate
                    </Button>
                    <Button type="button" onClick={handleSaveCertificates} disabled={isSavingCerts}>
                        {isSavingCerts ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        Save Certificates
                    </Button>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );

  const renderSiteSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Site Settings</CardTitle>
        <CardDescription>Manage global site settings like the homepage banners.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveBanner} className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Homepage Banners</h3>
            <Button type="button" variant="outline" size="sm" onClick={handleAddBanner}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Banner
            </Button>
          </div>

          <div className="space-y-4">
            {bannerSettings.banners.map((banner, index) => (
              <div key={banner.id} className="p-4 border rounded-lg relative bg-secondary/50">
                 <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-7 w-7 text-destructive" 
                    onClick={() => handleDeleteBanner(banner.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                 </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`banner-image-url-${index}`}>Banner Image URL</Label>
                    <Input
                      id={`banner-image-url-${index}`}
                      placeholder="https://example.com/banner.jpg"
                      value={banner.imageUrl}
                      onChange={(e) => handleUpdateBanner(banner.id, 'imageUrl', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`banner-link-url-${index}`}>Banner Link URL</Label>
                    <Input
                      id={`banner-link-url-${index}`}
                      placeholder="/courses/your-course-id"
                      value={banner.linkUrl}
                      onChange={(e) => handleUpdateBanner(banner.id, 'linkUrl', e.target.value)}
                    />
                  </div>
                </div>
                 <div className="flex items-center space-x-2 mt-4">
                    <Switch 
                        id={`banner-active-${index}`}
                        checked={banner.isActive}
                        onCheckedChange={(checked) => handleUpdateBanner(banner.id, 'isActive', checked)}
                    />
                    <Label htmlFor={`banner-active-${index}`}>Show this banner</Label>
                </div>
              </div>
            ))}
            {bannerSettings.banners.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No banners configured. Add one to get started.</p>
            )}
          </div>
          
          <Button type="submit" disabled={isSavingBanner}>
            {isSavingBanner ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Banner Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-10 grid gap-8 grid-cols-1 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <div className="flex items-center gap-2 flex-wrap">
            {hasPermission('manage_academics') && <Button variant={activeTab === 'academics' ? 'default' : 'outline'} onClick={() => setActiveTab('academics')}>
                <BookCopy className="mr-2 h-4 w-4" /> Academics
            </Button>}
             {hasPermission('manage_courses') && <Button variant={activeTab === 'courses' ? 'default' : 'outline'} onClick={() => setActiveTab('courses')}>
                <PlusCircle className="mr-2 h-4 w-4" /> Courses
            </Button>}
             {hasPermission('manage_free_notes') && <Button variant={activeTab === 'free-notes' ? 'default' : 'outline'} onClick={() => setActiveTab('free-notes')}>
                <FileText className="mr-2 h-4 w-4" /> Free Notes
            </Button>}
            {hasPermission('manage_bookstore') && <Button variant={activeTab === 'bookstore' ? 'default' : 'outline'} onClick={() => setActiveTab('bookstore')}>
                <BookOpen className="mr-2 h-4 w-4" /> Bookstore
            </Button>}
            {hasPermission('manage_quizzes') && <Button variant={activeTab === 'quizzes' ? 'default' : 'outline'} onClick={() => setActiveTab('quizzes')}>
                <BrainCircuit className="mr-2 h-4 w-4" /> Quizzes
            </Button>}
            {hasPermission('manage_live_classes') && <Button variant={activeTab === 'live-classes' ? 'default' : 'outline'} onClick={() => setActiveTab('live-classes')}>
                <Radio className="mr-2 h-4 w-4" /> Live Classes
            </Button>}
            {hasPermission('manage_certificates') && <Button variant={activeTab === 'certificates' ? 'default' : 'outline'} onClick={() => setActiveTab('certificates')}>
                <Award className="mr-2 h-4 w-4" /> Certificates
            </Button>}
             {hasPermission('manage_schools') && <Button variant={activeTab === 'schools' ? 'default' : 'outline'} onClick={() => setActiveTab('schools')}>
                <SchoolIcon className="mr-2 h-4 w-4" /> Schools
            </Button>}
            {hasPermission('view_quiz_attempts') && <Button variant={activeTab === 'quiz-attempts' ? 'default' : 'outline'} onClick={() => setActiveTab('quiz-attempts')}>
                <BarChart3 className="mr-2 h-4 w-4" /> Quiz Attempts
            </Button>}
            {hasPermission('view_live_class_surveys') && <Button variant={activeTab === 'live-surveys' ? 'default' : 'outline'} onClick={() => setActiveTab('live-surveys')}>
                <Radio className="mr-2 h-4 w-4" /> Live Surveys
            </Button>}
             {hasPermission('manage_reviews') && <Button variant={activeTab === 'reviews' ? 'default' : 'outline'} onClick={() => setActiveTab('reviews')}>
                <MessageSquareQuote className="mr-2 h-4 w-4" /> Reviews
            </Button>}
             {hasPermission('manage_payment_requests') && <Button variant={activeTab === 'requests' ? 'default' : 'outline'} onClick={() => setActiveTab('requests')} className="relative">
                <ShieldAlert className="mr-2 h-4 w-4" /> Payment Requests
                 {paymentRequests.length > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                        {paymentRequests.length}
                    </span>
                 )}
            </Button>}
            {hasPermission('manage_manual_access') && <Button variant={activeTab === 'access' ? 'default' : 'outline'} onClick={() => setActiveTab('access')}>
                <UserCheck className="mr-2 h-4 w-4" /> Manual Access
            </Button>}
            {hasPermission('view_purchases') && <Button variant={activeTab === 'purchases' ? 'default' : 'outline'} onClick={() => setActiveTab('purchases')}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Purchases
            </Button>}
            {userRole === 'admin' && <Button variant={activeTab === 'employees' ? 'default' : 'outline'} onClick={() => setActiveTab('employees')}>
                <UserCog className="mr-2 h-4 w-4" /> Employees
            </Button>}
            {hasPermission('manage_site_settings') && <Button variant={activeTab === 'settings' ? 'default' : 'outline'} onClick={() => setActiveTab('settings')}>
                <Settings className="mr-2 h-4 w-4" /> Site Settings
            </Button>}
        </div>

        {activeTab === 'academics' && hasPermission('manage_academics') && renderAcademicsManagement()}
        {activeTab === 'courses' && hasPermission('manage_courses') && renderCourseManagement()}
        {activeTab === 'free-notes' && hasPermission('manage_free_notes') && renderFreeNotesManagement()}
        {activeTab === 'bookstore' && hasPermission('manage_bookstore') && renderBookstoreManagement()}
        {activeTab === 'quizzes' && hasPermission('manage_quizzes') && renderQuizManagement()}
        {activeTab === 'live-classes' && hasPermission('manage_live_classes') && renderLiveClassManagement()}
        {activeTab === 'certificates' && hasPermission('manage_certificates') && renderCertificateManagement()}
        {activeTab === 'schools' && hasPermission('manage_schools') && renderSchoolManagement()}
        {activeTab === 'quiz-attempts' && hasPermission('view_quiz_attempts') && renderQuizAttempts()}
        {activeTab === 'live-surveys' && hasPermission('view_live_class_surveys') && renderLiveSurveys()}
        {activeTab === 'reviews' && hasPermission('manage_reviews') && renderReviewManagement()}
        {activeTab === 'requests' && hasPermission('manage_payment_requests') && renderPaymentRequests()}
        {activeTab === 'access' && hasPermission('manage_manual_access') && renderManualAccessGrant()}
        {activeTab === 'purchases' && hasPermission('view_purchases') && renderPurchaseManagement()}
        {activeTab === 'employees' && userRole === 'admin' && renderEmployeeManagement()}
        {activeTab === 'settings' && hasPermission('manage_site_settings') && renderSiteSettings()}
        
        {hasPermission('view_payments') && <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Payment History</CardTitle>
            <CardDescription>View recent transaction details.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formattedPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.userName}</TableCell>
                    <TableCell className="text-muted-foreground">{payment.itemTitle}</TableCell>
                    <TableCell className="font-medium">Rs. {payment.amount}</TableCell>
                    <TableCell className="text-muted-foreground">{payment.paymentDate}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          payment.status === 'succeeded'
                            ? 'default'
                            : payment.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className={cn(
                          "capitalize",
                          payment.status === 'succeeded' && "bg-green-600",
                          payment.status === 'pending' && "bg-orange-500",
                        )}
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                 {formattedPayments.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No payments found.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>}
      </div>

      <div className="lg:col-span-1 space-y-8">
        {hasPermission('send_notifications') && <>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Send Notification</CardTitle>
              <CardDescription>Broadcast a message to all users.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendNotification} className="space-y-4">
                <div className="space-y-2">
                  <Input 
                    placeholder="Notification Title" 
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Textarea 
                    placeholder="Notification Message..." 
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    required
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Input 
                    type="url"
                    placeholder="Link URL (Optional)" 
                    value={notificationLink}
                    onChange={(e) => setNotificationLink(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Send Notification
                </Button>
              </form>
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <BellRing /> Notification Management
              </CardTitle>
              <CardDescription>View and delete sent notifications.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="flex items-start gap-4 p-3 rounded-lg bg-secondary">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteNotificationClick(notif)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Notification?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the notification titled "{notificationToDelete?.title}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setNotificationToDelete(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDeleteNotification}>Continue</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold break-words">{notif.title}</p>
                        <p className="text-sm text-muted-foreground break-words">{notif.description}</p>
                        {notif.link && (
                            <a href={notif.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline break-all flex items-center gap-1">
                                <LinkIcon className="h-3 w-3"/> {notif.link}
                            </a>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No notifications sent yet.</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>}
        </>}

        {hasPermission('manage_chat') && <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Chat Management</CardTitle>
            <CardDescription>Start chats or view support requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInitiateChat} className="space-y-3 mb-6 p-4 border rounded-lg bg-secondary/50">
              <Label htmlFor="chat-search" className="font-semibold">Start New Chat</Label>
              <div className="flex gap-2">
                <Input
                  id="chat-search"
                  type="email"
                  placeholder="user@example.com"
                  value={chatSearchEmail}
                  onChange={(e) => setChatSearchEmail(e.target.value)}
                  disabled={isSearchingChat}
                  required
                />
                <Button type="submit" disabled={isSearchingChat}>
                  {isSearchingChat ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  <span className="sr-only">Find & Chat</span>
                </Button>
              </div>
            </form>

            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chats.map((chat) => (
                    <TableRow key={chat.id}>
                      <TableCell className="font-medium flex items-center gap-3">
                         <Avatar className="h-9 w-9">
                            <AvatarImage src={`https://i.pravatar.cc/40?u=${chat.userId}`} alt={chat.userName} />
                            <AvatarFallback>{chat.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span>{chat.userName}</span>
                            <span className="text-xs text-muted-foreground">{new Date(chat.lastMessageTimestamp).toLocaleString()}</span>
                          </div>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                         <Button variant="outline" size="sm" onClick={() => handleViewChat(chat)}>
                           <Eye className="mr-2 h-4 w-4" /> View
                         </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon" onClick={() => handleDeleteChatClick(chat)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Chat History?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the chat history with <span className="font-bold">{chatToDelete?.userName}</span>? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setChatToDelete(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmDeleteChat}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                  {chats.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                            No active chats. Start one by searching for a user.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>}
      </div>


      <Dialog open={isChatDialogOpen} onOpenChange={setIsChatDialogOpen}>
        <DialogContent className="sm:max-w-md flex flex-col h-[500px]">
          <DialogHeader>
            <DialogTitle>Chat with {selectedChat?.userName}</DialogTitle>
            <DialogDescription>
              Respond to the user's messages here.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="h-[400px] p-4 border rounded-md">
                {selectedChat?.messages.map((msg) => (
                  <div key={msg.id} className={`flex items-end gap-2 my-2 ${ msg.sender === 'admin' ? "justify-end" : "justify-start"}`}>
                     {msg.sender === "user" && (
                         <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://i.pravatar.cc/40?u=${selectedChat.userId}`} alt={selectedChat.userName} />
                           <AvatarFallback>{selectedChat.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[75%] rounded-lg px-3 py-2 ${ msg.sender === 'admin' ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                         <p className="text-sm">{msg.text}</p>
                      </div>
                       {msg.sender === "admin" && (
                         <Avatar className="h-8 w-8">
                          <AvatarImage src="/logo-icon.svg" alt="Admin" />
                           <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                      )}
                  </div>
                ))}
            </ScrollArea>
            <div className="mt-4 flex gap-2">
                <Input 
                  placeholder="Type your reply..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                />
                <Button onClick={handleSendReply}>
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}



    

    



