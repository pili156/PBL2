-- CreateTable
CREATE TABLE "master_jabatan" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "singkatan" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_jabatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_pangkat" (
    "id" SERIAL NOT NULL,
    "pangkat" TEXT NOT NULL,
    "golongan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_pangkat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_jurusan" (
    "id" SERIAL NOT NULL,
    "nama_jurusan" TEXT NOT NULL,

    CONSTRAINT "master_jurusan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_program_studi" (
    "id" SERIAL NOT NULL,
    "jurusan_id" INTEGER NOT NULL,
    "nama_prodi" TEXT NOT NULL,

    CONSTRAINT "master_program_studi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "master_jabatan_nama_key" ON "master_jabatan"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "master_jabatan_singkatan_key" ON "master_jabatan"("singkatan");

-- CreateIndex
CREATE UNIQUE INDEX "master_pangkat_golongan_key" ON "master_pangkat"("golongan");

-- CreateIndex
CREATE UNIQUE INDEX "master_jurusan_nama_jurusan_key" ON "master_jurusan"("nama_jurusan");

-- AddForeignKey
ALTER TABLE "master_program_studi" ADD CONSTRAINT "master_program_studi_jurusan_id_fkey" FOREIGN KEY ("jurusan_id") REFERENCES "master_jurusan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
