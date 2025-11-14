import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. 관리자 계정 생성
  const adminPassword = await bcrypt.hash('wjdgus!123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'whtpq159@naver.com' },
    update: {},
    create: {
      email: 'whtpq159@naver.com',
      password_hash: adminPassword,
      name: '오정현',
      role: 'ADMIN',
    },
  });

  console.log('✅ 관리자 계정 생성:', admin.email);

  // 2. 테스트 유저 생성
  const userPassword = await bcrypt.hash('test123', 10);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password_hash: userPassword,
      name: '테스트유저',
      role: 'USER',
      profiles: {
        create: {
          grade: '고등학교 2학년',
          phone: '010-1234-5678',
        },
      },
    },
  });

  console.log('✅ 테스트 유저 생성:', testUser.email);

  // 3. 시설 3개 생성
  const facilities = [
    {
      id: 'fac_dance',
      name: '댄스 연습실',
      icon: '💃',
      description: '거울이 설치된 넓은 댄스 연습 공간입니다',
      capacity: 20,
      order: 1,
      isActive: true,
    },
    {
      id: 'fac_music',
      name: '음악 합주실',
      icon: '🎸',
      description: '악기 연습 및 밴드 합주가 가능한 방음 시설입니다',
      capacity: 10,
      order: 2,
      isActive: true,
    },
    {
      id: 'fac_study',
      name: '스터디룸',
      icon: '📚',
      description: '조용한 분위기에서 학습할 수 있는 공간입니다',
      capacity: 8,
      order: 3,
      isActive: true,
    },
  ];

  for (const facility of facilities) {
    await prisma.facility.upsert({
      where: { id: facility.id },
      update: {},
      create: facility,
    });
  }

  console.log('✅ 시설 생성 완료:', facilities.length, '개');

  // 4. 프로그램 3개 생성
  const programs = [
    {
      title: '청소년 코딩 교실',
      department: '정보교육팀',
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-02-28'),
      targetAudience: '중고등학생',
      capacity: 20,
      fee: 0,
      recruitStatus: '모집중',
      description: '파이썬 기초부터 간단한 게임 만들기까지! 코딩의 세계로 여러분을 초대합니다.',
      tags: ['디지털역량', '코딩', '무료'],
      isActive: true,
      order: 1,
    },
    {
      title: '자기관리 캠프',
      department: '청소년활동팀',
      startDate: new Date('2025-01-20'),
      endDate: new Date('2025-01-22'),
      targetAudience: '고등학생',
      capacity: 30,
      fee: 50000,
      recruitStatus: '모집중',
      description: '시간 관리, 목표 설정, 습관 만들기 등 자기관리 능력을 키우는 2박 3일 캠프입니다.',
      tags: ['자기개발', '캠프', '숙박'],
      isActive: true,
      order: 2,
    },
    {
      title: '진로탐색 멘토링',
      department: '진로지원팀',
      startDate: new Date('2025-02-10'),
      endDate: new Date('2025-03-10'),
      targetAudience: '중고등학생',
      capacity: 15,
      fee: 20000,
      recruitStatus: '모집중',
      description: '다양한 직업군의 멘토와 만나 진로를 탐색하고 꿈을 구체화하는 프로그램입니다.',
      tags: ['진로개발', '멘토링', '1:1상담'],
      isActive: true,
      order: 3,
    },
  ];

  for (const program of programs) {
    await prisma.program.create({
      data: program,
    });
  }

  console.log('✅ 프로그램 생성 완료:', programs.length, '개');

  // 5. 샘플 예약 생성
  await prisma.booking.create({
    data: {
      facilityId: 'fac_dance',
      userId: testUser.id,
      userName: testUser.name,
      date: new Date('2025-01-20'),
      timeSlot: '14:00-16:00',
      phone: '010-1234-5678',
      status: 'active',
      source: 'web',
    },
  });

  console.log('✅ 샘플 예약 생성 완료');

  // 6. 샘플 설문 결과 생성
  await prisma.testResult.create({
    data: {
      user_id: testUser.id,
      answers: {
        자기개발분야: [4, 5, 4, 5, 4],
        사회참여분야: [3, 4, 3, 4, 3],
        문화예술분야: [5, 4, 5, 4, 5],
      },
      scores: {
        자기개발분야: 4.4,
        사회참여분야: 3.4,
        문화예술분야: 4.6,
      },
    },
  });

  console.log('✅ 샘플 설문 결과 생성 완료');

  console.log('🎉 Seeding 완료!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });