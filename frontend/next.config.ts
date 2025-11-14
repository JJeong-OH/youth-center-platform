/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true,  <-- 이런 기존 설정이 있을 수 있습니다.
  
  // ⬇️ 이 부분을 추가하는 것이 핵심입니다.
  eslint: {
    // 경고: 이 설정은 ESLint 오류가 있어도 프로덕션 빌드를 강제로 성공시킵니다.
    ignoreDuringBuilds: true,
  },
  // ⬆️ 여기까지
};

module.exports = nextConfig;