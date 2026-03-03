import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Admin ayrıcalıklı istemci - veritabanını limitsiz güncelleyebilmek için
// Build işlemi sırasında çökmeyi önlemek için anahtarlar yoksa sahte değerle başlatıyoruz (Zaten Webhook kapalı)
const supabaseAdmin = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null as any

export async function POST(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Service Key eksik' }, { status: 500 })
    }
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!sig || !webhookSecret) {
        return NextResponse.json({ error: 'Eksik bildirim imzası veya sırrı' }, { status: 400 })
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err: any) {
        console.error('Webhook İmza Hatası:', err.message)
        return NextResponse.json({ error: `Webhook Hatası: ${err.message}` }, { status: 400 })
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any
                if (session.mode === 'subscription') {
                    await handleSubscriptionUpdate(session.subscription as string, session.customer as string)
                }
                break
            }
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any
                await handleSubscriptionUpdate(subscription.id, subscription.customer as string)
                break
            }
        }
        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook İşlem Hatası:', error)
        return NextResponse.json({ error: 'Webhook işlemleri sırasında bir hata oluştu' }, { status: 500 })
    }
}

async function handleSubscriptionUpdate(subscriptionId: string, customerId: string) {
    const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any

    // Supabase'den bu müşteriye ait kullanıcıyı bulalım
    const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

    if (error || !user) {
        console.error('Kullanıcı bulunamadı (customerId):', customerId)
        return
    }

    const end_date = new Date(subscription.current_period_end * 1000).toISOString()
    const status = subscription.status // "trialing", "active", "canceled", "past_due", "unpaid" vb.

    await supabaseAdmin
        .from('users')
        .update({
            stripe_subscription_id: subscription.id,
            subscription_status: status,
            subscription_end_date: end_date,
            // trial_end_date: // eger stripe uzerinden trial gidiyorsak kullanilabilir, yoksa mevcut kalsin.
        })
        .eq('id', user.id)

    console.log(`[Webhook] Kullanıcı (${user.id}) abonelik durumu yenilendi: ${status}`)
}
