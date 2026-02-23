import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const response = NextResponse.next()

    // Supabase session yenileme (tüm route'lar için)
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Auth gerektiren rotalar
    const protectedPaths = ['/dashboard', '/admin']
    const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

    if (isProtected && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Admin route koruması
    if (pathname.startsWith('/admin')) {
        const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim())
        if (!user || !adminEmails.includes(user.email ?? '')) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return response
}

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*'],
}
