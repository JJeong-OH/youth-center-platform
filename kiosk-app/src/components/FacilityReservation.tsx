'use client';
import React, { useState, useEffect } from 'react';
import { UsersIcon, CheckCircleIcon, XCircleIcon, CalendarIcon, TicketIcon, LoadingIcon, UserIcon, PhoneIcon } from './Icons';
import { BackButton } from './BackButton';  

const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : 'https://youth-center-platform.onrender.com';

type Facility = {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  capacity: number | null;
  floor: string | null; 
  isActive: boolean;
};

type Booking = {
  id: number;
  facility_id: string;
  user_name: string;
  date: string;
  time_slot: string;
  phone: string | null;
  status: string;
  source: string;
  created_at: string;
  facility: {
    id: string;
    name: string;
    icon: string;
  };
};

const TIME_SLOTS = Array.from({ length: 9 }, (_, i) => {
    const startHour = i + 9;
    const endHour = startHour + 1;
    return `${String(startHour).padStart(2, '0')}:00-${String(endHour).padStart(2, '0')}:00`;
});

const getTodayString = () => new Date().toISOString().split('T')[0];

const BookingModal: React.FC<{
  slot: { facility: Facility; timeSlots: string[]; date: string };
  onClose: () => void;
  onConfirm: (details: { userName: string; phoneNumber: string; pin: string; date: string; timeSlots: string[] }) => Promise<void>;
}> = ({ slot, onClose, onConfirm }) => {
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (userName.trim().length < 2 || !/^[가-힣]{2,}$/.test(userName.trim())) {
      newErrors.userName = '유효한 한글 이름(2자 이상)을 입력해주세요.';
    }
    if (!/^\d{10,11}$/.test(phoneNumber.replace(/-/g, ''))) {
      newErrors.phoneNumber = '유효한 전화번호 10-11자리를 입력해주세요.';
    }
    if (!/^\d{4}$/.test(pin)) {
      newErrors.pin = '비밀번호 4자리를 입력해주세요.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (validate()) {
      setIsSubmitting(true);
      try {
        await onConfirm({
          date: slot.date,
          timeSlots: slot.timeSlots,
          userName: userName.trim(),
          phoneNumber: phoneNumber.replace(/-/g, ''),
          pin,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/30 max-w-md w-full">
        <h3 className="text-2xl font-bold mb-2 text-indigo-600">예약 정보 입력</h3>
        <div className="text-slate-600 mb-6 bg-slate-100/80 p-3 rounded-lg border border-slate-200/80">
            <p><strong>시설:</strong> {slot.facility.name}</p>
            <p><strong>날짜:</strong> {slot.date}</p>
            <p><strong>시간:</strong> {slot.timeSlots.length}개 시간대</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {slot.timeSlots.map(ts => (
                <span key={ts} className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-semibold">
                  {ts.split('-')[0]}
                </span>
              ))}
            </div>
        </div>
        <div className="space-y-4">
          <div>
            <input type="text" placeholder="이름 (한글 2자 이상)" value={userName} onChange={e => setUserName(e.target.value)} className={`w-full input-field ${errors.userName ? 'border-red-500' : 'border-slate-300'}`} />
            {errors.userName && <p className="text-red-600 text-sm mt-1">{errors.userName}</p>}
          </div>
          <div>
            <input type="tel" placeholder="전화번호 ('-' 제외)" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className={`w-full input-field ${errors.phoneNumber ? 'border-red-500' : 'border-slate-300'}`} />
            {errors.phoneNumber && <p className="text-red-600 text-sm mt-1">{errors.phoneNumber}</p>}
          </div>
          <div>
            <input type="password" placeholder="비밀번호 4자리" maxLength={4} value={pin} onChange={e => setPin(e.target.value)} className={`w-full input-field ${errors.pin ? 'border-red-500' : 'border-slate-300'}`} />
            {errors.pin && <p className="text-red-600 text-sm mt-1">{errors.pin}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button onClick={onClose} className="btn-secondary" disabled={isSubmitting}>취소</button>
          <button onClick={handleConfirm} className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? '신청 중...' : '예약 신청'}
          </button>
        </div>
      </div>
    </div>
  );
};

const BookingSuccessModal: React.FC<{ bookings: Booking[]; onClose: () => void }> = ({ bookings, onClose }) => {
    const firstBooking = bookings[0];
    const facilityName = firstBooking?.facility?.name || '알 수 없음';
    const userName = firstBooking?.user_name || '알 수 없음';
    const date = firstBooking?.date || '';
    
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/30 max-w-md w-full text-center">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2 text-slate-800">예약 완료!</h3>
                <p className="text-slate-600 mb-6">{bookings.length}개 시간대 예약이 완료되었습니다.</p>
                <div className="text-left bg-slate-50/80 p-4 rounded-lg border border-slate-200/80 space-y-2 mb-8">
                    <p><strong>예약자:</strong> {userName}</p>
                    <p><strong>시설:</strong> {facilityName}</p>
                    <p><strong>날짜:</strong> {date ? new Date(date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                    }) : '날짜 정보 없음'}</p>
                    <p><strong>시간대:</strong></p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {bookings.map(booking => {
                        if (!booking.time_slot) return null;
                        const timeDisplay = booking.time_slot.split('-')[0];
                        return (
                          <span key={booking.id} className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-semibold">
                            {timeDisplay}
                          </span>
                        );
                      })}
                    </div>
                </div>
                <button onClick={onClose} className="w-full btn-primary">확인</button>
            </div>
        </div>
    );
};

const FacilityCard: React.FC<{
  facility: Facility;
  bookings: Booking[];
  selectedDate: string;
  onBook: (facility: Facility, timeSlots: string[]) => void;
}> = ({ facility, bookings, selectedDate, onBook }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [existingBookingsCount, setExistingBookingsCount] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const bookingsForDate = bookings.filter(b => 
    b.facility_id === facility.id && 
    b.date.split('T')[0] === selectedDate &&
    b.status === 'active'
  );
  
  const bookedTimeSlots = new Set(
    bookingsForDate.map(b => b.time_slot)
  );
  
  const checkExistingBookings = async (phone: string) => {
    if (phone.length >= 10) {
      try {
        const response = await fetch(
          `${API_URL}/api/kiosk/bookings/check?facilityId=${facility.id}&date=${selectedDate}&phone=${phone}`
        );
        const data = await response.json();
        if (data.success) {
          setExistingBookingsCount(data.count || 0);
        }
      } catch (error) {
        console.error('예약 개수 확인 실패:', error);
      }
    }
  };
  
  useEffect(() => {
    if (!isExpanded) {
      setSelectedTimeSlots([]);
      setExistingBookingsCount(0);
      setPhoneNumber('');
    }
  }, [isExpanded]);
  
  const toggleTimeSlot = (timeSlot: string) => {
    setSelectedTimeSlots(prev => {
      if (prev.includes(timeSlot)) {
        return prev.filter(t => t !== timeSlot);
      } else {
        const maxSelectable = 2 - existingBookingsCount;
        if (prev.length >= maxSelectable) {
          alert(`같은 날, 같은 실습실은 최대 2시간까지만 예약 가능합니다.\n현재 ${existingBookingsCount}개 예약됨`);
          return prev;
        }
        return [...prev, timeSlot];
      }
    });
  };
  
  const handleBooking = () => {
    if (selectedTimeSlots.length > 0) {
      onBook(facility, selectedTimeSlots);
      setSelectedTimeSlots([]);
      setExistingBookingsCount(0);
      setPhoneNumber('');
      setIsExpanded(false);
    }
  };
  
  const isPast = new Date(selectedDate) < new Date(getTodayString());

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-4 overflow-hidden transition-all duration-300">
      <div className="flex gap-4">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center text-4xl flex-shrink-0 overflow-hidden">
          {facility.icon.startsWith('/') || facility.icon.startsWith('http') ? (
            <img 
              src={facility.icon.startsWith('/') ? `${API_URL}${facility.icon}` : facility.icon}
              alt={facility.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            facility.icon
          )}
        </div>
        <div className="flex flex-col flex-grow min-w-0">
          <h3 className="text-lg font-bold text-slate-800 truncate">{facility.name}</h3>
          {facility.floor && (
            <div className="text-xs font-semibold text-purple-600 mt-0.5">
              📍 {facility.floor}
            </div>
          )}
          <div className="text-xs font-semibold text-slate-500 my-0.5 flex items-center gap-1">
            <UsersIcon className="w-3 h-3" />
            <span>최대 {facility.capacity}명</span>
          </div>
          <p className="text-slate-600 text-xs line-clamp-2 mt-1">{facility.description}</p>
          {!isPast && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 px-4 py-1.5 rounded-lg bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors self-start"
            >
              {isExpanded ? '닫기' : '예약하기'}
            </button>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-200/80">
          <div className="mb-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              전화번호 입력
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                checkExistingBookings(e.target.value.replace(/-/g, ''));
              }}
              placeholder="전화번호 ('-' 제외)"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            />
          </div>

          {existingBookingsCount > 0 && (
            <div className="mb-3 p-2 bg-yellow-100 border border-yellow-300 rounded-lg text-xs text-yellow-800">
              ⚠️ 오늘 {existingBookingsCount}시간 예약됨. 최대 {2 - existingBookingsCount}시간 추가 가능
            </div>
          )}

          <h4 className="font-semibold mb-2 text-slate-700 text-sm">
            시간 선택 (최대 {2 - existingBookingsCount}개)
            {selectedTimeSlots.length > 0 && (
              <span className="text-indigo-600 ml-2">({selectedTimeSlots.length}개)</span>
            )}
          </h4>
          <div className="grid grid-cols-3 gap-1.5">
            {TIME_SLOTS.map(timeSlot => {
              const isBooked = bookedTimeSlots.has(timeSlot);
              const isSelected = selectedTimeSlots.includes(timeSlot);
              const maxSelectable = 2 - existingBookingsCount;
              const isDisabled = !isSelected && selectedTimeSlots.length >= maxSelectable;
              
              if (isBooked) {
                return (
                  <button key={timeSlot} disabled className="p-2 rounded-lg text-xs font-semibold bg-gray-300 text-gray-500 cursor-not-allowed">
                    <div className="line-through">{timeSlot.split('-')[0]}</div>
                  </button>
                );
              }
              
              return (
                <button
                  key={timeSlot}
                  onClick={() => toggleTimeSlot(timeSlot)}
                  disabled={isDisabled}
                  className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                    isSelected 
                      ? 'bg-indigo-500 text-white shadow-lg'
                      : isDisabled
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
                >
                  {timeSlot.split('-')[0]}
                  {isSelected && ' ✓'}
                </button>
              );
            })}
          </div>
          
          {selectedTimeSlots.length > 0 && (
            <button
              onClick={handleBooking}
              className="mt-3 w-full px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="w-4 h-4" />
              {selectedTimeSlots.length}개 시간대 예약
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const NewReservationView: React.FC<{ 
  facilities: Facility[];
  bookings: Booking[], 
  onAddBooking: (booking: Booking) => void,
  onRefreshBookings: () => void 
}> = ({ facilities, bookings, onAddBooking, onRefreshBookings }) => {
    const [selectedDate, setSelectedDate] = useState(getTodayString());
    const [bookingSlot, setBookingSlot] = useState<{ facility: Facility; timeSlots: string[] } | null>(null);
    const [successInfo, setSuccessInfo] = useState<Booking[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const facilitiesByFloor = facilities.reduce((acc, facility) => {
      const floor = facility.floor || '기타';
      if (!acc[floor]) {
        acc[floor] = [];
      }
      acc[floor].push(facility);
      return acc;
    }, {} as Record<string, Facility[]>);

    const floorOrder = ['지하1층', '3층', '4층', '기타'];
    const sortedFloors = floorOrder.filter(floor => facilitiesByFloor[floor]);

    const handleConfirmBooking = async (details: { userName: string; phoneNumber: string; pin: string; date: string; timeSlots: string[] }) => {
        if (!bookingSlot) return;
        
        try {
            const newBookings: Booking[] = [];
            
            for (const timeSlot of details.timeSlots) {
                const bookingPayload = {
                    facilityId: bookingSlot.facility.id,
                    userName: details.userName,
                    date: details.date,
                    timeSlot: timeSlot,
                    phone: details.phoneNumber,
                };
                
                const response = await fetch(`${API_URL}/api/kiosk/bookings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookingPayload),
                });
                
                const result = await response.json();
                
                if (!result.success) {
                    throw new Error(result.error || result.message || '예약에 실패했습니다.');
                }
                
                const booking: Booking = {
                    id: result.data.id,
                    facility_id: result.data.facility_id,
                    user_name: result.data.user_name,
                    date: result.data.date,
                    time_slot: result.data.time_slot,
                    phone: result.data.phone,
                    status: result.data.status,
                    source: result.data.source,
                    created_at: result.data.created_at,
                    facility: result.data.facility
                };
                
                newBookings.push(booking);
                onAddBooking(booking);
            }
            
            await onRefreshBookings();
            setBookingSlot(null);
            setSuccessInfo(newBookings);
            setErrorMessage(null);
        } catch (error: any) {
            console.error("💥 예약 실패:", error);
            setBookingSlot(null);
            
            const errorMsg = error.message || '예약에 실패했습니다. 다시 시도해주세요.';
            setErrorMessage(errorMsg);
            setTimeout(() => setErrorMessage(null), 5000);
        }
    };

    const handleCloseSuccess = () => {
        setSuccessInfo([]);
        setErrorMessage(null);
    };

    return (  
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* 날짜 선택 - 고정 */}
            <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/30 p-3 mb-3" style={{ flexShrink: 0 }}>
                <label htmlFor="date-picker" className="flex items-center gap-2 text-base font-bold text-slate-700 mb-2">
                    <CalendarIcon className="w-5 h-5 text-indigo-500"/>
                    날짜 선택
                </label>
                <input
                    id="date-picker"
                    type="date"
                    value={selectedDate}
                    min={getTodayString()}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full bg-white/70 rounded-lg p-2 border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
            </div>

            {/* 에러 메시지 */}
            {errorMessage && (
              <div className="bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded-xl mb-3 flex items-center gap-2 text-sm" style={{ flexShrink: 0 }}>
                <XCircleIcon className="w-4 h-4 flex-shrink-0" />
                <p className="font-semibold">{errorMessage}</p>
              </div>
            )}

            {/* 시설 목록 - 스크롤 영역 */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', paddingBottom: '100px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {sortedFloors.map(floor => (
                        <div key={floor}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                marginBottom: '12px',
                                padding: '10px 14px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                borderRadius: '10px',
                                textAlign: 'center'
                            }}>
                                📍 {floor}
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '12px'
                            }}>
                                {facilitiesByFloor[floor].map(facility => (
                                    <FacilityCard
                                        key={facility.id}
                                        facility={facility}
                                        bookings={bookings}
                                        selectedDate={selectedDate}
                                        onBook={(facility, timeSlots) => setBookingSlot({ facility, timeSlots })}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 모달들 */}
            {bookingSlot && (
                <BookingModal
                    slot={{ ...bookingSlot, date: selectedDate }}
                    onClose={() => setBookingSlot(null)}
                    onConfirm={handleConfirmBooking}
                />
            )}
            {successInfo.length > 0 && (
                <BookingSuccessModal 
                    bookings={successInfo}
                    onClose={handleCloseSuccess}
                />
            )}
        </div>
    );
};

const CheckReservationView: React.FC<{
    bookings: Booking[];
    facilities: Facility[];
    onCancelBooking: (bookingId: string) => void;
}> = ({ bookings, facilities, onCancelBooking }) => {
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [userBookings, setUserBookings] = useState<Booking[] | null>(null);

    const maskPhoneNumber = (phone: string): string => {
        if (!phone) return '';
        const cleaned = phone.replace(/-/g, '');
        if (cleaned.length > 7) {
            return `${cleaned.slice(0, 3)}-****-${cleaned.slice(-4)}`;
        }
        return cleaned;
    };

    const handleCheck = () => {
        const foundBookings = bookings.filter(b => 
          b.phone === phone.replace(/-/g, '') && b.status === 'active'
        );
        if (foundBookings.length > 0) {
            setUserBookings(foundBookings.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            setError('');
        } else {
            setUserBookings(null);
            setError('일치하는 예약 정보를 찾을 수 없습니다. 전화번호를 확인해주세요.');
        }
    };
    
    const handleLogout = () => {
        setUserBookings(null);
        setPhone('');
        setError('');
    };
    
    useEffect(() => {
        if(userBookings) {
            handleCheck();
        }
    }, [bookings]);

    if (userBookings) {
        return (
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px', paddingBottom: '100px' }}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">나의 예약 내역</h3>
                    <button onClick={handleLogout} className="text-sm font-semibold hover:underline text-slate-600">다른 예약 조회</button>
                </div>
                {userBookings.length === 0 ? (
                    <p className="text-center text-slate-500 mt-8">남아있는 예약이 없습니다.</p>
                ) : (
                    <div className="space-y-3">
                        {userBookings.map(booking => {
                            const facility = facilities.find(f => f.id === booking.facility_id);
                            return (
                                <div key={booking.id} className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/30 p-4">
                                    <h4 className="font-bold text-base text-indigo-600">{facility?.name}</h4>
                                    <p className="text-sm text-slate-500 font-semibold mb-2">{booking.date.split('T')[0]} / {booking.time_slot}</p>
                                    
                                    <div className="space-y-1 text-sm border-t border-slate-200/80 pt-2">
                                        <p className="flex items-center gap-2 text-slate-700">
                                            <UserIcon className="w-4 h-4 text-slate-400"/>
                                            <span><strong>예약자:</strong> {booking.user_name}</span>
                                        </p>
                                        <p className="flex items-center gap-2 text-slate-700">
                                            <PhoneIcon className="w-4 h-4 text-slate-400"/>
                                            <span><strong>연락처:</strong> {maskPhoneNumber(booking.phone || '')}</span>
                                        </p>
                                        <p className="flex items-center gap-2 text-slate-700">
                                            <TicketIcon className="w-4 h-4 text-slate-400"/>
                                            <span><strong>예약번호:</strong> {booking.id}</span>
                                        </p>
                                    </div>
                                    
                                    <button
                                        onClick={() => onCancelBooking(String(booking.id))}
                                        className="mt-3 w-full px-3 py-2 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors font-semibold"
                                    >
                                        예약 취소
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }
    
    return (
        <div className="flex-grow flex items-center justify-center">
            <div className="w-full max-w-sm bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-8">
                <h3 className="text-xl font-bold text-slate-700 mb-2">예약 확인/취소</h3>
                <p className="text-slate-500 mb-6">예약 시 입력한 전화번호를 입력해주세요.</p>
                <div className="space-y-4">
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="전화번호 ('-' 제외)" className="w-full input-field border-slate-300" />
                </div>
                {error && <p className="text-red-600 text-sm mt-4 font-semibold">{error}</p>}
                <button onClick={handleCheck} className="w-full btn-primary mt-6">예약 확인</button>
            </div>
        </div>
    );
};

export const FacilityReservation: React.FC<{ 
  onBack?: () => void;
  initialViewMode?: 'new' | 'check';
}> = ({ onBack, initialViewMode = 'new' }) => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [viewMode, setViewMode] = useState<'new' | 'check'>(initialViewMode);
  
  useEffect(() => {
    setViewMode(initialViewMode);
  }, [initialViewMode]);
  
  const fetchData = async () => {
    try {
        const [facilitiesResponse, bookingsResponse] = await Promise.all([
          fetch(`${API_URL}/api/kiosk/facilities`),
          fetch(`${API_URL}/api/kiosk/bookings`)
        ]);
        
        const facilitiesData = await facilitiesResponse.json();
        const bookingsData = await bookingsResponse.json();
        
        setFacilities(Array.isArray(facilitiesData) ? facilitiesData : []);
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error) {
        console.error("Failed to fetch data:", error);
        showNotification('error', '데이터를 불러오는데 실패했습니다.');
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };
  
  const addBooking = (newBooking: Booking) => {
      setBookings(prev => [...prev, newBooking]);
  };

  const cancelBooking = async (bookingId: string) => {
    const bookingToCancel = bookings.find(b => String(b.id) === bookingId);
    if (!bookingToCancel) return;
    
    try {
        const response = await fetch(`${API_URL}/api/kiosk/bookings/${bookingId}`, {
            method: 'DELETE',
        });
        
        const result = await response.json();

        if (result.success) {
            const facility = facilities.find(f => f.id === bookingToCancel.facility_id);
            setBookings(prev => prev.filter(b => String(b.id) !== bookingId));
            showNotification('error', `'${facility?.name}' (${bookingToCancel.time_slot}) 예약이 취소되었습니다.`);
        } else {
            showNotification('error', '예약 취소에 실패했습니다. 다시 시도해주세요.');
        }
    } catch (error) {
        console.error('예약 취소 실패:', error);
        showNotification('error', '예약 취소에 실패했습니다.');
    }
  };

  const renderView = () => {
    if (isLoading) {
        return (
            <div className="flex-grow flex items-center justify-center">
                <LoadingIcon className="w-10 h-10 text-indigo-500" />
            </div>
        );
    }

    switch(viewMode) {
      case 'new':
        return <NewReservationView facilities={facilities} bookings={bookings} onAddBooking={addBooking} onRefreshBookings={fetchData} />;
      case 'check':
        return <CheckReservationView facilities={facilities} bookings={bookings} onCancelBooking={cancelBooking} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <style>{`
            .input-field { background-color: rgba(255,255,255,0.7); border-radius: 0.5rem; padding: 0.75rem; border-width: 1px; transition: all 0.2s; }
            .input-field:focus { ring: 2px; ring-color: #6366f1; outline: none; border-color: #6366f1; }
            .btn-primary { padding: 0.75rem 1.5rem; border-radius: 0.5rem; background-color: #4f46e5; color: white; font-weight: 600; transition: background-color 0.2s; display: inline-flex; align-items: center; justify-content: center;}
            .btn-primary:hover:not(:disabled) { background-color: #4338ca; }
            .btn-primary:disabled { background-color: #a5b4fc; cursor: not-allowed; }
            .btn-secondary { padding: 0.75rem 1.5rem; border-radius: 0.5rem; background-color: #d1d5db; color: #1f2937; font-weight: 600; transition: background-color 0.2s; }
            .btn-secondary:hover:not(:disabled) { background-color: #9ca3af; }
            .btn-secondary:disabled { background-color: #e5e7eb; cursor: not-allowed; }
        `}</style>
        
      {/* 헤더 - 고정 */}
      <div className="flex items-center justify-between mb-3 px-2" style={{ flexShrink: 0 }}>
        <h2 className="text-xl md:text-2xl font-bold text-indigo-600">시설 예약</h2>
        <div className="flex items-center p-1 rounded-xl bg-white/70 border border-white/30 shadow-sm">
            <button 
                onClick={() => setViewMode('new')}
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${viewMode === 'new' ? 'bg-indigo-500 text-white shadow' : 'text-slate-600 hover:bg-white/50'}`}
            >
                신규 예약
            </button>
            <button
                onClick={() => setViewMode('check')}
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${viewMode === 'check' ? 'bg-indigo-500 text-white shadow' : 'text-slate-600 hover:bg-white/50'}`}
            >
                예약 확인
            </button>
        </div>
      </div>

      {/* 알림 */}
      {notification && (
        <div className={`px-3 py-2 rounded-xl mb-3 flex items-center gap-2 text-sm ${notification.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' : 'bg-red-100 border border-red-300 text-red-800'}`} style={{ flexShrink: 0 }}>
          {notification.type === 'success' ? <CheckCircleIcon className="w-4 h-4"/> : <XCircleIcon className="w-4 h-4"/>}
          <p>{notification.message}</p>
        </div>
      )}
      
      {/* 콘텐츠 영역 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {renderView()}
      </div>

      {/* 뒤로가기 버튼 */}
      {onBack && <BackButton onClick={onBack} label="← 메인으로 돌아가기" />}
    </div>
  );
};