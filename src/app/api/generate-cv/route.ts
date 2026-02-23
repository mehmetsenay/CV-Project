import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCVWithClaude } from '@/lib/ai/anthropic'
import { sendCVReadyEmail } from '@/lib/email/templates'
import type { CVData } from '@/types/cv'

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

        if (!cv.base_linkedin_json || !cv.target_job_json) {
            return NextResponse.json(
                { error: 'LinkedIn ve iş ilanı verisi henüz hazır değil' },
                { status: 400 }
            )
        }

        // Status'u generating yap
        await supabase
            .from('cv_data')
            .update({ status: 'generating' })
            .eq('id', cvId)

        // Claude ile CV üret
        const rawJson = await generateCVWithClaude(
            cv.base_linkedin_json as Record<string, unknown>,
            cv.target_job_json as Record<string, unknown>
        )

        // JSON parse
        let cvJson: CVData
        try {
            // Bazen Claude ```json block döndürebilir, temizle
            const cleaned = rawJson
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/\s*```$/i, '')
                .trim()
            cvJson = JSON.parse(cleaned)
        } catch {
            console.error('JSON parse hatası, ham yanıt:', rawJson)
            await supabase
                .from('cv_data')
                .update({
                    status: 'error',
                    error_message: 'AI yanıtı işlenemedi. Lütfen tekrar deneyin.',
                })
                .eq('id', cvId)
            return NextResponse.json(
                { error: 'AI yanıtı işlenemedi' },
                { status: 500 }
            )
        }

        // Üretilen CV'yi kaydet
        await supabase
            .from('cv_data')
            .update({
                ai_tailored_cv_json: cvJson,
                ats_score: cvJson.ats_score ?? null,
                status: 'completed',
                error_message: null,
            })
            .eq('id', cvId)

        // Kullanıcı profilini al ve email gönder (hata olsa da sessizce devam et)
        try {
            const { data: profile } = await supabase
                .from('users')
                .select('email, full_name')
                .eq('id', user.id)
                .single()

            if (profile?.email && process.env.RESEND_API_KEY) {
                await sendCVReadyEmail(
                    profile.email,
                    profile.full_name ?? '',
                    cvId,
                    cv.title ?? 'CV',
                    cvJson.ats_score ?? 0
                )
            }
        } catch (emailError) {
            console.warn('Email gönderilemedi:', emailError)
        }

        return NextResponse.json({
            success: true,
            cvId,
            atsScore: cvJson.ats_score,
            matchedKeywords: cvJson.matched_keywords,
        })
    } catch (error) {
        console.error('CV üretim hatası:', error)
        return NextResponse.json(
            { error: 'CV üretimi sırasında bir hata oluştu' },
            { status: 500 }
        )
    }
}
