import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CVRenderer from '@/components/cv/CVRenderer'
import { CVData } from '@/types/cv'
import { Button } from '@/components/ui/button'
import { Sparkles, Download } from 'lucide-react'
import { PrintButton } from '@/components/cv/PrintButton'
import Link from 'next/link'

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function PublicCVPage({ params }: PageProps) {
    const { slug } = await params
    const supabase = await createClient()

    // Linki getir
    const { data: linkInfo } = await supabase
        .from('shareable_links')
        .select('cv_id, user_id, is_active')
        .eq('slug', slug)
        .single()

    if (!linkInfo || !linkInfo.is_active) {
        redirect('/expired')
    }

    // Kullanıcının aboneliğini kontrol et
    const { data: userProfile } = await supabase
        .from('users')
        .select('subscription_status, trial_end_date')
        .eq('id', linkInfo.user_id)
        .single()

    const status = userProfile?.subscription_status
    const isActive = status === 'active'
    const isTrialing = status === 'trialing'
    const trialValid = isTrialing && userProfile?.trial_end_date
        ? new Date() < new Date(userProfile.trial_end_date)
        : false

    if (!isActive && !trialValid) {
        redirect('/expired') // Growth Hack => Abonelik biterse link ölür!
    }

    // Link aktif ve geçerli => analytics'e kayıt (Görüntüleme) eklenebilir. 
    // Şimdilik pas geçiyoruz ama analytics tablosuna burada ekleme yapmak growth için harika olacaktır.

    // İlgili CV_Data'yı çek
    const { data: cvData } = await supabase
        .from('cv_data')
        .select('ai_tailored_cv_json, title')
        .eq('id', linkInfo.cv_id)
        .single()

    if (!cvData?.ai_tailored_cv_json) {
        return (
            <div className="p-8 text-center text-red-500">
                CV verisi bulunamadı veya henüz tamamlanmadı.
            </div>
        )
    }

    const cvJson = cvData.ai_tailored_cv_json as unknown as CVData

    return (
        <div className="min-h-screen bg-zinc-950 font-sans">
            {/* Üst Bar (Growth Hack - Branding) */}
            <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-white/5 bg-zinc-950/80 px-4 backdrop-blur sm:px-6">
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-indigo-600">
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="font-bold text-sm text-white">
                        CV<span className="text-violet-400">AI</span>
                    </span>
                </Link>
                <div className="flex items-center gap-3">
                    <p className="hidden md:block text-xs text-zinc-400 italic">✨ Bu mükemmel CV yapay zeka tarafından tasarlandı</p>
                    <PrintButton />
                    <Link href="/" target="_blank">
                        <Button className="h-8 bg-gradient-to-r from-violet-600 to-indigo-600 text-xs hover:from-violet-500 hover:to-indigo-500">
                            Sen de Oluştur
                        </Button>
                    </Link>
                </div>
            </header>

            {/* CV Renderer: Print Friendly Modus */}
            <main className="mx-auto max-w-5xl p-4 py-8 sm:p-8">
                <div className="print-area overflow-hidden rounded-xl border border-white/10 bg-white shadow-2xl">
                    <CVRenderer cv={cvJson} />
                </div>
            </main>

            {/* Yazdırma için küçük print css hack'i (Next.js globals.css'den alınmadığı durumlarda ekstra garanti sağlar) */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          body { background: white !important; }
          header { display: none !important; }
          .print-area { box-shadow: none !important; border: none !important; }
          main { padding: 0 !important; max-width: none !important; }
        }
      `}} />
        </div>
    )
}
