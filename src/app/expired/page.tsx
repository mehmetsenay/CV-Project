import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, FileWarning } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function ExpiredPage() {
    return (
        <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
            {/* Navbar Minimal */}
            <header className="flex h-16 items-center border-b border-white/5 px-6">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-lg text-white">
                        CV<span className="text-violet-400">AI</span>
                    </span>
                </div>
            </header>

            {/* İçerik */}
            <main className="flex flex-1 items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-6">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                        <FileWarning className="h-8 w-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Bu CV linki artık aktif değil
                    </h1>
                    <p className="text-sm text-zinc-400">
                        CV sahibi aboneliğini sonlandırdığı veya deneme süresi bittiği için bu bağlantı güvenlik nedeniyle pasif duruma alınmıştır.
                    </p>

                    <div className="pt-4">
                        <Link href="/">
                            <Button className="w-full sm:w-auto bg-white text-zinc-900 hover:bg-zinc-200">
                                CVAI ile Kendi CV'nizi Oluşturun
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
