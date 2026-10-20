import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Retrieve auth cookies
  const roleCookie = request.cookies.get('careerpath-role')?.value?.toLowerCase();
  const tokenCookie = request.cookies.get('careerpath-token')?.value;

  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = pathname === '/login' || pathname === '/register';
  
  // Student protected features
  const isStudentOnlyRoute = 
    pathname.startsWith('/akademik') ||
    pathname.startsWith('/riasec') ||
    pathname.startsWith('/rekomendasi') ||
    pathname.startsWith('/profile');

  // 1. Enforce strict Admin route protection
  if (isAdminRoute) {
    if (!tokenCookie || roleCookie !== 'admin') {
      // If student or unauthenticated, block and redirect immediately at HTTP level
      const redirectUrl = tokenCookie ? '/' : '/login';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // 2. Prevent Admin from accessing student assessment flow
  if (isStudentOnlyRoute && roleCookie === 'admin') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // 3. Prevent unauthenticated access to student protected features
  if (isStudentOnlyRoute && !tokenCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. Redirect logged-in users away from auth pages (/login, /register)
  if (isAuthRoute && tokenCookie) {
    if (roleCookie === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/akademik/:path*',
    '/riasec/:path*',
    '/rekomendasi/:path*',
    '/profile/:path*',
    '/login',
    '/register'
  ]
};
