import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('📦 로컬 데이터 추출 중...');

  const data = {
    users: await prisma.user.findMany({
      include: {
        profiles: true,
      },
    }),
    programs: await prisma.program.findMany(),
    facilities: await prisma.facility.findMany(),
    programApplications: await prisma.programApplication.findMany(),
    bookings: await prisma.booking.findMany(),
    testResults: await prisma.testResult.findMany(),
  };

  fs.writeFileSync('backup/data.json', JSON.stringify(data, null, 2));
  
  console.log('✅ 데이터 추출 완료!');
  console.log('📊 통계:');
  console.log(`- Users: ${data.users.length}`);
  console.log(`- Programs: ${data.programs.length}`);
  console.log(`- Facilities: ${data.facilities.length}`);
  console.log(`- Applications: ${data.programApplications.length}`);
  console.log(`- Bookings: ${data.bookings.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());