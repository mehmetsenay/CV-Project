'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

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
        <div className="flex min-h-screen items-center justify-center bg-black px-4">
            {/* Arka plan blur */}
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

                {/* Kart */}
                <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-8 backdrop-blur-sm">
                    <h1 className="mb-1 text-xl font-bold text-white">Tekrar hoş geldin</h1>
                    <p className="mb-6 text-sm text-zinc-500">Hesabına giriş yap</p>

                    <form onSubmit={handleLogin} className="space-y-4">
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
                                    placeholder="••••••••"
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
                        </div>

                        <div className="flex justify-end">
                            <Link
                                href="/reset-password"
                                className="text-xs text-zinc-500 hover:text-violet-400 transition-colors"
                            >
                                Şifremi unuttum
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
                        >
                            {loading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Giriş yapılıyor...</>
                            ) : (
                                'Giriş Yap'
                            )}
                        </Button>
                    </form>
                </div>

                <p className="mt-4 text-center text-sm text-zinc-600">
                    Hesabın yok mu?{' '}
                    <Link href="/signup" className="text-violet-400 hover:text-violet-300 transition-colors">
                        Kayıt ol
                    </Link>
                </p>
            </div>
        </div>
    )
}
