import {
    Linkedin,
    Brain,
    FileText,
    Link2,
    BarChart3,
    Zap,
} from 'lucide-react'

const features = [
    {
        icon: Linkedin,
        title: 'LinkedIn Entegrasyonu',
        description: 'Profil URL\'ini yapistir, gerisini biz halledelim. Tum deneyim, egitim ve beceri verilerini otomatik cekeriz.',
        color: 'from-blue-500 to-cyan-500',
        bg: 'bg-blue-500/10',
    },
    {
        icon: Brain,
        title: 'Claude 3.5 Zekası',
        description: 'Is ilanindaki anahtar kelimeleri CV\'ye organik bicimde yerlestirir. Her madde rakamlarla kanitlanmis basarilar icerir.',
        color: 'from-violet-500 to-purple-500',
        bg: 'bg-violet-500/10',
    },
    {
        icon: BarChart3,
        title: 'ATS Skoru',
        description: "CV'nin ATS sistemlerini gecme oranini 0-100 skalasinda gorursun. Eslesen keyword'leri tek tek listeleriz.",
        color: 'from-emerald-500 to-teal-500',
        bg: 'bg-emerald-500/10',
    },
    {
        icon: FileText,
        title: 'PDF Export',
        description: "Profesyonel, baskiya hazir CV'ni tek tikla PDF olarak indir. Tum formatlamalar korunur.",
        color: 'from-orange-500 to-amber-500',
        bg: 'bg-orange-500/10',
    },
    {
        icon: Link2,
        title: 'Paylasilabilir Link',
        description: "Recruiter'lara ozel link gonder. Aboneligin aktif oldugu surece link calisir.",
        color: 'from-pink-500 to-rose-500',
        bg: 'bg-pink-500/10',
    },
    {
        icon: Zap,
        title: '5 Dakikada Hazir',
        description: 'Geleneksel yontemlerle saatler alan CV yazimini 5 dakikaya indiriyoruz. Daha fazla basvuru, daha az vakit.',
        color: 'from-yellow-500 to-orange-500',
        bg: 'bg-yellow-500/10',
    },
]

export default function Features() {
    return (
        <section id="features" className="bg-black py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Baslik */}
                <div className="text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
                        <span>Her sey dahil</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white sm:text-4xl">
                        Neden CVAI?
                    </h2>
                    <p className="mt-4 text-zinc-500">
                        Basvurdugun her is icin ayri CV yazmak yerine, AI bunu saniyeler icinde yapiyor.
                    </p>
                </div>

                {/* Grid */}
                <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => {
                        const Icon = feature.icon
                        return (
                            <div
                                key={feature.title}
                                className="group relative rounded-2xl border border-white/5 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-white/10 hover:bg-zinc-900"
                            >
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600/0 to-indigo-600/0 opacity-0 transition-opacity group-hover:opacity-5" />

                                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.bg}`}>
                                    <Icon className="h-5 w-5 text-violet-400" />
                                </div>
                                <h3 className="mb-2 font-semibold text-white">
                                    {feature.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-zinc-500">
                                    {feature.description}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
