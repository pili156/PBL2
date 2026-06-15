import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, type JwtPayload } from '@/src/lib/jwt';

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
  '/buku-induk': ['admin_fakultas'],
};

const ROLE_TO_COOKIE: Record<string, string> = {
  dosen: 'token_dosen',
  admin_fakultas: 'token_admin_fakultas',
  master_admin: 'token_master_admin',
  keuangan: 'token_keuangan',
};

const ALL_TOKEN_COOKIES = Object.values(ROLE_TO_COOKIE);

function findToken(request: NextRequest, allowedRoles: string[]): { token: string; payload: JwtPayload } | null {
  for (const role of allowedRoles) {
    const cookieName = ROLE_TO_COOKIE[role];
    const token = request.cookies.get(cookieName)?.value;
    if (token) {
      const payload = verifyToken(token);
      if (payload) return { token, payload };
    }
  }
  return null;
}

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

  let allowedRoles: string[] = [];
  let matchedPrefix = '';

  for (const [prefix, roles] of Object.entries(PATH_ROLE_MAP)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(`/api${prefix}`)) {
      allowedRoles = roles;
      matchedPrefix = prefix;
      break;
    }
  }

  if (allowedRoles.length === 0) {
    allowedRoles = Object.keys(ROLE_TO_COOKIE);
  }

  const found = findToken(request, allowedRoles);

  if (!found) {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    for (const cookieName of ALL_TOKEN_COOKIES) {
      response.cookies.delete(cookieName);
    }
    return response;
  }

  const { payload } = found;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', String(payload.userId));
  requestHeaders.set('x-user-email', payload.email);
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-user-nama', payload.nama);

  if (!pathname.startsWith('/api/') && matchedPrefix) {
    if (!allowedRoles.includes(payload.role)) {
      const redirectUrl = new URL(getRedirectUrl(payload.role), request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (pathname.startsWith('/api/') && matchedPrefix) {
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
