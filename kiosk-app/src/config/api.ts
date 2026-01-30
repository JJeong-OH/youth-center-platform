export const API_URL = (() => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    
    // ✅ 올바른 URL로 수정!
    return 'https://youth-center-backend-b331.onrender.com';
  }
  
  return 'http://localhost:3001';
})();

console.log('🔗 API URL:', API_URL);