import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('📥 관리자 계정 추가 중...');

  const hashedPassword = await bcrypt.hash('admin', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin' },
    update: {},
    create: {
      email: 'admin',
      name: '관리자',
      password_hash: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ 관리자 계정 생성 완료!');
  console.log('📌 아이디(이메일): admin');
  console.log('📌 비밀번호: admin');
  console.log('📌 User ID:', admin.id);
}

main()
  .catch((error) => {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());