import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateMotivationLetterWithClaude } from '@/lib/ai/anthropic'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const body = await request.json()
        const { cvId } = body

        if (!cvId) {
            return NextResponse.json({ error: 'CV ID gerekli' }, { status: 400 })
        }

        // CV verisini çek
        const { data: cv, error: cvError } = await supabase
            .from('cv_data')
            .select('*')
            .eq('id', cvId)
            .eq('user_id', user.id)
            .single()

        if (cvError || !cv) {
            return NextResponse.json({ error: 'CV bulunamadı' }, { status: 404 })
        }

        if (cv.motivation_letter_text) {
            return NextResponse.json({ success: true, text: cv.motivation_letter_text })
        }

        if (!cv.base_linkedin_json || !cv.target_job_json || !cv.ai_tailored_cv_json) {
            return NextResponse.json(
                { error: 'Bütün CV verisi (LinkedIn, İş, CV) mevcut olmalıdır' },
                { status: 400 }
            )
        }

        // Claude ile Motivasyon Mektubu üret
        const letterText = await generateMotivationLetterWithClaude(
            cv.base_linkedin_json as Record<string, unknown>,
            cv.target_job_json as Record<string, unknown>,
            cv.ai_tailored_cv_json as Record<string, unknown>
        )

        // Üretilen mektubu kaydet
        await supabase
            .from('cv_data')
            .update({
                motivation_letter_text: letterText
            })
            .eq('id', cvId)

        return NextResponse.json({
            success: true,
            text: letterText
        })
    } catch (error) {
        console.error('Motivasyon Mektubu üretim hatası:', error)
        return NextResponse.json(
            { error: 'Üretim sırasında bir hata oluştu' },
            { status: 500 }
        )
    }
}
