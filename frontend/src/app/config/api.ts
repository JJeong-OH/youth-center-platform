// 배포 환경인지 확인
const isProduction = typeof window !== 'undefined' && 
                     window.location.hostname !== 'localhost' &&
                     window.location.hostname !== '127.0.0.1';

export const API_URL = isProduction
  ? 'https://youth-center-platform.onrender.com'
  : 'http://localhost:3001';

// 디버깅용
if (typeof window !== 'undefined') {
  console.log('🌍 Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
  console.log('🔗 API URL:', API_URL);
}