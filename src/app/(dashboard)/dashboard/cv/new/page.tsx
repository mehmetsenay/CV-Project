'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
} from 'lucide-react'
import { toast } from 'sonner'

type ScrapeStatus = 'idle' | 'starting' | 'scraping' | 'generating' | 'done' | 'error'

interface Step {
    label: string
    status: 'waiting' | 'loading' | 'done' | 'error'
}

export default function NewCVPage() {
    const router = useRouter()
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
                toast.error('CV üretimi başarısız', { description: data.error })
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

    useEffect(() => {
        return () => {
            if (pollingRef.current?.interval) {
                clearInterval(pollingRef.current.interval)
            }
        }
    }, [])

    const isProcessing = scrapeStatus !== 'idle' && scrapeStatus !== 'error'

    return (
        <div className="mx-auto max-w-2xl">
            {/* Başlık */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Yeni CV Oluştur</h1>
                <p className="mt-1 text-sm text-zinc-500">
                    LinkedIn profil URL'ini ve başvurmak istediğin iş ilanını gir.
                    AI sana özel bir CV üretsin.
                </p>
            </div>

            {/* Form */}
            {scrapeStatus === 'idle' || scrapeStatus === 'error' ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6">
                        <div className="space-y-4">
                            {/* CV Başlığı */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                                    CV Başlığı
                                </label>
                                <Input
                                    type="text"
                                    placeholder="örn. Frontend Developer @ Google"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600"
                                />
                            </div>

                            {/* LinkedIn Profil URL */}
                            <div>
                                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-zinc-300">
                                    <Linkedin className="h-4 w-4 text-blue-400" />
                                    LinkedIn Profil URL
                                </label>
                                <Input
                                    type="url"
                                    placeholder="https://linkedin.com/in/kullanici-adi"
                                    value={linkedinUrl}
                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                    required
                                    className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus:border-blue-500"
                                />
                                <p className="mt-1 text-xs text-zinc-600">
                                    Profilin herkese açık (public) olmalı
                                </p>
                            </div>

                            {/* İş İlanı URL */}
                            <div>
                                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-zinc-300">
                                    <Briefcase className="h-4 w-4 text-violet-400" />
                                    LinkedIn İş İlanı URL
                                </label>
                                <Input
                                    type="url"
                                    placeholder="https://linkedin.com/jobs/view/1234567890"
                                    value={jobUrl}
                                    onChange={(e) => setJobUrl(e.target.value)}
                                    required
                                    className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus:border-violet-500"
                                />
                            </div>
                        </div>
                    </div>

                    {scrapeStatus === 'error' && (
                        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
                            <p className="text-sm text-red-300">
                                Bir hata oluştu. URL'lerinizi kontrol edip tekrar deneyin.
                            </p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-base text-white hover:from-violet-500 hover:to-indigo-500"
                    >
                        CV Oluştur
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </form>
            ) : (
                /* Progress ekranı */
                <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-8">
                    <div className="text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
                            {scrapeStatus === 'done' ? (
                                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                            ) : (
                                <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                            )}
                        </div>

                        <h2 className="text-lg font-semibold text-white">
                            {scrapeStatus === 'starting' && 'Başlatılıyor...'}
                            {scrapeStatus === 'scraping' && 'Veriler analiz ediliyor...'}
                            {scrapeStatus === 'generating' && 'AI CV yazıyor...'}
                            {scrapeStatus === 'done' && 'CV hazır! 🎉'}
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500">
                            Bu işlem 1-3 dakika sürebilir, lütfen bekleyin.
                        </p>
                    </div>

                    {/* Adımlar */}
                    <div className="mt-8 space-y-3">
                        {steps.map((step, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 rounded-xl bg-zinc-800/50 px-4 py-3"
                            >
                                {step.status === 'waiting' && (
                                    <div className="h-5 w-5 rounded-full border-2 border-zinc-700" />
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
                                <span
                                    className={`text-sm ${step.status === 'done'
                                            ? 'text-emerald-400'
                                            : step.status === 'error'
                                                ? 'text-red-400'
                                                : step.status === 'loading'
                                                    ? 'text-white'
                                                    : 'text-zinc-600'
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
