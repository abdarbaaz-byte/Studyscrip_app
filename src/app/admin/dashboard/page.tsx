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
import { PlusCircle, Edit, Trash2, Eye, Send, BookCopy, Loader2, BellRing, UserCheck, Calendar as CalendarIcon, ShoppingCart, ShieldCheck, ShieldAlert, FileText, BookOpen, UserCog, BrainCircuit, BarChart3, Settings, Radio, MessageSquareQuote, CheckCircle, Search, Award, Link as LinkIcon, School as SchoolIcon, User, Layers, Headphones, Gift, LayoutGrid, Save, Inbox, Coins, Users, History, ArrowUpRight, ArrowDownRight, Clock, MonitorPlay, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getAcademicData, saveAcademicData, deleteAcademicClass, type AcademicClass, type Subject } from "@/lib/academics";
import { getCourses, saveCourse, deleteCourse, getPayments, type Payment, listenToAllChats, sendMessage, sendNotification, listenToNotifications, deleteNotification, grantManualAccess, getAllPurchases, revokePurchase, type EnrichedPurchase, listenToPaymentRequests, type PaymentRequest, approvePaymentRequest, rejectPaymentRequest, getFreeNotes, saveFreeNotes, deleteFreeNote, getBookstoreItems, saveBookstoreItem, deleteBookstoreItem, type FreeNote, type BookstoreItem, getEmployees, updateEmployeePermissions, type EmployeeData, getQuizzes, saveQuiz, deleteQuiz, type Quiz, getQuizAttempts, type QuizAttempt, getBannerSettings, saveBannerSettings, type BannerSettings, deleteQuizAttempt, getLiveClassSurveys, type LiveClassSurvey, getReviews, type Review, approveReview, deleteReview, getLiveClasses, saveLiveClass, deleteLiveClass, type LiveClass, BannerItem, findUserByEmail, listenToChat, deleteChat, getUserProfile, updateUserCertificates, type UserCertificate, UserProfile, getSchools, type School, saveSchool, addTeacherToSchool, removeTeacherFromSchool, deleteSchool, getAudioLectures, saveAudioLecture, deleteAudioLecture, type AudioLecture, getBatches, saveBatch, deleteBatch, type Batch, type BookRequest, listenToBookRequests, deleteBookRequest, getUserCreditHistory, type CreditTransaction, awardManualCredits, type PopupBannerSettings } from "@/lib/data";
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
import { AdminAudioLecturesForm } from "@/components/admin-audio-lectures-form";
import { AdminBatchForm } from "@/components/admin-batch-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Timestamp } from "firebase/firestore";


type FormattedPayment = Omit<Payment, 'paymentDate'> & { paymentDate: string };
type SelectableItem = {
    id: string;
    name: string;
    type: 'course' | 'subject' | 'batch';
    classId?: string; // For subjects
};


export default function AdminDashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [purchases, setPurchases] = useState<EnrichedPurchase[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [freeNotes, setFreeNotes] = useState<FreeNote[]>([]);
  const [bookstoreItems, setBookstoreItems] = useState<BookstoreItem[]>([]);
  const [bookRequests, setBookRequests] = useState<BookRequest[]>([]);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [audioLectures, setAudioLectures] = useState<AudioLecture[]>([]);
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

  // State for Targeted Notifications (Updated for Multi-Select)
  const [notifTarget, setNotifTarget] = useState<'everyone' | 'user'>('everyone');
  const [notifUserEmail, setNotifUserEmail] = useState("");
  const [selectedTargetUsers, setSelectedTargetUsers] = useState<{ uid: string; email: string }[]>([]);
  const [isSearchingNotifUser, setIsSearchingNotifUser] = useState(false);

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
  const [liveClassMeetingLink, setLiveClassMeetingLink] = useState('');
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

  const [isSendingNotification, setIsSendingNotification] = useState(false);

  // State for User Credits Management
  const [creditSearchEmail, setCreditSearchEmail] = useState("");
  const [isSearchingCreditUser, setIsSearchingCreditUser] = useState(false);
  const [creditSearchedUser, setCreditSearchedUser] = useState<UserProfile | null>(null);
  const [creditUserHistory, setCreditUserHistory] = useState<CreditTransaction[]>([]);
  const [rewardEmail, setRewardEmail] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [rewardReason, setRewardReason] = useState("");
  const [isGivingReward, setIsGivingReward] = useState(false);

  // State for Purchase Search
  const [purchaseSearchTerm, setPurchaseSearchTerm] = useState("");


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
      const unsubscribeBookRequests = hasPermission('manage_bookstore') ? listenToBookRequests((reqs) => setBookRequests(reqs)) : () => {};
      
      return () => {
        unsubscribeChats();
        unsubscribeNotifications();
        unsubscribePaymentRequests();
        unsubscribeBookRequests();
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
          if (hasPermission('manage_batches')) promises.push(getBatches()); else promises.push(Promise.resolve([]));
          if (hasPermission('view_payments')) promises.push(getPayments()); else promises.push(Promise.resolve([]));
          if (hasPermission('view_purchases')) promises.push(getAllPurchases()); else promises.push(Promise.resolve([]));
          if (hasPermission('manage_free_notes')) promises.push(getFreeNotes()); else promises.push(Promise.resolve([]));
          if (hasPermission('manage_bookstore')) promises.push(getBookstoreItems()); else promises.push(Promise.resolve([]));
          if (hasPermission('manage_audio_lectures')) promises.push(getAudioLectures()); else promises.push(Promise.resolve([]));
          if (hasPermission('manage_quizzes')) promises.push(getQuizzes()); else promises.push(Promise.resolve([]));
          if (hasPermission('view_quiz_attempts')) promises.push(getQuizAttempts()); else promises.push(Promise.resolve([]));
          if (hasPermission('view_live_class_surveys')) promises.push(getLiveClassSurveys()); else promises.push(Promise.resolve([]));
          if (hasPermission('manage_site_settings')) promises.push(getBannerSettings()); else promises.push(Promise.resolve(null));
          if (hasPermission('manage_reviews')) promises.push(getReviews('pending')); else promises.push(Promise.resolve([]));
          if (hasPermission('manage_live_classes')) promises.push(getLiveClasses()); else promises.push(Promise.resolve([]));
          if (hasPermission('manage_schools')) promises.push(getSchools()); else promises.push(Promise.resolve([]));
          if (userRole === 'admin') promises.push(getEmployees()); else promises.push(Promise.resolve([]));
          

          const [academicsData, coursesData, batchesData, paymentsData, purchasesData, freeNotesData, bookstoreData, audioLecturesData, quizzesData, quizAttemptsData, surveysData, bannerData, reviewsData, liveClassesData, schoolsData, employeesData] = await Promise.all(promises);
          
          setAcademicClasses(academicsData as AcademicClass[]);
          setCourses(coursesData as Course[]);
          setBatches(batchesData as Batch[]);
          setPayments(paymentsData as Payment[]);
          setPurchases(purchasesData as EnrichedPurchase[]);
          setFreeNotes(freeNotesData as FreeNote[]);
          setBookstoreItems(bookstoreData as BookstoreItem[]);
          setAudioLectures(audioLecturesData as AudioLecture[]);
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
            const batchItems: SelectableItem[] = (batchesData as Batch[]).map(b => ({ id: b.id, name: `(Batch) ${b.title}`, type: 'batch' }));
            const subjectItems: SelectableItem[] = (academicsData as AcademicClass[]).flatMap(ac => 
                ac.subjects.map(s => ({ id: s.id, name: `(${ac.name}) ${s.name}`, type: 'subject', classId: ac.id }))
            );
            setSelectableItems([...courseItems, ...batchItems, ...subjectItems]);
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

  const handleSaveBatch = async (batchData: Batch) => {
    try {
        await saveBatch(batchData);
        await loadAdminData();
        toast({ title: "Batch saved successfully!" });
    } catch (error) {
        console.error("Failed to save batch:", error);
        toast({ variant: "destructive", title: "Failed to save batch" });
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    try {
        await deleteBatch(batchId);
        await loadAdminData();
        toast({ title: "Batch deleted." });
    } catch (error) {
        console.error("Failed to delete batch:", error);
        toast({ variant: "destructive", title: "Failed to delete batch." });
    }
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
      toast({ variant: "destructive", title: "Failed to save Free Note" });
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

  const handleDeleteBookRequest = async (id: string) => {
    try {
      await deleteBookRequest(id);
      toast({ title: "Request deleted." });
    } catch (error) {
      console.error("Failed to delete book request:", error);
      toast({ variant: "destructive", title: "Delete Failed" });
    }
  };
  
  const handleSaveAudioLecture = async (lecture: AudioLecture) => {
    try {
      await saveAudioLecture(lecture);
      await loadAdminData();
      toast({ title: "Audio Lecture saved successfully!" });
    } catch (error) {
      console.error("Failed to save audio lecture:", error);
      toast({ variant: "destructive", title: "Failed to save Audio Lecture" });
    }
  };

  const handleDeleteAudioLecture = async (lectureId: string) => {
    try {
      await deleteAudioLecture(lectureId);
      await loadAdminData();
      toast({ title: "Audio Lecture deleted successfully." });
    } catch (error) {
      console.error("Failed to delete audio lecture:", error);
      toast({ variant: "destructive", title: "Failed to delete Audio Lecture" });
    }
  };

  const handleSaveQuiz = async (quiz: Quiz) => {
    try {
      await saveQuiz(quiz);
      await loadAdminData();
      toast({ title: "Test saved successfully!" });
    } catch (error) {
      console.error("Failed to save test:", error);
      toast({ variant: "destructive", title: "Failed to save Test" });
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await deleteQuiz(quizId);
      await loadAdminData();
      toast({ title: "Test deleted successfully." });
    } catch (error) {
      console.error("Failed to delete test:", error);
      toast({ variant: "destructive", title: "Failed to delete Test" });
    }
  };

  const handleTimeChange = (date: Date | undefined, timeString: string, setter: (d: Date | undefined) => void) => {
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
    if (!liveClassTitle || !liveClassStartTime || !liveClassEndTime || !liveClassAssociatedItem || !liveClassMeetingLink) {
        toast({ variant: "destructive", title: "Please fill all fields for the live class, including the meeting link." });
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
        meetingLink: liveClassMeetingLink,
        associatedItemId: selectedItem.id,
        itemType: selectedItem.type as any,
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
        setLiveClassMeetingLink('');
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
                    admin: { id: 'admin-1', name: 'StudyScript Support', avatar: '/icons/icon-192x192.png' },
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

  const handleSearchNotifUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifUserEmail.trim()) return;
    setIsSearchingNotifUser(true);
    try {
        const foundUser = await findUserByEmail(notifUserEmail);
        if (foundUser) {
            if (!selectedTargetUsers.find(u => u.uid === foundUser.uid)) {
                setSelectedTargetUsers(prev => [...prev, { uid: foundUser.uid, email: foundUser.email }]);
                toast({ title: "User Added", description: `${foundUser.email} is added to recipient list.` });
            } else {
                toast({ variant: "destructive", title: "User already in list." });
            }
            setNotifUserEmail(""); // Clear search bar
        } else {
            toast({ variant: "destructive", title: "User not found." });
        }
    } catch (e) {
        toast({ variant: "destructive", title: "Search failed." });
    }
    setIsSearchingNotifUser(false);
  }

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationTitle || !notificationMessage) return;
    if (notifTarget === 'user' && selectedTargetUsers.length === 0) {
        toast({ variant: "destructive", title: "Please select at least one user." });
        return;
    }

    setIsSendingNotification(true);
    try {
        // 1. Prepare Payload
        const payload: any = {
            title: notificationTitle,
            body: notificationMessage,
            link: notificationLink,
        };

        if (notifTarget === 'everyone') {
            payload.broadcast = true;
            // Broadcasts also save to Firestore for the In-App global list
            await sendNotification(notificationTitle, notificationMessage, notificationLink);
        } else {
            payload.targetUids = selectedTargetUsers.map(u => u.uid);
            // Targeted/Private notifications are NOT saved to the global 'notifications' collection
        }

        const response = await fetch('/api/push-notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('API failed to send push notification');

        toast({
            title: notifTarget === 'everyone' ? "Broadcast Sent!" : `${selectedTargetUsers.length} Notifications Sent!`,
            description: "Notifications delivered via FCM.",
        });
        
        // Reset fields
        setNotificationTitle("");
        setNotificationMessage("");
        setNotificationLink("");
        setNotifUserEmail("");
        setSelectedTargetUsers([]);

    } catch (error) {
        console.error("Failed to send notification:", error);
        toast({ variant: "destructive", title: "Failed to send notification." });
    }
    setIsSendingNotification(false);
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
        
        await grantManualAccess(accessEmail, selectedItem.id, selectedItem.type as any, accessExpiryDate);
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
          
          // Automated Notification to Student
          fetch('/api/push-notifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  targetUids: [request.userId],
                  title: "Congratulations! 🎉",
                  body: `${request.itemTitle} has been unlocked for you. Happy learning!`,
                  link: request.itemType === 'batch' ? `/batches/${request.itemId}` : request.itemType === 'course' ? `/courses/${request.itemId}` : '/my-courses'
              })
          });

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
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBanner(true);
    try {
      await saveBannerSettings(bannerSettings);
      toast({ title: "Site Settings Saved!" });
    } catch (error) {
      console.error("Failed to save site settings:", error);
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
    setBannerSettings(prev => ({ ...prev, banners: [...prev.banners, newBanner] }));
  };

  const handleUpdateBanner = (id: string, field: keyof Omit<BannerItem, 'id'>, value: string | boolean) => {
    setBannerSettings(prev => ({
      ...prev,
      banners: prev.banners.map(b => b.id === id ? { ...b, [field]: value } : b)
    }));
  };
  
  const handleDeleteBanner = (id: string) => {
    setBannerSettings(prev => ({
      ...prev,
      banners: prev.banners.filter(b => b.id !== id)
    }));
  };

  const handleUpdateReferralBanner = (field: keyof Omit<BannerItem, 'id'>, value: string | boolean) => {
    setBannerSettings(prev => ({
        ...prev,
        referralBanner: {
            id: 'referral-banner',
            imageUrl: prev.referralBanner?.imageUrl || '',
            linkUrl: prev.referralBanner?.linkUrl || '',
            isActive: prev.referralBanner?.isActive ?? false,
            [field]: value
        }
    }));
  };

  const handleUpdatePopupBanner = (field: keyof Omit<PopupBannerSettings, 'id' | 'expiresAt'>, value: string | boolean) => {
    setBannerSettings(prev => ({
        ...prev,
        popupBanner: {
            id: prev.popupBanner?.id || `popup-${Date.now()}`, // Keep ID unless resetting
            imageUrl: prev.popupBanner?.imageUrl || '',
            actionUrl: prev.popupBanner?.actionUrl || '',
            expiresAt: prev.popupBanner?.expiresAt || Timestamp.now(),
            isActive: prev.popupBanner?.isActive ?? false,
            [field]: value,
            // If any critical field changes, generate new ID to reset dismissal for all users
            ...(field !== 'isActive' ? { id: `popup-${Date.now()}` } : {})
        }
    }));
  };

  const handlePopupExpiryChange = (date: Date | undefined, timeString: string) => {
    if (!date) return;
    const newDate = new Date(date);
    if (timeString) {
        const [h, m] = timeString.split(':').map(Number);
        newDate.setHours(h, m, 0, 0);
    }
    setBannerSettings(prev => ({
        ...prev,
        popupBanner: {
            ...prev.popupBanner!,
            id: `popup-${Date.now()}`, // Force reset for everyone on update
            expiresAt: Timestamp.fromDate(newDate)
        }
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
            toast({ title: "Test attempt deleted successfully." });
        } catch (error) {
            console.error("Failed to delete test attempt:", error);
            toast({ variant: "destructive", title: "Failed to delete test attempt." });
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

  // Credit Management Handlers
  const handleSearchCreditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditSearchEmail.trim()) return;
    setIsSearchingCreditUser(true);
    setCreditSearchedUser(null);
    setCreditUserHistory([]);
    try {
        const foundUser = await findUserByEmail(creditSearchEmail);
        if (foundUser) {
            setCreditSearchedUser(foundUser);
            const history = await getUserCreditHistory(foundUser.uid);
            setCreditUserHistory(history);
            setRewardEmail(foundUser.email);
        } else {
            toast({ variant: "destructive", title: "User not found." });
        }
    } catch (error: any) {
        toast({ variant: "destructive", title: "Search failed.", description: error.message });
    } finally {
        setIsSearchingCreditUser(false);
    }
  };

  const handleGiveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardEmail || !rewardAmount || !rewardReason.trim()) {
        toast({ variant: "destructive", title: "All reward fields are required." });
        return;
    }
    const amountNum = parseFloat(rewardAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
        toast({ variant: "destructive", title: "Amount must be a positive number." });
        return;
    }

    setIsGivingReward(true);
    try {
        const targetUser = await findUserByEmail(rewardEmail);
        if (!targetUser) throw new Error("Target user not found.");
        
        await awardManualCredits(targetUser.uid, amountNum, rewardReason);
        
        toast({ title: "Credits Awarded!", description: `₹${amountNum} credited to ${rewardEmail}.` });
        
        // Push Notification to student
        fetch('/api/push-notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUids: [targetUser.uid],
            title: "Credits Received! 🥳",
            body: `₹${amountNum} StudyScript Credit has been added: ${rewardReason}`,
            link: '/my-profile'
          })
        });

        // Reset and Refresh if this is the user currently being viewed
        if (creditSearchedUser?.uid === targetUser.uid) {
            const updatedProfile = await getUserProfile(targetUser.uid);
            setCreditSearchedUser(updatedProfile as any);
            const history = await getUserCreditHistory(targetUser.uid);
            setCreditUserHistory(history);
        }
        setRewardAmount("");
        setRewardReason("");
    } catch (error: any) {
        console.error("Reward failed:", error);
        toast({ variant: "destructive", title: "Reward Failed", description: error.message });
    } finally {
        setIsGivingReward(false);
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

  const renderBatchManagement = () => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Batch Management</CardTitle>
        <CardDescription>Create and manage learning batches (Notes, Tests, Info).</CardDescription>
      </CardHeader>
      <CardContent>
        <AdminBatchForm 
          initialBatches={batches}
          onSave={handleSaveBatch}
          onDelete={handleDeleteBatch}
        />
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
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Bookstore Items</CardTitle>
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

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2"><Inbox className="h-6 w-6"/> Book Requests</CardTitle>
                <CardDescription>View books requested by students.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User Name</TableHead>
                            <TableHead>Requested Book</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookRequests.map((req) => (
                            <TableRow key={req.id}>
                                <TableCell className="font-medium">{req.userName}</TableCell>
                                <TableCell>{req.bookName}</TableCell>
                                <TableCell>{format(req.createdAt.toDate(), "PPP")}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteBookRequest(req.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {bookRequests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No book requests found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
  
  const renderAudioLectureManagement = () => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Audio Lectures Management</CardTitle>
        <CardDescription>Manage audio lecture topics and their tracks.</CardDescription>
      </CardHeader>
      <CardContent>
        <AdminAudioLecturesForm
          initialLectures={audioLectures}
          onSave={handleSaveAudioLecture}
          onDelete={handleDeleteAudioLecture}
        />
      </CardContent>
    </Card>
  );

  const renderQuizManagement = () => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Test Management</CardTitle>
        <CardDescription>Manage tests and their questions.</CardDescription>
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
                    <Label htmlFor="live-class-item">Associated Item</Label>
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
                            onChange={(e) => handleTimeChange(liveClassStartTime, e.target.value, setLiveClassStartTime)}
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
                            onChange={(e) => handleTimeChange(liveClassEndTime, e.target.value, setLiveClassEndTime)}
                            className="w-[120px]"
                        />
                    </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="live-class-link">Meeting Link (Zoom, Google Meet, etc.)</Label>
                    <Input id="live-class-link" value={liveClassMeetingLink} onChange={(e) => setLiveClassMeetingLink(e.target.value)} required placeholder="https://zoom.us/j/..." />
                </div>
             </div>
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
                        <TableHead>Start Time</TableHead>
                        <TableHead>Meeting Link</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {liveClasses.map(lc => (
                        <TableRow key={lc.id}>
                            <TableCell>{lc.title}</TableCell>
                            <TableCell>{format(lc.startTime.toDate(), "PPP p")}</TableCell>
                            <TableCell>
                                <a href={lc.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                                    <LinkIcon className="h-4 w-4" /> Link
                                </a>
                            </TableCell>
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
                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No live classes scheduled.</TableCell></TableRow>
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
        <CardTitle className="font-headline text-2xl">Test Attempts</CardTitle>
        <CardDescription>View all submitted test results and user details.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Test</TableHead>
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
                    {attempt.userSchool && <div className="text-xs text-muted-foreground">School: {attempt.userSchool}</div>}
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
                        <AlertDialogTitle>Delete Test Attempt?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the attempt by "{attemptToDelete?.userName}" for the test "{attemptToDelete?.quizTitle}".
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
                        No test attempts have been submitted yet.
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
              <TableHead>Amounts</TableHead>
              <TableHead>Ref. ID</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentRequests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>
                    <div className="font-medium">{req.userName}</div>
                    <div className="text-[10px] text-muted-foreground">{format(req.requestDate.toDate(), 'p, MMM d')}</div>
                </TableCell>
                <TableCell>
                    <div className="font-medium">{req.itemTitle}</div>
                    <div className="text-[10px] text-muted-foreground capitalize">{req.itemType}</div>
                </TableCell>
                <TableCell>
                    <div className="text-xs space-y-1">
                        <div className="flex justify-between gap-4"><span>Original:</span> <span className="font-bold">₹{req.itemPrice}</span></div>
                        {req.creditUsed ? <div className="flex justify-between gap-4 text-orange-600"><span>Credit:</span> <span className="font-bold">-₹{req.creditUsed}</span></div> : null}
                        <div className="flex justify-between gap-4 border-t pt-1 text-primary"><span>Payable:</span> <span className="font-black">₹{req.amountToPay || req.itemPrice}</span></div>
                    </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{req.upiReferenceId}</TableCell>
                <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-100" onClick={() => handleApproveRequest(req)}>
                        <ShieldCheck className="h-4 w-4" />
                    </Button>
                    <Dialog open={requestToActOn?.id === req.id} onOpenChange={(isOpen) => !isOpen && setRequestToActOn(null)}>
                        <DialogTrigger asChild>
                           <Button size="sm" variant="destructive" onClick={() => setRequestToActOn(req)}>
                                <ShieldAlert className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reject Payment Request?</DialogTitle>
                                <DialogDescription>
                                    Reason for rejecting user <span className="font-bold">{requestToActOn?.userName}</span>.
                                </DialogDescription>
                            </DialogHeader>
                             <div className="py-4">
                                <Textarea 
                                    placeholder="e.g., Transaction ID not found..."
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
        <CardDescription>Grant access to a course, subject, or batch to a user manually without payment.</CardDescription>
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
                 <label htmlFor="access-item" className="font-medium">Item to Grant</label>
                <Select value={accessItemId} onValueChange={setAccessItemId} required>
                    <SelectTrigger id="access-item">
                        <SelectValue placeholder="Select a course, subject, or batch..." />
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

  const renderPurchaseManagement = () => {
    const filteredPurchases = purchases.filter((purchase) => {
      const search = purchaseSearchTerm.toLowerCase();
      return (
        purchase.userEmail.toLowerCase().includes(search) ||
        purchase.itemName.toLowerCase().includes(search) ||
        purchase.itemType.toLowerCase().includes(search)
      );
    });

    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-headline text-2xl">User Purchases</CardTitle>
              <CardDescription>View and manage all user purchases and manually granted access.</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search email, item or type..."
                value={purchaseSearchTerm}
                onChange={(e) => setPurchaseSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
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
              {filteredPurchases.map((purchase) => (
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
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
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
               {filteredPurchases.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          {purchaseSearchTerm ? "No matching purchases found." : "No purchases found."}
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

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

  const renderCreditsManagement = () => (
    <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Search className="h-6 w-6"/> Search User by Email
            </CardTitle>
            <CardDescription>View a user's credit balance and transaction history.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearchCreditUser} className="flex gap-2">
                <Input 
                    type="email" 
                    placeholder="Enter user email..." 
                    value={creditSearchEmail} 
                    onChange={e => setCreditSearchEmail(e.target.value)}
                    required
                />
                <Button type="submit" disabled={isSearchingCreditUser}>
                    {isSearchingCreditUser ? <Loader2 className="animate-spin h-4 w-4"/> : <Search className="h-4 w-4"/>}
                    Search
                </Button>
            </form>

            {creditSearchedUser && (
                <div className="mt-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                         <div className="p-4 rounded-xl border bg-background">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Name</p>
                            <p className="text-lg font-bold">{creditSearchedUser.displayName || 'Anonymous'}</p>
                        </div>
                        <div className="p-4 rounded-xl border bg-background">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Referrals</p>
                            <p className="text-lg font-bold text-blue-600">{creditSearchedUser.referralCount || 0}</p>
                        </div>
                         <div className="p-4 rounded-xl border bg-background">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Credit Balance</p>
                            <p className="text-lg font-bold text-primary">₹{creditSearchedUser.creditBalance || 0}</p>
                        </div>
                        <div className="p-4 rounded-xl border bg-background">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Credits Earned</p>
                            <p className="text-lg font-bold text-green-600">₹{creditUserHistory.reduce((acc, item) => item.type === 'credit' ? acc + item.amount : acc, 0)}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold flex items-center gap-2"><History className="h-4 w-4"/> User Credit History</h4>
                        <div className="border rounded-lg overflow-hidden">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead className="text-right">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {creditUserHistory.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className={cn("inline-flex p-1.5 rounded-lg", item.type === 'credit' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                                                    {item.type === 'credit' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-sm">{item.reason}</TableCell>
                                            <TableCell className={cn("font-bold", item.type === 'credit' ? "text-green-600" : "text-red-600")}>
                                                {item.type === 'credit' ? '+' : '-'} ₹{item.amount}
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground">{format(item.timestamp.toDate(), "PP p")}</TableCell>
                                        </TableRow>
                                    ))}
                                    {creditUserHistory.length === 0 && (
                                        <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No history found.</TableCell></TableRow>
                                    )}
                                </TableBody>
                             </Table>
                        </div>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Coins className="h-6 w-6"/> Give Credit Reward
            </CardTitle>
            <CardDescription>Manually add credits to a user's wallet.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGiveReward} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>User Email</Label>
                        <Input 
                            type="email" 
                            placeholder="user@example.com" 
                            value={rewardEmail} 
                            onChange={e => setRewardEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Credit Amount (₹)</Label>
                        <Input 
                            type="number" 
                            placeholder="e.g. 50" 
                            value={rewardAmount} 
                            onChange={e => setRewardAmount(e.target.value)}
                            required
                            min="1"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Reason</Label>
                    <Input 
                        placeholder="e.g. Special bonus / Support resolution" 
                        value={rewardReason} 
                        onChange={e => setRewardReason(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit" disabled={isGivingReward} className="w-full">
                    {isGivingReward ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : <Gift className="h-4 w-4 mr-2"/>}
                    Give Credits
                </Button>
            </form>
          </CardContent>
        </Card>
    </div>
  );

  const renderSiteSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Site Settings</CardTitle>
        <CardDescription>Manage global site settings like banners for home, referral pages, and in-app popups.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveBanner} className="space-y-12">
          {/* Homepage Banners Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-bold flex items-center gap-2"><LayoutGrid className="h-5 w-5"/> Homepage Banners</h3>
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
                    <p className="text-center text-muted-foreground py-4">No homepage banners configured.</p>
                )}
            </div>
          </div>

          {/* Popup Banner Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
                <h3 className="text-lg font-bold flex items-center gap-2 text-primary"><MonitorPlay className="h-5 w-5"/> In-App Popup Banner</h3>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-none font-black text-[10px]">NEW</Badge>
            </div>
            
            <div className="p-6 border rounded-2xl bg-indigo-50/30 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="popup-img">Banner Image View Link</Label>
                        <Input 
                            id="popup-img"
                            placeholder="Direct image URL or Google Drive view link..."
                            value={bannerSettings.popupBanner?.imageUrl || ''}
                            onChange={(e) => handleUpdatePopupBanner('imageUrl', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="popup-link">Target Action Link (Optional)</Label>
                        <Input 
                            id="popup-link"
                            placeholder="e.g. /quizzes or https://external.com"
                            value={bannerSettings.popupBanner?.actionUrl || ''}
                            onChange={(e) => handleUpdatePopupBanner('actionUrl', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Expiration Date & Time (Mandatory)</Label>
                        <div className="flex gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !bannerSettings.popupBanner?.expiresAt && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {bannerSettings.popupBanner?.expiresAt ? format(bannerSettings.popupBanner.expiresAt.toDate(), "PPP") : <span>Pick Expiry Date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar 
                                        mode="single" 
                                        selected={bannerSettings.popupBanner?.expiresAt?.toDate()} 
                                        onSelect={(date) => handlePopupExpiryChange(date, bannerSettings.popupBanner?.expiresAt ? format(bannerSettings.popupBanner.expiresAt.toDate(), "HH:mm") : "")} 
                                    />
                                </PopoverContent>
                            </Popover>
                            <Input 
                                type="time" 
                                className="w-[120px]"
                                value={bannerSettings.popupBanner?.expiresAt ? format(bannerSettings.popupBanner.expiresAt.toDate(), "HH:mm") : ""}
                                onChange={(e) => handlePopupExpiryChange(bannerSettings.popupBanner?.expiresAt?.toDate(), e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2 mt-6 p-3 bg-white rounded-xl border border-indigo-100">
                    <Switch 
                        id="popup-active"
                        checked={bannerSettings.popupBanner?.isActive || false}
                        onCheckedChange={(checked) => handleUpdatePopupBanner('isActive', checked)}
                    />
                    <Label htmlFor="popup-active" className="font-bold text-indigo-900">Activate Popup globally</Label>
                </div>
                {bannerSettings.popupBanner?.expiresAt && bannerSettings.popupBanner.expiresAt.toDate() < new Date() && (
                    <p className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1"><ShieldAlert className="h-3 w-3"/> EXPIRED: Banner will not show to users.</p>
                )}
            </div>
          </div>

          {/* Referral Page Banner Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
                <h3 className="text-lg font-bold flex items-center gap-2"><Gift className="h-5 w-5"/> Referral Page Banner</h3>
                <Badge variant="outline" className="text-[10px]">Optional</Badge>
            </div>
            
            <div className="p-6 border rounded-2xl bg-primary/5 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="ref-banner-img">Banner Image URL</Label>
                        <Input 
                            id="ref-banner-img"
                            placeholder="Drive image link..."
                            value={bannerSettings.referralBanner?.imageUrl || ''}
                            onChange={(e) => handleUpdateReferralBanner('imageUrl', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ref-banner-link">Optional Link URL</Label>
                        <Input 
                            id="ref-banner-link"
                            placeholder="/batches/..."
                            value={bannerSettings.referralBanner?.linkUrl || ''}
                            onChange={(e) => handleUpdateReferralBanner('linkUrl', e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center space-x-2 mt-6">
                    <Switch 
                        id="ref-banner-active"
                        checked={bannerSettings.referralBanner?.isActive || false}
                        onCheckedChange={(checked) => handleUpdateReferralBanner('isActive', checked)}
                    />
                    <Label htmlFor="ref-banner-active" className="font-semibold">Show banner at bottom of Share & Earn page</Label>
                </div>
            </div>
          </div>
          
          <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSavingBanner}>
            {isSavingBanner ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save All Site Settings
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
            {hasPermission('manage_batches') && <Button variant={activeTab === 'batches' ? 'default' : 'outline'} onClick={() => setActiveTab('batches')}>
                <Layers className="mr-2 h-4 w-4" /> Batches
            </Button>}
             {hasPermission('manage_free_notes') && <Button variant={activeTab === 'free-notes' ? 'default' : 'outline'} onClick={() => setActiveTab('free-notes')}>
                <FileText className="mr-2 h-4 w-4" /> Free Notes
            </Button>}
            {hasPermission('manage_bookstore') && <Button variant={activeTab === 'bookstore' ? 'default' : 'outline'} onClick={() => setActiveTab('bookstore')}>
                <BookOpen className="mr-2 h-4 w-4" /> Bookstore
            </Button>}
            {hasPermission('manage_audio_lectures') && <Button variant={activeTab === 'audio-lectures' ? 'default' : 'outline'} onClick={() => setActiveTab('audio-lectures')}>
                <Headphones className="mr-2 h-4 w-4" /> Audio Lectures
            </Button>}
            {hasPermission('manage_quizzes') && <Button variant={activeTab === 'quizzes' ? 'default' : 'outline'} onClick={() => setActiveTab('quizzes')}>
                <BrainCircuit className="mr-2 h-4 w-4" /> Tests
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
            {isAdmin && <Button variant={activeTab === 'credits' ? 'default' : 'outline'} onClick={() => setActiveTab('credits')}>
                <Coins className="mr-2 h-4 w-4" /> User Credits
            </Button>}
            {hasPermission('view_quiz_attempts') && <Button variant={activeTab === 'quiz-attempts' ? 'default' : 'outline'} onClick={() => setActiveTab('quiz-attempts')}>
                <BarChart3 className="mr-2 h-4 w-4" /> Test Attempts
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
        {activeTab === 'batches' && hasPermission('manage_batches') && renderBatchManagement()}
        {activeTab === 'free-notes' && hasPermission('manage_free_notes') && renderFreeNotesManagement()}
        {activeTab === 'bookstore' && hasPermission('manage_bookstore') && renderBookstoreManagement()}
        {activeTab === 'audio-lectures' && hasPermission('manage_audio_lectures') && renderAudioLectureManagement()}
        {activeTab === 'quizzes' && hasPermission('manage_quizzes') && renderQuizManagement()}
        {activeTab === 'live-classes' && hasPermission('manage_live_classes') && renderLiveClassManagement()}
        {activeTab === 'certificates' && hasPermission('manage_certificates') && renderCertificateManagement()}
        {activeTab === 'schools' && hasPermission('manage_schools') && renderSchoolManagement()}
        {activeTab === 'credits' && isAdmin && renderCreditsManagement()}
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
              <CardDescription>Broadcast or targeted push notification.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendNotification} className="space-y-4">
                <RadioGroup 
                    value={notifTarget} 
                    onValueChange={(val: any) => setNotifTarget(val)}
                    className="flex gap-4 p-3 bg-secondary/50 rounded-lg mb-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="everyone" id="target-everyone" />
                        <Label htmlFor="target-everyone" className="cursor-pointer">Everyone</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="user" id="target-user" />
                        <Label htmlFor="target-user" className="cursor-pointer">Specific Users</Label>
                    </div>
                </RadioGroup>

                {notifTarget === 'user' && (
                    <div className="space-y-3 p-3 border rounded-lg bg-primary/5 animate-in fade-in duration-300">
                        <Label className="text-xs font-bold uppercase tracking-wider">Recipient List</Label>
                        
                        {selectedTargetUsers.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {selectedTargetUsers.map(u => (
                                    <Badge key={u.uid} variant="secondary" className="pl-2 pr-1 py-1 gap-1 flex items-center bg-white border border-primary/20">
                                        <span className="max-w-[120px] truncate">{u.email}</span>
                                        <X 
                                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                                          onClick={() => setSelectedTargetUsers(prev => prev.filter(item => item.uid !== u.uid))}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Input 
                                placeholder="Add email..." 
                                value={notifUserEmail}
                                onChange={(e) => setNotifUserEmail(e.target.value)}
                            />
                            <Button type="button" size="icon" onClick={handleSearchNotifUser} disabled={isSearchingNotifUser}>
                                {isSearchingNotifUser ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>}
                            </Button>
                        </div>
                    </div>
                )}

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
                <Button type="submit" className="w-full" disabled={isSendingNotification}>
                  {isSendingNotification ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Send {notifTarget === 'everyone' ? 'Broadcast' : `${selectedTargetUsers.length} Alerts`}
                </Button>
              </form>
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <BellRing /> Global Broadcast Feed
              </CardTitle>
              <CardDescription>View/Delete global in-app notifications.</CardDescription>
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
                    <p className="text-center text-muted-foreground py-8">No broadcasts sent yet.</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
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
                            <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
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
                            <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[75%] rounded-lg px-3 py-2 ${ msg.sender === 'admin' ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                         <p className="text-sm break-words">{msg.text}</p>
                      </div>
                       {msg.sender === "admin" && (
                         <Avatar className="h-8 w-8">
                          <AvatarImage src="/icons/icon-192x192.png" alt="Admin" />
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
