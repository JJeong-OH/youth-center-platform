import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('📥 Production DB에 데이터 삽입 중...');

  const data = JSON.parse(fs.readFileSync('backup/data.json', 'utf-8'));

  console.log('📊 가져온 데이터:');
  console.log(`- Users: ${data.users.length}`);
  console.log(`- Programs: ${data.programs.length}`);
  console.log(`- Facilities: ${data.facilities.length}`);

  // 1. Users
  if (data.users.length > 0) {
    console.log('\n👥 Users 삽입 중...');
    for (const user of data.users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          email: user.email,
          name: user.name,
          password_hash: user.password_hash,
          role: user.role,
          created_at: new Date(user.created_at),
        },
      });
    }
    console.log(`✅ ${data.users.length}명 삽입 완료`);
  }

  // 2. Profiles
  if (data.users.length > 0) {
    console.log('\n📋 Profiles 삽입 중...');
    let profileCount = 0;
    for (const user of data.users) {
      const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
      if (!dbUser) continue;

      for (const profile of user.profiles || []) {
        await prisma.profile.create({
          data: {
            user_id: dbUser.id,
            grade: profile.grade,
            phone: profile.phone,
            interests: profile.interests,
            created_at: new Date(profile.created_at),
            updated_at: new Date(profile.updated_at),
          },
        });
        profileCount++;
      }
    }
    console.log(`✅ ${profileCount}개 삽입 완료`);
  }

  // 3. Programs
  if (data.programs.length > 0) {
    console.log('\n📚 Programs 삽입 중...');
    for (const program of data.programs) {
      await prisma.program.create({
        data: {
          title: program.title,
          department: program.department,
          startDate: program.startDate ? new Date(program.startDate) : null,
          endDate: program.endDate ? new Date(program.endDate) : null,
          targetAudience: program.targetAudience,
          capacity: program.capacity,
          fee: program.fee,
          recruitStatus: program.recruitStatus,
          description: program.description,
          imageUrl: program.imageUrl,
          tags: program.tags,
          isActive: program.isActive,
          order: program.order,
          createdBy: program.createdBy,
          createdAt: new Date(program.createdAt),
          updatedAt: new Date(program.updatedAt),
        },
      });
    }
    console.log(`✅ ${data.programs.length}개 삽입 완료`);
  }

  // 4. Facilities
  if (data.facilities.length > 0) {
    console.log('\n🏢 Facilities 삽입 중...');
    for (const facility of data.facilities) {
      await prisma.facility.create({
        data: {
          id: facility.id,
          name: facility.name,
          icon: facility.icon,
          description: facility.description,
          capacity: facility.capacity,
          isActive: facility.isActive,
          order: facility.order,
          createdAt: new Date(facility.createdAt),
          updatedAt: new Date(facility.updatedAt),
        },
      });
    }
    console.log(`✅ ${data.facilities.length}개 삽입 완료`);
  }

  // 5. 관리자 계정 추가 (데이터가 없을 경우)
  if (data.users.length === 0) {
    console.log('\n👤 기본 관리자 계정 생성 중...');
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash('wjdgus!123', 10);
    
    await prisma.user.upsert({
      where: { email: 'whtpq159@naver.com' },
      update: {},
      create: {
        email: 'whtpq159@naver.com',
        name: '오정현',
        password_hash: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('✅ 관리자 계정 생성 완료');
    console.log('📌 이메일: admin@youth.com');
    console.log('📌 비밀번호: admin123');
  }

  console.log('\n✅ 모든 데이터 삽입 완료!');
}

main()
  .catch((error) => {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());