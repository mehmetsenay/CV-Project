import Stripe from 'stripe'

const stripeKey = process.env.STRIPE_SECRET_KEY || ''

if (!stripeKey) {
    console.warn('STRIPE_SECRET_KEY bulunamadı! Stripe özellikleri devre dışı.')
}

export const stripe = stripeKey ? new Stripe(stripeKey, {
    apiVersion: '2025-02-24.acacia' as any, // TypeScript hatası önlendi
    typescript: true,
}) : null as any
