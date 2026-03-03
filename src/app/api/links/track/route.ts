import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendCVViewedEmail } from '@/lib/email/templates'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { slug } = body

        if (!slug) {
            return NextResponse.json({ error: 'Slug gerekli' }, { status: 400 })
        }

        const supabase = await createClient()

        // 1. Link bilgisini çek
        const { data: linkInfo } = await supabase
            .from('shareable_links')
            .select('id, user_id, cv_id, view_count, is_active')
            .eq('slug', slug)
            .single()

        if (!linkInfo || !linkInfo.is_active) {
            return NextResponse.json({ error: 'Geçersiz link' }, { status: 404 })
        }

        // IP & Cihaz Analitiği (Header'lardan okuma)
        const viewer_ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Bilinmiyor'
        const viewer_device = request.headers.get('user-agent') || 'Bilinmiyor'

        // Ülke tespiti için Vercel veya Cloudflare header'ları kontrol edilebilir
        const viewer_country = request.headers.get('x-vercel-ip-country') || 'Bilinmiyor'
        const locationStr = viewer_country !== 'Bilinmiyor' ? viewer_country : 'Bilinmeyen Konum'

        // 2. Analitik Tablosuna kayıt ekle
        await supabase
            .from('link_analytics')
            .insert({
                link_id: linkInfo.id,
                viewer_ip,
                viewer_country,
                viewer_device,
                referrer: request.headers.get('referer') || 'Direkt',
            })

        // 3. View Count değerini 1 artır
        await supabase
            .from('shareable_links')
            .update({
                view_count: (linkInfo.view_count || 0) + 1,
                last_viewed_at: new Date().toISOString()
            })
            .eq('id', linkInfo.id)

        // 4. Kullancıya Email at (Bildirim)
        // Öncelikle kullanıcının bilgilerini ve CV başlığını alalım
        const { data: userData } = await supabase
            .from('users')
            .select('email, full_name')
            .eq('id', linkInfo.user_id)
            .single()

        const { data: cvData } = await supabase
            .from('cv_data')
            .select('title')
            .eq('id', linkInfo.cv_id)
            .single()

        if (userData?.email && cvData) {
            // Asenkron çalışması için await beklememize gerek yok, ama garantili olsun diye awaitleyebiliriz
            try {
                await sendCVViewedEmail(
                    userData.email,
                    userData.full_name || 'Kullanıcı',
                    locationStr,
                    cvData.title || 'CV'
                )
            } catch (emailErr) {
                console.error('Email goenderim hatasi:', emailErr)
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Track hatası:', error)
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
    }
}
