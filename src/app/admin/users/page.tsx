import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Search, Filter } from 'lucide-react'

export default async function AdminUsersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: users } = await supabase
        .from('users')
        .select('*, cv_data(count)')
        .order('created_at', { ascending: false })
        .limit(100)

    const statusColors: Record<string, string> = {
        active: 'bg-emerald-500/20 text-emerald-400',
        trialing: 'bg-blue-500/20 text-blue-400',
        canceled: 'bg-red-500/20 text-red-400',
        past_due: 'bg-orange-500/20 text-orange-400',
        inactive: 'bg-zinc-700 text-zinc-400',
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
                <h1 className="text-2xl font-bold text-white">Kullanıcılar</h1>
                <p className="mt-1 text-sm text-zinc-500">
                    Tüm kayıtlı kullanıcılar ({users?.length ?? 0} kullanıcı)
                </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-zinc-900/50 overflow-hidden">
                {/* Tablo başlığı */}
                <div className="grid grid-cols-12 border-b border-white/5 px-6 py-3">
                    <div className="col-span-4 text-xs font-medium uppercase tracking-wide text-zinc-500">Kullanıcı</div>
                    <div className="col-span-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Durum</div>
                    <div className="col-span-2 text-center text-xs font-medium uppercase tracking-wide text-zinc-500">CV Sayısı</div>
                    <div className="col-span-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Deneme Bitiş</div>
                    <div className="col-span-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Kayıt Tarihi</div>
                </div>

                {/* Satırlar */}
                <div className="divide-y divide-white/5">
                    {users?.map((u) => {
                        const cvCount = Array.isArray(u.cv_data) ? u.cv_data.length : 0
                        return (
                            <div key={u.id} className="grid grid-cols-12 items-center px-6 py-3 hover:bg-white/2 transition-colors">
                                <div className="col-span-4 min-w-0">
                                    <p className="truncate text-sm font-medium text-white">
                                        {u.full_name ?? 'İsimsiz'}
                                    </p>
                                    <p className="truncate text-xs text-zinc-500">{u.email}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[u.subscription_status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                                        {statusLabels[u.subscription_status] ?? u.subscription_status}
                                    </span>
                                </div>
                                <div className="col-span-2 text-center text-sm text-zinc-400">{cvCount}</div>
                                <div className="col-span-2 text-xs text-zinc-500">
                                    {u.trial_end_date
                                        ? new Date(u.trial_end_date).toLocaleDateString('tr-TR')
                                        : '—'}
                                </div>
                                <div className="col-span-2 text-xs text-zinc-500">
                                    {new Date(u.created_at).toLocaleDateString('tr-TR')}
                                </div>
                            </div>
                        )
                    })}

                    {!users?.length && (
                        <div className="px-6 py-16 text-center text-sm text-zinc-600">
                            Kullanıcı bulunamadı
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
