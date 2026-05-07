// D:\polines\semester 4\PBL 2\PBL2\prisma\seed.ts
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Memulai proses seeding (SIGAP Polines PBL2)...');

  const hashedPassword = await bcrypt.hash('rahasia123', 10);

  // === MASTER DATA ===
  const roleMaster = await prisma.masterRole.upsert({ where: { id: 1 }, update: { nama_role: 'master_admin' }, create: { id: 1, nama_role: 'master_admin' } });
  const roleAdmin = await prisma.masterRole.upsert({ where: { id: 2 }, update: { nama_role: 'admin_fakultas' }, create: { id: 2, nama_role: 'admin_fakultas' } });
  const roleDosen = await prisma.masterRole.upsert({ where: { id: 3 }, update: { nama_role: 'dosen' }, create: { id: 3, nama_role: 'dosen' } });
  const roleKeuangan = await prisma.masterRole.upsert({ where: { id: 4 }, update: { nama_role: 'keuangan' }, create: { id: 4, nama_role: 'keuangan' } });

  const jenisTugasBelajar = await prisma.masterJenisStudi.upsert({ where: { id: 1 }, update: { nama_jenis: 'Tugas Belajar' }, create: { id: 1, nama_jenis: 'Tugas Belajar' } });
  await prisma.masterJenisStudi.upsert({ where: { id: 2 }, update: { nama_jenis: 'Izin Belajar' }, create: { id: 2, nama_jenis: 'Izin Belajar' } });

  const jalurMandiri = await prisma.masterJalurPendanaan.upsert({ where: { id: 1 }, update: { nama_pendanaan: 'Mandiri' }, create: { id: 1, nama_pendanaan: 'Mandiri' } });
  const jalurLPDP = await prisma.masterJalurPendanaan.upsert({ where: { id: 2 }, update: { nama_pendanaan: 'Beasiswa LPDP' }, create: { id: 2, nama_pendanaan: 'Beasiswa LPDP' } });

  await prisma.masterStatusPengajuan.upsert({ where: { id: 1 }, update: { nama_status: 'Draft' }, create: { id: 1, nama_status: 'Draft' } });
  const statusMenunggu = await prisma.masterStatusPengajuan.upsert({ where: { id: 2 }, update: { nama_status: 'Menunggu Verifikasi (Admin)' }, create: { id: 2, nama_status: 'Menunggu Verifikasi (Admin)' } });
  await prisma.masterStatusPengajuan.upsert({ where: { id: 3 }, update: { nama_status: 'Perlu Revisi (Dosen)' }, create: { id: 3, nama_status: 'Perlu Revisi (Dosen)' } });
  await prisma.masterStatusPengajuan.upsert({ where: { id: 6 }, update: { nama_status: 'Studi Selesai (Lulus)' }, create: { id: 6, nama_status: 'Studi Selesai (Lulus)' } });

  await prisma.masterWilayah.upsert({ where: { id: 1 }, update: { nama_wilayah: 'Dalam Negeri' }, create: { id: 1, nama_wilayah: 'Dalam Negeri' } });
  await prisma.masterWilayah.upsert({ where: { id: 2 }, update: { nama_wilayah: 'Luar Negeri' }, create: { id: 2, nama_wilayah: 'Luar Negeri' } });

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
  for (const dok of dokumenList) {
    await prisma.masterDokumen.upsert({
      where: { id: dok.id },
      update: { nama_dokumen: dok.nama_dokumen, is_mandatory: dok.is_mandatory, syarat_wilayah: dok.syarat_wilayah, updated_at: new Date() },
      create: { id: dok.id, nama_dokumen: dok.nama_dokumen, is_mandatory: dok.is_mandatory, syarat_wilayah: dok.syarat_wilayah, created_at: new Date(), updated_at: new Date() },
    });
  }

  // === USERS & Dosen ===
  await prisma.user.upsert({ where: { email: 'master_admin@polines.ac.id' }, update: {}, create: { username: 'Master Admin', email: 'master_admin@polines.ac.id', password_hash: hashedPassword, role_id: roleMaster.id } });
  await prisma.user.upsert({ where: { email: 'admin@polines.ac.id' }, update: {}, create: { username: 'Mbak Ayu', email: 'admin@polines.ac.id', password_hash: hashedPassword, role_id: roleAdmin.id } });
  await prisma.user.upsert({ where: { email: 'keuangan@polines.ac.id' }, update: {}, create: { username: 'Admin Keuangan', email: 'keuangan@polines.ac.id', password_hash: hashedPassword, role_id: roleKeuangan.id } });

  const userDosenBudi = await prisma.user.upsert({
    where: { email: 'dosen@polines.ac.id' },
    update: { role_id: roleDosen.id, username: 'Budi Doremi' },
    create: { id: 4, username: 'Budi Doremi', email: 'dosen@polines.ac.id', password_hash: hashedPassword, role_id: roleDosen.id, status_akun: 'aktif' },
  });

  await prisma.masterDosen.upsert({
    where: { user_id: userDosenBudi.id },
    update: { nama_lengkap: 'Budi Doremi, S.Kom., M.T.' },
    create: {
      user_id: userDosenBudi.id, nip: '198273645', nama_lengkap: 'Budi Doremi, S.Kom., M.T.',
      pangkat_golongan: 'Penata Muda Tk I (III/b)', jabatan: 'Asisten Ahli', unit_kerja: 'Politeknik Negeri Semarang',
      jurusan: 'Teknik Elektro', program_studi: 'Teknik Informatika',
    },
  });

  // === Transaksi ===
  const pengajuanStudiBudi = await prisma.pengajuanStudi.upsert({
    where: { id: 1 },
    update: {},
    create: {
      user_id: userDosenBudi.id, jenis_studi_id: jenisTugasBelajar.id, jalur_pendanaan_id: jalurLPDP.id,
      wilayah_studi: 1, perguruan_tinggi: 'Institut Teknologi Bandung (ITB)', status_id: statusMenunggu.id,
      tanggal_pengajuan: new Date('2023-08-10'),
    },
  });

  const khsData = [
    { id: 1, semester_ke: 1, tahun_akademik: '2023/2024 Ganjil', file: 'uploads/khs/khs_budi_s1_12345.pdf', ipk: 3.85, status: 'Valid', catatan: 'Awal yang sangat bagus.', tgl: '2024-01-05' },
    { id: 2, semester_ke: 2, tahun_akademik: '2023/2024 Genap', file: 'uploads/khs/khs_budi_s2_12345.pdf', ipk: 3.75, status: 'Valid', catatan: 'Aman, performa stabil.', tgl: '2024-06-01' },
    { id: 3, semester_ke: 3, tahun_akademik: '2024/2025 Ganjil', file: 'uploads/khs/khs_budi_s3_12345.pdf', ipk: 3.00, status: 'Revisi', catatan: 'Ada nilai C, tolong perbaiki progres studi.', tgl: '2025-01-01' },
    { id: 4, semester_ke: 4, tahun_akademik: '2024/2025 Genap', status: 'Pending' },
  ];
  for (const khs of khsData) {
    await prisma.monitoringKhs.upsert({
      where: { id: khs.id },
      update: {},
      create: {
        id: khs.id, pengajuan_id: pengajuanStudiBudi.id, semester_ke: khs.semester_ke, tahun_akademik: khs.tahun_akademik,
        file_khs_path: khs.file, ipk: khs.ipk, status_evaluasi: khs.status, catatan_evaluasi: khs.catatan, tanggal_unggah: khs.tgl ? new Date(khs.tgl) : undefined,
      },
    });
  }

  console.log('Seeding selesai! Budi Doremi berkuliah di ITB.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
