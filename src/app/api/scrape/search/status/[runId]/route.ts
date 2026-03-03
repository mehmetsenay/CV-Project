import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApifyClient } from 'apify-client'

const apify = new ApifyClient({ token: process.env.APIFY_API_TOKEN! })

const EARLY_RETURN_THRESHOLD = 10  // Bu kadar ilan birikince run bitmeden döndür
const MAX_ITEMS = 20

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ runId: string }> }
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const { runId } = await context.params

        const run = await apify.run(runId).get()
        if (!run) {
            return NextResponse.json({ error: 'Run bulunamadı' }, { status: 404 })
        }

        const status = run.status

        // Run tamamlandıysa direkt veriyi getir
        if (status === 'SUCCEEDED') {
            const { items } = await apify.dataset(run.defaultDatasetId).listItems({ limit: MAX_ITEMS })
            const filtered = filterAndNormalizeJobs(items)
            return NextResponse.json({ status: 'SUCCEEDED', data: filtered })
        }

        // Run devam ediyor ya da hata aldıysa → dataset'te yeterli ilan var mı bak
        if (status === 'RUNNING' || status === 'FAILED' || status === 'TIMED-OUT' || status === 'ABORTED') {
            try {
                const { items } = await apify.dataset(run.defaultDatasetId).listItems({ limit: MAX_ITEMS })
                if (items && items.length >= EARLY_RETURN_THRESHOLD) {
                    const filtered = filterAndNormalizeJobs(items)
                    return NextResponse.json({ status: 'SUCCEEDED', data: filtered })
                }
            } catch {
                // Dataset henüz oluşmadıysa görmezden gel
            }

            if (status === 'FAILED' || status === 'TIMED-OUT' || status === 'ABORTED') {
                return NextResponse.json({ status: 'FAILED', message: 'Arama başarısız oldu' })
            }

            return NextResponse.json({ status: 'RUNNING', message: 'Arama devam ediyor...' })
        }

        return NextResponse.json({ status: 'RUNNING', message: 'Hazırlanıyor...' })
    } catch (error) {
        console.error('Arama durumu kontrol hatası:', error)
        return NextResponse.json({ error: 'Durum sorgulanamadı' }, { status: 500 })
    }
}

/**
 * Apify'dan gelen ham iş ilanı verilerini normalize et ve temizle.
 * curator_coder actor'ü farklı alan adları döndürebiliyor.
 */
function filterAndNormalizeJobs(items: any[]): any[] {
    return items
        .filter((item) => item.title || item.jobTitle)
        .map((item) => ({
            title: item.title || item.jobTitle || 'Bilinmeyen Pozisyon',
            companyName: item.companyName || item.company || item.companyUrl || 'Bilinmeyen Şirket',
            location: item.location || item.jobLocation || '',
            link: item.jobUrl || item.link || item.url || '',
            description: item.description || item.jobDescription || '',
            postDate: item.postDate || item.postedAt || item.listedAt || '',
            isRemote: !!(
                item.workplace === 'Remote' ||
                item.workplaceType === 'REMOTE' ||
                (item.location || '').toLowerCase().includes('remote') ||
                (item.title || '').toLowerCase().includes('remote')
            ),
            employmentType: item.employmentType || item.jobType || '',
            experienceLevel: item.experienceLevel || item.seniorityLevel || '',
            applicantCount: item.applicantCount || item.applyCount || null,
        }))
}
