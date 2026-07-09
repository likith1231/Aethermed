import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_dev" });
  const path = req.nextUrl.pathname;

  console.log(`[Middleware] Path: ${path} | Token:`, token ? `Role: ${token.role}` : 'No token found');

  if (path.startsWith('/admin') && !path.startsWith('/admin/auth')) {
    if (!token || token.role !== 'admin') {
      console.log('[Middleware] Redirecting to /admin/auth');
      return NextResponse.redirect(new URL('/admin/auth', req.url));
    }
  }

  if (path.startsWith('/doctor') && !path.startsWith('/doctor/auth')) {
    if (!token || token.role !== 'doctor') {
      console.log('[Middleware] Redirecting to /doctor/auth');
      return NextResponse.redirect(new URL('/doctor/auth', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/doctor/:path*'],
};
