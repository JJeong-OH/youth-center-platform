import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📥 테이블 재생성 중...');

  try {
    // 1. Facility 테이블 삭제
    console.log('🗑️ Facility 테이블 삭제 중...');
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Facility" CASCADE;`);
    
    // 2. Facility 테이블 생성
    console.log('🔨 Facility 테이블 생성 중...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Facility" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "icon" TEXT NOT NULL DEFAULT '🏢',
        "description" TEXT,
        "capacity" INTEGER,
        "floor" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
      );
    `);
    
    console.log('✅ Facility 테이블 생성 완료!');

    // 3. Booking 테이블 삭제
    console.log('🗑️ Booking 테이블 삭제 중...');
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "bookings" CASCADE;`);
    
    // 4. Booking 테이블 생성
    console.log('🔨 Booking 테이블 생성 중...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "bookings" (
        "id" SERIAL NOT NULL,
        "user_id" INTEGER,
        "facility_id" TEXT NOT NULL,
        "user_name" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "time_slot" TEXT NOT NULL,
        "phone" TEXT,
        "status" TEXT NOT NULL DEFAULT 'active',
        "source" TEXT NOT NULL DEFAULT 'kiosk',
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
      );
    `);

    // 5. Foreign Key 추가 (users 테이블)
    console.log('🔗 Foreign Key 추가 중 (users)...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "users"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    `);
    
    // 6. Foreign Key 추가 (Facility 테이블)
    console.log('🔗 Foreign Key 추가 중 (Facility)...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "bookings" ADD CONSTRAINT "bookings_facility_id_fkey" 
        FOREIGN KEY ("facility_id") REFERENCES "Facility"("id") 
        ON DELETE RESTRICT ON UPDATE CASCADE;
    `);

    console.log('✅ Booking 테이블 생성 완료!');

    // 7. 샘플 데이터 추가 (각각 분리)
    console.log('📝 샘플 데이터 추가 중...');
    
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Facility" ("id", "name", "icon", "description", "capacity", "floor", "isActive", "order", "createdAt", "updatedAt")
      VALUES ('fac_001', '댄스 연습실', '💃', '댄스 연습을 위한 공간', 20, '지하1층', true, 1, NOW(), NOW())
      ON CONFLICT ("id") DO NOTHING;
    `);

    await prisma.$executeRawUnsafe(`
      INSERT INTO "Facility" ("id", "name", "icon", "description", "capacity", "floor", "isActive", "order", "createdAt", "updatedAt")
      VALUES ('fac_002', '음악 합주실', '🎵', '밴드 연습 및 녹음 가능', 10, '3층', true, 2, NOW(), NOW())
      ON CONFLICT ("id") DO NOTHING;
    `);

    await prisma.$executeRawUnsafe(`
      INSERT INTO "Facility" ("id", "name", "icon", "description", "capacity", "floor", "isActive", "order", "createdAt", "updatedAt")
      VALUES ('fac_003', '스터디룸 A', '📚', '조용한 학습 공간', 8, '4층', true, 3, NOW(), NOW())
      ON CONFLICT ("id") DO NOTHING;
    `);

    await prisma.$executeRawUnsafe(`
      INSERT INTO "Facility" ("id", "name", "icon", "description", "capacity", "floor", "isActive", "order", "createdAt", "updatedAt")
      VALUES ('fac_004', '멀티미디어실', '🎬', '영상 제작 및 편집', 15, '4층', true, 4, NOW(), NOW())
      ON CONFLICT ("id") DO NOTHING;
    `);

    console.log('✅ 샘플 데이터 추가 완료!');
    console.log('');
    console.log('🎉 모든 작업 완료!');

  } catch (error) {
    console.error('❌ 에러:', error);
    throw error;
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());