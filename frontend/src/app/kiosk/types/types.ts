import type { FunctionCall } from '@google/genai';

export type View = 'counselor' | 'facilities' | 'recommend';

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
  functionCall?: FunctionCall;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  category: string;
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
  date: string; // YYYY-MM-DD
  timeSlot: string;
  userName: string;
  phoneNumber: string;
  pin: string; // 4-digit string
}

export interface ProgramApplication {
  applicationId: string;
  programId: string;
  userName: string;
  phoneNumber: string;
  pin: string;
}
