import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const body = await request.json()
        const { title, fullName, headline, summary, experience, education, skills, jobDescription } = body

        if (!title || !fullName || !jobDescription) {
            return NextResponse.json(
                { error: 'Gerekli alanlar eksik' },
                { status: 400 }
            )
        }

        const baseLinkedinJson = {
            fullName,
            headline,
            summary,
            experience: experience ? [{ title: experience, companyName: '', description: experience }] : [],
            education: education ? [{ schoolName: education, degreeName: '' }] : [],
            skills: skills ? skills.split(',').map((s: string) => s.trim()) : [],
        }

        const targetJobJson = {
            description: jobDescription,
        }

        const { data: newCv, error: cvError } = await supabase
            .from('cv_data')
            .insert({
                user_id: user.id,
                title: title || 'Yeni CV',
                base_linkedin_json: baseLinkedinJson,
                target_job_json: targetJobJson,
                status: 'generating', // doğrudan generate adımına geçeceğiz
            })
            .select()
            .single()

        if (cvError || !newCv) {
            return NextResponse.json({ error: 'CV kaydı oluşturulamadı' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            cvId: newCv.id,
        })
    } catch (error) {
        console.error('Manuel CV oluşturma hatası:', error)
        return NextResponse.json(
            { error: 'İşlem başlatılamadı.' },
            { status: 500 }
        )
    }
}
