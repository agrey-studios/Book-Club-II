export type EducationLevel = 'primary' | 'jss' | 'senior' | 'college_uni';

export type ResourceCategory = 'notes' | 'exams' | 'textbooks' | 'readers' | 'novels' | 'storybooks';

export type UserRole = 'student' | 'teacher' | 'author' | 'institution' | 'admin';

export type SubscriptionTier = 'free' | 'plus' | 'premium';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  educationLevel?: EducationLevel;
  institution?: string;
  bio?: string;
  phoneNumber?: string;
  subscriptionTier: SubscriptionTier;
  createdAt: string;
  updatedAt?: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  educationLevel: EducationLevel;
  gradeLevel: string; // e.g. "Grade 4", "Form 3", "Year 2 Semester 1"
  subject: string;
  topic?: string;
  category: ResourceCategory;
  curriculum: string; // CBC, 8-4-4, Cambridge, TVET, University Common
  examSystem?: string; // KCPE, KCSE, KJSEA, IGCSE, University Exams
  authorId: string;
  authorName: string;
  authorEmail?: string;
  authorRole: string;
  coverImage: string;
  fileUrl: string;
  fileName: string;
  fileFormat: 'pdf' | 'epub' | 'docx' | 'pptx' | 'txt';
  fileSize: string;
  pagesCount: number;
  language: string;
  publicationYear: string;
  isFree: boolean;
  priceKsh: number;
  copyrightDeclaration: string;
  downloadAllowed: boolean;
  readOnlineAllowed: boolean;
  status: 'published' | 'pending' | 'draft' | 'rejected';
  viewsCount: number;
  downloadsCount: number;
  rating: number;
  reviewsCount: number;
  featured?: boolean;
  createdAt: string;
  updatedAt?: string;
  // Sample reading pages for reader
  samplePages?: {
    pageNumber: number;
    title?: string;
    content: string;
  }[];
}

export interface ResourceReview {
  id: string;
  resourceId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface LibraryItem {
  id: string;
  userId: string;
  resourceId: string;
  resourceTitle: string;
  resourceCategory: ResourceCategory;
  coverImage: string;
  fileUrl: string;
  addedAt: string;
}

export interface ReadingBookmark {
  id: string;
  userId: string;
  resourceId: string;
  resourceTitle?: string;
  coverImage?: string;
  category?: ResourceCategory;
  subject?: string;
  gradeLevel?: string;
  pageNumber: number;
  chapterTitle?: string;
  note?: string;
  createdAt: string;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  resourceId: string;
  currentPage: number;
  totalPages: number;
  percentage: number;
  lastReadAt: string;
}

export interface DownloadRecord {
  id: string;
  userId: string;
  resourceId: string;
  resourceTitle: string;
  downloadedAt: string;
}

export interface ResourceRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  title: string;
  educationLevel: EducationLevel;
  gradeLevel: string;
  subject: string;
  category: ResourceCategory;
  description: string;
  status: 'open' | 'fulfilled' | 'closed';
  responsesCount: number;
  fulfilledResourceId?: string;
  createdAt: string;
}

export interface UserMediaFile {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'document' | 'image' | 'audio' | 'video' | 'other';
  fileSize: string;
  fileUrl: string;
  dataUrl?: string;
  description?: string;
  category?: string;
  uploadedAt: string;
}

export interface ContributorApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  roleRequested: 'teacher' | 'author' | 'institution';
  qualifications: string;
  institution?: string;
  sampleWorkUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  createdAt: string;
}

export interface ExamQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
}

export interface Examination {
  id: string;
  title: string;
  description: string;
  educationLevel: EducationLevel;
  gradeLevel: string;
  subject: string;
  durationMinutes: number;
  totalMarks: number;
  questionsCount: number;
  passingScore: number;
  creatorId: string;
  creatorName: string;
  questions: ExamQuestion[];
  createdAt: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  score: number;
  totalMarks: number;
  percentage: number;
  answers: Record<string, string>;
  completedAt: string;
  timeSpentSeconds: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  itemType: 'resource' | 'subscription';
  itemId: string;
  itemTitle: string;
  amountKsh: number;
  paymentMethod: 'mpesa' | 'card';
  mpesaPhoneNumber?: string;
  transactionRef: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

export interface ContributorWallet {
  userId: string;
  userName: string;
  balanceKsh: number;
  totalEarnedKsh: number;
  pendingWithdrawalKsh: number;
  updatedAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amountKsh: number;
  mpesaPhone: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  educationLevel: EducationLevel;
  subject: string;
  creatorId: string;
  creatorName: string;
  membersCount: number;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  type: 'info' | 'success' | 'alert' | 'system';
  createdAt: string;
}
