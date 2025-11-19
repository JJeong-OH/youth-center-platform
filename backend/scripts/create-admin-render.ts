import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@youth.com' },
    update: {
      password_hash: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@youth.com',
      name: '관리자',
      password_hash: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Render DB 관리자 계정:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());