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
        const { linkedinUrl, cvId, title, fullName, email } = body
        let jobUrl = body.jobUrl;

        // Eğer jobUrl bir arama URL'si ise ve içinde currentJobId varsa, onu temiz bir /view/ URL'sine çevir
        // Böylece Apify yüzlerce ilan yerine yalnızca 1 iş ilanını hemen çeker.
        try {
            const parsedJobUrl = new URL(jobUrl);
            if (parsedJobUrl.searchParams.has('currentJobId')) {
                const jobId = parsedJobUrl.searchParams.get('currentJobId');
                jobUrl = `https://www.linkedin.com/jobs/view/${jobId}/`;
            }
        } catch (e) { /* Hatalıysa aşağıda validateLinkedInJobUrl var */ }

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
                    // Kullanıcının girdigi temel bilgileri hemen kaydet
                    base_linkedin_json: fullName ? {
                        fullName: fullName || null,
                        email: email || null,
                        linkedinUrl: linkedinUrl,
                        _userProvided: true,
                    } : null,
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
                .update({
                    status: 'scraping',
                    linkedin_url: linkedinUrl,
                    job_url: jobUrl,
                    ...(fullName ? {
                        base_linkedin_json: {
                            fullName: fullName || null,
                            email: email || null,
                            linkedinUrl: linkedinUrl,
                            _userProvided: true,
                        }
                    } : {}),
                })
                .eq('id', currentCvId)
                .eq('user_id', user.id)
        }

        // İki Apify actor'ı paralel olarak başlat
        let profileRun, jobRun;
        try {
            [profileRun, jobRun] = await Promise.all([
                apify.actor('harvestapi/linkedin-profile-scraper').start({
                    urls: [linkedinUrl],
                    proxy: { useApifyProxy: true },
                }),
                apify.actor('apify/puppeteer-scraper').start({
                    startUrls: [{ url: jobUrl }],
                    pageFunction: `async ({ page, request, log }) => {
                        log.info('Processing ' + request.url);
                        await page.waitForSelector('.top-card-layout__title', { timeout: 10000 }).catch(() => {});
                        const title = await page.$eval('.top-card-layout__title', el => el.innerText).catch(() => 'Bilinmeyen Pozisyon');
                        const companyName = await page.$eval('.topcard__org-name-link', el => el.innerText).catch(() => 'Bilinmeyen Şirket');
                        const location = await page.$eval('.topcard__flavor--bullet', el => el.innerText).catch(() => 'Bilinmeyen Konum');
                        const descriptionText = await page.$eval('.show-more-less-html__markup', el => el.innerText).catch(() => '');
                        return { title, companyName, location, descriptionText };
                    }`,
                    proxyConfiguration: { useApifyProxy: true },
                }),
            ])
        } catch (startError: any) {
            console.error('Apify start error:', startError?.message || startError);
            console.error('Apify start error stack:', startError?.stack);

            // Hata durumunda CV statusünü error'a çek
            await supabase
                .from('cv_data')
                .update({ status: 'error', error_message: `Apify Hatası: ${startError.message || 'Bilinmeyen hata'}` })
                .eq('id', currentCvId)
                .eq('user_id', user.id)

            throw startError;
        }

        return NextResponse.json({
            success: true,
            cvId: currentCvId,
            profileRunId: profileRun.id,
            profileDatasetId: profileRun.defaultDatasetId,
            jobRunId: jobRun.id,
            jobDatasetId: jobRun.defaultDatasetId,
        })
    } catch (error: any) {
        console.error('Scraping başlatma hatası:', error?.message || error)
        console.error('Stack:', error?.stack)
        return NextResponse.json(
            { error: 'Scraping başlatılamadı. Lütfen tekrar dene.' },
            { status: 500 }
        )
    }
}
