import { prisma } from '../src/lib/prisma'; 
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Memulai proses seeding...');

  // 1. Buat Master Role menggunakan upsert agar tidak duplikat
  const roleMaster = await prisma.masterRole.upsert({
    where: { id: 1 },
    update: { nama_role: 'master_admin' }, // Ubah menjadi master_admin
    create: { id: 1, nama_role: 'master_admin' },
  });

  const roleAdmin = await prisma.masterRole.upsert({
    where: { id: 2 },
    update: { nama_role: 'admin' },
    create: { id: 2, nama_role: 'admin' },
  });

  const roleUser = await prisma.masterRole.upsert({
    where: { id: 3 },
    update: { nama_role: 'user' }, // Sesuaikan dengan folder /user/dashboard
    create: { id: 3, nama_role: 'user' },
  });

  // (Opsional) Jika fitur register masih menggunakan role 'dosen', kita biarkan role ini tetap ada di ID 4
  const roleDosen = await prisma.masterRole.upsert({
    where: { id: 4 },
    update: { nama_role: 'dosen' },
    create: { id: 4, nama_role: 'dosen' },
  });

  // 2. Hash Password Default untuk semua akun (rahasia123)
  const hashedPassword = await bcrypt.hash('rahasia123', 10);

  // 3. Buat Akun Master Admin
  await prisma.user.upsert({
    where: { 
      email: 'master_admin@gmail.com' 
    },
    update: { role_id: roleMaster.id }, // Pastikan role update ke master_admin
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

  // 5. Buat Akun User Biasa
  await prisma.user.upsert({
    where: { 
      email: 'user@gmail.com' 
    },
    update: { role_id: roleUser.id },
    create: {
      username: 'User Biasa',
      email: 'user@gmail.com',
      password_hash: hashedPassword,
      role_id: roleUser.id,
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