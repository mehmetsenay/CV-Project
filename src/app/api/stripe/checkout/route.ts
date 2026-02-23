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

        const priceId = process.env.STRIPE_PRICE_ID
        if (!priceId) {
            return NextResponse.json({ error: 'Fiyat ID ayarlanmamış' }, { status: 500 })
        }

        const { data: profile } = await supabase
            .from('users')
            .select('stripe_customer_id, email, full_name')
            .eq('id', user.id)
            .single()

        let customerId = profile?.stripe_customer_id

        // Müşteri ID yoksa Stripe üzerinde oluştur ve Supabase'e kaydet
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: profile?.email || user.email,
                name: profile?.full_name || 'İsimsiz Kullanıcı',
                metadata: {
                    supabase_user_id: user.id
                }
            })
            customerId = customer.id

            await supabase
                .from('users')
                .update({ stripe_customer_id: customerId })
                .eq('id', user.id)
        }

        const nextHeaders = await headers()
        const origin = process.env.NEXT_PUBLIC_APP_URL || nextHeaders.get('origin') || 'http://localhost:3000'

        // Checkout Session oluştur
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/dashboard`,
            // subscription_data: { trial_period_days: 7 }, // Eğer direkt Stripe tarafında trial ayarlamak isterseniz bunu da açabilirsiniz (Stripe Dashboard'da Price ayarlarına da konabilir)
            metadata: {
                supabase_user_id: user.id
            }
        })

        return NextResponse.json({ url: session.url })

    } catch (error: any) {
        console.error('Stripe Checkout Hatası:', error)
        return NextResponse.json(
            { error: error?.message || 'Ödeme oturumu başlatılamadı' },
            { status: 500 }
        )
    }
}
