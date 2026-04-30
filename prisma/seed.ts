import { prisma } from '../src/lib/prisma'; 
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Memulai proses seeding...');

  // 1. Buat Master Role menggunakan upsert agar tidak duplikat
  const roleMaster = await prisma.masterRole.upsert({
    where: { id: 1 },
    update: { nama_role: 'master_user' },
    create: { id: 1, nama_role: 'master_user' },
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

  // 2. Hash Password Default untuk akun Master dan Admin
  const hashedPassword = await bcrypt.hash('rahasia123', 10);

  // 3. Buat Akun Master System
  // Syarat: Kolom 'email' di schema.prisma harus memiliki atribut @unique
  await prisma.user.upsert({
    where: { 
      email: 'master@sistem.com' 
    },
    update: {}, // Jangan ubah apa pun jika user sudah ada
    create: {
      username: 'Master System',
      email: 'master@sistem.com',
      password_hash: hashedPassword,
      role_id: roleMaster.id,
      status_akun: 'aktif',
    },
  });

  // 4. Buat Akun Admin Fakultas
  await prisma.user.upsert({
    where: { 
      email: 'admin@sistem.com' 
    },
    update: {},
    create: {
      username: 'Admin Fakultas',
      email: 'admin@sistem.com',
      password_hash: hashedPassword,
      role_id: roleAdmin.id,
      status_akun: 'aktif',
    },
  });

  console.log('Seed berhasil! Role dan Akun Default telah siap digunakan.');
}

main()
  .catch((e) => {
    console.error('Error saat menjalankan seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Selalu putuskan koneksi prisma setelah selesai
    await prisma.$disconnect();
  });