'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Linkedin,
    Briefcase,
    ArrowRight,
    Loader2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'

type ScrapeStatus = 'idle' | 'starting' | 'scraping' | 'generating' | 'done' | 'error'

interface Step {
    label: string
    status: 'waiting' | 'loading' | 'done' | 'error'
}

export default function NewCVPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [linkedinUrl, setLinkedinUrl] = useState('')
    const [jobUrl, setJobUrl] = useState('')
    const [title, setTitle] = useState('')
    const [scrapeStatus, setScrapeStatus] = useState<ScrapeStatus>('idle')
    const [steps, setSteps] = useState<Step[]>([
        { label: 'LinkedIn profili analiz ediliyor...', status: 'waiting' },
        { label: 'İş ilanı analiz ediliyor...', status: 'waiting' },
        { label: 'AI ile CV üretiliyor...', status: 'waiting' },
    ])

    const pollingRef = useRef<{
        profileRunId: string
        jobRunId: string
        cvId: string
        interval: NodeJS.Timeout | null
    } | null>(null)

    function updateStep(index: number, status: Step['status']) {
        setSteps((prev) =>
            prev.map((s, i) => (i === index ? { ...s, status } : s))
        )
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setScrapeStatus('starting')
        updateStep(0, 'loading')
        updateStep(1, 'loading')

        try {
            const res = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ linkedinUrl, jobUrl, title: title || 'Yeni CV' }),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error('Hata', { description: data.error })
                setScrapeStatus('error')
                updateStep(0, 'error')
                updateStep(1, 'error')
                return
            }

            setScrapeStatus('scraping')
            pollingRef.current = {
                profileRunId: data.profileRunId,
                jobRunId: data.jobRunId,
                cvId: data.cvId,
                interval: null,
            }

            // Her 4 saniyede bir polling
            const interval = setInterval(() => pollStatus(), 4000)
            pollingRef.current.interval = interval
            pollStatus()
        } catch {
            toast.error('Bağlantı hatası')
            setScrapeStatus('error')
        }
    }

    async function pollStatus() {
        if (!pollingRef.current) return
        const { profileRunId, jobRunId, cvId } = pollingRef.current

        try {
            // Her iki run'ı paralel sorgula
            const [profileRes, jobRes] = await Promise.all([
                fetch(`/api/scrape/status/${profileRunId}?type=profile&cvId=${cvId}&otherRunId=${jobRunId}`),
                fetch(`/api/scrape/status/${jobRunId}?type=job&cvId=${cvId}&otherRunId=${profileRunId}`),
            ])

            const [profileData, jobData] = await Promise.all([
                profileRes.json(),
                jobRes.json(),
            ])

            // Profil durumu
            if (profileData.status === 'SUCCEEDED' || profileData.status === 'BOTH_DONE') {
                updateStep(0, 'done')
            } else if (profileData.status === 'FAILED') {
                updateStep(0, 'error')
            }

            // İş ilanı durumu
            if (jobData.status === 'SUCCEEDED' || jobData.status === 'BOTH_DONE') {
                updateStep(1, 'done')
            } else if (jobData.status === 'FAILED') {
                updateStep(1, 'error')
            }

            // İkisi de tamam → CV üretimine geç
            if (
                (profileData.status === 'BOTH_DONE' || jobData.status === 'BOTH_DONE') ||
                (profileData.status === 'SUCCEEDED' && jobData.status === 'SUCCEEDED')
            ) {
                if (pollingRef.current?.interval) {
                    clearInterval(pollingRef.current.interval)
                }
                updateStep(2, 'loading')
                setScrapeStatus('generating')
                await generateCV(cvId)
            }

            // Hata durumu
            if (profileData.status === 'FAILED' && jobData.status === 'FAILED') {
                if (pollingRef.current?.interval) clearInterval(pollingRef.current.interval)
                setScrapeStatus('error')
                toast.error('Scraping başarısız', {
                    description: 'Lütfen URL\'lerinizi kontrol edin ve tekrar deneyin.',
                })
            }
        } catch (err) {
            console.error('Polling hatası:', err)
        }
    }

    async function generateCV(cvId: string) {
        try {
            const res = await fetch('/api/generate-cv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cvId }),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error('CV üretimi başarısız', { description: data.detail || data.error })
                updateStep(2, 'error')
                setScrapeStatus('error')
                return
            }

            updateStep(2, 'done')
            setScrapeStatus('done')
            toast.success('CV hazır! 🎉')

            setTimeout(() => {
                router.push(`/dashboard/cv/${cvId}`)
            }, 1500)
        } catch {
            updateStep(2, 'error')
            setScrapeStatus('error')
            toast.error('CV üretimi sırasında bir hata oluştu')
        }
    }

    // İş ilanları sayfasından gelen jobUrl query param'ını otomatik doldur
    useEffect(() => {
        const jobUrlParam = searchParams.get('jobUrl')
        if (jobUrlParam) {
            setJobUrl(decodeURIComponent(jobUrlParam))
        }
    }, [searchParams])

    useEffect(() => {
        return () => {
            if (pollingRef.current?.interval) {
                clearInterval(pollingRef.current.interval)
            }
        }
    }, [])

    const isProcessing = scrapeStatus !== 'idle' && scrapeStatus !== 'error'

    return (
        <div className="mx-auto max-w-2xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Ortam Glow Efekti (Arkaplan için) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            {/* Başlık */}
            <div className="mb-10 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-white/10 shadow-xl backdrop-blur-xl">
                    <Sparkles className="h-8 w-8 text-violet-400" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-3">Yeni CV Oluştur</h1>
                <p className="text-base text-zinc-400 max-w-md mx-auto leading-relaxed">
                    LinkedIn profilinizi ve başvurmak istediğiniz iş ilanını girin.
                    AI saniyeler içinde size özel ATS uyumlu bir CV üretsin.
                </p>
            </div>

            {/* Form */}
            {scrapeStatus === 'idle' || scrapeStatus === 'error' ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl overflow-hidden group">
                        {/* Hover Gradient Edge */}
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="space-y-6 relative z-10">
                            {/* CV Başlığı */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300 ml-1">
                                    CV Başlığı
                                </label>
                                <Input
                                    type="text"
                                    placeholder="örn. Frontend Developer @ Google"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="h-12 rounded-xl border-white/10 bg-black/50 px-4 text-white placeholder:text-zinc-600 focus:border-violet-500 focus:bg-white/5 transition-colors shadow-inner"
                                />
                            </div>

                            {/* LinkedIn Profil URL */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 ml-1">
                                    <Linkedin className="h-4 w-4 text-blue-400" />
                                    LinkedIn Profil URL
                                </label>
                                <Input
                                    type="url"
                                    placeholder="https://linkedin.com/in/kullanici-adi"
                                    value={linkedinUrl}
                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                    required
                                    className="h-12 rounded-xl border-white/10 bg-black/50 px-4 text-white placeholder:text-zinc-600 focus:border-blue-500 focus:bg-white/5 transition-colors shadow-inner"
                                />
                                <p className="ml-1 text-xs text-zinc-500">
                                    Profilin herkese açık (public) olmalı
                                </p>
                            </div>

                            {/* İş İlanı URL */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 ml-1">
                                    <Briefcase className="h-4 w-4 text-violet-400" />
                                    LinkedIn İş İlanı URL
                                </label>
                                <Input
                                    type="url"
                                    placeholder="https://linkedin.com/jobs/view/1234567890"
                                    value={jobUrl}
                                    onChange={(e) => setJobUrl(e.target.value)}
                                    required
                                    className="h-12 rounded-xl border-white/10 bg-black/50 px-4 text-white placeholder:text-zinc-600 focus:border-violet-500 focus:bg-white/5 transition-colors shadow-inner"
                                />
                            </div>
                        </div>
                    </div>

                    {scrapeStatus === 'error' && (
                        <div className="flex items-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 shadow-lg shadow-red-500/5 backdrop-blur-md animate-in slide-in-from-top-2">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20 border border-red-500/30">
                                <AlertCircle className="h-5 w-5 text-red-400" />
                            </div>
                            <p className="text-sm text-red-300">
                                Bir hata oluştu. URL'lerinizi kontrol edip tekrar deneyin.
                            </p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="group relative w-full h-14 overflow-hidden rounded-2xl bg-white text-zinc-950 hover:bg-zinc-200 transition-all text-lg font-semibold shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                    >
                        <span className="relative flex items-center justify-center gap-2">
                            Sihri Başlat
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </span>
                    </Button>
                </form>
            ) : (
                /* Progress ekranı */
                <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-10 backdrop-blur-xl shadow-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2"></div>

                    <div className="text-center relative z-10">
                        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-white/10 shadow-2xl backdrop-blur-xl">
                            {scrapeStatus === 'done' ? (
                                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                            ) : (
                                <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
                            )}
                        </div>

                        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                            {scrapeStatus === 'starting' && 'Makineler Isınıyor...'}
                            {scrapeStatus === 'scraping' && 'Veriler Analiz Ediliyor...'}
                            {scrapeStatus === 'generating' && 'AI CV\'nizi Yazıyor...'}
                            {scrapeStatus === 'done' && 'CV Hazır! 🎉'}
                        </h2>
                        <p className="text-base text-zinc-400 max-w-sm mx-auto">
                            Bu işlem 1-3 dakika sürebilir, lütfen sayfadan ayrılmayın.
                        </p>
                    </div>

                    {/* Adımlar */}
                    <div className="mt-10 space-y-4 relative z-10">
                        {steps.map((step, i) => (
                            <div
                                key={i}
                                className="group flex items-center gap-4 rounded-2xl bg-black/40 border border-white/5 px-5 py-4 transition-colors hover:bg-black/60"
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10">
                                    {step.status === 'waiting' && (
                                        <div className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
                                    )}
                                    {step.status === 'loading' && (
                                        <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
                                    )}
                                    {step.status === 'done' && (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                    )}
                                    {step.status === 'error' && (
                                        <XCircle className="h-5 w-5 text-red-400" />
                                    )}
                                </div>
                                <span
                                    className={`font-medium text-base ${step.status === 'done'
                                        ? 'text-emerald-400'
                                        : step.status === 'error'
                                            ? 'text-red-400'
                                            : step.status === 'loading'
                                                ? 'text-white'
                                                : 'text-zinc-500'
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
