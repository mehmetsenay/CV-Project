'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, LogOut, Settings, User } from 'lucide-react'
import { toast } from 'sonner'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { UserProfile } from '@/types/database'

interface DashboardNavbarProps {
    user: SupabaseUser
    profile: UserProfile | null
}

export default function DashboardNavbar({ user, profile }: DashboardNavbarProps) {
    const router = useRouter()

    async function handleLogout() {
        const supabase = createClient()
        await supabase.auth.signOut()
        toast.success('Çıkış yapıldı')
        router.push('/')
        router.refresh()
    }

    const statusColors: Record<string, string> = {
        active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        trialing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        canceled: 'bg-red-500/20 text-red-400 border-red-500/30',
        past_due: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        inactive: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
        unpaid: 'bg-red-500/20 text-red-400 border-red-500/30',
    }

    const statusLabels: Record<string, string> = {
        active: 'Pro',
        trialing: 'Deneme',
        canceled: 'İptal',
        past_due: 'Gecikmiş',
        inactive: 'Pasif',
        unpaid: 'Ödenmedi',
    }

    const status = profile?.subscription_status ?? 'inactive'

    return (
        <nav className="border-b border-white/5 bg-zinc-950/95 backdrop-blur-sm">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="font-bold text-white hidden sm:inline-block">
                        CV<span className="text-violet-400">AI</span>
                    </span>
                </Link>

                {/* Orta - Linkler */}
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                        CV'lerim
                    </Link>
                    <Link href="/dashboard/cv/new" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                        Yeni CV
                    </Link>
                    <Link href="/dashboard/jobs" className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" /> İş Bul
                    </Link>
                </div>

                {/* Sağ taraf */}
                <div className="flex items-center gap-3">
                    {/* Abonelik durumu */}
                    <span
                        className={`hidden rounded-full border px-2.5 py-0.5 text-xs font-medium sm:inline-flex ${statusColors[status]}`}
                    >
                        {statusLabels[status]}
                    </span>

                    {/* Kullanıcı adı */}
                    <span className="hidden text-sm text-zinc-500 sm:block">
                        {profile?.full_name ?? user.email}
                    </span>

                    <Link href="/dashboard/settings">
                        <Button variant="ghost" size="icon" className="text-zinc-500 hover:bg-white/5 hover:text-white">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </Link>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="text-zinc-500 hover:bg-white/5 hover:text-red-400"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </nav>
    )
}
