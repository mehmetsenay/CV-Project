import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id } = await params

        // Oturum kontrolü
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const body = await request.json()
        const { updatedJson } = body

        if (!updatedJson) {
            return NextResponse.json({ error: 'Eksik JSON verisi' }, { status: 400 })
        }

        // CV'nin bu kullanıcıya ait olduğunu teyit ederek güncelleme yap
        const { data: updatedCv, error: updateError } = await supabase
            .from('cv_data')
            .update({
                ai_tailored_cv_json: updatedJson,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (updateError || !updatedCv) {
            console.error('CV Update Error:', updateError)
            return NextResponse.json({ error: 'CV güncellenemedi veya bulunamadı' }, { status: 404 })
        }

        return NextResponse.json({ success: true, cv: updatedCv })
    } catch (error) {
        console.error('Update CV API error:', error)
        return NextResponse.json({ error: 'Sunucu hatası oluştu' }, { status: 500 })
    }
}
