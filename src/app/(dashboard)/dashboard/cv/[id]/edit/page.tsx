import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CVEditClient from '@/components/cv/CVEditClient'

interface EditCVPageProps {
    params: Promise<{ id: string }>
}

export default async function EditCVPage({ params }: EditCVPageProps) {
    const supabase = await createClient()
    const { id } = await params

    // Oturum Kontrolü
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // İlgili CV Verisini Çek
    const { data: cvRecord, error } = await supabase
        .from('cv_data')
        .select('ai_tailored_cv_json')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error || !cvRecord || !cvRecord.ai_tailored_cv_json) {
        return notFound()
    }

    return (
        <div className="container mx-auto px-4 py-8 relative z-10">
            <CVEditClient
                cvId={id}
                initialData={cvRecord.ai_tailored_cv_json as any}
            />
        </div>
    )
}
