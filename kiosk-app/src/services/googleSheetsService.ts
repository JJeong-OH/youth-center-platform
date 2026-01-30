import { API_URL } from '../config/api';

const API_BASE = `${API_URL}/api/kiosk`;

export async function getFacilities() {
  try {
    const response = await fetch(`${API_BASE}/facilities`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data.facilities || []);
  } catch (error) {
    console.error('❌ Error fetching facilities:', error);
    return [];
  }
}

export async function getBookings() {
  try {
    const response = await fetch(`${API_BASE}/bookings`);
    const data = await response.json();
    
    console.log('📥 getBookings 응답:', data);
    
    const bookings = Array.isArray(data) ? data : (data.bookings || []);
    
    return bookings.map((booking: any) => ({
      id: booking.id,
      facilityId: booking.facility_id,
      facilityName: booking.facility?.name || '',
      userName: booking.user_name, 
      date: booking.date,
      timeSlot: booking.time_slot, 
      phone: booking.phone || '',
      status: booking.status,
      createdAt: booking.created_at 
    }));
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    return [];
  }
}

export async function addBooking(bookingData: {
  facilityId: string;
  userName: string;
  date: string;
  timeSlot: string;
  phone?: string;
}) {
  try {
    console.log('📤 addBooking 요청:', bookingData);
    
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    
    const result = await response.json();
    console.log('📥 addBooking 응답:', result);
    
    if (!response.ok || !result.success) {
      throw new Error(result.error || result.message || '예약 추가 실패');
    }
    
    const booking = result.data;
    return {
      id: booking.id,
      facilityId: booking.facility_id,
      facilityName: booking.facility?.name || '',
      userName: booking.user_name,
      date: booking.date,
      timeSlot: booking.time_slot,
      phone: booking.phone || '',
      status: booking.status || 'active',
      createdAt: booking.created_at
    };
  } catch (error) {
    console.error('❌ Error adding booking:', error);
    throw error;
  }
}

export async function deleteBooking(bookingId: number) {
  try {
    const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('예약 삭제 실패');
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error deleting booking:', error);
    throw error;
  }
}

export async function getPrograms() {
  try {
    const response = await fetch(`${API_BASE}/programs`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data.programs || []);
  } catch (error) {
    console.error('❌ Error fetching programs:', error);
    return [];
  }
}

export async function getApplications() {
  try {
    const response = await fetch(`${API_BASE}/applications`);
    const data = await response.json();
    
    const applications = Array.isArray(data) ? data : (data.applications || []);
    
    return applications.map((app: any) => ({
      id: app.id,
      programId: app.program_id,
      programTitle: app.program?.title || '',
      userName: app.applicant_name,
      phone: app.phone || '',
      status: app.status,
      appliedAt: app.applied_at
    }));
  } catch (error) {
    console.error('❌ Error fetching applications:', error);
    return [];
  }
}

export async function addApplication(applicationData: {
  programId: number;
  userName: string;
  phone?: string;
}) {
  try {
    console.log('📤 addApplication 요청:', applicationData);
    
    const response = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationData),
    });
    
    const result = await response.json();
    console.log('📥 addApplication 응답:', result);
    
    if (!response.ok || !result.success) {
      throw new Error(result.error || result.message || '프로그램 신청 실패');
    }
    
    const application = result.data;
    return {
      id: application.id,
      programId: application.program_id,
      userName: application.applicant_name, 
      phone: application.phone || '',
      status: application.status,
      appliedAt: application.applied_at,
      isWaiting: application.isWaiting,
      waitingNumber: application.waitingNumber,
      programCapacity: application.programCapacity,
      approvedCount: application.approvedCount,
    };
  } catch (error) {
    console.error('❌ Error adding application:', error);
    throw error;
  }
}

export async function deleteApplication(applicationId: number) {
  try {
    const response = await fetch(`${API_BASE}/applications/${applicationId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('신청 삭제 실패');
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error deleting application:', error);
    throw error;
  }
}