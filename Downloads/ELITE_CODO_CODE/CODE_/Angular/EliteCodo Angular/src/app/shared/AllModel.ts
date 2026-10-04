import { Observable } from 'rxjs';
export interface ProfileSection {
  id: string;
  name: string;
  description: string;
  icon: string;
  isComplete: boolean;
}

export interface Employee {
  name: string;
  initials: string;
  employeeId: string;
  role: string;
  joinDate: string;
  sections: ProfileSection[];
  completionPercentage?: number;
}

export class studentMaster {
  id!: any;
  email!: any;
  mobile!: any;
  userSalary!: any;
  firstName!: any;
  middleName!: any;
  lastName!: any;
  permanentAddress!: any;
  currentAddress!: any;
  status!: any;
  role!: any;
  birthDate!: any;
  adminAttendanceId!: any;
  profilePicture!: any;
  roleId!: any;
  uniqueCode!: any;
  password!: any;
  pfStatus!: any;
  fcmTokenString!: any;
  token!: any;
  adharCardNo!: any;
  className: any;
  standard: any;
  assignTeacher: any;
}

export class teacherMaster {
  id!: any;
  studentKeys!: any;
  email!: any;
  mobile!: any;
  userSalary!: any;
  firstName!: any;
  middleName!: any;
  lastName!: any;
  permanentAddress!: any;
  currentAddress!: any;
  status!: any;
  role!: any;
  birthDate!: any;
  adminAttendanceId!: any;
  profilePicture!: any;
  logoImage!: any;
  watermarkImage!: any;
  roleId!: any;
  uniqueCode!: any;
  password!: any;
  pfStatus!: any;
  fcmTokenString!: any;
  token!: any;
  adharCardNo!: any;
  className: any;
}

export enum TYPE {
  ERROR = 'error',
  SUCCESS = 'success',
  WARNING = 'warning',
  INFO = 'info',
  QUESTION = 'question',
}

export class ForgotPassClass {
  email!: any;
  id!: any;
}

export class ValidateOtpClass {
  id!: Number;
  otp!: Number;
}

export class updatePassClass {
  id: any;
  newPassword: any;
  confirmPassword: any;
}

export class companyMaster {
  companyId: any;
  companyName: any;
  companyAddress: any;
  companyWeb: any;
  authorizedSignatory: any;
  companySign: any;
  companyLogo: any;
  contact: any;
  emailId: any;
}

export class adminLogin {
  username: any;
  password: any;
  role: any;
  deviceId: any;
}

export class chapterWiseweightageMaster {
  entranceExamId: any;
  subjectId: any;
  chapterId: any;
  weightage: any;
  status: any;
}


export class testMaster {
  teacherId!: number | null;
  questionId!: number | null;
  standardIds!: any;
  subjectIds!: any;
  chapterIds!: any;
  topicIds!: any;
  questionLevel!: string | null;
  questionCategory!: string | null;
  pyq!: any;
  usedStatus!: any;
  pageSize!: any;
  currentPage!: any;
  selectedSubjects!: any[];
}

export class testCreationMaster {
  testName!: string;
  marks!: number;
  entranceExamId!: number;
  standardId!: any;
  subjectId!: any;
  chapterMasters!: any;
  topicMasters!: any;
  examSetRequests!: any[];
  createdBy!: number;
  typeOfTest!: string;
  status!: string;
  testDate!: string;
  startTime!: string;
  endTime!: string;
  selectedSubjects!: any[];
}

// Core data structures with proper nesting relationships
export interface Subject {
  id: number;
  name: string;
}

export interface pdfOne {
  institute: string | null;
  examName: string | null;
  date: string | null;
  duration: string | null;
  totalMarks: number | null;
  twoColumn: boolean | null;
  watermark: string | null;
  angle: number | null;
  opacity: number | null;
  questions: any;
  teacherKey: boolean | null;
  examSetName: string | null;
  isPdf: boolean | null;
}

export interface answerKey1 {
  creatorId: any; //done
  institute: string | null; //done
  address: string | null;
  contactDetails: string | null;
  examName: string | null; //done
  date: string | null; //done
  duration: string | null; //done
  totalMarks: number | null; //done
  examSetName: string | null;
  isPdf: boolean | null;
}
// export interface answerKey1 {
//   creatorId: any; //done
//   institute: string | null; //done
//   address: string | null;
//   contactDetails: string | null;
//   examName: string | null; //done
//   date: string | null; //done
//   duration: string | null; //done
//   totalMarks: number | null; //done
//   examSetName: string | null; //done
// }

export interface answerKey2 {
  creatorId: any; //done
  instituteName: string | null; //done
  organization: string | null; //done
  examName: string | null; //done
  standard: string | null; //done
  totalQuestions: number | null; //done
  totalMarks: number | null; //done
  date: string | null; //done
  time: string | null; //done
  examSetName: string | null; //done
  isPdf: boolean | null;
}

export interface pdfTwo {
  instituteName: string | null; //done
  organization: string | null; //done
  examName: string | null; //done
  standard: string | null; //done
  totalQuestions: number | null;
  totalMarks: number | null; //done
  twoColumn: boolean | null; //done
  teacherKey: boolean | null;
  date: string | null; //done
  time: string | null; //done
  questions: any; //done
  examSetName: string | null; //done
  isPdf: boolean | null;
}

export interface Grade {
  subjectId: number;
  value: number | null;
}

export interface Student {
  id: number;
  name: string;
  grades: Grade[];
}

export interface Test {
  id: number;
  name: string;
  subjects: Subject[];
  students: Student[];
}

// State management for the component
export interface AppState {
  tests: Test[];
  selectedTestId: number | null;
  loading: boolean;
  currentView: 'manual' | 'excel';
  selectedStudentIds: Set<number>;
  uploadError: string | null;
}

// API interface for submitting grades
export interface GradeSubmission {
  testId: number;
  studentId: number;
  grades: { [subjectId: string]: number };
}

// Service method signatures
export interface TestService {
  getTests(): Observable<Test[]>;
  getTestById(testId: number): Observable<Test>;
  submitGrades(submission: GradeSubmission[]): Observable<void>;
}

// ============ SUBSCRIPTION & LICENSE MODELS ============
// Add these at the END of AllModel.ts (after all existing models)

/**
 * Subscription Plan Definition
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  role: string;
  
  // For Institution: per-user pricing
  minTeachers?: number;
  minStudents?: number;
  maxTeachers?: number;
  maxStudents?: number;
  teacherPrice?: number;
  studentPrice?: number;
  
  // For Student/Teacher plans
  basePrice?: number;
  defaultTeachers?: number;
  defaultStudents?: number;
  extraTeacherPrice?: number;
  extraStudentPrice?: number;
  maxExtraTeachers?: number;
  maxExtraStudents?: number;
  
  // NEW: Duration options
  availableDurations?: number[];  // [1, 2, 3, 6, 12]
  defaultDuration?: number;       // 1
  
  features: string[];
  isActive: boolean;
  color: string;
  icon: string;
}

/**
 * User License - Tracks what user has purchased
 */
export interface UserLicense {
  userId: string;
  planId: string;
  role: string;
  
  maxTeachers: number;
  maxStudents: number;
  currentTeachers: number;
  currentStudents: number;
  extraTeachers: number;
  extraStudents: number;
  
  // NEW: Duration & expiry
  durationInMonths: number;
  purchaseDate: Date;
  expiryDate: Date;
  
  status: 'pending' | 'active' | 'expired' | 'suspended';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  totalAmountPaid: number;
  paymentId?: string;
  orderId?: string;
  
  // NEW: Extension tracking
  extendedBy?: string;
  extendedAt?: Date;
  extensionCount: number;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

/**
 * Plan Customization - For signup flow
 */
export interface PlanCustomization {
  planId: string;
  role: string;
  
  // For Institution - selected counts
  selectedTeachers: number;
  selectedStudents: number;
  teacherPrice: number;
  studentPrice: number;
  
  // NEW: Duration
  durationInMonths: number;      // 1, 2, 3, 6, 12
  
  // For Student/Teacher
  baseTeachers: number;
  baseStudents: number;
  extraTeachers: number;
  extraStudents: number;
  
  // Totals
  totalTeachers: number;
  totalStudents: number;
  basePrice: number;
  totalPrice: number;            // Monthly price × duration
  monthlyPrice: number;          // Base monthly price
  selectedPlan: SubscriptionPlan;
}


/**
 * License Validation Request
 */
export interface LicenseValidationRequest {
  userId: string;
  role: string;
  action: 'CREATE_TEACHER' | 'CREATE_STUDENT' | 'ASSIGN_STUDENT';
  currentCount: number;
  maxLimit: number;
  entityId?: string; // ID of entity being created
}

export interface LicenseValidationResponse {
  isValid: boolean;
  message: string;
  currentCount: number;
  maxLimit: number;
  remainingSlots: number;
  canProceed: boolean;
}

/**
 * Extended Institute with license
 */
export interface InstituteExtended extends companyMaster {
  license: UserLicense;
  teachers: teacherMaster[];
  students: studentMaster[];
  totalTeachers: number;
  totalStudents: number;
  availableTeacherSlots: number;
  availableStudentSlots: number;
}

/**
 * Extended Teacher with license
 */
export interface TeacherExtended extends teacherMaster {
  license: UserLicense;
  students: studentMaster[];
  totalStudents: number;
  availableStudentSlots: number;
}

/**
 * Extended Student with license
 */
export interface StudentExtended extends studentMaster {
  license: UserLicense;
}

/**
 * License Extension Request
 */
export interface LicenseExtensionRequest {
  userId: string;
  extensionMonths: number;
  extendedBy: string;
}