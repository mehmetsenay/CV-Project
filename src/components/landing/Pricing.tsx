import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, ArrowRight } from 'lucide-react'

const freeFeatures = [
    '7 gün tam erişim',
    'Sınırsız CV oluşturma',
    'ATS skoru analizi',
    'PDF export',
    'Paylaşılabilir linkler',
]

const proFeatures = [
    'Sınırsız CV, tüm özellikler',
    'ATS skoru & keyword analizi',
    'PDF export',
    'Paylaşılabilir public linkler',
    'Link görüntülenme bildirimleri',
    'Link analitikleri',
    'Öncelikli destek',
]

export default function Pricing() {
    return (
        <section id="pricing" className="relative bg-black py-24">
            {/* Arka plan blur */}
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[120px]" />

            <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                {/* Başlık */}
                <div className="text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
                        <span>Şeffaf fiyatlandırma</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white sm:text-4xl">
                        Basit, Anlaşılır Fiyat
                    </h2>
                    <p className="mt-4 text-zinc-500">
                        7 gün ücretsiz dene. Beğendiysen devam et.
                    </p>
                </div>

                {/* Kartlar */}
                <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* Ücretsiz Deneme */}
                    <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-8">
                        <div className="mb-4">
                            <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400">
                                7 Gün Ücretsiz
                            </span>
                        </div>
                        <div className="mb-2 text-4xl font-bold text-white">$0</div>
                        <p className="text-sm text-zinc-500">
                            7 gün sonra otomatik Pro'ya geçer
                        </p>
                        <ul className="mt-8 space-y-3">
                            {freeFeatures.map((f) => (
                                <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                                    <Check className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <Link href="/signup" className="mt-8 block">
                            <Button className="w-full border border-white/10 bg-white/5 text-white hover:bg-white/10">
                                Ücretsiz Başla
                            </Button>
                        </Link>
                    </div>

                    {/* Pro Plan */}
                    <div className="relative rounded-2xl border border-violet-500/50 bg-gradient-to-b from-violet-500/10 to-transparent p-8">
                        {/* Popular badge */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1 text-xs font-medium text-white shadow-lg shadow-violet-500/25">
                                ⭐ Önerilen
                            </span>
                        </div>

                        <div className="mb-4">
                            <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-300">
                                Pro Yıllık
                            </span>
                        </div>
                        <div className="mb-1 flex items-end gap-2">
                            <span className="text-4xl font-bold text-white">$99</span>
                            <span className="mb-1 text-zinc-500">/yıl</span>
                        </div>
                        <p className="text-sm text-zinc-500">
                            Aylık $8.25 — 2 aylık bedava
                        </p>

                        <ul className="mt-8 space-y-3">
                            {proFeatures.map((f) => (
                                <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                                    <Check className="h-4 w-4 flex-shrink-0 text-violet-400" />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <Link href="/signup" className="mt-8 block">
                            <Button className="group w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25">
                                7 Gün Ücretsiz Dene
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                        <p className="mt-3 text-center text-xs text-zinc-600">
                            Kredi kartı gerekli · İstediğin zaman iptal et
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
