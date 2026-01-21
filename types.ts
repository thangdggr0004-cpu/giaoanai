
export type EducationLevel = 'Tiểu học' | 'THCS' | 'THPT';

export interface Grade {
  name: string;
  subjects: string[];
}

export interface EducationData {
  [key: string]: Grade[];
}

export interface Lesson {
  id: number;
  title: string;
  periods?: string; // Số tiết (ví dụ: "2", "1-3")
  selected: boolean;
  isIntegrated: boolean;
}

export type GenerationStatus = 'idle' | 'parsing' | 'generating' | 'done' | 'error';

export interface Student {
  id: number;
  name: string;
  score: string | number;
  comment: string;
  selected: boolean;
  status: 'pending' | 'generating' | 'done' | 'error';
}

// User types for authentication
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AppUser extends AuthUser {
  isActive: boolean;
  isAdmin: boolean;
}