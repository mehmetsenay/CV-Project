import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApifyClient } from 'apify-client'
import {
    validateLinkedInProfileUrl,
    validateLinkedInJobUrl,
} from '@/lib/apify/scrapers'

const apify = new ApifyClient({ token: process.env.APIFY_API_TOKEN! })

export async function POST(request: NextRequest) {
    try {
        // Auth kontrolü
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const body = await request.json()
        const { linkedinUrl, jobUrl, cvId, title } = body

        // URL validasyonu
        if (!linkedinUrl || !validateLinkedInProfileUrl(linkedinUrl)) {
            return NextResponse.json(
                { error: 'Geçersiz LinkedIn profil URL\'i. Örnek: https://linkedin.com/in/kullanici-adi' },
                { status: 400 }
            )
        }

        if (!jobUrl || !validateLinkedInJobUrl(jobUrl)) {
            return NextResponse.json(
                { error: 'Geçersiz LinkedIn iş ilanı URL\'i. Örnek: https://linkedin.com/jobs/view/123456789' },
                { status: 400 }
            )
        }

        // Yeni CV kaydı oluştur veya mevcut güncelle
        let currentCvId = cvId
        if (!currentCvId) {
            const { data: newCv, error: cvError } = await supabase
                .from('cv_data')
                .insert({
                    user_id: user.id,
                    title: title || 'Yeni CV',
                    linkedin_url: linkedinUrl,
                    job_url: jobUrl,
                    status: 'scraping',
                })
                .select()
                .single()

            if (cvError || !newCv) {
                return NextResponse.json({ error: 'CV kaydı oluşturulamadı' }, { status: 500 })
            }
            currentCvId = newCv.id
        } else {
            await supabase
                .from('cv_data')
                .update({ status: 'scraping', linkedin_url: linkedinUrl, job_url: jobUrl })
                .eq('id', currentCvId)
                .eq('user_id', user.id)
        }

        // İki Apify actor'ı paralel olarak başlat
        const [profileRun, jobRun] = await Promise.all([
            apify.actor('dev_fusion/linkedin-profile-scraper').start({
                profileUrls: [linkedinUrl],
                proxy: { useApifyProxy: true, apifyProxyGroups: ['RESIDENTIAL'] },
            }),
            apify.actor('curious_coder/linkedin-jobs-scraper').start({
                startUrls: [{ url: jobUrl }],
                maxItems: 1,
                proxy: { useApifyProxy: true, apifyProxyGroups: ['RESIDENTIAL'] },
            }),
        ])

        return NextResponse.json({
            success: true,
            cvId: currentCvId,
            profileRunId: profileRun.id,
            profileDatasetId: profileRun.defaultDatasetId,
            jobRunId: jobRun.id,
            jobDatasetId: jobRun.defaultDatasetId,
        })
    } catch (error) {
        console.error('Scraping başlatma hatası:', error)
        return NextResponse.json(
            { error: 'Scraping başlatılamadı. Lütfen tekrar dene.' },
            { status: 500 }
        )
    }
}
