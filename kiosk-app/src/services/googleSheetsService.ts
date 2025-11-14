const API_BASE = 'http://localhost:3001/api/kiosk';

// 시설 목록 조회
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

// 예약 목록 조회
export async function getBookings() {
  try {
    const response = await fetch(`${API_BASE}/bookings`);
    const data = await response.json();
    
    console.log('📥 getBookings 응답:', data); // ✅ 디버깅
    
    // 백엔드에서 오는 데이터 구조에 맞게 변환
    const bookings = Array.isArray(data) ? data : (data.bookings || []);
    
    return bookings.map((booking: any) => ({
      id: booking.id,
      facilityId: booking.facility_id, // ✅ facility_id로 수정
      facilityName: booking.facility?.name || '', // ✅ 시설명
      userName: booking.user_name, // ✅ user_name으로 수정
      date: booking.date,
      timeSlot: booking.time_slot, // ✅ time_slot으로 수정
      phone: booking.phone || '',
      status: booking.status,
      createdAt: booking.created_at // ✅ created_at으로 수정
    }));
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    return [];
  }
}

// 예약 추가
export async function addBooking(bookingData: {
  facilityId: string;
  userName: string;
  date: string;
  timeSlot: string;
  phone?: string;
}) {
  try {
    console.log('📤 addBooking 요청:', bookingData); // ✅ 디버깅
    
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    
    const result = await response.json();
    console.log('📥 addBooking 응답:', result); // ✅ 디버깅
    
    if (!response.ok || !result.success) {
      throw new Error(result.error || result.message || '예약 추가 실패');
    }
    
    // ✅ 백엔드 응답을 프론트엔드 구조로 변환
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

// 예약 삭제
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

// 프로그램 목록 조회
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

// 프로그램 신청 조회
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

// 프로그램 신청 추가
export async function addApplication(applicationData: {
  programId: number;
  userName: string;
  phone?: string;
}) {
  try {
    const response = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationData),
    });
    
    if (!response.ok) {
      throw new Error('프로그램 신청 실패');
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error adding application:', error);
    throw error;
  }
}

// 프로그램 신청 삭제
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