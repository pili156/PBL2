import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/src/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/src/lib/jwt';
import { loginSchema } from '@/src/lib/validation';
import { checkRateLimit } from '@/src/lib/rate-limit';
import { logger } from '@/src/lib/logger';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed, remaining } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json({ error: "Terlalu banyak percobaan login. Silakan coba lagi dalam 1 menit." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { identifier, password } = parsed.data;

    if (identifier.includes('@') && !identifier.endsWith('@polines.ac.id')) {
      return NextResponse.json({ error: "Gagal: Gunakan email @polines.ac.id untuk login." }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { master_dosen: { nip: identifier } }
        ]
      },
      include: { 
        role: true, 
        master_dosen: true 
      }
    });

    if (!user || !user.password_hash) {
      return NextResponse.json({ error: "Kredensial tidak valid" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Kredensial tidak valid" }, { status: 401 });
    }

    const roleName = user.role?.nama_role;

    const statusAkun = user.status_akun?.toLowerCase(); 

    if (roleName === 'dosen' && (statusAkun === 'pending' || statusAkun === 'menunggu')) {
      return NextResponse.json({ error: "Akun Anda berstatus Pending. Silakan hubungi Admin untuk aktivasi." }, { status: 403 });
    }

    let targetUrl = "/user/dashboard";

    // --- BAGIAN YANG DIBENARKAN ---
    if (roleName === "master_admin") {
      targetUrl = "/master_admin/dashboard";
    } else if (roleName === "admin") {
      targetUrl = "/admin/dashboard";
    }
    // ------------------------------

    const token = signToken({
      userId: user.id,
      email: user.email || '',
      role: roleName || 'dosen',
      nama: user.master_dosen?.nama_lengkap || user.username || 'User',
    });

    const cookieName = `token_${roleName}`;

    const cookieStore = await cookies();

    // --- BAGIAN YANG DITAMBAHKAN: Menghapus cookie role lain yang mungkin tersisa di browser ---
    const allRoles = ['dosen', 'admin', 'master_admin'];
    for (const r of allRoles) {
      if (r !== roleName) {
        cookieStore.delete(`token_${r}`);
      }
    }
    // ----------------------------------------------------------------------------------------

    cookieStore.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 12 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({
      message: "Login berhasil",
      redirectUrl: targetUrl, 
      user: {
        id: user.id,
        email: user.email,
        role: roleName,
        nama: user.master_dosen?.nama_lengkap || user.username || "User"
      }
    }, { status: 200 });

  } catch (error) {
    logger.error("Login Error Catch:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}