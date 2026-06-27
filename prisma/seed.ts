// D:\polines\semester 4\PBL 2\PBL2\prisma\seed.ts
import { prisma } from '../src/lib/prisma'; // Sesuaikan path ini dengan project kamu
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// --- DATA JURUSAN DAN PROGRAM STUDI ---
const dataPolines = {
  "Teknik Sipil": [
    "D3 - Konstruksi Gedung",
    "D3 - Konstruksi Sipil",
    "D4 - Teknik Perawatan dan Perbaikan Gedung",
    "D4 - Perancangan Jalan dan Jembatan",
  ],
  "Teknik Mesin": [
    "D3 - Teknik Mesin",
    "D3 - Teknik Konversi Energi",
    "D4 - Teknik Mesin Produksi dan Perawatan",
    "D4 - Teknologi Rekayasa Pembangkit Energi",
  ],
  "Teknik Elektro": [
    "D3 - Teknik Listrik",
    "D3 - Teknik Elektronika",
    "D3 - Teknik Telekomunikasi",
    "D3 - Teknik Informatika",
    "D4 - Teknik Telekomunikasi",
    "D4 - Teknologi Rekayasa Instalasi Listrik",
    "D4 - Teknologi Rekayasa Komputer",
    "D4 - Teknologi Rekayasa Elektronika",
    "S2 Terapan - Teknik Telekomunikasi",
  ],
  "Akuntansi": [
    "D3 - Akuntansi",
    "D3 - Keuangan dan Perbankan",
    "D4 - Komputerisasi Akuntansi",
    "D4 - Perbankan Syariah",
    "D4 - Analis Keuangan",
    "D4 - Akuntansi Manajerial",
  ],
  "Administrasi Bisnis": [
    "D3 - Administrasi Bisnis",
    "D3 - Manajemen Pemasaran",
    "D4 - Manajemen Bisnis Internasional",
    "D4 - Administrasi Bisnis Terapan",
  ],
};

async function main() {
  console.log('Memulai proses seeding (SIGAP Polines PBL2)...');

  // --- 1. HASH PASSWORD DEFAULT (rahasia123) ---
  const hashedPassword = await bcrypt.hash('rahasia123', 10);

  // --- 1b. Bersihkan data lama (urutan berdasarkan dependensi) ---
  console.log('Membersihkan data lama...');
  const cleanUp = async (fn: () => Promise<any>) => { try { await fn(); } catch {} };
  await cleanUp(() => prisma.masterKabupatenKota.deleteMany());
  await cleanUp(() => prisma.masterProvinsi.deleteMany());
  await cleanUp(() => prisma.masterBeasiswa.deleteMany()); // TAMBAHAN CLEANUP BEASISWA
  await cleanUp(() => prisma.activityLog.deleteMany());
  await cleanUp(() => prisma.pesanKomunikasi.deleteMany());
  await cleanUp(() => prisma.pengajuanReimbursement.deleteMany());
  await cleanUp(() => prisma.monitoringKhs.deleteMany());
  await cleanUp(() => prisma.skKementerian.deleteMany());
  await cleanUp(() => prisma.dokumenPengajuan.deleteMany());
  await cleanUp(() => prisma.pengajuanStudi.deleteMany());
  await cleanUp(() => prisma.masterDokumen.deleteMany());
  await cleanUp(() => prisma.masterDosen.deleteMany());
  await cleanUp(() => prisma.user.deleteMany());
  await cleanUp(() => prisma.masterProgramStudi.deleteMany());
  await cleanUp(() => prisma.masterJurusan.deleteMany());
  await cleanUp(() => prisma.masterBank.deleteMany());
  await cleanUp(() => prisma.masterWilayah.deleteMany());
  await cleanUp(() => prisma.masterStatusPengajuan.deleteMany());
  await cleanUp(() => prisma.masterJalurPendanaan.deleteMany());
  await cleanUp(() => prisma.masterJenisStudi.deleteMany());
  await cleanUp(() => prisma.masterRole.deleteMany());
  await cleanUp(() => prisma.masterPerguruanTinggi.deleteMany()); // TAMBAHAN CLEANUP
  // ===============================================================
  // === 2. MASTER DATA (Deterministic IDs) ===
  // ===============================================================

  // --- 2.1 Master Role ---
  const roleMaster = await prisma.masterRole.create({ data: { id: 1, nama_role: 'master_admin' } });
  const roleAdmin = await prisma.masterRole.create({ data: { id: 2, nama_role: 'admin' } });
  const roleDosen = await prisma.masterRole.create({ data: { id: 3, nama_role: 'dosen' } });

  // --- 2.2 Master Jenis Studi ---
  const jenisTugasBelajar = await prisma.masterJenisStudi.create({ data: { id: 1, nama_jenis: 'Tugas Belajar (Dibebas Tugaskan)' } });
  await prisma.masterJenisStudi.create({ data: { id: 2, nama_jenis: 'Tugas Belajar (Tetap Menjalankan Kewajiban)' } });

  // --- 2.3 Master Jalur Pendanaan ---
  const jalurMandiri = await prisma.masterJalurPendanaan.create({ data: { id: 1, nama_pendanaan: 'Mandiri' } });
  const jalurLPDP = await prisma.masterJalurPendanaan.create({ data: { id: 2, nama_pendanaan: 'Beasiswa LPDP' } });

  // --- 2.4 Master Status Pengajuan Studi (snake_case, konsisten) ---
  await prisma.masterStatusPengajuan.create({ data: { id: 1, nama_status: 'draft' } });
  const statusMenunggu = await prisma.masterStatusPengajuan.create({ data: { id: 2, nama_status: 'menunggu_verifikasi' } });
  const statusRevisi = await prisma.masterStatusPengajuan.create({ data: { id: 3, nama_status: 'perlu_revisi' } });
  await prisma.masterStatusPengajuan.create({ data: { id: 4, nama_status: 'pending' } });
  await prisma.masterStatusPengajuan.create({ data: { id: 5, nama_status: 'diterima' } });
  const statusLulus = await prisma.masterStatusPengajuan.create({ data: { id: 6, nama_status: 'lulus' } });
  await prisma.masterStatusPengajuan.create({ data: { id: 7, nama_status: 'terverifikasi' } });
  await prisma.masterStatusPengajuan.create({ data: { id: 8, nama_status: 'revisi' } });
  await prisma.masterStatusPengajuan.create({ data: { id: 9, nama_status: 'ditolak' } });

  // --- 2.5 Master Dokumen (Utuk Syarat Awal & Upload Pengajuan) ---
  await prisma.masterDokumen.create({ data: { id: 1, nama_dokumen: 'Kartu Virtual ASN', is_mandatory: true, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 2, nama_dokumen: 'SK CPNS', is_mandatory: false, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 3, nama_dokumen: 'SK PNS', is_mandatory: false, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 4, nama_dokumen: 'SK Pangkat Terakhir', is_mandatory: true, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 5, nama_dokumen: 'SK Jabatan Terakhir', is_mandatory: true, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 6, nama_dokumen: 'Penilaian Prestasi Kerja', is_mandatory: true, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 7, nama_dokumen: 'Akta Nikah', is_mandatory: false, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 8, nama_dokumen: 'KP-4', is_mandatory: false, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 9, nama_dokumen: 'SK Kesehatan Jasmani', is_mandatory: true, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 10, nama_dokumen: 'Surat Rekomendasi Atasan', is_mandatory: true, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 11, nama_dokumen: 'Surat Keterangan Pimpinan', is_mandatory: true, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 12, nama_dokumen: 'Perjanjian Tugas Belajar', is_mandatory: true, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 13, nama_dokumen: 'Jaminan Pembiayaan', is_mandatory: false, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 14, nama_dokumen: 'Surat LoA', is_mandatory: true, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 15, nama_dokumen: 'Surat Pernyataan Pimpinan Unit', is_mandatory: true, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 16, nama_dokumen: 'Surat Pernyataan Pegawai', is_mandatory: true, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 17, nama_dokumen: 'Ijazah Pendidikan Terakhir', is_mandatory: true, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 18, nama_dokumen: 'Surat Akreditasi Prodi & Kampus', is_mandatory: true, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 19, nama_dokumen: 'Surat Persetujuan Seteng', is_mandatory: false, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 20, nama_dokumen: 'SK Kesehatan Rohani', is_mandatory: true, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 21, nama_dokumen: 'Formulir Bantuan Studi', is_mandatory: true, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 22, nama_dokumen: 'Bukti Pembayaran SPP', is_mandatory: true, syarat_wilayah: 'Semua' } });
  const wilayahDalamNegeri = await prisma.masterWilayah.create({ data: { id: 1, nama_wilayah: 'Dalam Negeri' } });
  const wilayahLuarNegeri = await prisma.masterWilayah.create({ data: { id: 2, nama_wilayah: 'Luar Negeri' } });

  // --- 2.5 Master Jabatan & Master Pangkat ---
  await prisma.masterJabatan.upsert({
    where: { singkatan: 'AA' },
    update: { nama: 'Asisten Ahli', urutan: 1 },
    create: { nama: 'Asisten Ahli', singkatan: 'AA', urutan: 1 },
  });
  await prisma.masterJabatan.upsert({
    where: { singkatan: 'L2' },
    update: { nama: 'Lektor', urutan: 2 },
    create: { nama: 'Lektor', singkatan: 'L2', urutan: 2 },
  });
  await prisma.masterJabatan.upsert({
    where: { singkatan: 'LK' },
    update: { nama: 'Lektor Kepala', urutan: 3 },
    create: { nama: 'Lektor Kepala', singkatan: 'LK', urutan: 3 },
  });
  await prisma.masterJabatan.upsert({
    where: { singkatan: 'GB' },
    update: { nama: 'Profesor', urutan: 4 },
    create: { nama: 'Profesor', singkatan: 'GB', urutan: 4 },
  });

  await prisma.masterPangkat.upsert({
    where: { golongan: 'III/a' },
    update: { pangkat: 'Penata Muda' },
    create: { pangkat: 'Penata Muda', golongan: 'III/a' },
  });
  await prisma.masterPangkat.upsert({
    where: { golongan: 'III/b' },
    update: { pangkat: 'Penata Muda Tingkat I' },
    create: { pangkat: 'Penata Muda Tingkat I', golongan: 'III/b' },
  });
  await prisma.masterPangkat.upsert({
    where: { golongan: 'III/c' },
    update: { pangkat: 'Penata' },
    create: { pangkat: 'Penata', golongan: 'III/c' },
  });
  await prisma.masterPangkat.upsert({
    where: { golongan: 'III/d' },
    update: { pangkat: 'Penata Tingkat I' },
    create: { pangkat: 'Penata Tingkat I', golongan: 'III/d' },
  });
  await prisma.masterPangkat.upsert({
    where: { golongan: 'IV/a' },
    update: { pangkat: 'Pembina' },
    create: { pangkat: 'Pembina', golongan: 'IV/a' },
  });
  await prisma.masterPangkat.upsert({
    where: { golongan: 'IV/b' },
    update: { pangkat: 'Pembina Tingkat I' },
    create: { pangkat: 'Pembina Tingkat I', golongan: 'IV/b' },
  });
  await prisma.masterPangkat.upsert({
    where: { golongan: 'IV/c' },
    update: { pangkat: 'Pembina Utama Muda' },
    create: { pangkat: 'Pembina Utama Muda', golongan: 'IV/c' },
  });
  await prisma.masterPangkat.upsert({
    where: { golongan: 'IV/d' },
    update: { pangkat: 'Pembina Utama Madya' },
    create: { pangkat: 'Pembina Utama Madya', golongan: 'IV/d' },
  });
  await prisma.masterPangkat.upsert({
    where: { golongan: 'IV/e' },
    update: { pangkat: 'Pembina Utama' },
    create: { pangkat: 'Pembina Utama', golongan: 'IV/e' },
  });

  // --- 2.6 Master Jurusan & Program Studi ---
  console.log('Seeding Jurusan dan Program Studi...');
  for (const [jurusanName, prodiList] of Object.entries(dataPolines)) {
    await prisma.masterJurusan.create({
      data: {
        nama_jurusan: jurusanName,
        program_studi: {
          create: prodiList.map((prodi) => ({
            nama_prodi: prodi,
          })),
        },
      },
    });
  }

  // --- 2.7 Master Bank (DIPERBAIKI) ---
  console.log('Seeding Master Bank...');
  const bankNames = ['BNI', 'BRI', 'BSI', 'BCA', 'Mandiri'];
  for (const nama of bankNames) {
    const existingBank = await prisma.masterBank.findFirst({
      where: { nama_bank: nama },
    });
    if (!existingBank) {
      await prisma.masterBank.create({
        data: { nama_bank: nama },
      });
    }
  }

  console.log('Data Master (Role, Jenis Studi, Pendanaan, Status, Dokumen, Wilayah, Jurusan, Bank) telah siap.');

  // --- 2.8 Master Perguruan Tinggi Dalam Negeri ---
  console.log('Seeding Master Perguruan Tinggi...');
  const daftarPTN = [
    "Universitas Gadjah Mada (UGM)",
    "Universitas Indonesia (UI)",
    "Institut Teknologi Bandung (ITB)",
    "Universitas Diponegoro (UNDIP)",
    "Universitas Negeri Semarang (UNNES)",
    "Universitas Sebelas Maret (UNS)",
    "Institut Teknologi Sepuluh Nopember (ITS)",
    "Universitas Brawijaya (UB)",
    "Universitas Airlangga (UNAIR)",
    "Universitas Hasanuddin (UNHAS)"
  ];
  
  for (const nama of daftarPTN) {
    const existingPT = await prisma.masterPerguruanTinggi.findFirst({ where: { nama_pt: nama } });
    if (!existingPT) {
      await prisma.masterPerguruanTinggi.create({ data: { nama_pt: nama } });
    }
  }

  // --- 2.9 Master Beasiswa ---
  console.log('Seeding Master Beasiswa...');
  const daftarBeasiswa = [
    "LPDP",
    "BPI (Beasiswa Pendidikan Indonesia)",
    "Beasiswa Unggulan Kemendikbud",
    "AAS (Australia Awards Scholarships)"
  ];
  
  for (const nama of daftarBeasiswa) {
    const existingBeasiswa = await prisma.masterBeasiswa.findFirst({ where: { nama_beasiswa: nama } });
    if (!existingBeasiswa) {
      await prisma.masterBeasiswa.create({ data: { nama_beasiswa: nama } });
    }
  }

  // --- 2.10 Master Provinsi & Kabupaten/Kota dari CSV ---
  console.log('Seeding Master Provinsi dan Kabupaten/Kota dari CSV...');
  const csvPath = path.resolve(process.cwd(), 'Data-daftar_provinsi_kabupaten_dan_kota_pilkada_serentak_2024-2026-06-25-1782352821535.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const csvLines = csvContent.split('\n').filter((line) => line.trim() !== '');

  // Parse CSV: skip header
  const rows: { id: number; nama: string; kode_wilayah: string }[] = [];
  for (let i = 1; i < csvLines.length; i++) {
    const parts = csvLines[i].split(',');
    if (parts.length >= 3) {
      const nama = parts[1].trim();
      const kode_wilayah = parts[2].trim();
      rows.push({ id: Number(parts[0].trim()), nama, kode_wilayah });
    }
  }

  // Pisahkan provinsi dan kabupaten/kota
  // Provinsi: kode_wilayah tidak memiliki titik (integer)
  // Kabupaten/Kota: kode_wilayah memiliki titik (desimal)
  const provinsiRows = rows.filter((r) => !r.kode_wilayah.includes('.'));
  const kabKotaRows = rows.filter((r) => r.kode_wilayah.includes('.'));

  // Insert provinsi dan buat mapping kode_wilayah -> id
  const provinsiMap = new Map<string, number>();
  for (const row of provinsiRows) {
    const created = await prisma.masterProvinsi.create({
      data: {
        nama: row.nama,
        kode_wilayah: row.kode_wilayah,
      },
    });
    provinsiMap.set(row.kode_wilayah, created.id);
  }
  console.log(`  ${provinsiRows.length} provinsi berhasil di-seed.`);

  // Insert kabupaten/kota
  let kabCount = 0;
  let kotaCount = 0;
  for (const row of kabKotaRows) {
    // Ambil kode provinsi induk (bagian sebelum titik)
    const kodeProvinsiInduk = row.kode_wilayah.split('.')[0];
    const provinsiId = provinsiMap.get(kodeProvinsiInduk);

    if (!provinsiId) {
      console.log(`  Peringatan: Provinsi induk dengan kode ${kodeProvinsiInduk} tidak ditemukan untuk ${row.nama}`);
      continue;
    }

    // Tentukan tipe berdasarkan nama
    const tipe = row.nama.startsWith('KOTA') ? 'kota' : 'kabupaten';

    await prisma.masterKabupatenKota.create({
      data: {
        nama: row.nama,
        kode_wilayah: row.kode_wilayah,
        tipe,
        provinsi_id: provinsiId,
      },
    });

    if (tipe === 'kota') kotaCount++;
    else kabCount++;
  }
  console.log(`  ${kabCount} kabupaten dan ${kotaCount} kota berhasil di-seed.`);

  // ===============================================================
  // === 3. SEED USERS & DOSEN PROFILE (Budi Doremi) ===
  // ===============================================================

  // --- 3.1 Buat Akun Master Admin ---
  const userMasterAdmin = await prisma.user.create({
    data: {
      id: 1,
      username: 'Master Admin',
      email: 'master_admin@polines.ac.id',
      password_hash: hashedPassword,
      role_id: roleMaster.id,
      status_akun: 'aktif',
    },
  });

  // --- 3.2 Buat Akun Admin ---
  const userAdmin = await prisma.user.create({
    data: {
      id: 2,
      username: 'Mbak Ayu (Admin)',
      email: 'admin@polines.ac.id',
      password_hash: hashedPassword,
      role_id: roleAdmin.id,
      status_akun: 'aktif',
    },
  });

  // --- 3.3 Buat Akun Dosen PBL (Budi Doremi) ---
  const userDosenBudi = await prisma.user.create({
    data: {
      id: 3,
      username: 'Budi Doremi',
      email: 'dosen@polines.ac.id',
      password_hash: hashedPassword,
      role_id: roleDosen.id,
      status_akun: 'aktif',
    },
  });

  // --- 3.5 Buat Profil Dosen Lengkap Budi (Tabel MasterDosen) ---
  await prisma.masterDosen.create({
    data: {
      user: { connect: { id: userDosenBudi.id } }, // Diperbaiki: Menggunakan connect
      nip: '198273645',
      nama_lengkap: 'Budi Doremi, S.Kom., M.T.',
      pangkat_golongan: 'Penata Muda Tk I (III/b)',
      jabatan: 'Asisten Ahli', // Diperbaiki: Typo dari 'jabatu' menjadi 'jabatan'
      jurusan: 'Teknik Elektro',
      program_studi: 'Teknik Informatika',
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  console.log('Users dan Profil Dosen (Budi Doremi) telah siap.');

  // ===============================================================
  // === 4. TRANSAKSI (Skenario Histori Studi Budi) ===
  // ===============================================================

  // --- 4.1 Buat Skenario Pengajuan Studi Aktif (Budi) ---
  const pengajuanStudiBudi = await prisma.pengajuanStudi.create({
    data: {
      id: 1,
      user_id: userDosenBudi.id,
      jenis_studi_id: jenisTugasBelajar.id,
      jalur_pendanaan_id: jalurLPDP.id,
      wilayah_studi: wilayahDalamNegeri.id,
      status_id: statusMenunggu.id,
      tanggal_pengajuan: new Date('2023-08-10'),
      created_at: new Date('2023-08-10'),
      updated_at: new Date(),
    },
  });

  console.log('Data Pengajuan Studi (Skenario Budi) telah siap.');

  // --- 4.2 Buat Histori Monitoring KHS per Semester ---
  // ID 1: Semester 1 (Valid)
  await prisma.monitoringKhs.create({
    data: {
      id: 1,
      pengajuan_id: pengajuanStudiBudi.id,
      semester_ke: 1,
      file_khs_path: 'uploads/khs/khs_budi_s1_12345.pdf',
      ipk: 3.85,
      status_evaluasi: 'valid',
      catatan_evaluasi: 'Awal yang sangat bagus, pertahankan performa studi.',
      tanggal_evaluasi: new Date('2024-01-10T15:45:00+07:00'),
      tanggal_unggah: new Date('2024-01-05'),
      created_at: new Date('2024-01-05'),
      updated_at: new Date('2024-01-10T15:45:00+07:00'),
    },
  });

  // ID 2: Semester 2 (Valid)
  await prisma.monitoringKhs.create({
    data: {
      id: 2,
      pengajuan_id: pengajuanStudiBudi.id,
      semester_ke: 2,
      file_khs_path: 'uploads/khs/khs_budi_s2_12345.pdf',
      ipk: 3.75,
      status_evaluasi: 'valid',
      catatan_evaluasi: 'Aman, performa stabil.',
      tanggal_evaluasi: new Date('2024-06-15T15:45:00+07:00'),
      tanggal_unggah: new Date('2024-06-01'),
      created_at: new Date('2024-06-01'),
      updated_at: new Date('2024-06-15T15:45:00+07:00'),
    },
  });

  // ID 3: Semester 3 (Revisi)
  await prisma.monitoringKhs.create({
    data: {
      id: 3,
      pengajuan_id: pengajuanStudiBudi.id,
      semester_ke: 3,
      file_khs_path: 'uploads/khs/khs_budi_s3_12345.pdf',
      ipk: 3.00,
      status_evaluasi: 'revisi',
      catatan_evaluasi: 'Ada nilai C, tolong perbaiki progres studi.',
      tanggal_evaluasi: new Date('2025-01-10T15:45:00+07:00'),
      tanggal_unggah: new Date('2025-01-01'),
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-10T15:45:00+07:00'),
    },
  });

  // ID 4: Semester 4 (Belum Unggah)
  await prisma.monitoringKhs.create({
    data: {
      id: 4,
      pengajuan_id: pengajuanStudiBudi.id,
      semester_ke: 4,
      file_khs_path: null,
      ipk: null,
      status_evaluasi: 'pending',
      catatan_evaluasi: null,
      tanggal_evaluasi: null,
      tanggal_unggah: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  console.log('Histori Monitoring KHS (Semester 1-4) telah siap.');

  // --- 4.3 Buat Histori Monitoring Keuangan per Semester ---
  // ID 1: Semester 1 (Dicairkan)
  await prisma.pengajuanReimbursement.create({
    data: {
      id: 1,
      pengajuan_id: pengajuanStudiBudi.id,
      semester_ke: 1,
      file_bukti_bayar: 'uploads/reimbursement/bukti_budi_s1_12345.pdf',
      nominal: 5000000,
      status_pencairan: 'dicairkan',
      catatan_keuangan: 'Audit pembayaran dana Tugas Belajar Sem 1 lulus.',
      tanggal_pencairan: new Date('2024-02-15T15:45:00+07:00'),
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-02-15T15:45:00+07:00'),
    },
  });

  // ID 2: Semester 2 (Dicairkan)
  await prisma.pengajuanReimbursement.create({
    data: {
      id: 2,
      pengajuan_id: pengajuanStudiBudi.id,
      semester_ke: 2,
      file_bukti_bayar: 'uploads/reimbursement/bukti_budi_s2_12345.pdf',
      nominal: 5000000,
      status_pencairan: 'dicairkan',
      catatan_keuangan: 'Audit pembayaran dana Tugas Belajar Sem 2 lulus.',
      tanggal_pencairan: new Date('2024-07-20T15:45:00+07:00'),
      created_at: new Date('2024-06-20'),
      updated_at: new Date('2024-07-20T15:45:00+07:00'),
    },
  });

  // ID 3: Semester 3 (Pending)
  await prisma.pengajuanReimbursement.create({
    data: {
      id: 3,
      pengajuan_id: pengajuanStudiBudi.id,
      semester_ke: 3,
      file_bukti_bayar: 'uploads/reimbursement/bukti_budi_s3_12345.pdf',
      nominal: 5000000,
      status_pencairan: 'pending',
      catatan_keuangan: null,
      tanggal_pencairan: null,
      created_at: new Date('2025-01-15'),
      updated_at: new Date('2025-01-15'),
    },
  });

  console.log('Histori Monitoring Keuangan (Semester 1-3) telah siap.');

  // --- 4.4 Buat Pesan Komunikasi Contoh ---
  await prisma.pesanKomunikasi.create({
    data: {
      id: 1,
      pengajuan_id: pengajuanStudiBudi.id,
      pengirim_id: userDosenBudi.id,
      isi_pesan: 'Mohon izin, Mbak Ayu. Saya sudah mengunggah KHS Semester 1-3 dan Bukti Bayar Sem 1-3. Mohon diverifikasi. Terima kasih.',
      waktu_kirim: new Date('2025-01-16T10:00:00+07:00'),
    },
  });

  // ===============================================================
  // === 5. RESET SEQUENCE POSTGRESQL (DIPERBAIKI) ===
  // ===============================================================
  console.log('Menyelaraskan sequence ID untuk PostgreSQL...');
  try {
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"users"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "users";`);
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"pengajuan_studi"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "pengajuan_studi";`);
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"monitoring_khs"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "monitoring_khs";`);
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"pengajuan_reimbursement"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "pengajuan_reimbursement";`);
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"pesan_komunikasi"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "pesan_komunikasi";`);
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"master_provinsi"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "master_provinsi";`);
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"master_kabupaten_kota"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "master_kabupaten_kota";`);
    console.log('Sequence ID database berhasil disinkronisasi.');
  } catch (error) {
    console.log('Catatan: Reset sequence gagal, abaikan jika kamu tidak menggunakan PostgreSQL.');
  }

  console.log('Proses Seeding (SIGAP PBL2) Berhasil!');
  console.log('-----------------------------------');
  console.log('Skenario Data Hidup:');
  console.log('- Akun Master Admin: master_admin@polines.ac.id');
  console.log('- Akun Admin:        admin@polines.ac.id');
  console.log('- Akun Dosen:        dosen@polines.ac.id (Budi Doremi)');
  console.log('- Password Semuanya: rahasia123');
  console.log('-----------------------------------');
  console.log('Histori Studi per Semester Budi telah siap di database.');
}

main()
  .catch((e) => {
    console.error('Error saat menjalankan seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) await prisma.$disconnect();
  });