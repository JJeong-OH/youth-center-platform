'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Facility {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  capacity: number | null;
  floor: string | null;
  isActive: boolean;
}

interface Booking {
  id: number;
  facility_id: string;
  user_name: string;
  date: string;
  time_slot: string;
  phone: string | null;
  status: string;
  facility?: {
    name: string;
  };
}

interface User {
  userId: number;
  email: string;
  name: string;
  phoneNumber?: string;
}

const API_URL = 'http://localhost:3001/api';

const TIME_SLOTS = Array.from({ length: 9 }, (_, i) => {
  const startHour = i + 9;
  const endHour = startHour + 1;
  return `${String(startHour).padStart(2, '0')}:00-${String(endHour).padStart(2, '0')}:00`;
});

// ✅ 간단하게
const getTodayString = () => new Date().toISOString().split('T')[0];

export default function FacilitiesPage() {
  const router = useRouter();
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [viewMode, setViewMode] = useState<'new' | 'check'>('new');
  
  const [selectedDate, setSelectedDate] = useState(getTodayString()); // ✅ 페이지 열 때마다 오늘
  const [expandedFacility, setExpandedFacility] = useState<string | null>(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<{[key: string]: string[]}>({});
  const [bookingForm, setBookingForm] = useState({
    userName: '',
    phoneNumber: ''
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingTarget, setBookingTarget] = useState<{facility: Facility, timeSlots: string[], date: string} | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [checkPhone, setCheckPhone] = useState('');
  const [userBookings, setUserBookings] = useState<Booking[] | null>(null);
  const [checkError, setCheckError] = useState('');
  
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // ✅ useEffect - 타이머 전부 제거
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      setIsInitializing(false);
      alert('로그인이 필요합니다.');
      router.push('/');
      return;
    }

    setIsInitializing(false);
    fetchUserProfile(token);
    fetchFacilities();
    fetchBookings();
  }, [router]);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        localStorage.removeItem('accessToken');
        router.push('/');
        return;
      }
      
      const userData = await response.json();
      setUser(userData);
      setBookingForm({
        userName: userData.name || '',
        phoneNumber: userData.phoneNumber || ''
      });
    } catch (error) {
      localStorage.removeItem('accessToken');
      router.push('/');
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await fetch(`${API_URL}/kiosk/facilities`);
      const data = await response.json();
      setFacilities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('시설 조회 에러:', error);
    }
  };

  // ✅ fetchBookings - 지난 날짜만 필터링
  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_URL}/kiosk/bookings`);
      const data = await response.json();
      
      // ✅ 오늘 0시 기준
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const filteredBookings = Array.isArray(data) 
        ? data.filter((booking: Booking) => {
            const bookingDate = new Date(booking.date);
            return bookingDate >= today && booking.status === 'active';
          })
        : [];
      
      setBookings(filteredBookings);
    } catch (error) {
      console.error('예약 조회 에러:', error);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const toggleTimeSlot = (facilityId: string, timeSlot: string) => {
    setSelectedTimeSlots(prev => {
      const current = prev[facilityId] || [];
      if (current.includes(timeSlot)) {
        return { ...prev, [facilityId]: current.filter(t => t !== timeSlot) };
      } else {
        if (current.length >= 2) {
          alert('최대 2개 시간대까지 선택 가능합니다.');
          return prev;
        }
        return { ...prev, [facilityId]: [...current, timeSlot] };
      }
    });
  };

  const handleBookingClick = (facility: Facility) => {
    const timeSlots = selectedTimeSlots[facility.id] || [];
    if (timeSlots.length === 0) {
      alert('시간대를 선택해주세요.');
      return;
    }
    
    setBookingTarget({ facility, timeSlots, date: selectedDate });
    setShowBookingModal(true);
  };

  const submitBooking = async () => {
    if (!bookingTarget || !user) return;

    try {
      for (const timeSlot of bookingTarget.timeSlots) {
        const response = await fetch(`${API_URL}/kiosk/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            facilityId: bookingTarget.facility.id,
            userName: user.name,
            date: bookingTarget.date,
            timeSlot: timeSlot,
            phone: user.phoneNumber?.replace(/-/g, '') || ''
          })
        });

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || '예약에 실패했습니다.');
        }
      }

      await fetchBookings();
      setShowBookingModal(false);
      setBookingTarget(null);
      setSelectedTimeSlots(prev => ({ ...prev, [bookingTarget.facility.id]: [] }));
      setExpandedFacility(null);
      setShowSuccessModal(true);
    } catch (error: any) {
      alert(error.message || '예약 중 오류가 발생했습니다.');
    }
  };

  // ✅ handleCheckBookings - 지난 예약 제외
  const handleCheckBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const foundBookings = bookings.filter(b => {
      const bookingDate = new Date(b.date);
      return b.phone === checkPhone.replace(/-/g, '') && 
             b.status === 'active' &&
             bookingDate >= today;  // ✅ 오늘 이후만
    });
    
    if (foundBookings.length > 0) {
      setUserBookings(foundBookings.sort((a,b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ));
      setCheckError('');
    } else {
      setUserBookings(null);
      setCheckError('일치하는 예약 정보를 찾을 수 없습니다.');
    }
  };
  
  const cancelBooking = async (bookingId: number) => {
    if (!confirm('예약을 취소하시겠습니까?')) return;

    try {
      const response = await fetch(`${API_URL}/kiosk/bookings/${bookingId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        await fetchBookings();
        const updatedUserBookings = userBookings?.filter(b => b.id !== bookingId) || [];
        setUserBookings(updatedUserBookings.length > 0 ? updatedUserBookings : null);
        showNotification('error', '예약이 취소되었습니다.');
      } else {
        showNotification('error', '예약 취소에 실패했습니다.');
      }
    } catch (error) {
      console.error('예약 취소 에러:', error);
      showNotification('error', '예약 취소 중 오류가 발생했습니다.');
    }
  };

  const maskPhoneNumber = (phone: string | null): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/-/g, '');
    if (cleaned.length > 7) {
      return `${cleaned.slice(0, 3)}-****-${cleaned.slice(-4)}`;
    }
    return cleaned;
  };

  if (isInitializing) {
    return (
      <div style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '20px',
        fontWeight: '600'
      }}>
        로딩 중...
      </div>
    );
  }

  const facilitiesByFloor = facilities.reduce((acc, facility) => {
    const floor = facility.floor || '기타';
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(facility);
    return acc;
  }, {} as Record<string, Facility[]>);

  const floorOrder = ['지하1층', '3층', '4층', '기타'];
  const sortedFloors = floorOrder.filter(floor => facilitiesByFloor[floor]);

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* 헤더 */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        padding: '16px 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1a1a2e',
            margin: 0
          }}>
            🏢 시설 예약
          </h1>
          
          <div style={{
            display: 'flex',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            padding: '4px'
          }}>
            <button
              onClick={() => setViewMode('new')}
              style={{
                padding: '6px 12px',
                backgroundColor: viewMode === 'new' ? '#667eea' : 'transparent',
                color: viewMode === 'new' ? 'white' : '#666',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              신규 예약
            </button>
            <button
              onClick={() => setViewMode('check')}
              style={{
                padding: '6px 12px',
                backgroundColor: viewMode === 'check' ? '#667eea' : 'transparent',
                color: viewMode === 'check' ? 'white' : '#666',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              예약 확인
            </button>
          </div>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {/* 알림 */}
        {notification && (
          <div style={{
            margin: '16px',
            padding: '12px 16px',
            backgroundColor: notification.type === 'success' ? '#dcfce7' : '#fee2e2',
            borderRadius: '8px',
            fontSize: '14px',
            color: notification.type === 'success' ? '#166534' : '#991b1b',
            fontWeight: '500'
          }}>
            {notification.message}
          </div>
        )}

        {/* 신규 예약 */}
        {viewMode === 'new' && (
          <div style={{ padding: '16px' }}>
            {/* 날짜 선택 */}
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                📅 날짜 선택
              </label>
              <input
                type="date"
                value={selectedDate}
                min={getTodayString()}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* 시설 목록 */}
            {sortedFloors.map(floor => (
              <div key={floor} style={{ marginBottom: '20px' }}>
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '12px',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}>
                  📍 {floor}
                </h2>
                
                {facilitiesByFloor[floor].map(facility => {
                  const isExpanded = expandedFacility === facility.id;
                  const selectedSlots = selectedTimeSlots[facility.id] || [];
                  const bookingsForDate = bookings.filter(b => 
                    b.facility_id === facility.id && 
                    b.date.split('T')[0] === selectedDate &&
                    b.status === 'active'
                  );
                  const bookedTimeSlots = new Set(bookingsForDate.map(b => b.time_slot));

                  return (
                    <div
                      key={facility.id}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '12px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: isExpanded ? '12px' : '0'
                      }}>
                        <div style={{
                          width: '60px',
                          height: '60px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '30px',
                          flexShrink: 0
                        }}>
                          {facility.icon}
                        </div>
                        
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#1a1a2e',
                            marginBottom: '4px'
                          }}>
                            {facility.name}
                          </h3>
                          <p style={{
                            fontSize: '12px',
                            color: '#666',
                            marginBottom: '8px'
                          }}>
                            최대 {facility.capacity}명
                          </p>
                          
                          <button
                            onClick={() => setExpandedFacility(isExpanded ? null : facility.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#667eea',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            {isExpanded ? '닫기' : '예약하기'}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '8px',
                            marginBottom: '12px'
                          }}>
                            {TIME_SLOTS.map(timeSlot => {
                              const isBooked = bookedTimeSlots.has(timeSlot);
                              const isSelected = selectedSlots.includes(timeSlot);
                              
                              return (
                                <button
                                  key={timeSlot}
                                  onClick={() => !isBooked && toggleTimeSlot(facility.id, timeSlot)}
                                  disabled={isBooked}
                                  style={{
                                    padding: '8px',
                                    backgroundColor: isBooked ? '#e5e7eb' : (isSelected ? '#667eea' : '#f3f4f6'),
                                    color: isBooked ? '#999' : (isSelected ? 'white' : '#333'),
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: isBooked ? 'not-allowed' : 'pointer',
                                    textDecoration: isBooked ? 'line-through' : 'none'
                                  }}
                                >
                                  {timeSlot.split('-')[0]}
                                </button>
                              );
                            })}
                          </div>
                          
                          {selectedSlots.length > 0 && (
                            <button
                              onClick={() => handleBookingClick(facility)}
                              style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              {selectedSlots.length}개 시간대 예약하기
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* 예약 확인 */}
        {viewMode === 'check' && (
          <div style={{ padding: '16px' }}>
            {!userBookings ? (
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a1a2e',
                  marginBottom: '8px'
                }}>
                  예약 확인/취소
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '16px'
                }}>
                  예약 시 입력한 전화번호를 입력해주세요.
                </p>
                
                <input
                  type="tel"
                  value={checkPhone}
                  onChange={(e) => setCheckPhone(e.target.value)}
                  placeholder="전화번호 ('-' 제외)"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    marginBottom: '12px'
                  }}
                />
                
                {checkError && (
                  <p style={{
                    fontSize: '13px',
                    color: '#dc2626',
                    marginBottom: '12px'
                  }}>
                    {checkError}
                  </p>
                )}
                
                <button
                  onClick={handleCheckBookings}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  예약 확인
                </button>
              </div>
            ) : (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: 'white'
                  }}>
                    나의 예약 내역
                  </h3>
                  <button
                    onClick={() => {
                      setUserBookings(null);
                      setCheckPhone('');
                      setCheckError('');
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    다른 예약 조회
                  </button>
                </div>
                
                {userBookings.length === 0 ? (
                  <div style={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderRadius: '12px',
                    padding: '40px 24px',
                    textAlign: 'center',
                    color: '#999'
                  }}>
                    남아있는 예약이 없습니다.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {userBookings.map(booking => (
                      <div
                        key={booking.id}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.95)',
                          borderRadius: '12px',
                          padding: '16px',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                        }}
                      >
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '700',
                          color: '#667eea',
                          marginBottom: '4px'
                        }}>
                          {booking.facility?.name || '시설'}
                        </h4>
                        <p style={{
                          fontSize: '13px',
                          color: '#666',
                          marginBottom: '12px'
                        }}>
                          {booking.date.split('T')[0]} / {booking.time_slot}
                        </p>
                        
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          marginBottom: '12px',
                          paddingTop: '12px',
                          borderTop: '1px solid #e5e7eb'
                        }}>
                          <p style={{ marginBottom: '4px' }}>
                            <strong>예약자:</strong> {booking.user_name}
                          </p>
                          <p style={{ marginBottom: '4px' }}>
                            <strong>연락처:</strong> {maskPhoneNumber(booking.phone)}
                          </p>
                          <p>
                            <strong>예약번호:</strong> {booking.id}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => cancelBooking(booking.id)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          예약 취소
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div style={{
        backgroundColor: 'white',
        padding: '12px 16px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        flexShrink: 0
      }}>
        <Link href="/" style={{
          display: 'block',
          textAlign: 'center',
          padding: '10px',
          color: '#667eea',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          ← 홈으로 돌아가기
        </Link>
      </div>

      {/* 예약 모달 */}
      {showBookingModal && bookingTarget && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1a1a2e',
              marginBottom: '8px'
            }}>
              예약 확인
            </h3>
            
            <div style={{
              padding: '16px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#666'
            }}>
              <p style={{ marginBottom: '8px' }}><strong>예약자:</strong> {user?.name}</p>
              <p style={{ marginBottom: '8px' }}><strong>연락처:</strong> {user?.phoneNumber}</p>
              <p style={{ marginBottom: '8px' }}><strong>시설:</strong> {bookingTarget.facility.name}</p>
              <p style={{ marginBottom: '8px' }}><strong>날짜:</strong> {bookingTarget.date}</p>
              <p><strong>시간:</strong> {bookingTarget.timeSlots.length}개 시간대</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                {bookingTarget.timeSlots.map(ts => (
                  <span key={ts} style={{
                    padding: '2px 8px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {ts.split('-')[0]}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setBookingTarget(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#f3f4f6',
                  color: '#666',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={submitBooking}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                예약하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 성공 모달 */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '350px',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1a1a2e',
              marginBottom: '8px'
            }}>
              예약 완료!
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '24px'
            }}>
              시설 예약이 완료되었습니다.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}