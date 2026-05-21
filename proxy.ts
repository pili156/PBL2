import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/src/lib/jwt';

const ROLE_DASHBOARD_MAP: Record<string, string> = {
  dosen: '/user/dashboard',
  admin_fakultas: '/admin/dashboard',
  master_admin: '/master_admin/dashboard',
  keuangan: '/keuangan/dashboard',
};

function getRedirectUrl(role: string): string {
  return ROLE_DASHBOARD_MAP[role] || '/login';
}

const PATH_ROLE_MAP: Record<string, string[]> = {
  '/user': ['dosen'],
  '/admin': ['admin_fakultas'],
  '/master_admin': ['master_admin'],
  '/keuangan': ['keuangan'],
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === '/login' ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/uploads/')
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const payload = verifyToken(token);

  if (!payload) {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('token');
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', String(payload.userId));
  requestHeaders.set('x-user-email', payload.email);
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-user-nama', payload.nama);

  if (!pathname.startsWith('/api/')) {
    for (const [prefix, allowedRoles] of Object.entries(PATH_ROLE_MAP)) {
      if (pathname.startsWith(prefix)) {
        if (!allowedRoles.includes(payload.role)) {
          const redirectUrl = new URL(getRedirectUrl(payload.role), request.url);
          return NextResponse.redirect(redirectUrl);
        }
        break;
      }
    }
  }

  if (pathname.startsWith('/api/')) {
    for (const [prefix, allowedRoles] of Object.entries(PATH_ROLE_MAP)) {
      if (pathname.startsWith(`/api${prefix}`)) {
        if (!allowedRoles.includes(payload.role)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        break;
      }
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/user/:path*',
    '/admin/:path*',
    '/master_admin/:path*',
    '/keuangan/:path*',
  ],
};
