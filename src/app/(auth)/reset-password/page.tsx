'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)

    async function handleReset(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        const supabase = createClient()
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        })

        if (error) {
            toast.error('Hata', { description: error.message })
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
                    <h2 className="text-xl font-bold text-white">Bağlantı gönderildi!</h2>
                    <p className="mt-2 text-sm text-zinc-500">
                        <span className="text-white">{email}</span> adresine şifre sıfırlama bağlantısı gönderdik.
                    </p>
                    <Link href="/login" className="mt-6 block">
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                            Giriş Sayfasına Dön
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
                <Link href="/" className="mb-8 flex items-center justify-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">
                        CV<span className="text-violet-400">AI</span>
                    </span>
                </Link>

                <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-8 backdrop-blur-sm">
                    <h1 className="mb-1 text-xl font-bold text-white">Şifreni Sıfırla</h1>
                    <p className="mb-6 text-sm text-zinc-500">
                        E-posta adresine sıfırlama bağlantısı göndereceğiz.
                    </p>

                    <form onSubmit={handleReset} className="space-y-4">
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

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500"
                        >
                            {loading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gönderiliyor...</>
                            ) : (
                                'Sıfırlama Bağlantısı Gönder'
                            )}
                        </Button>
                    </form>
                </div>

                <p className="mt-4 text-center text-sm text-zinc-600">
                    <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
                        ← Giriş sayfasına dön
                    </Link>
                </p>
            </div>
        </div>
    )
}
