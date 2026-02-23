import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail, sendCVReadyEmail } from '@/lib/email/templates'

export async function POST(request: NextRequest) {
    try {
        // Supabase webhook secret ile güvenlik kontrolü
        const authHeader = request.headers.get('authorization')
        const expectedSecret = process.env.SUPABASE_WEBHOOK_SECRET

        if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
            return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
        }

        const body = await request.json()
        const { type, record } = body

        if (type === 'INSERT' && record?.id) {
            // Yeni kullanıcı kaydı → hoşgeldin emaili
            await sendWelcomeEmail(
                record.email,
                record.full_name ?? record.email.split('@')[0]
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Email webhook hatası:', error)
        return NextResponse.json({ error: 'Email gönderilemedi' }, { status: 500 })
    }
}
