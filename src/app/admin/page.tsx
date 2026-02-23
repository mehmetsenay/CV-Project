import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
    Users,
    FileText,
    TrendingUp,
    Activity,
    CheckCircle2,
    AlertCircle,
    Clock,
} from 'lucide-react'

function StatCard({
    icon: Icon,
    label,
    value,
    sub,
    color = 'violet',
}: {
    icon: React.ElementType
    label: string
    value: string | number
    sub?: string
    color?: 'violet' | 'emerald' | 'blue' | 'amber'
}) {
    const colors = {
        violet: 'bg-violet-500/10 text-violet-400',
        emerald: 'bg-emerald-500/10 text-emerald-400',
        blue: 'bg-blue-500/10 text-blue-400',
        amber: 'bg-amber-500/10 text-amber-400',
    }

    return (
        <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-5">
            <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${colors[color]}`}>
                <Icon className="h-4.5 w-4.5" />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="mt-0.5 text-sm text-zinc-500">{label}</div>
            {sub && <div className="mt-1 text-xs text-zinc-600">{sub}</div>}
        </div>
    )
}

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // İstatistikleri paralel çek
    const [
        { count: totalUsers },
        { count: activeUsers },
        { count: trialingUsers },
        { count: totalCVs },
        { count: completedCVs },
        { data: recentUsers },
    ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('subscription_status', 'trialing'),
        supabase.from('cv_data').select('*', { count: 'exact', head: true }),
        supabase.from('cv_data').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase
            .from('users')
            .select('id, email, full_name, subscription_status, created_at')
            .order('created_at', { ascending: false })
            .limit(10),
    ])

    const statusColors: Record<string, string> = {
        active: 'bg-emerald-500/20 text-emerald-400',
        trialing: 'bg-blue-500/20 text-blue-400',
        canceled: 'bg-red-500/20 text-red-400',
        past_due: 'bg-orange-500/20 text-orange-400',
        inactive: 'bg-zinc-500/20 text-zinc-500',
        unpaid: 'bg-red-500/20 text-red-400',
    }

    const statusLabels: Record<string, string> = {
        active: 'Aktif',
        trialing: 'Deneme',
        canceled: 'İptal',
        past_due: 'Gecikmiş',
        inactive: 'Pasif',
        unpaid: 'Ödenmedi',
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Genel Bakış</h1>
                <p className="mt-1 text-sm text-zinc-500">
                    CVAI uygulaması anlık istatistikleri
                </p>
            </div>

            {/* İstatistik Kartları */}
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard
                    icon={Users}
                    label="Toplam Kullanıcı"
                    value={totalUsers ?? 0}
                    color="violet"
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Aktif Aboneler"
                    value={activeUsers ?? 0}
                    sub={`${trialingUsers ?? 0} deneme`}
                    color="emerald"
                />
                <StatCard
                    icon={FileText}
                    label="Toplam CV"
                    value={totalCVs ?? 0}
                    sub={`${completedCVs ?? 0} tamamlandı`}
                    color="blue"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Aylık Gelir (est.)"
                    value={`$${((activeUsers ?? 0) * 99 / 12).toFixed(0)}`}
                    sub="$99/yıl × aktif"
                    color="amber"
                />
            </div>

            {/* Son Kayıt Olan Kullanıcılar */}
            <div className="rounded-2xl border border-white/5 bg-zinc-900/50 overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                    <h2 className="font-semibold text-white">Son Kullanıcılar</h2>
                    <span className="text-xs text-zinc-600">Son 10 kayıt</span>
                </div>

                <div className="divide-y divide-white/5">
                    {recentUsers && recentUsers.length > 0 ? (
                        recentUsers.map((u) => (
                            <div key={u.id} className="flex items-center justify-between px-6 py-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-white">
                                        {u.full_name ?? 'İsimsiz'}
                                    </p>
                                    <p className="truncate text-xs text-zinc-500">{u.email}</p>
                                </div>
                                <div className="ml-4 flex items-center gap-3">
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[u.subscription_status] ?? 'bg-zinc-700 text-zinc-400'}`}
                                    >
                                        {statusLabels[u.subscription_status] ?? u.subscription_status}
                                    </span>
                                    <span className="text-xs text-zinc-600">
                                        {new Date(u.created_at).toLocaleDateString('tr-TR')}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-6 py-12 text-center">
                            <Clock className="mx-auto mb-2 h-8 w-8 text-zinc-700" />
                            <p className="text-sm text-zinc-600">Henüz kullanıcı yok</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
