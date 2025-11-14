// kiosk-app/src/types/types.ts

export type View = 'landing' | 'counselor' | 'facilities' | 'recommend';

export interface Facility {
  id: string;
  name: string;
  description: string;
  capacity: number;
  icon: string; // 이전 수정 사항
}

export interface Booking {
  id: string | number;
  facilityId: string;
  facilityName: string;
  userName: string;
  date: string;
  timeSlot: string;
  status: string;
  phone?: string; // 이전 수정 사항
}

export interface ProgramApplication {
  id: number;
  programId: number;
  userName: string;  // ✅ 이 필드가 있어야 함
  phone?: string;
  status: string;
  appliedAt?: string;
  // ✅ 추가 필드
  isWaiting?: boolean;
  waitingNumber?: number | null;
  programCapacity?: number;
  approvedCount?: number;
}

// ✨ YouthProgram -> Program으로 변경 및 필드 수정!
export interface Program {
  id: number; // React 코드에서 number로 사용 (recommendedProgramIds: number[])
  name: string;
  title: string; // React 코드에서 사용 (program.title)
  category: string;
  description: string;
  schedule: string;
  capacity: number;
  currentParticipants: number;
  department?: string; // React 코드에서 사용 (program.department)
  targetAudience?: string; // React 코드에서 사용 (program.targetAudience)
  fee?: number; // React 코드에서 사용 (program.fee)
}

export interface YouthFacility {
  id: string;
  name: string;
  description: string;
  capacity: number;
  available: boolean;
}

// ✨ ChatMessage 타입 추가 (React 코드에서 사용)
export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
}