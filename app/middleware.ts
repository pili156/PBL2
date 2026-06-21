// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Fungsi bantuan untuk mendecode JWT Payload di Edge Runtime (Mencegah error crypto NodeJS)
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. BYPASS RUTE PUBLIK (Penting agar fetch dari frontend tidak diblokir/error)
  if (
    pathname.startsWith('/api/jurusan') || 
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  // 1. Ambil semua token dari cookie dan tentukan token aktif
  const tokenMasterAdmin = request.cookies.get('token_master_admin')?.value;
  const tokenAdmin = request.cookies.get('token_admin')?.value;
  const tokenDosen = request.cookies.get('token_dosen')?.value;

  const activeToken = tokenMasterAdmin || tokenAdmin || tokenDosen;
  const activeRole = tokenMasterAdmin ? 'master_admin' : (tokenAdmin ? 'admin' : (tokenDosen ? 'dosen' : null));

  // 2. Cegah user yang sudah login kembali ke halaman Login/Register
  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    if (tokenMasterAdmin) return NextResponse.redirect(new URL('/master_admin/dashboard', request.url));
    if (tokenAdmin) return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    if (tokenDosen) return NextResponse.redirect(new URL('/user/dashboard', request.url));
    return NextResponse.next();
  }

  // 3. INJEKSI HEADER (Menyelesaikan Poin 10: x-user-id dan x-user-email)
  const requestHeaders = new Headers(request.headers);
  if (activeToken && activeRole) {
    const decoded = parseJwt(activeToken);
    if (decoded) {
      requestHeaders.set('x-user-role', activeRole);
      if (decoded.id) requestHeaders.set('x-user-id', decoded.id.toString());
      if (decoded.email) requestHeaders.set('x-user-email', decoded.email);
    }
  }

  // 4. PROTEKSI RUTE MASTER ADMIN
  if (pathname.startsWith('/master_admin') || pathname.startsWith('/api/master_admin')) {
    if (!tokenMasterAdmin) {
      if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 5. PROTEKSI RUTE ADMIN & API MASTER DATA
  const isAdminRoute = pathname.startsWith('/admin') || 
                       pathname.startsWith('/api/admin') || 
                       pathname.startsWith('/api/buku-induk') ||
                       pathname.startsWith('/api/master-') || // master-data, master-jabatan, master-pangkat, master-bank
                       pathname.startsWith('/api/export') ||
                       pathname.startsWith('/api/search');

  if (isAdminRoute) {
    const hasAccess = tokenAdmin || tokenMasterAdmin;
    if (!hasAccess) {
      if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 6. PROTEKSI RUTE USER / DOSEN
  const isUserRoute = pathname.startsWith('/user') || 
                      pathname.startsWith('/api/user') ||
                      pathname.startsWith('/api/pengajuan') ||
                      pathname.startsWith('/api/user-reimbursement') ||
                      pathname.startsWith('/api/notifications');

  if (isUserRoute) {
    // Memberikan kelonggaran bagi Admin/Master Admin untuk memanggil API tertentu jika dibutuhkan
    if (!tokenDosen && !tokenAdmin && !tokenMasterAdmin) { 
      if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Jaring Pengaman Terakhir untuk Rute API Apapun yang Tersisa
  if (pathname.startsWith('/api/')) {
    if (!activeToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Teruskan request yang valid beserta header yang sudah di-inject
  return NextResponse.next({ request: { headers: requestHeaders } });
}

// Menyelesaikan Poin 13: Menambahkan semua gerbang API yang bocor ke Matcher
export const config = {
  matcher: [
    '/master_admin/:path*', 
    '/admin/:path*', 
    '/user/:path*', 
    '/api/master_admin/:path*',
    '/api/admin/:path*',
    '/api/user/:path*',
    '/api/buku-induk/:path*',
    '/api/pengajuan/:path*',
    '/api/user-reimbursement/:path*',
    '/api/master-data/:path*',
    '/api/master-jabatan/:path*',
    '/api/master-pangkat/:path*',
    '/api/master-bank/:path*',
    '/api/export/:path*',
    '/api/search/:path*',
    '/api/notifications/:path*',
    '/api/jurusan/:path*', 
    '/api/auth/:path*',    
    '/login',
    '/register',
    '/'
  ],
};