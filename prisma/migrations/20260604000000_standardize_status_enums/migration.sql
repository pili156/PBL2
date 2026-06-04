-- Standardize all status fields to snake_case enums
-- Step 1: Normalize existing data to lowercase/snake_case

-- status_akun: normalize to lowercase
UPDATE "users" SET "status_akun" = lower("status_akun");

-- status_verifikasi: normalize and map 'menunggu' -> 'pending'
UPDATE "dokumen_pengajuan" SET "status_verifikasi" = lower("status_verifikasi");
UPDATE "dokumen_pengajuan" SET "status_verifikasi" = 'pending' WHERE "status_verifikasi" = 'menunggu';

-- status_evaluasi: normalize to lowercase
UPDATE "monitoring_khs" SET "status_evaluasi" = lower("status_evaluasi");

-- status_pencairan: normalize to lowercase
UPDATE "pengajuan_reimbursement" SET "status_pencairan" = lower("status_pencairan");

-- status_studi: normalize (Belum ada SK -> belum_ada_sk, Aktif -> aktif)
UPDATE "sk_kementerian" SET "status_studi" = lower("status_studi");
UPDATE "sk_kementerian" SET "status_studi" = 'belum_ada_sk' WHERE "status_studi" = 'belum ada sk';

-- MasterStatusPengajuan: normalize nama_status to snake_case
UPDATE "master_status_pengajuan" SET "nama_status" = lower("nama_status");
UPDATE "master_status_pengajuan" SET "nama_status" = 'menunggu_verifikasi' WHERE "nama_status" = 'menunggu verifikasi (admin)';
UPDATE "master_status_pengajuan" SET "nama_status" = 'perlu_revisi' WHERE "nama_status" = 'perlu revisi (dosen)';
UPDATE "master_status_pengajuan" SET "nama_status" = 'studi_selesai' WHERE "nama_status" = 'studi selesai (lulus)';

-- Step 2: Drop old default values before changing types
ALTER TABLE "users" ALTER COLUMN "status_akun" DROP DEFAULT;
ALTER TABLE "dokumen_pengajuan" ALTER COLUMN "status_verifikasi" DROP DEFAULT;
ALTER TABLE "monitoring_khs" ALTER COLUMN "status_evaluasi" DROP DEFAULT;
ALTER TABLE "pengajuan_reimbursement" ALTER COLUMN "status_pencairan" DROP DEFAULT;

-- Step 3: Create enum types
CREATE TYPE "status_akun" AS ENUM ('aktif', 'menunggu', 'pending');
CREATE TYPE "status_verifikasi_dokumen" AS ENUM ('pending', 'terverifikasi', 'revisi');
CREATE TYPE "status_evaluasi_khs" AS ENUM ('pending', 'valid', 'revisi', 'diterima', 'ditolak');
CREATE TYPE "status_pencairan" AS ENUM ('pending', 'disetujui', 'dicairkan', 'selesai', 'ditolak', 'revisi', 'draft', 'dibatalkan');
CREATE TYPE "status_studi_sk" AS ENUM ('aktif', 'belum_ada_sk');

-- Step 4: Alter column types using lowercase conversion
ALTER TABLE "users" ALTER COLUMN "status_akun" TYPE "status_akun" USING ("status_akun"::text::"status_akun");
ALTER TABLE "dokumen_pengajuan" ALTER COLUMN "status_verifikasi" TYPE "status_verifikasi_dokumen" USING ("status_verifikasi"::text::"status_verifikasi_dokumen");
ALTER TABLE "monitoring_khs" ALTER COLUMN "status_evaluasi" TYPE "status_evaluasi_khs" USING ("status_evaluasi"::text::"status_evaluasi_khs");
ALTER TABLE "pengajuan_reimbursement" ALTER COLUMN "status_pencairan" TYPE "status_pencairan" USING ("status_pencairan"::text::"status_pencairan");
ALTER TABLE "sk_kementerian" ALTER COLUMN "status_studi" TYPE "status_studi_sk" USING ("status_studi"::text::"status_studi_sk");

-- Step 5: Set new default values
ALTER TABLE "users" ALTER COLUMN "status_akun" SET DEFAULT 'pending'::"status_akun";
ALTER TABLE "dokumen_pengajuan" ALTER COLUMN "status_verifikasi" SET DEFAULT 'pending'::"status_verifikasi_dokumen";
ALTER TABLE "monitoring_khs" ALTER COLUMN "status_evaluasi" SET DEFAULT 'pending'::"status_evaluasi_khs";
ALTER TABLE "pengajuan_reimbursement" ALTER COLUMN "status_pencairan" SET DEFAULT 'pending'::"status_pencairan";
ALTER TABLE "sk_kementerian" ALTER COLUMN "status_studi" SET DEFAULT 'belum_ada_sk'::"status_studi_sk";

-- Step 6: Add missing MasterStatusPengajuan entries
INSERT INTO "master_status_pengajuan" (id, nama_status) VALUES (4, 'pending') ON CONFLICT (id) DO NOTHING;
INSERT INTO "master_status_pengajuan" (id, nama_status) VALUES (5, 'diterima') ON CONFLICT (id) DO NOTHING;
INSERT INTO "master_status_pengajuan" (id, nama_status) VALUES (7, 'terverifikasi') ON CONFLICT (id) DO NOTHING;
INSERT INTO "master_status_pengajuan" (id, nama_status) VALUES (8, 'revisi') ON CONFLICT (id) DO NOTHING;
