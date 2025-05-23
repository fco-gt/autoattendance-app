export enum UserFrontendStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface UserFrontend {
  id: string;
  email: string;
  name: string;
  lastname?: string | null;
  status: UserFrontendStatus;
  agencyId?: string | null;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export interface AuthUserResponse {
  user: UserFrontend;
  token: string;
  message?: string;
}

export interface Schedule {
  id: string;
  agencyId: string;
  name: string;
  daysOfWeek: number[]; // 0=Sunday, 1=Monday, etc.
  entryTime: string; // HH:MM
  exitTime: string; // HH:MM
  gracePeriodMinutes: number;
  isDefault: boolean;
  assignedUsersIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  userId: string;
  agencyId: string;
  checkInTime: string; // HH:MM
  scheduleEntryTime: string; // HH:MM
  status: AttendanceStatus;
  checkOutTime: string; // HH:MM
  scheduleExitTime: string; // HH:MM
  date: string; // YYYY-MM-DD
  methodIn: AttendanceMethod;
  methodOut: AttendanceMethod;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export enum AttendanceStatus {
  ON_TIME = "ON_TIME",
  LATE = "LATE",
}

export enum AttendanceMethod {
  MANUAL = "MANUAL",
  QR = "QR",
  NFC = "NFC",
}