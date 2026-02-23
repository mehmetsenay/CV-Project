import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function ConfirmPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams
    const code = params.code

    if (code) {
        const supabase = await createClient()
        await supabase.auth.exchangeCodeForSession(code)
        redirect('/dashboard')
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-black px-4">
            <div className="w-full max-w-sm text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
                    <Check className="h-7 w-7 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white">E-posta onaylandı!</h2>
                <p className="mt-2 text-sm text-zinc-500">
                    Hesabın başarıyla oluşturuldu. Şimdi giriş yapabilirsin.
                </p>
                <Link href="/login" className="mt-6 block">
                    <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                        Giriş Yap
                    </Button>
                </Link>
            </div>
        </div>
    )
}
