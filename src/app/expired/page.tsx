import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Sayfayı ziyaret edenin kim olduğuna göre farklı içerik göstermek için query param kullanılabilir
// Ancak public URL'lerde bunu bilemeyiz, bu nedenle genel bir "Erişim Yok" sayfası ve "CV Sahibine" özel uyarı
export default async function ExpiredPage() {
    return (
        <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
            {/* Navbar Minimal */}
            <header className="flex h-16 items-center border-b border-white/5 px-6">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-lg text-white">
                        CV<span className="text-violet-400">AI</span>
                    </span>
                </div>
            </header>

            {/* İçerik */}
            <main className="flex flex-1 items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-8">
                    {/* İkon Bölümü */}
                    <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <Lock className="h-10 w-10 text-amber-400 relative z-10" />
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Bağlantı Süresi Doldu
                        </h1>
                        <p className="text-base text-zinc-400 leading-relaxed">
                            Bu CV bağlantısının erişim süresi dolmuştur. Gizlilik politikalarımız gereği CV sahibinin aboneliği aktif değilse paylaşılan dosyalar gizlenir.
                        </p>
                    </div>

                    {/* CV Sahibi / İşe Alımcı Ayrımı Alanı (İlham Verici) */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm text-left relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-indigo-500"></div>
                        <p className="text-sm font-medium text-white mb-2">Siz CV'nin Sahibi Misiniz?</p>
                        <p className="text-xs text-zinc-400 mb-4">
                            Ücretsiz deneme süreniz dolmuş veya aboneliğiniz bitmiş olabilir. CV'nizi ve ön yazılarınızı tekrar erişime açmak için planınızı yükseltin.
                        </p>
                        <Link href="/dashboard/settings" className="block w-full">
                            <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 font-semibold shadow-xl shadow-violet-500/20 group">
                                Planı Yükselt & Lİnkleri Aktifleştir
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </div>

                    {/* Ziyaretçi CTA */}
                    <div className="pt-2 border-t border-white/5">
                        <p className="text-xs text-zinc-500 mb-3">İşe Alım Uzmanı mısınız veya kendi CV'nizi mi oluşturmak istiyorsunuz?</p>
                        <Link href="/">
                            <Button variant="outline" className="w-full bg-transparent border-white/10 text-white hover:bg-white/5 transition-colors">
                                CVAI ile Tanışın
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
