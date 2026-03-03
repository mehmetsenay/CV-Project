import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Sparkles, AlertCircle, ArrowRight } from 'lucide-react'
import type { CVRecord } from '@/types/cv'
import type { UserProfile } from '@/types/database'
import { ShineBorder } from '@/components/ui/shine-border'

function CVCard({ cv }: { cv: CVRecord & { shareable_links?: { view_count: number }[] } }) {
    const statusMap = {
        completed: { label: 'Tamamlandı', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
        generating: { label: 'Üretiliyor...', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
        scraping: { label: 'Analiz ediliyor...', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
        pending: { label: 'Bekliyor', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' },
        error: { label: 'Hata', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
    }

    const statusInfo = statusMap[cv.status] ?? statusMap.pending

    // Toplam Görüntülenme Sayısı
    const totalViews = cv.shareable_links?.reduce((acc, link) => acc + (link.view_count || 0), 0) || 0

    return (
        <div className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/50 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/20">
            <ShineBorder
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                borderWidth={1.5}
                duration={10}
            />

            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-all duration-500 -z-10 translate-x-1/2 -translate-y-1/2"></div>

            <div className="flex items-start justify-between gap-3 relative z-10 w-full">
                <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-white/10 shadow-inner group-hover:scale-105 transition-transform duration-300">
                        <FileText className="h-5 w-5 text-violet-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-white tracking-tight text-lg group-hover:text-violet-200 transition-colors">{cv.title}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            {new Date(cv.created_at).toLocaleDateString('tr-TR', {
                                day: 'numeric', month: 'long', year: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`flex-shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                    </span>
                    {totalViews > 0 && (
                        <span className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                            👁️ {totalViews} Kez Görüldü
                        </span>
                    )}
                </div>
            </div>

            {cv.ats_score && (
                <div className="mt-5 flex items-center gap-3 relative z-10 w-full">
                    <div className="h-2 flex-1 rounded-full bg-black/50 border border-white/5 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-400 transition-all duration-1000 ease-out"
                            style={{ width: `${cv.ats_score}%` }}
                        />
                    </div>
                    <span className="text-xs font-semibold text-zinc-300">ATS %{cv.ats_score}</span>
                </div>
            )}

            {cv.status === 'completed' && (
                <div className="mt-6 flex gap-3 relative z-10 w-full">
                    <Link href={`/dashboard/cv/${cv.id}`} className="flex-1">
                        <Button size="sm" className="w-full h-9 bg-white text-black hover:bg-zinc-200 transition-colors font-semibold">
                            Görüntüle
                        </Button>
                    </Link>
                    <Link href={`/dashboard/cv/${cv.id}/edit`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full h-9 border-white/10 bg-transparent text-white hover:bg-white/10 transition-colors">
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
        supabase.from('cv_data').select('*, shareable_links(view_count)').eq('user_id', user.id).order('created_at', { ascending: false }),
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Deneme uyarısı */}
            {isTrialing && trialDaysLeft !== null && trialDaysLeft <= 3 && (
                <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-lg shadow-amber-500/5 backdrop-blur-md">
                    <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-amber-500/20 blur-3xl"></div>
                    <div className="relative flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30">
                            <AlertCircle className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-amber-200">
                                Deneme süreniz <span className="font-bold text-amber-400">{trialDaysLeft} gün</span> içinde bitiyor.
                            </p>
                            <p className="text-xs text-amber-400/80 mt-0.5">Erişimini korumak için bugün aboneliğe geçin.</p>
                        </div>
                        <Link href="/dashboard/settings" className="ml-auto shrink-0">
                            <Button className="bg-amber-400 text-black shadow-lg shadow-amber-500/20 hover:bg-amber-500 font-semibold px-6">
                                Planı Yükselt
                            </Button>
                        </Link>
                    </div>
                </div>
            )}

            {/* Başlık + Yeni CV */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        Merhaba, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">{userProfile?.full_name?.split(' ')[0] ?? 'Kullanıcı'}</span> 👋
                    </h1>
                    <p className="text-base text-zinc-400">CV'lerini yönet ve yeni başvurular oluştur.</p>
                </div>
                {canCreate && (
                    <Link href="/dashboard/cv/new">
                        <Button className="group bg-white text-zinc-950 hover:bg-zinc-200 transition-all font-semibold h-11 px-6 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                            <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
                            Yeni CV Oluştur
                        </Button>
                    </Link>
                )}
            </div>

            {/* CV Listesi */}
            {!cvList || cvList.length === 0 ? (
                // Premium Boş Durum
                <div className="relative flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 py-32 text-center backdrop-blur-xl overflow-hidden shadow-2xl group">
                    {/* Arka plan efektleri */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/20 blur-[120px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-violet-600/30" />

                    <div className="relative z-10 mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-white/10 shadow-2xl backdrop-blur-xl transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <Sparkles className="h-12 w-12 text-violet-400" />
                    </div>
                    <h2 className="relative z-10 text-3xl font-bold tracking-tight text-white mb-4">İlk CV'nizi Oluşturun</h2>
                    <p className="relative z-10 max-w-md text-base text-zinc-400 mb-10 leading-relaxed">
                        LinkedIn profilinizi ve başvurmak istediğiniz iş ilanını sisteme girin. AI saniyeler içinde ATS uyumlu kusursuz bir CV üretsin.
                    </p>
                    {canCreate ? (
                        <Link href="/dashboard/cv/new" className="relative z-10">
                            <Button className="group relative h-12 overflow-hidden rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 transition-all text-base font-semibold px-8 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                                <span className="relative flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-violet-600" />
                                    Sihri Başlat
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </span>
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/dashboard/settings" className="relative z-10">
                            <Button className="group h-12 bg-white text-zinc-950 font-semibold px-8 hover:bg-zinc-200 transition-all rounded-xl">
                                Aboneliğe Başla
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {(cvList as CVRecord[]).map((cv) => (
                        <CVCard key={cv.id} cv={cv} />
                    ))}
                </div>
            )}
        </div>
    )
}
