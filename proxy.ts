import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Kita cek apakah ada cookie session
  const session = request.cookies.get('session')?.value

  // Jika tidak ada session (belum login), dan mencoba masuk ke halaman utama atau admin
  if (!session && (path === '/' || path.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Jika sudah login tapi malah mencoba buka halaman login
  if (session && path === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/admin/:path*', '/login'],
}
