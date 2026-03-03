'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Particles } from '@/components/ui/particles'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        const supabase = createClient()
        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            toast.error('Giriş başarısız', { description: error.message })
            setLoading(false)
            return
        }

        toast.success('Giriş yapıldı!')
        router.push('/dashboard')
        router.refresh()
    }

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sol Taraf - Form (Desktop %50, Mobile %100) */}
            <div className="flex w-full flex-col justify-center px-4 sm:px-12 lg:w-1/2 lg:px-24 xl:px-32 relative z-10">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-violet-600/10 to-transparent -z-10" />

                <div className="mx-auto w-full max-w-sm lg:max-w-md">
                    {/* Logo */}
                    <Link href="/" className="mb-12 flex items-center gap-3 w-fit hover:opacity-80 transition-opacity">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25 border border-white/10">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">
                            CV<span className="text-violet-400">AI</span>
                        </span>
                    </Link>

                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl animate-fade-up">Tekrar hoş geldin</h1>
                        <p className="mt-3 text-base text-zinc-400 animate-fade-up [animation-delay:100ms]">
                            Hesabına giriş yap ve CV'lerini yönetmeye kaldığın yerden devam et.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="mt-10 space-y-5 animate-fade-up [animation-delay:200ms]">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">İş E-postası</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="isim@sirket.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-white placeholder:text-zinc-600 focus:border-violet-500 focus:bg-white/10 transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-zinc-300">Şifre</label>
                                <Link
                                    href="/reset-password"
                                    className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors underline decoration-violet-400/30 underline-offset-4"
                                >
                                    Şifremi unuttum
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 rounded-xl border-white/10 bg-white/5 pl-4 pr-12 text-white placeholder:text-zinc-600 focus:border-violet-500 focus:bg-white/10 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full h-12 overflow-hidden rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 transition-all text-base font-semibold disabled:opacity-50 mt-4 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        >
                            <span className="relative flex items-center justify-center gap-2">
                                {loading ? (
                                    <><Loader2 className="h-5 w-5 animate-spin" /> Giriş yapılıyor...</>
                                ) : (
                                    <>
                                        Giriş Yap
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </span>
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-zinc-500 animate-fade-up [animation-delay:300ms]">
                        Hesabın yok mu?{' '}
                        <Link href="/signup" className="font-medium text-white hover:text-violet-400 underline decoration-white/30 underline-offset-4 transition-colors">
                            Kayıt Ol
                        </Link>
                    </p>
                </div>
            </div>

            {/* Sağ Taraf - Görsel ve Slogan (Sadece Desktop) */}
            <div className="relative hidden w-1/2 lg:block p-4">
                <div className="absolute inset-0 bg-black" />

                <div className="relative flex h-full w-full flex-col justify-center items-center rounded-3xl bg-zinc-950 border border-white/10 overflow-hidden shadow-2xl">
                    {/* Magic UI Particles */}
                    <Particles
                        className="absolute inset-0"
                        quantity={150}
                        ease={80}
                        color="#8B5CF6"
                        refresh
                    />

                    {/* Dekoratif Glowlar */}
                    <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-violet-600/20 blur-[130px] rounded-full" />
                    <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-indigo-600/20 blur-[130px] rounded-full" />
                    <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px]"></div>

                    <div className="relative z-20 flex flex-col items-center justify-center text-center p-12">
                        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/30 to-indigo-600/30 border border-white/10 backdrop-blur-xl shadow-2xl animate-fade-in hover:scale-105 transition-transform duration-500">
                            <Sparkles className="h-10 w-10 text-violet-300" />
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-6 tracking-tight animate-fade-up">
                            İşi Kazan. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                                Kariyerini AI İle Yönet.
                            </span>
                        </h2>
                        <p className="text-lg text-zinc-400 max-w-md leading-relaxed animate-fade-up [animation-delay:100ms]">
                            CV'lerinizi optimize edin, paylaşımlarınızı takip edin ve her zaman bir adım önde olun.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
