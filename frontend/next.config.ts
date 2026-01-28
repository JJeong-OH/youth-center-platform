/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. ESLint 오류 무시
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 2. TypeScript 오류 무시
  typescript: {
    ignoreBuildErrors: true,
  },

  // ❌ output: 'export' 삭제됨 (이제 로컬 서버 정상 작동)
  // ❌ images: unoptimized 삭제됨
};

module.exports = nextConfig;