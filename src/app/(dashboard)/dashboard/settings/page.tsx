import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckoutButton } from '@/components/stripe/CheckoutButton'
import { PortalButton } from '@/components/stripe/PortalButton'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('users')
        .select('subscription_status, subscription_end_date, trial_end_date')
        .eq('id', user.id)
        .single()

    const status = profile?.subscription_status || 'inactive'

    // Format dates visually
    const subEndDate = profile?.subscription_end_date ? new Date(profile.subscription_end_date).toLocaleDateString('tr-TR') : null
    const trialEndDate = profile?.trial_end_date ? new Date(profile.trial_end_date).toLocaleDateString('tr-TR') : null

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Hesap ve Abonelik Ayarları</h1>
                <p className="mt-1 text-sm text-zinc-400">Faturalandırma döngünüzü buradan yönetin.</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2">Abonelik Durumu</h2>

                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-zinc-400 w-32">Mevcut Durum:</span>
                    {status === 'active' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Aktif ($99 / Yıl)</span>
                    )}
                    {status === 'trialing' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">7 Gün Deneme Süresi</span>
                    )}
                    {(status === 'inactive' || status === 'canceled') && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">Abonelik Yok</span>
                    )}
                </div>

                {(status === 'active' || status === 'trialing') && subEndDate && (
                    <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm font-medium text-zinc-400 w-32">Yenilenme / Bitiş:</span>
                        <span className="text-sm text-white">{subEndDate}</span>
                    </div>
                )}

                {status === 'trialing' && trialEndDate && (
                    <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm font-medium text-zinc-400 w-32">Deneme Bitiş:</span>
                        <span className="text-sm text-amber-400">{trialEndDate}</span>
                    </div>
                )}

                <div className="pt-6 flex gap-4">
                    {status === 'active' ? (
                        <PortalButton />
                    ) : (
                        <>
                            <CheckoutButton />
                            {status === 'trialing' && <PortalButton />}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
