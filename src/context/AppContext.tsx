import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, 
  ResourceItem, 
  UserRole, 
  EducationLevel, 
  ResourceCategory, 
  LibraryItem, 
  ReadingBookmark, 
  ReadingProgress, 
  DownloadRecord, 
  Order, 
  ContributorWallet, 
  AppNotification, 
  Examination, 
  ExamAttempt,
  ResourceRequest,
  ContributorApplication,
  UserMediaFile
} from '../types';
import { auth, db, signInWithGoogle, logoutUser, onAuthStateChanged, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { INITIAL_RESOURCES, INITIAL_EXAMINATIONS, INITIAL_REQUESTS } from '../data/initialResources';

interface AppContextType {
  user: UserProfile | null;
  firebaseAuthLoading: boolean;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedResourceId: string | null;
  setSelectedResourceId: (id: string | null) => void;
  selectedEducationLevel: EducationLevel | 'all';
  setSelectedEducationLevel: (level: EducationLevel | 'all') => void;
  selectedCategory: ResourceCategory | 'all';
  setSelectedCategory: (cat: ResourceCategory | 'all') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  
  // Modals & Navigation state
  isSideMenuOpen: boolean;
  setIsSideMenuOpen: (open: boolean) => void;
  readerInitialPage: number;
  setReaderInitialPage: (page: number) => void;
  checkoutResource: ResourceItem | null;
  setCheckoutResource: (res: ResourceItem | null) => void;
  openReader: (resourceId: string, initialPage?: number) => void;
  openResourceDetail: (resourceId: string) => void;

  // Data lists
  resources: ResourceItem[];
  library: LibraryItem[];
  bookmarks: ReadingBookmark[];
  readingProgress: Record<string, ReadingProgress>;
  downloads: DownloadRecord[];
  orders: Order[];
  wallet: ContributorWallet;
  notifications: AppNotification[];
  examinations: Examination[];
  examAttempts: ExamAttempt[];
  resourceRequests: ResourceRequest[];
  contributorApplications: ContributorApplication[];
  userMediaFiles: UserMediaFile[];
  
  // User profile and media actions
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadUserMediaFile: (fileData: Omit<UserMediaFile, 'id' | 'uploadedAt'>) => Promise<UserMediaFile>;
  deleteUserMediaFile: (id: string) => Promise<void>;
  
  // Auth
  authError: string | null;
  setAuthError: (err: string | null) => void;
  loginWithGoogle: () => Promise<void>;
  loginAsDemoUser: (email: string, displayName: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  addToLibrary: (resource: ResourceItem) => Promise<void>;
  removeFromLibrary: (resourceId: string) => Promise<void>;
  isInLibrary: (resourceId: string) => boolean;
  addBookmark: (resourceId: string, pageNumber: number, note?: string, chapterTitle?: string) => Promise<void>;
  removeBookmark: (bookmarkId: string) => Promise<void>;
  isPageBookmarked: (resourceId: string, pageNumber: number) => boolean;
  updateReadingProgress: (resourceId: string, currentPage: number, totalPages: number) => Promise<void>;
  recordDownload: (resource: ResourceItem) => Promise<void>;
  publishResource: (newResource: Omit<ResourceItem, 'id' | 'createdAt' | 'viewsCount' | 'downloadsCount' | 'rating' | 'reviewsCount'>) => Promise<ResourceItem>;
  submitResourceRequest: (requestData: Omit<ResourceRequest, 'id' | 'createdAt' | 'responsesCount' | 'status'>) => Promise<void>;
  submitContributorApplication: (applicationData: Omit<ContributorApplication, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateApplicationStatus: (appId: string, status: 'approved' | 'rejected', notes?: string) => Promise<void>;
  completeOrder: (itemType: 'resource' | 'subscription', itemId: string, itemTitle: string, amountKsh: number, mpesaPhone?: string) => Promise<Order>;
  recordExamAttempt: (attempt: Omit<ExamAttempt, 'id' | 'completedAt'>) => Promise<void>;
  requestWithdrawal: (amountKsh: number, mpesaPhone: string) => Promise<void>;
  updateResourceStatus: (resourceId: string, status: 'published' | 'pending' | 'draft' | 'rejected') => Promise<void>;
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ADMIN_BOOTSTRAP_EMAILS = ['oumameshack2345@gmail.com', 'oumameshack@yahoo.com'];
const isBootstrapAdminEmail = (email?: string | null) => {
  if (!email) return false;
  return ADMIN_BOOTSTRAP_EMAILS.includes(email.toLowerCase().trim());
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseAuthLoading, setFirebaseAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [selectedEducationLevel, setSelectedEducationLevel] = useState<EducationLevel | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Navigation state
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [readerInitialPage, setReaderInitialPage] = useState(1);
  const [checkoutResource, setCheckoutResource] = useState<ResourceItem | null>(null);

  // Collections state
  const [resources, setResources] = useState<ResourceItem[]>(INITIAL_RESOURCES);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [bookmarks, setBookmarks] = useState<ReadingBookmark[]>(() => {
    try {
      const saved = localStorage.getItem('bookclub_bookmarks');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    const firstRes = INITIAL_RESOURCES[0];
    return [
      {
        id: 'bm-init-1',
        userId: 'guest',
        resourceId: firstRes?.id || 'res-01',
        resourceTitle: firstRes?.title || 'Form 4 Mathematics Pure Revision Guide',
        coverImage: firstRes?.coverImage || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
        category: firstRes?.category || 'notes',
        subject: firstRes?.subject || 'Mathematics',
        gradeLevel: firstRes?.gradeLevel || 'Form 4',
        pageNumber: 3,
        chapterTitle: 'Chapter 2: Differential Calculus & Stationary Points',
        note: 'Important formula breakdown for national mock exam revision',
        createdAt: '2026-02-18T08:30:00Z'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('bookclub_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {}
  }, [bookmarks]);
  const [readingProgress, setReadingProgress] = useState<Record<string, ReadingProgress>>({});
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wallet, setWallet] = useState<ContributorWallet>({
    userId: 'guest',
    userName: 'Contributor',
    balanceKsh: 12450,
    totalEarnedKsh: 42800,
    pendingWithdrawalKsh: 0,
    updatedAt: new Date().toISOString()
  });
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      userId: 'all',
      title: 'Welcome to Book Club!',
      message: 'Explore thousands of free and premium notes, CBC textbooks, KJSEA & KCSE past papers.',
      link: '#',
      read: false,
      type: 'info',
      createdAt: new Date().toISOString()
    },
    {
      id: 'notif-2',
      userId: 'all',
      title: 'High-Thinking AI Study Assistant Active',
      message: 'Gemini-4-Argon with deep thinking mode is ready to tutor you across all academic levels.',
      link: '#',
      read: false,
      type: 'success',
      createdAt: new Date().toISOString()
    }
  ]);
  const [examinations, setExaminations] = useState<Examination[]>(INITIAL_EXAMINATIONS);
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  const [resourceRequests, setResourceRequests] = useState<ResourceRequest[]>(INITIAL_REQUESTS);
  const [contributorApplications, setContributorApplications] = useState<ContributorApplication[]>([
    {
      id: 'app-001',
      applicantId: 'usr-demo-01',
      applicantName: 'Sarah Akinyi',
      applicantEmail: 'sarah.akinyi@edu.ke',
      roleRequested: 'teacher',
      qualifications: 'B.Ed Science (Physics/Math) with 8 years teaching experience in Senior Secondary.',
      institution: 'Alliance High School',
      sampleWorkUrl: 'https://example.com/physics_notes_sample.pdf',
      status: 'pending',
      createdAt: '2026-02-18T10:00:00Z'
    }
  ]);

  const [userMediaFiles, setUserMediaFiles] = useState<UserMediaFile[]>(() => {
    try {
      const saved = localStorage.getItem('bookclub_user_media');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'media-01',
        userId: 'demo-user',
        title: 'Biology Form 4 Genetics Summary Sheet',
        fileName: 'Genetics_Summary_Sheet.pdf',
        fileType: 'pdf',
        fileSize: '1.4 MB',
        fileUrl: '#',
        description: 'Personal study summary on Mendelian inheritance, monohybrid crosses, and sex linkage.',
        category: 'Study Notes',
        uploadedAt: '2026-02-15T10:30:00Z'
      },
      {
        id: 'media-02',
        userId: 'demo-user',
        title: 'Chemistry Organic Reactions Flow Chart',
        fileName: 'Organic_Chemistry_Reactions.png',
        fileType: 'image',
        fileSize: '820 KB',
        fileUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
        description: 'Hand-drawn flow chart of alkanes, alkenes, alcohols and esterification pathways.',
        category: 'Diagrams & Media',
        uploadedAt: '2026-02-12T14:20:00Z'
      },
      {
        id: 'media-03',
        userId: 'demo-user',
        title: 'History Paper 1 Term 1 Assignment',
        fileName: 'History_P1_Assignment.docx',
        fileType: 'document',
        fileSize: '450 KB',
        fileUrl: '#',
        description: 'Coursework essay on the social organization of pre-colonial Kenyan societies.',
        category: 'Assignments',
        uploadedAt: '2026-02-05T09:15:00Z'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('bookclub_user_media', JSON.stringify(userMediaFiles));
    } catch (e) {}
  }, [userMediaFiles]);

  // Restore custom edited user profile if available
  useEffect(() => {
    try {
      const savedCustomUser = localStorage.getItem('bookclub_user_custom');
      if (savedCustomUser) {
        const parsed = JSON.parse(savedCustomUser);
        if (!user) {
          setUser(parsed);
          if (parsed.role) setCurrentRole(parsed.role);
        }
      }
    } catch (e) {}
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseAuthLoading(true);
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          let userProfile: UserProfile;

          // Check if user exists in Firestore
          const userSnap = await getDoc(userDocRef);
          const isBootstrapAdmin = isBootstrapAdminEmail(fbUser.email);

          if (userSnap.exists()) {
            userProfile = userSnap.data() as UserProfile;
            if (isBootstrapAdmin && userProfile.role !== 'admin') {
              userProfile.role = 'admin';
              await updateDoc(userDocRef, { role: 'admin' });
            }
          } else {
            // Create user profile in Firestore
            userProfile = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Learner',
              photoURL: fbUser.photoURL || undefined,
              role: isBootstrapAdmin ? 'admin' : 'student',
              educationLevel: 'senior',
              institution: 'National Learning Network',
              subscriptionTier: 'free',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, userProfile);
          }

          setUser(userProfile);
          setCurrentRole(userProfile.role);
          setWallet(prev => ({ ...prev, userId: userProfile.uid, userName: userProfile.displayName }));

          // Load user library from Firestore
          try {
            const libSnap = await getDocs(query(collection(db, 'libraries'), where('userId', '==', fbUser.uid)));
            const userLib = libSnap.docs.map(d => ({ id: d.id, ...d.data() } as LibraryItem));
            if (userLib.length > 0) setLibrary(userLib);
          } catch (e) {
            console.warn('Could not load user library from Firestore:', e);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}`);
        }
      } else {
        // Fallback default guest / preview state
        setUser(null);
        setCurrentRole('student');
      }
      setFirebaseAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setAuthError(result.error);
      }
    } catch (err: any) {
      console.warn('Google sign in warning:', err?.message);
      setAuthError('Sign-in popup encountered an issue. You can retry or use instant access.');
    }
  };

  const loginAsDemoUser = async (email: string, displayName: string, role: UserRole) => {
    setAuthError(null);
    const isBootstrapAdmin = isBootstrapAdminEmail(email);
    const demoId = `usr_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const userProfile: UserProfile = {
      uid: demoId,
      email,
      displayName,
      role: isBootstrapAdmin ? 'admin' : role,
      educationLevel: 'senior',
      institution: isBootstrapAdmin ? 'Book Club Administration' : 'National Academic Network',
      subscriptionTier: isBootstrapAdmin ? 'premium' : 'plus',
      createdAt: new Date().toISOString()
    };

    setUser(userProfile);
    setCurrentRole(userProfile.role);
    setWallet(prev => ({ ...prev, userId: userProfile.uid, userName: userProfile.displayName }));

    try {
      const userDocRef = doc(db, 'users', demoId);
      await setDoc(userDocRef, userProfile, { merge: true });
    } catch (e) {
      console.warn('User profile sync notice:', e);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setCurrentRole('student');
      setActiveView('home');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const addToLibrary = async (resource: ResourceItem) => {
    const newItem: LibraryItem = {
      id: `lib-${Date.now()}`,
      userId: user?.uid || 'guest',
      resourceId: resource.id,
      resourceTitle: resource.title,
      resourceCategory: resource.category,
      coverImage: resource.coverImage,
      fileUrl: resource.fileUrl,
      addedAt: new Date().toISOString()
    };
    setLibrary(prev => [newItem, ...prev.filter(i => i.resourceId !== resource.id)]);

    if (user?.uid) {
      try {
        await setDoc(doc(db, 'libraries', newItem.id), newItem);
      } catch (err) {
        console.warn('Library sync warning:', err);
      }
    }
  };

  const removeFromLibrary = async (resourceId: string) => {
    setLibrary(prev => prev.filter(i => i.resourceId !== resourceId));
    if (user?.uid) {
      try {
        const q = query(collection(db, 'libraries'), where('userId', '==', user.uid), where('resourceId', '==', resourceId));
        const snap = await getDocs(q);
        snap.forEach(d => updateDoc(d.ref, { deleted: true }));
      } catch (err) {
        console.warn('Remove library warning:', err);
      }
    }
  };

  const isInLibrary = (resourceId: string) => {
    return library.some(i => i.resourceId === resourceId);
  };

  const openReader = (resourceId: string, initialPage?: number) => {
    setSelectedResourceId(resourceId);
    if (initialPage && initialPage >= 1) {
      setReaderInitialPage(initialPage);
    } else {
      const saved = readingProgress[resourceId]?.currentPage || 1;
      setReaderInitialPage(saved);
    }
    setActiveView('reader');
  };

  const openResourceDetail = (resourceId: string) => {
    setSelectedResourceId(resourceId);
    setActiveView('resource-detail');
  };

  const isPageBookmarked = (resourceId: string, pageNumber: number) => {
    return bookmarks.some(b => b.resourceId === resourceId && b.pageNumber === pageNumber);
  };

  const addBookmark = async (resourceId: string, pageNumber: number, note?: string, chapterTitle?: string) => {
    const res = resources.find(r => r.id === resourceId);
    const existingIndex = bookmarks.findIndex(b => b.resourceId === resourceId && b.pageNumber === pageNumber);
    if (existingIndex >= 0) {
      // Toggle off
      const removedId = bookmarks[existingIndex].id;
      setBookmarks(prev => prev.filter((_, idx) => idx !== existingIndex));
      if (user?.uid) {
        try {
          await updateDoc(doc(db, 'bookmarks', removedId), { deleted: true });
        } catch (e) {}
      }
      return;
    }

    const newBookmark: ReadingBookmark = {
      id: `bm-${Date.now()}`,
      userId: user?.uid || 'guest',
      resourceId,
      resourceTitle: res?.title || 'Academic Resource',
      coverImage: res?.coverImage || '',
      category: res?.category,
      subject: res?.subject,
      gradeLevel: res?.gradeLevel,
      pageNumber,
      chapterTitle: chapterTitle || `Page ${pageNumber}`,
      note: note || '',
      createdAt: new Date().toISOString()
    };
    setBookmarks(prev => [newBookmark, ...prev]);

    if (user?.uid) {
      try {
        await setDoc(doc(db, 'bookmarks', newBookmark.id), newBookmark);
      } catch (err) {
        console.warn('Bookmark sync warning:', err);
      }
    }
  };

  const removeBookmark = async (bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'bookmarks', bookmarkId), { deleted: true });
      } catch (err) {
        console.warn('Remove bookmark warning:', err);
      }
    }
  };

  const updateReadingProgress = async (resourceId: string, currentPage: number, totalPages: number) => {
    const percentage = Math.round((currentPage / (totalPages || 1)) * 100);
    const progress: ReadingProgress = {
      id: `rp-${resourceId}`,
      userId: user?.uid || 'guest',
      resourceId,
      currentPage,
      totalPages,
      percentage,
      lastReadAt: new Date().toISOString()
    };

    setReadingProgress(prev => ({ ...prev, [resourceId]: progress }));

    if (user?.uid) {
      try {
        await setDoc(doc(db, 'reading_progress', `${user.uid}_${resourceId}`), progress);
      } catch (err) {
        console.warn('Reading progress sync warning:', err);
      }
    }
  };

  const recordDownload = async (resource: ResourceItem) => {
    const record: DownloadRecord = {
      id: `dl-${Date.now()}`,
      userId: user?.uid || 'guest',
      resourceId: resource.id,
      resourceTitle: resource.title,
      downloadedAt: new Date().toISOString()
    };

    setDownloads(prev => [record, ...prev]);
    setResources(prev => prev.map(r => r.id === resource.id ? { ...r, downloadsCount: r.downloadsCount + 1 } : r));

    if (user?.uid) {
      try {
        await setDoc(doc(db, 'downloads', record.id), record);
      } catch (err) {
        console.warn('Download sync warning:', err);
      }
    }
  };

  const publishResource = async (newResourceData: Omit<ResourceItem, 'id' | 'createdAt' | 'viewsCount' | 'downloadsCount' | 'rating' | 'reviewsCount'>) => {
    const newId = `res-${Date.now()}`;
    const newResource: ResourceItem = {
      ...newResourceData,
      id: newId,
      viewsCount: 0,
      downloadsCount: 0,
      rating: 5.0,
      reviewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setResources(prev => [newResource, ...prev]);

    if (user?.uid) {
      try {
        await setDoc(doc(db, 'resources', newId), newResource);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `resources/${newId}`);
      }
    }

    return newResource;
  };

  const submitResourceRequest = async (requestData: Omit<ResourceRequest, 'id' | 'createdAt' | 'responsesCount' | 'status'>) => {
    const newReq: ResourceRequest = {
      ...requestData,
      id: `req-${Date.now()}`,
      status: 'open',
      responsesCount: 0,
      createdAt: new Date().toISOString()
    };

    setResourceRequests(prev => [newReq, ...prev]);

    if (user?.uid) {
      try {
        await setDoc(doc(db, 'resource_requests', newReq.id), newReq);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `resource_requests/${newReq.id}`);
      }
    }
  };

  const submitContributorApplication = async (appData: Omit<ContributorApplication, 'id' | 'createdAt' | 'status'>) => {
    const newApp: ContributorApplication = {
      ...appData,
      id: `app-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setContributorApplications(prev => [newApp, ...prev]);

    if (user?.uid) {
      try {
        await setDoc(doc(db, 'contributor_applications', newApp.id), newApp);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `contributor_applications/${newApp.id}`);
      }
    }
  };

  const updateApplicationStatus = async (appId: string, status: 'approved' | 'rejected', notes?: string) => {
    setContributorApplications(prev => prev.map(a => a.id === appId ? { ...a, status, reviewNotes: notes } : a));

    const appToUpdate = contributorApplications.find(a => a.id === appId);
    if (appToUpdate && status === 'approved') {
      // If the current user was the applicant, upgrade their role
      if (user && user.uid === appToUpdate.applicantId) {
        const updatedUser = { ...user, role: appToUpdate.roleRequested };
        setUser(updatedUser);
        setCurrentRole(appToUpdate.roleRequested);
        try {
          await updateDoc(doc(db, 'users', user.uid), { role: appToUpdate.roleRequested });
        } catch (e) {
          console.warn('Role update warning:', e);
        }
      }
    }

    try {
      await updateDoc(doc(db, 'contributor_applications', appId), { status, reviewNotes: notes || '' });
    } catch (e) {
      console.warn('Update application warning:', e);
    }
  };

  const completeOrder = async (itemType: 'resource' | 'subscription', itemId: string, itemTitle: string, amountKsh: number, mpesaPhone?: string): Promise<Order> => {
    const refChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let transactionRef = 'BKC';
    for (let i = 0; i < 7; i++) {
      transactionRef += refChars.charAt(Math.floor(Math.random() * refChars.length));
    }

    const order: Order = {
      id: `ord-${Date.now()}`,
      userId: user?.uid || 'guest',
      userName: user?.displayName || 'Learner',
      userEmail: user?.email || 'learner@example.com',
      itemType,
      itemId,
      itemTitle,
      amountKsh,
      paymentMethod: 'mpesa',
      mpesaPhoneNumber: mpesaPhone || '0712345678',
      transactionRef,
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [order, ...prev]);

    // If subscription, upgrade user tier
    if (itemType === 'subscription') {
      const tier = itemTitle.toLowerCase().includes('premium') ? 'premium' : 'plus';
      if (user) {
        const updated = { ...user, subscriptionTier: tier as any };
        setUser(updated);
        try {
          await updateDoc(doc(db, 'users', user.uid), { subscriptionTier: tier });
        } catch (e) {
          console.warn('Sub tier update:', e);
        }
      }
    }

    // Contributor receives 70% of resource sales
    if (itemType === 'resource') {
      const contributorEarning = Math.round(amountKsh * 0.70);
      setWallet(prev => ({
        ...prev,
        balanceKsh: prev.balanceKsh + contributorEarning,
        totalEarnedKsh: prev.totalEarnedKsh + contributorEarning,
        updatedAt: new Date().toISOString()
      }));
    }

    // Add confirmation notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        userId: user?.uid || 'all',
        title: 'Payment Successful',
        message: `Your payment of KSh ${amountKsh} for "${itemTitle}" (Ref: ${transactionRef}) was successful.`,
        read: false,
        type: 'success',
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);

    if (user?.uid) {
      try {
        await setDoc(doc(db, 'orders', order.id), order);
      } catch (err) {
        console.warn('Order sync warning:', err);
      }
    }

    return order;
  };

  const recordExamAttempt = async (attempt: Omit<ExamAttempt, 'id' | 'completedAt'>) => {
    const newAttempt: ExamAttempt = {
      ...attempt,
      id: `att-${Date.now()}`,
      completedAt: new Date().toISOString()
    };
    setExamAttempts(prev => [newAttempt, ...prev]);

    if (user?.uid) {
      try {
        await setDoc(doc(db, 'exam_attempts', newAttempt.id), newAttempt);
      } catch (err) {
        console.warn('Exam attempt sync warning:', err);
      }
    }
  };

  const requestWithdrawal = async (amountKsh: number, mpesaPhone: string) => {
    if (amountKsh > wallet.balanceKsh) {
      throw new Error('Insufficient wallet balance');
    }
    setWallet(prev => ({
      ...prev,
      balanceKsh: prev.balanceKsh - amountKsh,
      pendingWithdrawalKsh: prev.pendingWithdrawalKsh + amountKsh,
      updatedAt: new Date().toISOString()
    }));

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        userId: user?.uid || 'all',
        title: 'Withdrawal Requested',
        message: `Your withdrawal request of KSh ${amountKsh} to ${mpesaPhone} has been received for processing.`,
        read: false,
        type: 'info',
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const updateResourceStatus = async (resourceId: string, status: 'published' | 'pending' | 'draft' | 'rejected') => {
    setResources(prev => prev.map(r => r.id === resourceId ? { ...r, status } : r));
    try {
      await updateDoc(doc(db, 'resources', resourceId), { status });
    } catch (e) {
      console.warn('Resource status update warning:', e);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    setUser(prev => {
      const base: UserProfile = prev || {
        uid: 'user_active',
        email: updates.email || 'learner@bookclub.org',
        displayName: updates.displayName || 'Academic Learner',
        role: currentRole,
        educationLevel: updates.educationLevel || 'senior',
        institution: updates.institution || 'National Academic Network',
        subscriptionTier: 'free',
        createdAt: new Date().toISOString()
      };
      const updated: UserProfile = {
        ...base,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      try {
        localStorage.setItem('bookclub_user_custom', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (user?.uid && !user.uid.startsWith('usr_demo')) {
      try {
        await updateDoc(doc(db, 'users', user.uid), updates);
      } catch (e) {
        console.warn('Firestore user update warning:', e);
      }
    }
  };

  const uploadUserMediaFile = async (fileData: Omit<UserMediaFile, 'id' | 'uploadedAt'>): Promise<UserMediaFile> => {
    const newFile: UserMediaFile = {
      ...fileData,
      id: `media-${Date.now()}`,
      userId: user?.uid || 'guest',
      uploadedAt: new Date().toISOString()
    };
    setUserMediaFiles(prev => [newFile, ...prev]);
    return newFile;
  };

  const deleteUserMediaFile = async (id: string) => {
    setUserMediaFiles(prev => prev.filter(f => f.id !== id));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        user,
        firebaseAuthLoading,
        currentRole,
        setCurrentRole,
        activeView,
        setActiveView,
        selectedResourceId,
        setSelectedResourceId,
        selectedEducationLevel,
        setSelectedEducationLevel,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        isSideMenuOpen,
        setIsSideMenuOpen,
        readerInitialPage,
        setReaderInitialPage,
        checkoutResource,
        setCheckoutResource,
        openReader,
        openResourceDetail,
        resources,
        library,
        bookmarks,
        readingProgress,
        downloads,
        orders,
        wallet,
        notifications,
        examinations,
        examAttempts,
        resourceRequests,
        contributorApplications,
        userMediaFiles,
        updateUserProfile,
        uploadUserMediaFile,
        deleteUserMediaFile,
        authError,
        setAuthError,
        loginWithGoogle,
        loginAsDemoUser,
        logout,
        addToLibrary,
        removeFromLibrary,
        isInLibrary,
        addBookmark,
        removeBookmark,
        isPageBookmarked,
        updateReadingProgress,
        recordDownload,
        publishResource,
        submitResourceRequest,
        submitContributorApplication,
        updateApplicationStatus,
        completeOrder,
        recordExamAttempt,
        requestWithdrawal,
        updateResourceStatus,
        unreadNotificationsCount,
        markNotificationAsRead
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
