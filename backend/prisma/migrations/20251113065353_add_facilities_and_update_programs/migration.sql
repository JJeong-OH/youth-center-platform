/*
  Warnings:

  - You are about to drop the column `purpose` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `ended_at` on the `chat_histories` table. All the data in the column will be lost.
  - You are about to drop the column `started_at` on the `chat_histories` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `chat_histories` table. All the data in the column will be lost.
  - You are about to drop the column `topic` on the `chat_histories` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `portfolio_items` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `portfolio_items` table. All the data in the column will be lost.
  - The primary key for the `profiles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dob` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `program_applications` table. All the data in the column will be lost.
  - You are about to drop the column `motivation` on the `program_applications` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `program_applications` table. All the data in the column will be lost.
  - You are about to drop the column `user_name` on the `program_applications` table. All the data in the column will be lost.
  - You are about to drop the column `created_by_id` on the `programs` table. All the data in the column will be lost.
  - The `tags` column on the `programs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `ai_analysis` on the `test_results` table. All the data in the column will be lost.
  - You are about to drop the column `kiosk_log_id` on the `test_results` table. All the data in the column will be lost.
  - You are about to drop the column `test_type` on the `test_results` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `kiosk_logs` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `messages` on table `chat_histories` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `title` to the `portfolio_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `portfolio_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `applicant_name` to the `program_applications` table without a default value. This is not possible if the table is not empty.
  - Made the column `user_id` on table `test_results` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."portfolio_items" DROP CONSTRAINT "portfolio_items_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."programs" DROP CONSTRAINT "programs_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."test_results" DROP CONSTRAINT "test_results_kiosk_log_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."test_results" DROP CONSTRAINT "test_results_user_id_fkey";

-- DropIndex
DROP INDEX "public"."bookings_facility_id_date_time_slot_key";

-- DropIndex
DROP INDEX "public"."program_applications_program_id_user_id_idx";

-- DropIndex
DROP INDEX "public"."program_applications_program_id_user_name_idx";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "purpose",
ALTER COLUMN "date" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "chat_histories" DROP COLUMN "ended_at",
DROP COLUMN "started_at",
DROP COLUMN "summary",
DROP COLUMN "topic",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "messages" SET NOT NULL;

-- AlterTable
ALTER TABLE "facilities" ADD COLUMN     "icon" TEXT NOT NULL DEFAULT '🏢',
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "capacity" DROP NOT NULL;

-- AlterTable
ALTER TABLE "portfolio_items" DROP COLUMN "category",
DROP COLUMN "content",
ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_pkey",
DROP COLUMN "dob",
DROP COLUMN "gender",
DROP COLUMN "phoneNumber",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "grade" TEXT,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "interests" JSONB,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "program_applications" DROP COLUMN "created_at",
DROP COLUMN "motivation",
DROP COLUMN "source",
DROP COLUMN "user_name",
ADD COLUMN     "applicant_name" TEXT NOT NULL,
ADD COLUMN     "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "programs" DROP COLUMN "created_by_id",
ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "created_by" INTEGER,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "fee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "recruit_status" TEXT NOT NULL DEFAULT '모집중',
ADD COLUMN     "start_date" TIMESTAMP(3),
ADD COLUMN     "target_audience" TEXT,
DROP COLUMN "tags",
ADD COLUMN     "tags" JSONB;

-- AlterTable
ALTER TABLE "test_results" DROP COLUMN "ai_analysis",
DROP COLUMN "kiosk_log_id",
DROP COLUMN "test_type",
ADD COLUMN     "scores" JSONB,
ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "updated_at",
ALTER COLUMN "role" SET DEFAULT 'USER';

-- DropTable
DROP TABLE "public"."kiosk_logs";

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
