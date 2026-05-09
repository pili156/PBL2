// D:\polines\semester 4\PBL 2\PBL2\prisma\seed.ts
import { prisma } from '../src/lib/prisma'; // Sesuaikan path ini dengan project kamu
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Memulai proses seeding (SIGAP Polines PBL2)...');

  // --- 1. HASH PASSWORD DEFAULT (rahasia123) ---
  const hashedPassword = await bcrypt.hash('rahasia123', 10);

  // ===============================================================
  // === 2. MASTER DATA (Deterministic IDs) ===
  // ===============================================================

  // --- 2.1 Master Role ---
  const roleMaster = await prisma.masterRole.upsert({
    where: { id: 1 },
    update: { nama_role: 'master_admin' },
    create: { id: 1, nama_role: 'master_admin' },
  });
  const roleAdmin = await prisma.masterRole.upsert({
    where: { id: 2 },
    update: { nama_role: 'admin_fakultas' },
    create: { id: 2, nama_role: 'admin_fakultas' },
  });
  const roleDosen = await prisma.masterRole.upsert({
    where: { id: 3 },
    update: { nama_role: 'dosen' },
    create: { id: 3, nama_role: 'dosen' },
  });
  const roleKeuangan = await prisma.masterRole.upsert({
    where: { id: 4 },
    update: { nama_role: 'keuangan' },
    create: { id: 4, nama_role: 'keuangan' },
  });

  // --- 2.2 Master Jenis Studi ---
  const jenisTugasBelajar = await prisma.masterJenisStudi.upsert({
    where: { id: 1 },
    update: { nama_jenis: 'Tugas Belajar' },
    create: { id: 1, nama_jenis: 'Tugas Belajar' },
  });
  await prisma.masterJenisStudi.upsert({
    where: { id: 2 },
    update: { nama_jenis: 'Izin Belajar' },
    create: { id: 2, nama_jenis: 'Izin Belajar' },
  });

  // --- 2.3 Master Jalur Pendanaan ---
  const jalurMandiri = await prisma.masterJalurPendanaan.upsert({
    where: { id: 1 },
    update: { nama_pendanaan: 'Mandiri' },
    create: { id: 1, nama_pendanaan: 'Mandiri' },
  });
  const jalurLPDP = await prisma.masterJalurPendanaan.upsert({
    where: { id: 2 },
    update: { nama_pendanaan: 'Beasiswa LPDP' },
    create: { id: 2, nama_pendanaan: 'Beasiswa LPDP' },
  });

  // --- 2.4 Master Status Pengajuan Studi ---
  await prisma.masterStatusPengajuan.upsert({
    where: { id: 1 },
    update: { nama_status: 'Draft' },
    create: { id: 1, nama_status: 'Draft' },
  });
  const statusMenunggu = await prisma.masterStatusPengajuan.upsert({
    where: { id: 2 },
    update: { nama_status: 'Menunggu Verifikasi (Admin)' },
    create: { id: 2, nama_status: 'Menunggu Verifikasi (Admin)' },
  });
  const statusRevisi = await prisma.masterStatusPengajuan.upsert({
    where: { id: 3 },
    update: { nama_status: 'Perlu Revisi (Dosen)' },
    create: { id: 3, nama_status: 'Perlu Revisi (Dosen)' },
  });
  const statusLulus = await prisma.masterStatusPengajuan.upsert({
    where: { id: 6 }, // Gunakan ID 6 untuk status akhir agar ada celah
    update: { nama_status: 'Studi Selesai (Lulus)' },
    create: { id: 6, nama_status: 'Studi Selesai (Lulus)' },
  });

  // --- 2.5 Master Dokumen (Untuk Syarat Awal) ---
  await prisma.masterDokumen.upsert({
    where: { id: 1 },
    update: { nama_dokumen: 'SK CPNS', is_mandatory: true, syarat_wilayah: 'Semua' },
    create: { id: 1, nama_dokumen: 'SK CPNS', is_mandatory: true, syarat_wilayah: 'Semua' },
  });
  await prisma.masterDokumen.upsert({
    where: { id: 2 },
    update: { nama_dokumen: 'LoA (Letter of Acceptance) Universitas', is_mandatory: true, syarat_wilayah: 'Semua' },
    create: { id: 2, nama_dokumen: 'LoA (Letter of Acceptance) Universitas', is_mandatory: true, syarat_wilayah: 'Semua' },
  });
  await prisma.masterDokumen.upsert({
    where: { id: 3 },
    update: { nama_dokumen: 'Surat Izin Studi (Dari Kampus)', is_mandatory: true, syarat_wilayah: 'Semua' },
    create: { id: 3, nama_dokumen: 'Surat Izin Studi (Dari Kampus)', is_mandatory: true, syarat_wilayah: 'Semua' },
  });
  await prisma.masterDokumen.upsert({
    where: { id: 4 },
    update: { nama_dokumen: 'SK Tugas Belajar (Kementerian)', is_mandatory: true, syarat_wilayah: 'Semua' },
    create: { id: 4, nama_dokumen: 'SK Tugas Belajar (Kementerian)', is_mandatory: true, syarat_wilayah: 'Semua' },
  });

  console.log('Data Master (Role, Jenis Studi, Pendanaan, Status, Dokumen) telah siap.');

  // ===============================================================
  // === 3. SEED USERS & DOSEN PROFILE (Budi Doremi) ===
  // ===============================================================

  // --- 3.1 Buat Akun Master Admin ---
  await prisma.user.upsert({
    where: { email: 'master_admin@gmail.com' },
    update: { role_id: roleMaster.id },
    create: {
      username: 'Master Admin',
      email: 'master_admin@gmail.com',
      password_hash: hashedPassword,
      role_id: roleMaster.id,
      status_akun: 'aktif',
    },
  });

  // --- 3.2 Buat Akun Admin Fakultas ---
  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: { role_id: roleAdmin.id },
    create: {
      username: 'Mbak Ayu (Admin)',
      email: 'admin@gmail.com',
      password_hash: hashedPassword,
      role_id: roleAdmin.id,
      status_akun: 'aktif',
    },
  });

  // --- 3.3 Buat Akun Keuangan ---
  await prisma.user.upsert({
    where: { email: 'keuangan@gmail.com' },
    update: { role_id: roleKeuangan.id },
    create: {
      username: 'Admin Keuangan',
      email: 'keuangan@gmail.com',
      password_hash: hashedPassword,
      role_id: roleKeuangan.id,
      status_akun: 'aktif',
    },
  });


  // --- 3.4 Buat Akun Dosen PBL (Budi Doremi) ---
  const userDosenBudi = await prisma.user.upsert({
    where: { email: 'dosen@gmail.com' },
    update: { role_id: roleDosen.id, username: 'Budi Doremi' },
    create: {
      username: 'Budi Doremi',
      email: 'dosen@gmail.com',
      password_hash: hashedPassword,
      role_id: roleDosen.id,
      status_akun: 'aktif',
    },
  });

  // --- 3.5 Buat Profil Dosen Lengkap Budi (Tabel MasterDosen) ---
  const profilDosenBudi = await prisma.masterDosen.upsert({
    where: { user_id: userDosenBudi.id },
    update: { nama_lengkap: 'Budi Doremi, S.Kom., M.T.' },
    create: {
      user_id: userDosenBudi.id,
      nip: '198273645',
      nama_lengkap: 'Budi Doremi, S.Kom., M.T.',
      pangkat_golongan: 'Penata Muda Tk I (III/b)',
      jabatan: 'Asisten Ahli',
      unit_kerja: 'Politeknik Negeri Semarang',
      jurusan: 'Teknik Elektro',
      program_studi: 'Teknik Informatika',
    },
  });

  console.log('Users dan Profil Dosen (Budi Doremi) telah siap.');

  // ===============================================================
  // === 4. TRANSAKSI (Skenario Histori Studi Budi) ===
  // ===============================================================

  // --- 4.1 Buat Skenario Pengajuan Studi Aktif (Budi) ---
  const pengajuanStudiBudi = await prisma.pengajuanStudi.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      user_id: userDosenBudi.id,
      jenis_studi_id: jenisTugasBelajar.id,
      jalur_pendanaan_id: jalurLPDP.id,
      wilayah_studi: 1,
      status_id: statusMenunggu.id,
      tanggal_pengajuan: new Date('2023-08-10'),
    },
  });

  console.log('Data Pengajuan Studi (Skenario Budi) telah siap.');

  // --- 4.2 Buat Histori Monitoring KHS per Semester ---
  await prisma.monitoringKhs.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      pengajuan_id: pengajuanStudiBudi.id,
      semester_ke: 1,
      ipk: 3.85,
      status_evaluasi: 'Valid',
      catatan_evaluasi: 'Awal yang sangat bagus, pertahankan performa studi.',
    },
  });

  await prisma.monitoringKhs.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      pengajuan_id: pengajuanStudiBudi.id,
      semester_ke: 2,
      ipk: 3.75,
      status_evaluasi: 'Valid',
      catatan_evaluasi: 'Aman, performa stabil.',
    },
  });

  await prisma.monitoringKhs.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      pengajuan_id: pengajuanStudiBudi.id,
      semester_ke: 3,
      ipk: 3.00,
      status_evaluasi: 'Revisi',
      catatan_evaluasi: 'Ada nilai C, tolong perbaiki progres studi.',
    },
  });

  await prisma.monitoringKhs.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      pengajuan_id: pengajuanStudiBudi.id,
      semester_ke: 4,
      ipk: null,
      status_evaluasi: 'Pending',
      catatan_evaluasi: null,
    },
  });

  console.log('Histori Monitoring KHS (Semester 1-4) telah siap.');

  // --- 4.3 Buat Histori Monitoring Keuangan per Semester ---
  await prisma.pengajuanReimbursement.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      pengajuan_id: pengajuanStudiBudi.id,
      semester_ke: 1,
      nominal: 5000000,
      status_pencairan: 'Dicairkan',
      catatan_keuangan: 'Audit pembayaran dana Tugas Belajar Sem 1 lulus.',
    },
  });

  await prisma.pengajuanReimbursement.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      pengajuan_id: pengajuanStudiBudi.id,
      semester_ke: 2,
      nominal: 5000000,
      status_pencairan: 'Dicairkan',
      catatan_keuangan: 'Audit pembayaran dana Tugas Belajar Sem 2 lulus.',
    },
  });

  await prisma.pengajuanReimbursement.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      pengajuan_id: pengajuanStudiBudi.id,
      semester_ke: 3,
      nominal: 5000000,
      status_pencairan: 'Pending',
      catatan_keuangan: null,
    },
  });

  console.log('Histori Monitoring Keuangan (Semester 1-3) telah siap.');

  // --- 4.4 Buat Pesan Komunikasi Contoh ---
  await prisma.pesanKomunikasi.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      pengajuan_id: pengajuanStudiBudi.id,
      pengirim_id: userDosenBudi.id,
      isi_pesan: 'Mohon izin, Mbak Ayu. Saya sudah mengunggah KHS Semester 1-3 dan Bukti Bayar Sem 1-3. Mohon diverifikasi. Terima kasih.',
    },
  });

  console.log('Proses Seeding (SIGAP PBL2) Berhasil!');
  console.log('-----------------------------------');
  console.log('Skenario Data Hidup:');
  console.log('- Akun Admin:   admin@gmail.com');
  console.log('- Akun Dosen:  dosen@gmail.com (Budi Doremi)');
  console.log('- Akun Keuangan: keuangan@gmail.com');
  console.log('- Password Semuanya: rahasia123');
  console.log('-----------------------------------');
}

main()
  .catch((e) => {
    console.error('Error saat menjalankan seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  