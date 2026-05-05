import { prisma } from '../src/lib/prisma'; 
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Memulai proses seeding...');

  // 1. Buat 4 Master Role utama menggunakan upsert
  const roleMaster = await prisma.masterRole.upsert({
    where: { id: 1 },
    update: { nama_role: 'master_admin' }, 
    create: { id: 1, nama_role: 'master_admin' },
  });

  const roleAdmin = await prisma.masterRole.upsert({
    where: { id: 2 },
    update: { nama_role: 'admin' },
    create: { id: 2, nama_role: 'admin' },
  });

  const roleDosen = await prisma.masterRole.upsert({
    where: { id: 3 },
    update: { nama_role: 'dosen' },
    create: { id: 3, nama_role: 'dosen' },
  });

  // Tambahkan Role Keuangan di ID 4
  const roleKeuangan = await prisma.masterRole.upsert({
    where: { id: 4 },
    update: { nama_role: 'keuangan' },
    create: { id: 4, nama_role: 'keuangan' },
  });

  // 2. Hash Password Default untuk semua akun (rahasia123)
  const hashedPassword = await bcrypt.hash('rahasia123', 10);

  // 3. Buat Akun Master Admin
  await prisma.user.upsert({
    where: { 
      email: 'master_admin@gmail.com' 
    },
    update: { role_id: roleMaster.id }, 
    create: {
      username: 'Master Admin',
      email: 'master_admin@gmail.com',
      password_hash: hashedPassword,
      role_id: roleMaster.id,
      status_akun: 'aktif',
    },
  });

  // 4. Buat Akun Admin
  await prisma.user.upsert({
    where: { 
      email: 'admin@gmail.com' 
    },
    update: { role_id: roleAdmin.id },
    create: {
      username: 'Admin Fakultas',
      email: 'admin@gmail.com',
      password_hash: hashedPassword,
      role_id: roleAdmin.id,
      status_akun: 'aktif',
    },
  });

  // 5. Buat Akun Dosen Default
  await prisma.user.upsert({
    where: { 
      email: 'dosen@gmail.com' 
    },
    update: { role_id: roleDosen.id },
    create: {
      username: 'Dosen PBL',
      email: 'dosen@gmail.com',
      password_hash: hashedPassword,
      role_id: roleDosen.id,
      status_akun: 'aktif',
    },
  });

  // 6. Buat Akun Keuangan Default
  await prisma.user.upsert({
    where: { 
      email: 'keuangan@gmail.com' 
    },
    update: { role_id: roleKeuangan.id },
    create: {
      username: 'Admin Keuangan',
      email: 'keuangan@gmail.com',
      password_hash: hashedPassword,
      role_id: roleKeuangan.id,
      status_akun: 'aktif',
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

  console.log('Seed berhasil! 4 Role (Master Admin, Admin, Dosen, Keuangan) dan Akun Default telah siap digunakan.');

  // 10. Seed Master Dokumen
  const dokumenList = [
    { id: 1, nama_dokumen: 'Kartu virtual ASN / Kartu pegawai', is_mandatory: true, syarat_wilayah: 'Semua' },
    { id: 2, nama_dokumen: 'SK CPNS', is_mandatory: true, syarat_wilayah: 'Semua' },
    { id: 3, nama_dokumen: 'SK PNS', is_mandatory: true, syarat_wilayah: 'Semua' },
    { id: 4, nama_dokumen: 'SK Pangkat Terakhir', is_mandatory: true, syarat_wilayah: 'Semua' },
    { id: 5, nama_dokumen: 'SK Jabatan Terakhir', is_mandatory: true, syarat_wilayah: 'Semua' },
    { id: 6, nama_dokumen: 'Penilaian Prestasi Kerja / SKPP 2 tahun', is_mandatory: true, syarat_wilayah: 'Semua' },
    { id: 7, nama_dokumen: 'Akta Nikah', is_mandatory: false, syarat_wilayah: 'Semua' },
    { id: 8, nama_dokumen: 'Tunjangan keluarga PNS (KP4)', is_mandatory: false, syarat_wilayah: 'Semua' },
    { id: 9, nama_dokumen: 'Surat keterangan sehat jasmani & rohani', is_mandatory: true, syarat_wilayah: 'Semua' },
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
  .catch((e) => {
    console.error('Error saat menjalankan seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });