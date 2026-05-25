/*
  Warnings:

  - You are about to drop the column `alamat_kampus` on the `pengajuan_studi` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "dokumen_pengajuan" ADD COLUMN     "pengajuan_reimbursement_id" INTEGER;

-- AlterTable
ALTER TABLE "pengajuan_studi" DROP COLUMN "alamat_kampus",
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "pengajuan_id" INTEGER,
    "aktivitas" TEXT,
    "tipe" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dokumen_pengajuan" ADD CONSTRAINT "dokumen_pengajuan_pengajuan_reimbursement_id_fkey" FOREIGN KEY ("pengajuan_reimbursement_id") REFERENCES "pengajuan_reimbursement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_pengajuan_id_fkey" FOREIGN KEY ("pengajuan_id") REFERENCES "pengajuan_studi"("id") ON DELETE SET NULL ON UPDATE CASCADE;
