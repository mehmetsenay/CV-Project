import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, Users, FileText, TrendingUp, Activity } from 'lucide-react'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim())
    if (!adminEmails.includes(user.email ?? '')) redirect('/dashboard')

    return (
        <div className="flex min-h-screen bg-zinc-950">
            {/* Sidebar */}
            <aside className="w-56 shrink-0 border-r border-white/5 bg-zinc-900/50">
                <div className="flex h-14 items-center gap-2 border-b border-white/5 px-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-indigo-600">
                        <Sparkles className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm font-bold text-white">
                        CV<span className="text-violet-400">AI</span>
                        <span className="ml-1 text-xs text-zinc-500">Admin</span>
                    </span>
                </div>

                <nav className="p-3 space-y-1">
                    {[
                        { href: '/admin', icon: Activity, label: 'Genel Bakış' },
                        { href: '/admin/users', icon: Users, label: 'Kullanıcılar' },
                        { href: '/admin/cvs', icon: FileText, label: 'CV\'ler' },
                        { href: '/admin/revenue', icon: TrendingUp, label: 'Gelir' },
                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}

                    <div className="my-2 border-t border-white/5" />

                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:text-zinc-400"
                    >
                        ← Dashboard'a dön
                    </Link>
                </nav>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-auto">
                <div className="mx-auto max-w-6xl p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
