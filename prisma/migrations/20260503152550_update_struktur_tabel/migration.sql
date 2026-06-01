/*
  Warnings:

  - You are about to alter the column `nominal` on the `pengajuan_reimbursement` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - A unique constraint covering the columns `[nip]` on the table `master_dosen` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "dokumen_pengajuan" ALTER COLUMN "status_verifikasi" SET DEFAULT 'Pending',
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "master_dokumen" ALTER COLUMN "is_mandatory" SET DEFAULT true,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "master_dosen" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "monitoring_khs" ADD COLUMN     "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ipk" DECIMAL(3,2),
ADD COLUMN     "status_evaluasi" TEXT DEFAULT 'Pending',
ADD COLUMN     "tanggal_evaluasi" TIMESTAMPTZ,
ADD COLUMN     "updated_at" TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "pengajuan_reimbursement" ADD COLUMN     "catatan_keuangan" TEXT,
ADD COLUMN     "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tanggal_pencairan" TIMESTAMPTZ,
ADD COLUMN     "updated_at" TIMESTAMPTZ,
ALTER COLUMN "nominal" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "status_pencairan" SET DEFAULT 'Pending';

-- AlterTable
ALTER TABLE "pengajuan_studi" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "pesan_komunikasi" ALTER COLUMN "waktu_kirim" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "status_akun" SET DEFAULT 'Pending';

-- CreateIndex
CREATE UNIQUE INDEX "master_dosen_nip_key" ON "master_dosen"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
