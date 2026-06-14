// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ambil semua token dari cookie
  const tokenMasterAdmin = request.cookies.get('token_master_admin')?.value;
  const tokenAdmin = request.cookies.get('token_admin')?.value;
  const tokenDosen = request.cookies.get('token_dosen')?.value;

  // 2. Cegah user yang sudah login kembali ke halaman Login/Register
  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    if (tokenMasterAdmin) return NextResponse.redirect(new URL('/master_admin/dashboard', request.url));
    if (tokenAdmin) return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    if (tokenDosen) return NextResponse.redirect(new URL('/user/dashboard', request.url));
    return NextResponse.next();
  }

  // 3. PROTEKSI RUTE MASTER ADMIN (Hanya token_master_admin yang boleh masuk)
  if (pathname.startsWith('/master_admin') || pathname.startsWith('/api/master_admin')) {
    if (!tokenMasterAdmin) {
      if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Suntikkan header role untuk dibaca oleh API backend (Solusi Poin 5)
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-role', 'master_admin');
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 4. PROTEKSI RUTE ADMIN & API UMUM (Buku Induk, dll)
  // Master Admin ATAU Admin boleh mengakses rute ini
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin') || pathname.startsWith('/api/buku-induk')) {
    const hasAccess = tokenAdmin || tokenMasterAdmin;
    
    if (!hasAccess) {
      if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Tentukan siapa yang sedang mengakses (untuk di-inject ke header)
    const activeRole = tokenMasterAdmin ? 'master_admin' : 'admin';
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-role', activeRole);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 5. PROTEKSI RUTE USER / DOSEN
  if (pathname.startsWith('/user') || pathname.startsWith('/api/user')) {
    if (!tokenDosen) {
      if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-role', 'dosen');
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

// Tentukan rute mana saja yang akan dijaga oleh middleware ini
export const config = {
  matcher: [
    '/master_admin/:path*', 
    '/admin/:path*', 
    '/user/:path*', 
    '/api/master_admin/:path*',
    '/api/admin/:path*',
    '/api/user/:path*',
    '/api/buku-induk/:path*',
    '/login',
    '/register',
    '/'
  ],
};