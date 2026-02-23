import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('users')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single()

        if (!profile?.stripe_customer_id) {
            return NextResponse.json({ error: 'Ödeme profili bulunamadı' }, { status: 404 })
        }

        const nextHeaders = await headers()
        const origin = process.env.NEXT_PUBLIC_APP_URL || nextHeaders.get('origin') || 'http://localhost:3000'

        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: `${origin}/dashboard/settings`,
        })

        return NextResponse.json({ url: session.url })

    } catch (error: any) {
        console.error('Stripe Portal Hatası:', error)
        return NextResponse.json(
            { error: error?.message || 'Müşteri portalı başlatılamadı' },
            { status: 500 }
        )
    }
}
