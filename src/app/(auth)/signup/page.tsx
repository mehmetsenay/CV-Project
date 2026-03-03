'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Eye, EyeOff, Loader2, Check, ArrowRight, Quote } from 'lucide-react'
import { toast } from 'sonner'
import { Particles } from '@/components/ui/particles'

export default function SignupPage() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)

    const passwordStrong = password.length >= 8

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault()
        if (!passwordStrong) {
            toast.error('Şifre en az 8 karakter olmalı')
            return
        }
        setLoading(true)

        const supabase = createClient()
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
                emailRedirectTo: `${window.location.origin}/confirm`,
            },
        })

        if (error) {
            // Check for rate limit specifically
            if (error.status === 429 || error.message.includes('rate limit')) {
                toast.error('Çok fazla deneme yapıldı.', { description: 'Lütfen birkaç dakika bekleyip tekrar deneyiniz. (E-posta limitine takıldınız)' })
            } else {
                toast.error('Kayıt başarısız', { description: error.message })
            }
            setLoading(false)
            return
        }

        setDone(true)
    }

    if (done) {
        return (
            <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden bg-background">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] -z-10" />

                <div className="w-full max-w-md text-center p-10 rounded-3xl border border-white/10 bg-zinc-950/50 backdrop-blur-2xl shadow-2xl animate-fade-up">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <Check className="h-10 w-10 text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">E-postanı kontrol et!</h2>
                    <p className="mt-4 text-zinc-400 leading-relaxed">
                        <span className="text-white font-medium">{email}</span> adresine bir onay bağlantısı gönderdik.
                        Gelen kutunu (ve spam klasörünü) kontrol edip bağlantıya tıklayarak hesabını aktive et.
                    </p>
                    <Link href="/login" className="mt-8 block">
                        <Button className="w-full h-12 bg-white text-zinc-950 hover:bg-zinc-200 transition-colors rounded-xl text-base font-medium">
                            Giriş Sayfasına Dön
                        </Button>
                    </Link>
                </div>
            </div>
        )
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
                        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl animate-fade-up">Hesabınızı oluşturun</h1>
                        <p className="mt-3 text-base text-zinc-400 animate-fade-up [animation-delay:100ms]">
                            7 günlük ücretsiz denemenizi başlatmak için detayları doldurun. Kredi kartı gereklidir, istediğiniz zaman iptal edebilirsiniz.
                        </p>
                    </div>

                    <form onSubmit={handleSignup} className="mt-10 space-y-5 animate-fade-up [animation-delay:200ms]">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Ad Soyad</label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Örn: John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="h-12 rounded-xl border-white/10 bg-white/5 px-4 text-white placeholder:text-zinc-600 focus:border-violet-500 focus:bg-white/10 transition-colors"
                            />
                        </div>

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
                            <label className="text-sm font-medium text-zinc-300">Şifre</label>
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
                            {password.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                    <div className={`h-1.5 flex-1 rounded-full ${password.length > 3 ? 'bg-violet-500' : 'bg-red-500'}`} />
                                    <div className={`h-1.5 flex-1 rounded-full ${password.length >= 8 ? 'bg-violet-500' : 'bg-zinc-800'}`} />
                                    <div className={`h-1.5 flex-1 rounded-full ${password.length >= 10 ? 'bg-violet-500' : 'bg-zinc-800'}`} />
                                    <p className={`text-xs ml-2 ${passwordStrong ? 'text-violet-400' : 'text-zinc-500'}`}>
                                        {passwordStrong ? 'Güçlü şifre' : 'Daha fazla karakter'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || (password.length > 0 && !passwordStrong)}
                            className="group relative w-full h-12 overflow-hidden rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 transition-all text-base font-semibold disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        >
                            <span className="relative flex items-center justify-center gap-2">
                                {loading ? (
                                    <><Loader2 className="h-5 w-5 animate-spin" /> Kaydediliyor...</>
                                ) : (
                                    <>
                                        Ücretsiz Dene
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </span>
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-zinc-500 animate-fade-up [animation-delay:300ms]">
                        Zaten bir hesabın var mı?{' '}
                        <Link href="/login" className="font-medium text-white hover:text-violet-400 underline decoration-white/30 underline-offset-4 transition-colors">
                            Giriş Yap
                        </Link>
                    </p>
                </div>
            </div>

            {/* Sağ Taraf - Görsel ve Testimonial (Sadece Desktop) */}
            <div className="relative hidden w-1/2 lg:block p-4">
                <div className="absolute inset-0 bg-black" />

                <div className="relative flex h-full w-full flex-col justify-between rounded-3xl bg-zinc-950 border border-white/10 overflow-hidden shadow-2xl">
                    {/* Magic UI Particles */}
                    <Particles
                        className="absolute inset-0 z-0"
                        quantity={150}
                        ease={80}
                        color="#8B5CF6"
                        refresh
                    />

                    {/* Dekoratif Glowlar */}
                    <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-violet-600/20 blur-[130px] rounded-full z-0" />
                    <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-indigo-600/10 blur-[130px] rounded-full z-0" />
                    <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px] z-0"></div>

                    {/* Gradient Border for Content */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10" />

                    <div className="relative z-20 h-full flex items-center justify-center p-12">
                        {/* Fake UI Element representing the AI App */}
                        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl shadow-2xl space-y-4 transform hover:scale-105 transition-transform duration-500">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                    <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                                </div>
                                <span className="font-mono text-xs text-zinc-500">processing_cv.log</span>
                            </div>
                            <div className="space-y-3 font-mono text-sm">
                                <p className="text-zinc-300"><span className="text-violet-400">→</span> Analyzing LinkedIn Profile...</p>
                                <div className="h-1.5 w-full rounded-full bg-white/5"><div className="h-full bg-violet-500 rounded-full w-full" /></div>
                                <p className="text-zinc-300"><span className="text-violet-400">→</span> Extracted 42 job keywords.</p>
                                <p className="text-green-400"><span className="text-green-500">✓</span> Initializing Claude 3.5 Sonnet...</p>
                                <p className="text-zinc-300 animate-pulse"><span className="text-violet-400">→</span> Generating ATS-optimized bullets...</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-20 p-12 mt-auto">
                        <Quote className="h-10 w-10 text-violet-400/50 mb-6" />
                        <h3 className="text-3xl font-medium text-white leading-tight">
                            "Yıllardır geçemediğim ilk aşamaları CVAI sayesinde aştım. AI'ın ilanlara özel sunduğu keyword uyarlaması gerçekten başka bir seviye."
                        </h3>
                        <div className="mt-8 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full border border-white/20 bg-white/10 flex items-center justify-center">
                                <span className="text-white font-medium">AY</span>
                            </div>
                            <div>
                                <p className="font-semibold text-white">Ali Yılmaz</p>
                                <p className="text-sm text-zinc-400">Senior Software Engineer</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
