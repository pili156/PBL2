// D:\polines\semester 4\PBL 2\PBL2\prisma\seed.ts
import { prisma } from '../src/lib/prisma';
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
    where: { id: 1 }, update: { nama_role: 'master_admin' }, create: { id: 1, nama_role: 'master_admin' },
  });
  const roleAdmin = await prisma.masterRole.upsert({
    where: { id: 2 }, update: { nama_role: 'admin_fakultas' }, create: { id: 2, nama_role: 'admin_fakultas' },
  });
  const roleDosen = await prisma.masterRole.upsert({
    where: { id: 3 }, update: { nama_role: 'dosen' }, create: { id: 3, nama_role: 'dosen' },
  });
  const roleKeuangan = await prisma.masterRole.upsert({
    where: { id: 4 }, update: { nama_role: 'keuangan' }, create: { id: 4, nama_role: 'keuangan' },
  });

  // --- 2.2 Master Jenis Studi ---
  const jenisTugasBelajar = await prisma.masterJenisStudi.upsert({
    where: { id: 1 }, update: { nama_jenis: 'Tugas Belajar' }, create: { id: 1, nama_jenis: 'Tugas Belajar' },
  });
  await prisma.masterJenisStudi.upsert({
    where: { id: 2 }, update: { nama_jenis: 'Izin Belajar' }, create: { id: 2, nama_jenis: 'Izin Belajar' },
  });

  // --- 2.3 Master Jalur Pendanaan ---
  const jalurMandiri = await prisma.masterJalurPendanaan.upsert({
    where: { id: 1 }, update: { nama_pendanaan: 'Mandiri' }, create: { id: 1, nama_pendanaan: 'Mandiri' },
  });
  const jalurLPDP = await prisma.masterJalurPendanaan.upsert({
    where: { id: 2 }, update: { nama_pendanaan: 'Beasiswa LPDP' }, create: { id: 2, nama_pendanaan: 'Beasiswa LPDP' },
  });

  // --- 2.4 Master Status Pengajuan Studi ---
  await prisma.masterStatusPengajuan.upsert({
    where: { id: 1 }, update: { nama_status: 'Draft' }, create: { id: 1, nama_status: 'Draft' },
  });
  const statusMenunggu = await prisma.masterStatusPengajuan.upsert({
    where: { id: 2 }, update: { nama_status: 'Menunggu Verifikasi (Admin)' }, create: { id: 2, nama_status: 'Menunggu Verifikasi (Admin)' },
  });
  const statusRevisi = await prisma.masterStatusPengajuan.upsert({
    where: { id: 3 }, update: { nama_status: 'Perlu Revisi (Dosen)' }, create: { id: 3, nama_status: 'Perlu Revisi (Dosen)' },
  });
  const statusLulus = await prisma.masterStatusPengajuan.upsert({
    where: { id: 6 }, update: { nama_status: 'Studi Selesai (Lulus)' }, create: { id: 6, nama_status: 'Studi Selesai (Lulus)' },
  });

  // --- 2.5 Master Dokumen ---
  await prisma.masterDokumen.upsert({ where: { id: 1 }, update: { nama_dokumen: 'SK CPNS' }, create: { id: 1, nama_dokumen: 'SK CPNS' } });
  await prisma.masterDokumen.upsert({ where: { id: 2 }, update: { nama_dokumen: 'LoA Universitas' }, create: { id: 2, nama_dokumen: 'LoA Universitas' } });

  console.log('Data Master telah siap.');

  // ===============================================================
  // === 3. SEED USERS & DOSEN PROFILE (Budi Doremi) ===
  // ===============================================================

  // 3.1 - 3.3 Akun Admin (Di-skip detail lognya agar rapi)
  await prisma.user.upsert({ where: { email: 'master_admin@gmail.com' }, update: {}, create: { username: 'Master Admin', email: 'master_admin@gmail.com', password_hash: hashedPassword, role_id: roleMaster.id }});
  await prisma.user.upsert({ where: { email: 'admin@gmail.com' }, update: {}, create: { username: 'Mbak Ayu', email: 'admin@gmail.com', password_hash: hashedPassword, role_id: roleAdmin.id }});
  await prisma.user.upsert({ where: { email: 'keuangan@gmail.com' }, update: {}, create: { username: 'Admin Keuangan', email: 'keuangan@gmail.com', password_hash: hashedPassword, role_id: roleKeuangan.id }});

  // --- 3.4 Buat Akun Dosen PBL (Budi Doremi) ---
  const userDosenBudi = await prisma.user.upsert({
    where: { email: 'dosen@gmail.com' },
    update: { role_id: roleDosen.id, username: 'Budi Doremi' },
    create: {
      id: 4, // LIXA KUNCI ID-NYA JADI 4
      username: 'Budi Doremi',
      email: 'dosen@gmail.com',
      password_hash: hashedPassword,
      role_id: roleDosen.id,
      status_akun: 'aktif',
    },
  });

  // --- 3.5 Buat Profil Dosen Lengkap Budi ---
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
  // === 4. TRANSAKSI (Skenario Budi di ITB) ===
  // ===============================================================

  // --- 4.1 Buat Skenario Pengajuan Studi Aktif (Budi di ITB) ---
  const pengajuanStudiBudi = await prisma.pengajuanStudi.upsert({
    where: { id: 1 }, 
    update: { perguruan_tinggi: 'Institut Teknologi Bandung (ITB)' },
    create: {
      id: 1,
      user_id: userDosenBudi.id,
      jenis_studi_id: jenisTugasBelajar.id,
      jalur_pendanaan_id: jalurLPDP.id,
      wilayah_studi: 'Dalam Negeri',
      perguruan_tinggi: 'Institut Teknologi Bandung (ITB)', // <-- KAMPUS ITB
      status_id: statusMenunggu.id,
      tanggal_pengajuan: new Date('2023-08-10'),
    },
  });

  // --- 4.2 Buat Histori Monitoring KHS per Semester ---
  // Semester 1 (Valid)
  await prisma.monitoringKhs.upsert({
    where: { id: 1 }, update: {},
    create: {
      id: 1, pengajuan_id: pengajuanStudiBudi.id, semester_ke: 1,
      tahun_akademik: '2023/2024 Ganjil', // <-- TAMBAHAN TAHUN AKADEMIK
      file_khs_path: 'uploads/khs/khs_budi_s1_12345.pdf', ipk: 3.85, status_evaluasi: 'Valid',
      catatan_evaluasi: 'Awal yang sangat bagus.', tanggal_unggah: new Date('2024-01-05'),
    },
  });

  // Semester 2 (Valid)
  await prisma.monitoringKhs.upsert({
    where: { id: 2 }, update: {},
    create: {
      id: 2, pengajuan_id: pengajuanStudiBudi.id, semester_ke: 2,
      tahun_akademik: '2023/2024 Genap', // <-- TAMBAHAN TAHUN AKADEMIK
      file_khs_path: 'uploads/khs/khs_budi_s2_12345.pdf', ipk: 3.75, status_evaluasi: 'Valid',
      catatan_evaluasi: 'Aman, performa stabil.', tanggal_unggah: new Date('2024-06-01'),
    },
  });

  // Semester 3 (Revisi)
  await prisma.monitoringKhs.upsert({
    where: { id: 3 }, update: {},
    create: {
      id: 3, pengajuan_id: pengajuanStudiBudi.id, semester_ke: 3,
      tahun_akademik: '2024/2025 Ganjil', // <-- TAMBAHAN TAHUN AKADEMIK
      file_khs_path: 'uploads/khs/khs_budi_s3_12345.pdf', ipk: 3.00, status_evaluasi: 'Revisi',
      catatan_evaluasi: 'Ada nilai C, tolong perbaiki progres studi.', tanggal_unggah: new Date('2025-01-01'),
    },
  });

  // Semester 4 (Belum Unggah / Pending)
  await prisma.monitoringKhs.upsert({
    where: { id: 4 }, update: {},
    create: {
      id: 4, pengajuan_id: pengajuanStudiBudi.id, semester_ke: 4,
      tahun_akademik: '2024/2025 Genap', // <-- TAMBAHAN TAHUN AKADEMIK
      status_evaluasi: 'Pending',
    },
  });

   // 7. Seed Master Jenis Studi
  const jenisTugasBelajar = await prisma.masterJenisStudi.upsert({
    where: { id: 1 },
    update: { nama_jenis: 'Tugas Belajar' },
    create: { id: 1, nama_jenis: 'Tugas Belajar' },
  });

  const jenisIzinBelajar = await prisma.masterJenisStudi.upsert({
    where: { id: 2 },
    update: { nama_jenis: 'Izin Belajar' },
    create: { id: 2, nama_jenis: 'Izin Belajar' },
  });

  // 8. Seed Master Jalur Pendanaan
  const pendanaanBeasiswa = await prisma.masterJalurPendanaan.upsert({
    where: { id: 1 },
    update: { nama_pendanaan: 'Beasiswa' },
    create: { id: 1, nama_pendanaan: 'Beasiswa' },
  });

const pendanaanMandiri = await prisma.masterJalurPendanaan.upsert({
    where: { id: 2 },
    update: { nama_pendanaan: 'Mandiri' },
    create: { id: 2, nama_pendanaan: 'Mandiri' },
  });

  // 9. Seed Master Wilayah
  await prisma.masterWilayah.upsert({
    where: { id: 1 },
    update: { nama_wilayah: 'Dalam Negeri' },
    create: { id: 1, nama_wilayah: 'Dalam Negeri' },
  });

  await prisma.masterWilayah.upsert({
    where: { id: 2 },
    update: { nama_wilayah: 'Luar Negeri' },
    create: { id: 2, nama_wilayah: 'Luar Negeri' },
  });

  // 10. Seed Master Status Pengajuan
  await prisma.masterStatusPengajuan.upsert({
    where: { id: 1 },
    update: { nama_status: 'menunggu' },
    create: { id: 1, nama_status: 'menunggu' },
  });

  console.log('Proses Seeding Berhasil! Budi Doremi resmi berkuliah di ITB.');

  // 10. Seed Master Dokumen
const dokumenList = [
    { id: 1, nama_dokumen: 'Kartu virtual ASN / Kartu pegawai', is_mandatory: true, syarat_wilayah: 'Semua' },
    { id: 2, nama_dokumen: 'SK Cpns', is_mandatory: true, syarat_wilayah: 'Semua' },
    { id: 3, nama_dokumen: 'SK PNS', is_mandatory: true, syarat_wilayah: 'Semua' },
    { id: 4, nama_dokumen: 'SK Pangkat Terakhir', is_mandatory: true, syarat_wilayah: 'Semua' },
    { id: 5, nama_dokumen: 'SK Jabatan Terakhir', is_mandatory: true, syarat_wilayah: 'Semua' },
    { id: 6, nama_dokumen: 'Penilaian Prestasi Kerja / SKPP 2 tahun', is_mandatory: true, syarat_wilayah: 'Semua' },
    { id: 7, nama_dokumen: 'Akta Nikah', is_mandatory: false, syarat_wilayah: 'Semua' },
    { id: 8, nama_dokumen: 'Tunjangan keluarga PNS (KP4)', is_mandatory: false, syarat_wilayah: 'Semua' },
    { id: 9, nama_dokumen: 'Surat keterangan sehat jasmani', is_mandatory: true, syarat_wilayah: 'Semua' },
    { id: 10, nama_dokumen: 'Surat rekomendasi dari atasan langsung', is_mandatory: true, syarat_wilayah: 'Semua' },
    { id: 11, nama_dokumen: 'Surat keterangan pimpinan (kesesuaian bidang)', is_mandatory: true, syarat_wilayah: 'Semua' },
    { id: 12, nama_dokumen: 'Perjanjian Tugas Belajar', is_mandatory: true, syarat_wilayah: 'Semua' },
    { id: 13, nama_dokumen: 'Surat jaminan Pembiayaan tugas belajar', is_mandatory: false, syarat_wilayah: 'Semua' },
    { id: 14, nama_dokumen: 'Hasil kelulusan / LoA dari lembaga', is_mandatory: true, syarat_wilayah: 'Semua' },
    { id: 15, nama_dokumen: 'Surat pernyataan pimpinan unit kerja', is_mandatory: true, syarat_wilayah: 'Semua' },
    { id: 16, nama_dokumen: 'Surat pernyataan pegawai bersangkutan', is_mandatory: true, syarat_wilayah: 'Semua' },
    { id: 17, nama_dokumen: 'Ijazah Pendidikan Terakhir', is_mandatory: true, syarat_wilayah: 'Semua' },
    { id: 18, nama_dokumen: 'Dokumen akreditasi prodi & PT / PTLN', is_mandatory: true, syarat_wilayah: 'Luar Negeri' },
    { id: 19, nama_dokumen: 'Surat Persetujuan Setneg', is_mandatory: true, syarat_wilayah: 'Luar Negeri' },
    { id: 20, nama_dokumen: 'Surat keterangan sehat rohani', is_mandatory: true, syarat_wilayah: 'Semua' },
  ];

  for (const dokumen of dokumenList) {
    await prisma.masterDokumen.upsert({
      where: { id: dokumen.id },
      update: {
        nama_dokumen: dokumen.nama_dokumen,
        is_mandatory: dokumen.is_mandatory,
        syarat_wilayah: dokumen.syarat_wilayah,
        updated_at: new Date(),
      },
      create: {
        id: dokumen.id,
        nama_dokumen: dokumen.nama_dokumen,
        is_mandatory: dokumen.is_mandatory,
        syarat_wilayah: dokumen.syarat_wilayah,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });