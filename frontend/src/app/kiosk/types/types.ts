import type { FunctionCall } from '@google/genai';

export type View = 'counselor' | 'facilities' | 'recommend';

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
  functionCall?: FunctionCall;
}

export interface Program {
  id: number;
  title: string;
  department?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  targetAudience?: string;
  capacity?: number;
  fee: number;
  recruitStatus?: string;
  description?: string;
  imageUrl?: string;
  tags?: any;
  isActive?: boolean;
  order?: number;
  createdBy?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  capacity: number;
  image: string;
}

export interface Booking {
  bookingId: string;
  facilityId: string;
  date: string;
  timeSlot: string;
  userName: string;
  phoneNumber: string;
  pin: string;
}

// ✅ ProgramApplication도 수정
export interface ProgramApplication {
  id: string | number;
  programId: string | number;
  userName?: string;
  phone?: string;
  status?: string;
  appliedAt?: Date | string;
  // 구글 시트 호환
  applicationId?: string;
  phoneNumber?: string;
  pin?: string;
}