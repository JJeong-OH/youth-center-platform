/*
  Warnings:

  - You are about to drop the `facilities` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."bookings" DROP CONSTRAINT "bookings_facility_id_fkey";

-- DropTable
DROP TABLE "public"."facilities";

-- CreateTable
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
