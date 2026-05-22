/*
  Warnings:

  - The `wilayah_studi` column on the `pengajuan_studi` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "monitoring_khs" ADD COLUMN     "tahun_akademik" TEXT;

-- AlterTable
ALTER TABLE "pengajuan_reimbursement" ADD COLUMN     "jenis_pengajuan" TEXT DEFAULT 'reimbursement',
ADD COLUMN     "nama_bank" TEXT,
ADD COLUMN     "nomor_rekening" TEXT,
ADD COLUMN     "tahun_akademik" TEXT,
ADD COLUMN     "tahun_ke" INTEGER;

-- AlterTable
ALTER TABLE "pengajuan_studi" ADD COLUMN     "alamat_kampus" TEXT,
ADD COLUMN     "perguruan_tinggi" TEXT,
ALTER COLUMN "created_at" DROP DEFAULT,
DROP COLUMN "wilayah_studi",
ADD COLUMN     "wilayah_studi" INTEGER;

-- CreateTable
CREATE TABLE "master_wilayah" (
    "id" SERIAL NOT NULL,
    "nama_wilayah" TEXT,

    CONSTRAINT "master_wilayah_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pengajuan_studi" ADD CONSTRAINT "pengajuan_studi_wilayah_studi_fkey" FOREIGN KEY ("wilayah_studi") REFERENCES "master_wilayah"("id") ON DELETE SET NULL ON UPDATE CASCADE;
