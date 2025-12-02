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
  role: UserRole;
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

// ============================================
// User Types
// ============================================

export type UserRole = "Student" | "Lecturer" | "Admin";

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginDate: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface GetUsersQuery {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  role?: UserRole;
  isActive?: boolean;
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
  imageUrl?: string;
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
  imageUrl?: string;
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
// Auth Context Types
// ============================================

export interface AuthState {
  user: UserInfo | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
