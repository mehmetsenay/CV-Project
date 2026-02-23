import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Star } from 'lucide-react'

export default function Hero() {
    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black pt-16">
            {/* Arka plan efektleri */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
                <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-indigo-600/15 blur-[100px]" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />
            </div>

            <div className="mx-auto max-w-5xl px-4 text-center">
                {/* Rozet */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Claude 3.5 Sonnet ile güçlendirilmiş</span>
                </div>

                {/* Başlık */}
                <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                    İşi Kazan.{' '}
                    <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        CV&apos;ni AI Yazar.
                    </span>
                </h1>

                {/* Alt başlık */}
                <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl">
                    LinkedIn profilini ve iş ilanını analiz ederek sana özel, ATS
                    sistemlerini geçen bir CV üretiyoruz. 5 dakikada hazır.
                </p>

                {/* Social proof */}
                <div className="mt-6 flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                    ))}
                    <span className="ml-2 text-sm text-zinc-500">
                        <span className="text-white font-medium">500+ kullanıcı</span> işe alındı
                    </span>
                </div>

                {/* CTA Butonları */}
                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                    <Link href="/signup">
                        <Button
                            size="lg"
                            className="group h-12 bg-gradient-to-r from-violet-600 to-indigo-600 px-8 text-base text-white hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-violet-500/25"
                        >
                            7 Gün Ücretsiz Dene
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                    <Link href="/#features">
                        <Button
                            size="lg"
                            variant="ghost"
                            className="h-12 border border-white/10 px-8 text-base text-zinc-300 hover:bg-white/5 hover:text-white"
                        >
                            Nasıl Çalışır?
                        </Button>
                    </Link>
                </div>

                <p className="mt-4 text-xs text-zinc-600">
                    Kredi kartı gerekli · 7 gün sonra $99/yıl · İstediğin zaman iptal et
                </p>

                {/* Demo CV önizleme */}
                <div className="relative mx-auto mt-16 max-w-3xl">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/20 to-indigo-500/20 blur-xl" />
                    <div className="relative rounded-2xl border border-white/10 bg-zinc-900/80 p-6 backdrop-blur-sm">
                        {/* Terminal benzeri başlık */}
                        <div className="mb-4 flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-red-500/80" />
                            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                            <div className="h-3 w-3 rounded-full bg-green-500/80" />
                            <span className="ml-3 text-xs text-zinc-500">cv-output.json</span>
                        </div>
                        {/* Animasyonlu içerik */}
                        <div className="space-y-2 text-left font-mono text-sm">
                            <div className="flex gap-3">
                                <span className="text-violet-400">✓</span>
                                <span className="text-zinc-300">LinkedIn profili analiz edildi</span>
                                <span className="ml-auto text-xs text-green-400">%100</span>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-violet-400">✓</span>
                                <span className="text-zinc-300">İş ilanı keyword&apos;leri çıkarıldı</span>
                                <span className="ml-auto text-xs text-green-400">ATS optimized</span>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-violet-400">✓</span>
                                <span className="text-zinc-300">AI CV üretildi</span>
                                <span className="ml-auto text-xs text-amber-400">ATS Skoru: 94/100</span>
                            </div>
                            <div className="mt-3 flex gap-3 rounded-lg bg-green-500/10 px-3 py-2">
                                <span className="text-green-400">🎉</span>
                                <span className="text-green-300">CV hazır! PDF indir veya linki paylaş.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
