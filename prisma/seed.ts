// D:\polines\semester 4\PBL 2\PBL2\prisma\seed.ts
import { prisma } from '../src/lib/prisma'; // Sesuaikan path ini dengan project kamu
import bcrypt from 'bcryptjs';

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
  await cleanUp(() => prisma.masterProgramStudi.deleteMany()); // Tambahan cleanup prodi
  await cleanUp(() => prisma.masterJurusan.deleteMany()); // Tambahan cleanup jurusan
  await cleanUp(() => prisma.masterWilayah.deleteMany());
  await cleanUp(() => prisma.masterStatusPengajuan.deleteMany());
  await cleanUp(() => prisma.masterJalurPendanaan.deleteMany());
  await cleanUp(() => prisma.masterJenisStudi.deleteMany());
  await cleanUp(() => prisma.masterRole.deleteMany());

  // ===============================================================
  // === 2. MASTER DATA (Deterministic IDs) ===
  // ===============================================================

  // --- 2.1 Master Role ---
  const roleMaster = await prisma.masterRole.create({ data: { id: 1, nama_role: 'master_admin' } });
  const roleAdmin = await prisma.masterRole.create({ data: { id: 2, nama_role: 'admin' } });
  const roleDosen = await prisma.masterRole.create({ data: { id: 3, nama_role: 'dosen' } });

  // --- 2.2 Master Jenis Studi ---
  const jenisTugasBelajar = await prisma.masterJenisStudi.create({ data: { id: 1, nama_jenis: 'Tugas Belajar' } });
  await prisma.masterJenisStudi.create({ data: { id: 2, nama_jenis: 'Izin Belajar' } });

  // --- 2.3 Master Jalur Pendanaan ---
  const jalurMandiri = await prisma.masterJalurPendanaan.create({ data: { id: 1, nama_pendanaan: 'Mandiri' } });
  const jalurLPDP = await prisma.masterJalurPendanaan.create({ data: { id: 2, nama_pendanaan: 'Beasiswa LPDP' } });

  // --- 2.4 Master Status Pengajuan Studi (snake_case, konsisten) ---
  await prisma.masterStatusPengajuan.create({ data: { id: 1, nama_status: 'draft' } });
  const statusMenunggu = await prisma.masterStatusPengajuan.create({ data: { id: 2, nama_status: 'menunggu_verifikasi' } });
  const statusRevisi = await prisma.masterStatusPengajuan.create({ data: { id: 3, nama_status: 'perlu_revisi' } });
  await prisma.masterStatusPengajuan.create({ data: { id: 4, nama_status: 'pending' } });
  await prisma.masterStatusPengajuan.create({ data: { id: 5, nama_status: 'diterima' } });
  const statusLulus = await prisma.masterStatusPengajuan.create({ data: { id: 6, nama_status: 'studi_selesai' } });
  await prisma.masterStatusPengajuan.create({ data: { id: 7, nama_status: 'terverifikasi' } });
  await prisma.masterStatusPengajuan.create({ data: { id: 8, nama_status: 'revisi' } });

  // --- 2.5 Master Dokumen (Untuk Syarat Awal) ---
  await prisma.masterDokumen.create({ data: { id: 1, nama_dokumen: 'SK CPNS', is_mandatory: true, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 2, nama_dokumen: 'LoA (Letter of Acceptance) Universitas', is_mandatory: true, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 3, nama_dokumen: 'Surat Izin Studi (Dari Kampus)', is_mandatory: true, syarat_wilayah: 'Semua' } });
  await prisma.masterDokumen.create({ data: { id: 4, nama_dokumen: 'SK Tugas Belajar (Kementerian)', is_mandatory: true, syarat_wilayah: 'Semua' } });
  const wilayahDalamNegeri = await prisma.masterWilayah.create({ data: { id: 1, nama_wilayah: 'Dalam Negeri' } });
  const wilayahLuarNegeri = await prisma.masterWilayah.create({ data: { id: 2, nama_wilayah: 'Luar Negeri' } });

  // --- 2.6 Master Jurusan & Program Studi ---
  console.log('Seeding Jurusan dan Program Studi...');
  for (const [jurusanName, prodiList] of Object.entries(dataPolines)) {
    await prisma.masterJurusan.upsert({
      where: { nama_jurusan: jurusanName },
      update: {}, 
      create: {
        nama_jurusan: jurusanName,
        program_studi: {
          create: prodiList.map((prodi) => ({
            nama_prodi: prodi,
          })),
        },
      },
    });
  }

  console.log('Data Master (Role, Jenis Studi, Pendanaan, Status, Dokumen, Wilayah, Jurusan) telah siap.');

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
      unit_kerja: 'Politeknik Negeri Semarang',
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
    await prisma.$disconnect();
  });