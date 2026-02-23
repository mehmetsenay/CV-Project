import Link from 'next/link'
import { Sparkles, Twitter, Linkedin, Github } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white">
                                CV<span className="text-violet-400">AI</span>
                            </span>
                        </Link>
                        <p className="mt-3 max-w-xs text-sm text-zinc-500">
                            AI ile kişiselleştirilmiş, ATS sistemlerini geçen CV'ler oluştur.
                            İşi kazan.
                        </p>
                        <div className="mt-4 flex gap-4">
                            <a href="#" className="text-zinc-600 hover:text-violet-400 transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-zinc-600 hover:text-violet-400 transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-zinc-600 hover:text-violet-400 transition-colors">
                                <Github className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Ürün */}
                    <div>
                        <h3 className="text-sm font-semibold text-white">Ürün</h3>
                        <ul className="mt-4 space-y-3">
                            {[
                                { label: 'Özellikler', href: '/#features' },
                                { label: 'Fiyatlar', href: '/#pricing' },
                                { label: 'SSS', href: '/#faq' },
                            ].map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-zinc-500 hover:text-white transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Hesap */}
                    <div>
                        <h3 className="text-sm font-semibold text-white">Hesap</h3>
                        <ul className="mt-4 space-y-3">
                            {[
                                { label: 'Giriş Yap', href: '/login' },
                                { label: 'Kayıt Ol', href: '/signup' },
                                { label: 'Dashboard', href: '/dashboard' },
                            ].map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-zinc-500 hover:text-white transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-zinc-600">
                        © {new Date().getFullYear()} CVAI. Tüm hakları saklıdır.
                    </p>
                    <div className="flex gap-4">
                        <Link href="/privacy" className="text-xs text-zinc-600 hover:text-white transition-colors">
                            Gizlilik
                        </Link>
                        <Link href="/terms" className="text-xs text-zinc-600 hover:text-white transition-colors">
                            Kullanım Şartları
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
