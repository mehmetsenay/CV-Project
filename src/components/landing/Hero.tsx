import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Star } from 'lucide-react'
import { RetroGrid } from '@/components/ui/retro-grid'
import { BorderBeam } from '@/components/ui/border-beam'

export default function Hero() {
    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background pt-24 md:pt-32">
            {/* Arka plan efekti */}
            <RetroGrid />

            <div className="mx-auto max-w-5xl px-4 text-center z-10 w-full relative">
                {/* Rozet */}
                <div className="mb-8 inline-flex animate-fade-in items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 backdrop-blur-sm transition-all hover:bg-violet-500/20">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-medium">Claude 3.5 Sonnet ile güçlendirilmiş</span>
                </div>

                {/* Başlık */}
                <h1 className="animate-fade-up text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
                    İşi Kazan.{' '}
                    <br className="hidden sm:block" />
                    <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        CV&apos;ni AI Yazar.
                    </span>
                </h1>

                {/* Alt başlık */}
                <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg text-zinc-400 sm:text-xl md:text-2xl [animation-delay:200ms]">
                    LinkedIn profilini ve iş ilanını analiz ederek sana özel, ATS
                    sistemlerini geçen bir CV üretiyoruz. 5 dakikada hazır.
                </p>

                {/* Social proof */}
                <div className="mt-8 flex animate-fade-up items-center justify-center gap-1 [animation-delay:400ms]">
                    <div className="flex -space-x-2 mr-4">
                        <img className="inline-block h-8 w-8 rounded-full ring-2 ring-zinc-900" src="https://i.pravatar.cc/150?img=1" alt="" />
                        <img className="inline-block h-8 w-8 rounded-full ring-2 ring-zinc-900" src="https://i.pravatar.cc/150?img=2" alt="" />
                        <img className="inline-block h-8 w-8 rounded-full ring-2 ring-zinc-900" src="https://i.pravatar.cc/150?img=3" alt="" />
                        <img className="inline-block h-8 w-8 rounded-full ring-2 ring-zinc-900" src="https://i.pravatar.cc/150?img=4" alt="" />
                    </div>
                    <div className="flex flex-col items-start">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                            ))}
                        </div>
                        <span className="text-xs text-zinc-500 mt-0.5">
                            <span className="text-white font-medium">500+ profesyonel</span> işe alındı
                        </span>
                    </div>
                </div>

                {/* CTA Butonları */}
                <div className="mt-10 flex animate-fade-up flex-col items-center gap-4 sm:flex-row sm:justify-center [animation-delay:600ms]">
                    <Link href="/signup" className="w-full sm:w-auto">
                        <Button
                            size="lg"
                            className="group relative w-full overflow-hidden rounded-xl bg-white px-8 h-14 text-lg font-semibold text-zinc-950 transition-all hover:scale-105 hover:bg-zinc-200 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] sm:w-auto"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                7 Gün Ücretsiz Dene
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Button>
                    </Link>
                    <Link href="/#features" className="w-full sm:w-auto">
                        <Button
                            size="lg"
                            variant="ghost"
                            className="w-full rounded-xl border border-white/10 bg-white/5 h-14 px-8 text-lg font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 sm:w-auto"
                        >
                            Nasıl Çalışır?
                        </Button>
                    </Link>
                </div>

                <p className="mt-6 animate-fade-up text-xs font-medium text-zinc-500 [animation-delay:800ms]">
                    Kredi kartı gerekli · 7 gün sonra $99/yıl · İstediğin zaman iptal et
                </p>

                {/* Demo CV önizleme (Border Beam efekti ile) */}
                <div className="relative mx-auto mt-20 max-w-4xl animate-fade-up [animation-delay:1000ms]">
                    <div className="relative rounded-xl border border-white/10 bg-zinc-950/50 p-2 backdrop-blur-xl md:p-4 shadow-2xl">
                        <BorderBeam size={250} duration={12} delay={9} />
                        <div className="rounded-lg bg-zinc-900 border border-white/5 p-4 md:p-8">
                            {/* Terminal benzeri başlık */}
                            <div className="mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                                <div className="flex gap-1.5">
                                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                                </div>
                                <span className="ml-3 font-mono text-xs text-zinc-500 flex-1 text-center">cv-generation-process.sh</span>
                            </div>
                            {/* Animasyonlu içerik */}
                            <div className="space-y-4 text-left font-mono text-sm sm:text-base">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-violet-400">✓</span>
                                    <span className="text-zinc-300">LinkedIn profili analiz edildi</span>
                                    <span className="ml-auto text-xs font-medium text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">%100</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-violet-400">✓</span>
                                    <span className="text-zinc-300">İş ilanı keyword&apos;leri çıkarıldı</span>
                                    <span className="ml-auto text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">ATS Optimized</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-violet-400">✓</span>
                                    <span className="text-zinc-300">Yapay Zeka ATS dostu CV'yi üretti</span>
                                    <span className="ml-auto text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">Skor: 94/100</span>
                                </div>
                                <div className="mt-6 flex items-center justify-between rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/5 px-4 py-3 border border-green-500/20">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">🎉</span>
                                        <span className="font-semibold text-green-300">CV'niz başarıyla hazırlandı!</span>
                                    </div>
                                    <Button size="sm" variant="ghost" className="h-8 text-green-400 hover:text-green-300 hover:bg-green-400/10">
                                        İndir .PDF
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Alt gradyan gölgesi */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none" />
        </section>
    )
}
