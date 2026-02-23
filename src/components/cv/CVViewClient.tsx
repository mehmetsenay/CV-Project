'use client'

import { useState } from 'react'
import Link from 'next/link'
import CVRenderer from '@/components/cv/CVRenderer'
import type { CVData } from '@/types/cv'
import { Button } from '@/components/ui/button'
import {
    Download,
    Share2,
    Edit2,
    ArrowLeft,
    CheckCircle2,
    Target,
} from 'lucide-react'
import { toast } from 'sonner'

interface CVViewClientProps {
    cv: {
        id: string
        title: string
        ats_score: number | null
        ai_tailored_cv_json: CVData
    }
    shareSlug?: string
}

export default function CVViewClient({ cv, shareSlug }: CVViewClientProps) {
    const [creating, setCreating] = useState(false)
    const [slug, setSlug] = useState(shareSlug ?? '')

    async function handleCreateLink() {
        setCreating(true)
        try {
            const res = await fetch('/api/links/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cvId: cv.id }),
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error('Link oluşturulamadı', { description: data.error })
                return
            }
            setSlug(data.slug)
            const link = `${window.location.origin}/cv/${data.slug}`
            await navigator.clipboard.writeText(link)
            toast.success('Link kopyalandı! 🎉', {
                description: 'Recruiter\'a gönderebilirsin.',
            })
        } finally {
            setCreating(false)
        }
    }

    function handleCopyLink() {
        const link = `${window.location.origin}/cv/${slug}`
        navigator.clipboard.writeText(link)
        toast.success('Link kopyalandı!')
    }

    function handlePrint() {
        window.print()
    }

    const atsScore = cv.ats_score ?? cv.ai_tailored_cv_json?.ats_score ?? 0
    const matchedKeywords = cv.ai_tailored_cv_json?.matched_keywords ?? []

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Üst bar — sadece ekranda görünür, baskıda yok */}
            <div className="no-print sticky top-0 z-10 border-b border-white/5 bg-zinc-950/95 backdrop-blur-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-sm font-semibold text-white">{cv.title}</h1>
                            {atsScore > 0 && (
                                <p className="text-xs text-zinc-500">ATS Skoru: {atsScore}/100</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={`/dashboard/cv/${cv.id}/edit`}>
                            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-1.5">
                                <Edit2 className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Düzenle</span>
                            </Button>
                        </Link>

                        {slug ? (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCopyLink}
                                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 gap-1.5"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Linki Kopyala</span>
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCreateLink}
                                disabled={creating}
                                className="border-white/10 text-zinc-300 hover:bg-white/5 gap-1.5"
                            >
                                <Share2 className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Link Oluştur</span>
                            </Button>
                        )}

                        <Button
                            size="sm"
                            onClick={handlePrint}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 gap-1.5"
                        >
                            <Download className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">PDF İndir</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* İçerik */}
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* Sol — ATS ve Keyword paneli */}
                    <div className="no-print order-2 w-full shrink-0 space-y-4 lg:order-1 lg:w-72">
                        {/* ATS Skor */}
                        {atsScore > 0 && (
                            <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-5">
                                <div className="mb-3 flex items-center gap-2">
                                    <Target className="h-4 w-4 text-violet-400" />
                                    <span className="text-sm font-medium text-white">ATS Skoru</span>
                                </div>
                                <div className="relative flex items-center justify-center">
                                    <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#27272a" strokeWidth="8" />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke={atsScore >= 80 ? '#10b981' : atsScore >= 60 ? '#f59e0b' : '#ef4444'}
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(atsScore / 100) * 251} 251`}
                                        />
                                    </svg>
                                    <div className="absolute text-center">
                                        <div className="text-3xl font-bold text-white">{atsScore}</div>
                                        <div className="text-xs text-zinc-500">/100</div>
                                    </div>
                                </div>
                                <p className="mt-3 text-center text-xs text-zinc-500">
                                    {atsScore >= 80
                                        ? '🎉 Mükemmel! ATS sistemlerini geçecek.'
                                        : atsScore >= 60
                                            ? '⚠️ İyi, ancak geliştirilebilir.'
                                            : '❌ Düşük. Düzenleme önerilir.'}
                                </p>
                            </div>
                        )}

                        {/* Eşleşen Keyword'ler */}
                        {matchedKeywords.length > 0 && (
                            <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-5">
                                <p className="mb-3 text-sm font-medium text-white">Eşleşen Keyword'ler</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {matchedKeywords.map((kw) => (
                                        <span
                                            key={kw}
                                            className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400"
                                        >
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sağ — CV önizleme */}
                    <div className="order-1 flex-1 lg:order-2">
                        <div className="overflow-hidden rounded-2xl shadow-2xl shadow-violet-500/10">
                            <CVRenderer cv={cv.ai_tailored_cv_json} showWatermark />
                        </div>
                    </div>
                </div>
            </div>

            {/* Print CSS */}
            <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          #cv-content { box-shadow: none !important; border-radius: 0 !important; }
          @page { margin: 0; size: A4; }
        }
      `}</style>
        </div>
    )
}
