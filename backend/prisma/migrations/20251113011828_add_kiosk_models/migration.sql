-- DropIndex
DROP INDEX "public"."program_applications_program_id_user_name_key";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "user_id" INTEGER;

-- AlterTable
ALTER TABLE "program_applications" ADD COLUMN     "user_id" INTEGER;

-- CreateIndex
CREATE INDEX "program_applications_program_id_user_id_idx" ON "program_applications"("program_id", "user_id");

-- CreateIndex
CREATE INDEX "program_applications_program_id_user_name_idx" ON "program_applications"("program_id", "user_name");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_applications" ADD CONSTRAINT "program_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
