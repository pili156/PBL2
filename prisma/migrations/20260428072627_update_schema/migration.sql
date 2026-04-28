/*
  Warnings:

  - You are about to drop the column `kategori_studi` on the `master_dokumen` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `monitoring_khs` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `monitoring_khs` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `pengajuan_reimbursement` table. All the data in the column will be lost.
  - You are about to drop the column `tanggal_pengajuan` on the `pengajuan_reimbursement` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `pengajuan_reimbursement` table. All the data in the column will be lost.
  - You are about to drop the column `jalur` on the `pengajuan_studi` table. All the data in the column will be lost.
  - You are about to drop the column `jenis_studi` on the `pengajuan_studi` table. All the data in the column will be lost.
  - You are about to drop the column `status_pengajuan` on the `pengajuan_studi` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `sk_kementerian` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `sk_kementerian` table. All the data in the column will be lost.
  - You are about to drop the column `jabatan` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `nama_lengkap` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `nip` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `pangkat_golongan` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `unit_kerja` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "master_dokumen" DROP COLUMN "kategori_studi",
ADD COLUMN     "syarat_wilayah" TEXT;

-- AlterTable
ALTER TABLE "monitoring_khs" DROP COLUMN "created_at",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "pengajuan_reimbursement" DROP COLUMN "created_at",
DROP COLUMN "tanggal_pengajuan",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "pengajuan_studi" DROP COLUMN "jalur",
DROP COLUMN "jenis_studi",
DROP COLUMN "status_pengajuan",
ADD COLUMN     "jalur_pendanaan_id" INTEGER,
ADD COLUMN     "jenis_studi_id" INTEGER,
ADD COLUMN     "status_id" INTEGER,
ADD COLUMN     "wilayah_studi" TEXT;

-- AlterTable
ALTER TABLE "sk_kementerian" DROP COLUMN "created_at",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "jabatan",
DROP COLUMN "nama_lengkap",
DROP COLUMN "nip",
DROP COLUMN "pangkat_golongan",
DROP COLUMN "role",
DROP COLUMN "unit_kerja",
ADD COLUMN     "role_id" INTEGER,
ADD COLUMN     "status_akun" TEXT,
ADD COLUMN     "username" TEXT;

-- CreateTable
CREATE TABLE "master_role" (
    "id" SERIAL NOT NULL,
    "nama_role" TEXT,

    CONSTRAINT "master_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_dosen" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "nip" TEXT,
    "nama_lengkap" TEXT,
    "pangkat_golongan" TEXT,
    "jabatan" TEXT,
    "unit_kerja" TEXT,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "master_dosen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_jenis_studi" (
    "id" SERIAL NOT NULL,
    "nama_jenis" TEXT,

    CONSTRAINT "master_jenis_studi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_jalur_pendanaan" (
    "id" SERIAL NOT NULL,
    "nama_pendanaan" TEXT,

    CONSTRAINT "master_jalur_pendanaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_status_pengajuan" (
    "id" SERIAL NOT NULL,
    "nama_status" TEXT,

    CONSTRAINT "master_status_pengajuan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "master_dosen_user_id_key" ON "master_dosen"("user_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "master_role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_dosen" ADD CONSTRAINT "master_dosen_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_studi" ADD CONSTRAINT "pengajuan_studi_jenis_studi_id_fkey" FOREIGN KEY ("jenis_studi_id") REFERENCES "master_jenis_studi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_studi" ADD CONSTRAINT "pengajuan_studi_jalur_pendanaan_id_fkey" FOREIGN KEY ("jalur_pendanaan_id") REFERENCES "master_jalur_pendanaan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_studi" ADD CONSTRAINT "pengajuan_studi_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "master_status_pengajuan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
