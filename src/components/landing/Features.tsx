import {
    Linkedin,
    Brain,
    FileText,
    Link2,
    BarChart3,
    Zap,
} from 'lucide-react'
import { MagicCard } from '@/components/ui/magic-card'

const features = [
    {
        icon: Linkedin,
        title: 'LinkedIn Entegrasyonu',
        description: 'Profil URL\'ini yapıştır, gerisini biz halledelim. Tüm deneyim, eğitim ve beceri verilerini otomatik çekeriz.',
        color: 'from-blue-500 to-cyan-500',
        bg: 'bg-blue-500/10',
    },
    {
        icon: Brain,
        title: 'Claude 3.5 Zekası',
        description: 'İş ilanındaki anahtar kelimeleri CV\'ye organik biçimde yerleştirir. Her madde rakamlarla kanıtlanmış başarılar içerir.',
        color: 'from-violet-500 to-purple-500',
        bg: 'bg-violet-500/10',
    },
    {
        icon: BarChart3,
        title: 'ATS Skoru',
        description: "CV'nin ATS sistemlerini geçme oranını 0-100 skalasında görürsün. Eşleşen keyword'leri tek tek listeleriz.",
        color: 'from-emerald-500 to-teal-500',
        bg: 'bg-emerald-500/10',
    },
    {
        icon: FileText,
        title: 'PDF Export',
        description: "Profesyonel, baskıya hazır CV'ni tek tıkla PDF olarak indir. Tüm formatlamalar korunur.",
        color: 'from-orange-500 to-amber-500',
        bg: 'bg-orange-500/10',
    },
    {
        icon: Link2,
        title: 'Paylaşılabilir Link',
        description: "İşe alım yetkililerine özel link gönder. Aboneliğin aktif olduğu sürece link kesintisiz çalışır.",
        color: 'from-pink-500 to-rose-500',
        bg: 'bg-pink-500/10',
    },
    {
        icon: Zap,
        title: '5 Dakikada Hazır',
        description: 'Geleneksel yöntemlerle saatler alan CV yazımını 5 dakikaya indiriyoruz. Daha fazla başvuru, daha az vakit.',
        color: 'from-yellow-500 to-orange-500',
        bg: 'bg-yellow-500/10',
    },
]

export default function Features() {
    return (
        <section id="features" className="bg-background py-24 relative overflow-hidden">
            {/* Arka plan parlaklıkları */}
            <div className="absolute left-0 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[100px]" />
            <div className="absolute right-0 top-1/4 -z-10 h-[400px] w-[400px] translate-x-1/3 rounded-full bg-indigo-600/10 blur-[100px]" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Baslik */}
                <div className="text-center">
                    <div className="mb-4 inline-flex animate-fade-in items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
                        <span>Her şey dahil</span>
                    </div>
                    <h2 className="animate-fade-up text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
                        Neden CVAI?
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl animate-fade-up text-lg text-zinc-400 [animation-delay:200ms]">
                        Başvurduğun her iş için ayrı ayrı CV yazmak yerine, AI bunu senin yerine saniyeler içinde mükemmel bir şekilde yapıyor.
                    </p>
                </div>

                {/* Grid */}
                <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, idx) => {
                        const Icon = feature.icon
                        return (
                            <MagicCard
                                key={feature.title}
                                className="flex min-h-[250px] w-full cursor-pointer flex-col bg-zinc-950/50 backdrop-blur-sm p-8 shadow-2xl overflow-hidden"
                                gradientColor="rgba(139, 92, 246, 0.15)"
                            >
                                <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 ${feature.bg} shadow-inner`}>
                                    <Icon className="h-6 w-6 text-violet-400" />
                                </div>
                                <h3 className="mb-3 text-xl font-bold tracking-tight text-white">
                                    {feature.title}
                                </h3>
                                <p className="text-base leading-relaxed text-zinc-400">
                                    {feature.description}
                                </p>
                            </MagicCard>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
