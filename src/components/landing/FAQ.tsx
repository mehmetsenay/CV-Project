'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
    {
        q: 'Kredi kartımı hemen tahsil edecek misiniz?',
        a: 'Hayır. 7 günlük deneme süresince ücret alınmaz. Deneme sona erdiğinde $99/yıl tahsil edilir. İstediğin zaman iptal edebilirsin.',
    },
    {
        q: 'LinkedIn profilim gizli olsa ne olur?',
        a: 'Scraping için LinkedIn profilinin herkese açık (public) olması gerekiyor. Profil gizliyse seni uyarır, önce public yapmanı isteriz.',
    },
    {
        q: 'ATS skoru ne anlama geliyor?',
        a: 'ATS (Applicant Tracking System) şirketlerin CV\'leri ele geçirmek için kullandığı yazılım. Üretilen CV\'nin bu sistemleri geçme olasılığını 0-100 arasında puanlıyoruz.',
    },
    {
        q: 'Paylaşılabilir link nedir?',
        a: 'Recruiter\'lara gönderebileceğin özel bir URL. Aboneliğin aktif olduğu sürece link çalışır. Aboneliği iptal edersen link devre dışı kalır.',
    },
    {
        q: 'Kaç CV oluşturabilirim?',
        a: 'Pro planda sınırsız. Başvurduğun her iş ilanı için ayrı, özel bir CV oluşturabilirsin.',
    },
    {
        q: 'Verilerim güvende mi?',
        a: 'Tüm veriler Supabase\'de şifrelenmiş olarak saklanır. Row Level Security (RLS) ile sadece sen kendi verilerine erişebilirsin.',
    },
]

export default function FAQ() {
    const [openIdx, setOpenIdx] = useState<number | null>(null)

    return (
        <section id="faq" className="bg-zinc-950 py-24">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                {/* Başlık */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white sm:text-4xl">
                        Sık Sorulan Sorular
                    </h2>
                    <p className="mt-4 text-zinc-500">
                        Aklında başka bir soru varsa destek ekibimizle iletişime geç.
                    </p>
                </div>

                {/* Sorular */}
                <div className="mt-12 divide-y divide-white/5">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="py-4">
                            <button
                                className="flex w-full items-center justify-between gap-4 text-left"
                                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                            >
                                <span className="font-medium text-white">{faq.q}</span>
                                <ChevronDown
                                    className={`h-5 w-5 flex-shrink-0 text-zinc-500 transition-transform duration-200 ${openIdx === idx ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                            {openIdx === idx && (
                                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                                    {faq.a}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
