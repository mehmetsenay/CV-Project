import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CVViewClient from '@/components/cv/CVViewClient'
import type { CVData } from '@/types/cv'

export default async function CVDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // CV verisini çek
    const { data: cv, error } = await supabase
        .from('cv_data')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error || !cv) notFound()

    if (cv.status !== 'completed' || !cv.ai_tailored_cv_json) {
        redirect('/dashboard')
    }

    // Varsa mevcut paylaşım linkini çek
    const { data: link } = await supabase
        .from('shareable_links')
        .select('slug')
        .eq('cv_id', id)
        .eq('is_active', true)
        .single()

    return (
        <CVViewClient
            cv={{
                id: cv.id,
                title: cv.title,
                ats_score: cv.ats_score,
                ai_tailored_cv_json: cv.ai_tailored_cv_json as CVData,
            }}
            shareSlug={link?.slug}
        />
    )
}
