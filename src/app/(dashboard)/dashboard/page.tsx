import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Sparkles, AlertCircle } from 'lucide-react'
import type { CVRecord } from '@/types/cv'
import type { UserProfile } from '@/types/database'

function CVCard({ cv }: { cv: CVRecord }) {
    const statusMap = {
        completed: { label: 'Tamamlandı', color: 'text-emerald-400 bg-emerald-500/10' },
        generating: { label: 'Üretiliyor...', color: 'text-blue-400 bg-blue-500/10' },
        scraping: { label: 'Analiz ediliyor...', color: 'text-amber-400 bg-amber-500/10' },
        pending: { label: 'Bekliyor', color: 'text-zinc-400 bg-zinc-500/10' },
        error: { label: 'Hata', color: 'text-red-400 bg-red-500/10' },
    }

    const statusInfo = statusMap[cv.status] ?? statusMap.pending

    return (
        <div className="group relative rounded-xl border border-white/5 bg-zinc-900/50 p-5 transition-all hover:border-white/10 hover:bg-zinc-900">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                        <FileText className="h-4 w-4 text-violet-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-medium text-white">{cv.title}</p>
                        <p className="text-xs text-zinc-600">
                            {new Date(cv.created_at).toLocaleDateString('tr-TR', {
                                day: 'numeric', month: 'long', year: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
                <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs ${statusInfo.color}`}>
                    {statusInfo.label}
                </span>
            </div>

            {cv.ats_score && (
                <div className="mt-4 flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-zinc-800">
                        <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all"
                            style={{ width: `${cv.ats_score}%` }}
                        />
                    </div>
                    <span className="text-xs text-zinc-500">ATS {cv.ats_score}/100</span>
                </div>
            )}

            {cv.status === 'completed' && (
                <div className="mt-4 flex gap-2">
                    <Link href={`/dashboard/cv/${cv.id}`}>
                        <Button size="sm" variant="outline" className="h-7 border-white/10 text-xs text-zinc-300 hover:bg-white/5">
                            Görüntüle
                        </Button>
                    </Link>
                    <Link href={`/dashboard/cv/${cv.id}/edit`}>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-zinc-500 hover:text-white">
                            Düzenle
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    )
}

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [{ data: cvList }, { data: profile }] = await Promise.all([
        supabase.from('cv_data').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('users').select('*').eq('id', user.id).single(),
    ])

    const userProfile = profile as UserProfile | null
    const isTrialing = userProfile?.subscription_status === 'trialing'
    const isActive = userProfile?.subscription_status === 'active'
    const canCreate = isTrialing || isActive

    // Deneme süresi
    let trialDaysLeft: number | null = null
    if (isTrialing && userProfile?.trial_end_date) {
        const diff = new Date(userProfile.trial_end_date).getTime() - Date.now()
        trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }

    return (
        <div>
            {/* Deneme uyarısı */}
            {isTrialing && trialDaysLeft !== null && trialDaysLeft <= 3 && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-400" />
                    <p className="text-sm text-amber-300">
                        Deneme süreniz <span className="font-bold">{trialDaysLeft} gün</span> içinde bitiyor.
                        Erişimini korumak için aboneliğe geç.
                    </p>
                    <Link href="/dashboard/settings" className="ml-auto flex-shrink-0">
                        <Button size="sm" className="bg-amber-500 text-black hover:bg-amber-400 h-7 text-xs">
                            Abonelik Al
                        </Button>
                    </Link>
                </div>
            )}

            {/* Başlık + Yeni CV */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Merhaba, {userProfile?.full_name?.split(' ')[0] ?? 'Kullanıcı'} 👋
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">CV'lerini yönet ve yeni başvurular oluştur.</p>
                </div>
                {canCreate && (
                    <Link href="/dashboard/cv/new">
                        <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500">
                            <Plus className="mr-2 h-4 w-4" />
                            Yeni CV
                        </Button>
                    </Link>
                )}
            </div>

            {/* CV Listesi */}
            {!cvList || cvList.length === 0 ? (
                // Boş durum
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10">
                        <Sparkles className="h-7 w-7 text-violet-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">İlk CV'ni oluştur</h2>
                    <p className="mt-2 max-w-sm text-sm text-zinc-500">
                        LinkedIn profilini ve başvurmak istediğin iş ilanını gir. AI sana özel bir CV üretsin.
                    </p>
                    {canCreate ? (
                        <Link href="/dashboard/cv/new" className="mt-6">
                            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                                <Plus className="mr-2 h-4 w-4" />
                                Yeni CV Oluştur
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/dashboard/settings" className="mt-6">
                            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                                Aboneliğe Başla
                            </Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {(cvList as CVRecord[]).map((cv) => (
                        <CVCard key={cv.id} cv={cv} />
                    ))}
                </div>
            )}
        </div>
    )
}
