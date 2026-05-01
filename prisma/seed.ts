import { prisma } from '../src/lib/prisma'; 
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Memulai proses seeding...');

  // 1. Buat 3 Master Role utama menggunakan upsert
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
    update: { nama_role: 'dosen' }, // ID 3 sekarang resmi milik Dosen
    create: { id: 3, nama_role: 'dosen' },
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

  console.log('Seed berhasil! 3 Role (Master Admin, Admin, Dosen) dan Akun Default telah siap digunakan.');
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