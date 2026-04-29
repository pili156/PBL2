import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

// Inisialisasi adapter untuk Prisma 7
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Memulai proses seeding...');

  const roles = [
    { id: 1, nama_role: 'Dosen' },
    { id: 2, nama_role: 'Admin' },
  ];

  for (const role of roles) {
    await prisma.masterRole.upsert({
      where: { id: role.id },
      update: {},
      create: role,
    });
  }

  console.log('✅ Seed data MasterRole berhasil dimasukkan!');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });