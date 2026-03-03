import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApifyClient } from 'apify-client'

const apify = new ApifyClient({ token: process.env.APIFY_API_TOKEN! })

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const body = await request.json()
        const {
            keyword,
            location,
            datePosted,       // r86400 | r604800 | r2592000 | r7776000 | ''
            jobType,          // F | C | P | T | I | ''
            experienceLevel,  // 1 | 2 | 3 | 4 | 5 | 6 | ''
            type,
        } = body

        if (!keyword) {
            return NextResponse.json({ error: 'Arama terimi zorunludur' }, { status: 400 })
        }

        let runResult;

        if (type === 'jobs') {
            // LinkedIn'in location parametresini doğru algılaması için Türkçe karakterleri normalize ediyoruz
            const normalizeLoc = (str: string) => {
                if (!str) return str
                return str
                    .replace(/İ/g, 'I')
                    .replace(/ı/g, 'i')
                    .replace(/Ş/g, 'S').replace(/ş/g, 's')
                    .replace(/Ç/g, 'C').replace(/ç/g, 'c')
                    .replace(/Ö/g, 'O').replace(/ö/g, 'o')
                    .replace(/Ü/g, 'U').replace(/ü/g, 'u')
                    .replace(/Ğ/g, 'G').replace(/ğ/g, 'g')
            }

            const params: Record<string, string> = {
                keywords: keyword.trim(),
                sortBy: 'DD',  // Date Descending — en yeniler önce
                position: '1',
                pageNum: '0',
            }

            if (location && location.trim()) {
                params.location = normalizeLoc(location.trim())
            }

            // Tarih filtresi
            if (datePosted && datePosted.trim()) {
                params.f_TPR = datePosted.trim()
            }

            // İş tipi filtresi (F=Full-time, C=Contract, P=Part-time, T=Temporary, I=Internship, R=Remote)
            if (jobType && jobType.trim()) {
                params.f_JT = jobType.trim()
            }

            // Deneyim seviyesi filtresi
            if (experienceLevel && experienceLevel.trim()) {
                params.f_E = experienceLevel.trim()
            }

            const queryString = new URLSearchParams(params).toString()
            const linkedInSearchUrl = `https://www.linkedin.com/jobs/search/?${queryString}`

            console.log('[JobSearch] LinkedIn URL:', linkedInSearchUrl)

            runResult = await apify.actor('curious_coder/linkedin-jobs-scraper').start({
                urls: [linkedInSearchUrl],
                count: 20,
                scrapeCompany: false,
                proxy: { useApifyProxy: true, apifyProxyGroups: ['RESIDENTIAL'] },
            })
        } else {
            return NextResponse.json({ error: 'Geçersiz arama tipi' }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            runId: runResult.id,
            datasetId: runResult.defaultDatasetId,
        })
    } catch (error) {
        console.error('LinkedIn arama hatası:', error)
        return NextResponse.json(
            { error: 'Arama başlatılamadı.' },
            { status: 500 }
        )
    }
}
