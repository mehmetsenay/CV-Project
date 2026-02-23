'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'

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
            toast.error('Kayıt başarısız', { description: error.message })
            setLoading(false)
            return
        }

        setDone(true)
    }

    if (done) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black px-4">
                <div className="w-full max-w-sm text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
                        <Check className="h-7 w-7 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">E-postanı kontrol et!</h2>
                    <p className="mt-2 text-sm text-zinc-500">
                        <span className="text-white">{email}</span> adresine onay bağlantısı gönderdik.
                        Gelen kutunu kontrol et ve bağlantıya tıkla.
                    </p>
                    <Link href="/login" className="mt-6 block">
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                            Giriş Yap
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-black px-4">
            <div className="absolute inset-0 -z-10">
                <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-[100px]" />
            </div>

            <div className="w-full max-w-sm">
                {/* Logo */}
                <Link href="/" className="mb-8 flex items-center justify-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">
                        CV<span className="text-violet-400">AI</span>
                    </span>
                </Link>

                <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-8 backdrop-blur-sm">
                    <h1 className="mb-1 text-xl font-bold text-white">7 Gün Ücretsiz Başla</h1>
                    <p className="mb-6 text-sm text-zinc-500">Kredi kartı gerekli • İstediğin zaman iptal et</p>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs text-zinc-400">Ad Soyad</label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Adın Soyadın"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus:border-violet-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs text-zinc-400">E-posta</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="ornek@mail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus:border-violet-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs text-zinc-400">Şifre</label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="En az 8 karakter"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="border-white/10 bg-white/5 pr-10 text-white placeholder:text-zinc-600 focus:border-violet-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {password.length > 0 && (
                                <p className={`mt-1 text-xs ${passwordStrong ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {passwordStrong ? '✓ Güçlü şifre' : '✗ En az 8 karakter gerekli'}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
                        >
                            {loading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Kayıt olunuyor...</>
                            ) : (
                                'Ücretsiz Başla'
                            )}
                        </Button>
                    </form>

                    <p className="mt-4 text-center text-xs text-zinc-600">
                        Devam ederek{' '}
                        <Link href="/terms" className="underline hover:text-zinc-400">Kullanım Şartları</Link>
                        &apos;nı kabul etmiş olursun.
                    </p>
                </div>

                <p className="mt-4 text-center text-sm text-zinc-600">
                    Zaten üye misin?{' '}
                    <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
                        Giriş yap
                    </Link>
                </p>
            </div>
        </div>
    )
}
