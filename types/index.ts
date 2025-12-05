// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
  errors: string[] | null;
  timestamp: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ============================================
// Auth Types
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  role: string; // Backend returns string
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  userCode: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  role: UserRole;
  department?: string | null;
  major?: string | null;
  campusId: string | null;
  campusName: string | null;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  campusId: string;
  role: "Student" | "Lecturer";
  department?: string;
  major?: string;
}

export interface PendingRegistration {
  id: string;
  userCode: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  campusId: string;
  campusName: string;
  role: string;
  department?: string;
  major?: string;
  createdAt: string;
}

export interface ApproveRegistrationRequest {
  userId: string;
  isApproved: boolean;
  rejectionReason?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  verificationCode: string;
  newPassword: string;
}

// ============================================
// User Types
// ============================================

export type UserRole = "Student" | "Lecturer" | "Admin";

export interface User {
  id: string;
  userCode: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: UserRole;
  department: string | null;
  major: string | null;
  campusId: string | null;
  campusName: string | null;
  isActive: boolean;
  isApproved: boolean;
  noShowCount: number;
  isBlocked: boolean;
  blockedUntil: string | null;
  blockedReason: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string; // "Student" | "Lecturer" | "Admin"
  password: string;
}

export interface UpdateUserRequest {
  id?: string; // Optional here, will be added by API client
  firstName: string;
  lastName: string;
  email: string;
  role: number; // 0 = Student, 1 = Lecturer, 2 = Admin
  isActive: boolean;
}

export interface GetUsersQuery {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  role?: string; // "Student" | "Lecturer" | "Admin"
  isActive?: boolean;
}

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber?: string | null;
  department?: string | null;
  major?: string | null;
}

// ============================================
// Campus Types
// ============================================

export interface Campus {
  id: string;
  campusCode: string;
  campusName: string;
  address: string;
  workingHoursStart: string; // TimeSpan as string "HH:mm:ss"
  workingHoursEnd: string;
  contactPhone: string | null;
  contactEmail: string | null;
  isActive: boolean;
}

export interface CreateCampusRequest {
  campusCode: string;
  campusName: string;
  address: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface UpdateCampusRequest {
  campusName: string;
  address: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  contactPhone?: string;
  contactEmail?: string;
  isActive: boolean;
}

// ============================================
// Facility Types
// ============================================

export type FacilityStatus = "Available" | "UnderMaintenance" | "Unavailable";

export interface Facility {
  id: string;
  facilityCode: string;
  facilityName: string;
  typeId: string;
  typeName: string;
  campusId: string;
  campusName: string;
  building: string | null;
  floor: string | null;
  roomNumber: string | null;
  capacity: number;
  description: string | null;
  equipment: string | null;
  imageUrl: string | null;
  status: string; // Backend returns string enum: "Available" | "UnderMaintenance" | "Unavailable"
  isActive: boolean;
}

export interface CreateFacilityRequest {
  facilityCode: string;
  facilityName: string;
  typeId: string;
  campusId: string;
  building?: string;
  floor?: string;
  roomNumber?: string;
  capacity: number;
  description?: string;
  equipment?: string;
  images?: File[];  // Changed from imageUrl to images array
}

export interface UpdateFacilityRequest {
  facilityName: string;
  typeId: string;
  building?: string;
  floor?: string;
  roomNumber?: string;
  capacity: number;
  description?: string;
  equipment?: string;
  imageUrl?: string;  // Keep existing images (JSON string)
  images?: File[];     // New images to upload
  status: string; // "Available" | "UnderMaintenance" | "Unavailable"
  isActive: boolean;
}

export interface GetFacilitiesQuery {
  campusId?: string;
  facilityTypeId?: string;
  availableOnly?: boolean;
}

// ============================================
// Facility Type Types
// ============================================

export interface FacilityType {
  id: string;
  typeCode: string;
  typeName: string;
  description: string | null;
  isActive: boolean;
}

export interface CreateFacilityTypeRequest {
  typeCode: string;
  typeName: string;
  description?: string;
}

export interface UpdateFacilityTypeRequest {
  typeName: string;
  description?: string;
  isActive: boolean;
}

// ============================================
// Campus Change Request Types
// ============================================

export type CampusChangeRequestStatus = "Pending" | "Approved" | "Rejected";

export interface CampusChangeRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  currentCampusId: string | null;
  currentCampusName: string | null;
  requestedCampusId: string;
  requestedCampusName: string;
  reason: string;
  status: CampusChangeRequestStatus;
  reviewedBy: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  reviewComment: string | null;
  createdAt: string;
}

export interface RequestCampusChangeRequest {
  requestedCampusId: string;
  reason: string;
}

export interface ApproveCampusChangeRequest {
  approved: boolean;
  comment?: string;
}

export interface MyCampusChangeRequest {
  id: string;
  currentCampusId: string | null;
  currentCampusName: string | null;
  requestedCampusId: string;
  requestedCampusName: string;
  reason: string;
  status: CampusChangeRequestStatus;
  reviewComment: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

// ============================================
// Booking Types
// ============================================

export type BookingStatus = 
  | "WaitingLecturerApproval" 
  | "WaitingAdminApproval" 
  | "Approved" 
  | "Rejected" 
  | "Cancelled" 
  | "Completed" 
  | "CheckedIn" 
  | "NoShow"
  | "Pending";

export interface Booking {
  id: string;
  bookingCode: string;
  facilityId: string;
  facilityName: string;
  userId: string;
  userName: string;
  userRole: string;
  bookingDate: string; // ISO date string
  startTime: string; // TimeSpan "HH:mm:ss"
  endTime: string; // TimeSpan "HH:mm:ss"
  purpose: string;
  participants: number;
  status: BookingStatus;
  lecturerEmail?: string | null;
  lecturerName?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
  checkedInAt?: string | null;
  checkedOutAt?: string | null;
  createdAt: string;
  modifiedAt?: string | null;
}

export interface BookingListDto {
  id: string;
  bookingCode: string;
  facilityId: string;
  facilityName: string;
  userId: string;
  userName: string;
  userRole: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  participants: number;
  status: string;
  lecturerEmail?: string | null;
  lecturerName?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
  checkedInAt?: string | null;
  checkedOutAt?: string | null;
  createdAt: string;
}

export interface CreateBookingRequest {
  facilityId: string;
  bookingDate: string; // ISO date "YYYY-MM-DD" (date only; time handled by startTime/endTime)
  startTime: string; // TimeSpan "HH:mm:ss"
  endTime: string; // TimeSpan "HH:mm:ss"
  purpose: string;
  participants: number;
  lecturerEmail?: string; // Required for Student bookings
  notes?: string;
}

export interface ApproveBookingRequest {
  comment?: string;
}

export interface LecturerApproveBookingRequest {
  approved: boolean;
  comment?: string;
}

export interface RejectBookingRequest {
  reason: string;
}

export interface GetBookingsQuery {
  status?: BookingStatus;
  facilityId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  pageNumber?: number;
  pageSize?: number;
}
// ============================================
// Holiday Types
// ============================================

export interface Holiday {
  id: string;
  holidayName: string;
  holidayDate: string; // ISO date string
  isRecurring: boolean;
  description?: string | null;
  createdAt: string;
}

export interface CreateHolidayRequest {
  holidayName: string;
  holidayDate: string; // ISO date string
  isRecurring: boolean;
  description?: string;
}

// ============================================
// Auth Context Types
// ============================================

export interface AuthState {
  user: UserInfo | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
