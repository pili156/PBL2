-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nip" TEXT,
    "email" TEXT,
    "password_hash" TEXT,
    "nama_lengkap" TEXT,
    "pangkat_golongan" TEXT,
    "jabatan" TEXT,
    "unit_kerja" TEXT,
    "role" TEXT,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_dokumen" (
    "id" SERIAL NOT NULL,
    "nama_dokumen" TEXT,
    "is_mandatory" BOOLEAN,
    "kategori_studi" TEXT,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "master_dokumen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengajuan_studi" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "jenis_studi" TEXT,
    "jalur" TEXT,
    "status_pengajuan" TEXT,
    "tanggal_pengajuan" DATE,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "pengajuan_studi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dokumen_pengajuan" (
    "id" SERIAL NOT NULL,
    "pengajuan_id" INTEGER,
    "master_dokumen_id" INTEGER,
    "file_path" TEXT,
    "status_verifikasi" TEXT,
    "catatan_revisi" TEXT,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "dokumen_pengajuan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sk_kementerian" (
    "id" SERIAL NOT NULL,
    "pengajuan_id" INTEGER,
    "nomor_sk" TEXT,
    "file_sk_path" TEXT,
    "tanggal_terbit" DATE,
    "status_studi" TEXT,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "sk_kementerian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitoring_khs" (
    "id" SERIAL NOT NULL,
    "pengajuan_id" INTEGER,
    "semester_ke" INTEGER,
    "file_khs_path" TEXT,
    "catatan_evaluasi" TEXT,
    "tanggal_unggah" DATE,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "monitoring_khs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengajuan_reimbursement" (
    "id" SERIAL NOT NULL,
    "pengajuan_id" INTEGER,
    "semester_ke" INTEGER,
    "file_bukti_bayar" TEXT,
    "nominal" DECIMAL(65,30),
    "status_pencairan" TEXT,
    "tanggal_pengajuan" DATE,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "pengajuan_reimbursement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesan_komunikasi" (
    "id" SERIAL NOT NULL,
    "pengajuan_id" INTEGER,
    "pengirim_id" INTEGER,
    "isi_pesan" TEXT,
    "waktu_kirim" TIMESTAMPTZ,

    CONSTRAINT "pesan_komunikasi_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pengajuan_studi" ADD CONSTRAINT "pengajuan_studi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumen_pengajuan" ADD CONSTRAINT "dokumen_pengajuan_pengajuan_id_fkey" FOREIGN KEY ("pengajuan_id") REFERENCES "pengajuan_studi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumen_pengajuan" ADD CONSTRAINT "dokumen_pengajuan_master_dokumen_id_fkey" FOREIGN KEY ("master_dokumen_id") REFERENCES "master_dokumen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sk_kementerian" ADD CONSTRAINT "sk_kementerian_pengajuan_id_fkey" FOREIGN KEY ("pengajuan_id") REFERENCES "pengajuan_studi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_khs" ADD CONSTRAINT "monitoring_khs_pengajuan_id_fkey" FOREIGN KEY ("pengajuan_id") REFERENCES "pengajuan_studi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_reimbursement" ADD CONSTRAINT "pengajuan_reimbursement_pengajuan_id_fkey" FOREIGN KEY ("pengajuan_id") REFERENCES "pengajuan_studi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesan_komunikasi" ADD CONSTRAINT "pesan_komunikasi_pengajuan_id_fkey" FOREIGN KEY ("pengajuan_id") REFERENCES "pengajuan_studi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesan_komunikasi" ADD CONSTRAINT "pesan_komunikasi_pengirim_id_fkey" FOREIGN KEY ("pengirim_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
