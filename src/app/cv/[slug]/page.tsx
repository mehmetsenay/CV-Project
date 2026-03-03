import { notFound, redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import CVViewClient from '@/components/cv/CVViewClient'
import type { CVData } from '@/types/cv'

export default async function PublicCVPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    // Public sayfada RLS kısıtlamalarını aşmak için admin client kullan
    const supabaseAdmin = createServiceClient()

    // 1. Slug ile linki bul
    const { data: linkInfo, error: linkError } = await supabaseAdmin
        .from('shareable_links')
        .select('cv_id, user_id, is_active')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

    if (linkError || !linkInfo) {
        notFound() // Link yoksa veya inaktifse 404
    }

    // 2. Link sahibinin abonelik durumunu kontrol et
    const { data: ownerProfile } = await supabaseAdmin
        .from('users')
        .select('subscription_status, trial_end_date')
        .eq('id', linkInfo.user_id)
        .single()

    const status = ownerProfile?.subscription_status
    const isActive = status === 'active'
    const isTrialing = status === 'trialing'

    // Deneme süresi kontrolü (Eğer trialing ise ve bitiş tarihi geçmediyse valid)
    const trialValid = isTrialing && ownerProfile?.trial_end_date
        ? new Date() < new Date(ownerProfile.trial_end_date)
        : false

    console.log('[PublicCVPage Server] checks:', {
        slug,
        linkOwnerId: linkInfo?.user_id,
        ownerProfile,
        status, isActive, isTrialing, trialValid,
        now: new Date().toISOString()
    })

    // Eğer aktif bir aboneliği yoksa ve geçerli bir deneme süresi içinde değilse
    if (!isActive && !trialValid) {
        redirect('/expired')
    }

    // 3. Geçerli ise CV'yi getir
    const { data: cv, error: cvError } = await supabaseAdmin
        .from('cv_data')
        .select('*')
        .eq('id', linkInfo.cv_id)
        .single()

    if (cvError || !cv || cv.status !== 'completed' || !cv.ai_tailored_cv_json) {
        notFound()
    }

    // 4. Görüntülenmeyi artır (Sadece public görünümde, anonimler için)
    // Analytics tablosunu daha sonra IP/Cihaz bazlı genişletebiliriz. Basit count ilk aşama.
    const { error: rpcError } = await supabaseAdmin.rpc('increment_view_count', { row_id: linkInfo.cv_id })
    if (rpcError) {
        // RPC yoksa manuel update
        await supabaseAdmin
            .from('shareable_links')
            .update({ view_count: (linkInfo as any).view_count ? (linkInfo as any).view_count + 1 : 1 })
            .eq('slug', slug)
    }

    return (
        <CVViewClient
            cv={{
                id: cv.id,
                title: cv.title,
                ats_score: cv.ats_score,
                ai_tailored_cv_json: cv.ai_tailored_cv_json as CVData,
            }}
            shareSlug={slug}
        />
    )
}
