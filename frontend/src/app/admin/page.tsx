'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // /admin 접속 시 자동으로 /admin/dashboard로 리다이렉트
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <p style={{ fontSize: '18px', color: '#666' }}>리다이렉트 중...</p>
    </div>
  );
}