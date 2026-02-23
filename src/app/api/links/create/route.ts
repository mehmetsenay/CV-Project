import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        // Kullanıcının aboneliğini kontrol et
        const { data: profile } = await supabase
            .from('users')
            .select('subscription_status, trial_end_date')
            .eq('id', user.id)
            .single()

        const status = profile?.subscription_status
        const isActive = status === 'active'
        const isTrialing = status === 'trialing'
        const trialValid = isTrialing && profile?.trial_end_date
            ? new Date() < new Date(profile.trial_end_date)
            : false

        if (!isActive && !trialValid) {
            return NextResponse.json(
                { error: 'Paylaşılabilir link oluşturmak için aktif abonelik gerekli' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { cvId } = body

        if (!cvId) {
            return NextResponse.json({ error: 'CV ID gerekli' }, { status: 400 })
        }

        // CV'nin bu kullanıcıya ait olduğunu kontrol et
        const { data: cv } = await supabase
            .from('cv_data')
            .select('id')
            .eq('id', cvId)
            .eq('user_id', user.id)
            .single()

        if (!cv) {
            return NextResponse.json({ error: 'CV bulunamadı' }, { status: 404 })
        }

        // Zaten aktif link var mı?
        const { data: existingLink } = await supabase
            .from('shareable_links')
            .select('slug')
            .eq('cv_id', cvId)
            .eq('is_active', true)
            .single()

        if (existingLink) {
            return NextResponse.json({ slug: existingLink.slug, existing: true })
        }

        // Yeni link oluştur
        const slug = nanoid(10)
        const { error: insertError } = await supabase
            .from('shareable_links')
            .insert({
                user_id: user.id,
                cv_id: cvId,
                slug,
                is_active: true,
            })

        if (insertError) {
            return NextResponse.json({ error: 'Link oluşturulamadı' }, { status: 500 })
        }

        return NextResponse.json({ slug, existing: false })
    } catch (error) {
        console.error('Link oluşturma hatası:', error)
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
    }
}
