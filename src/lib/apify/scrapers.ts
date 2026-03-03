import { ApifyClient } from 'apify-client'

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN!,
})

// ============================================================
// LinkedIn PROFIL SCRAPER
// Apify'nin en güvenilir LinkedIn profil scraperı
// Actor: kfiWbq3boy7hOPnhL (Scrap e LinkedIn)
// Alternatif: dev_fusion/linkedin-profile-scraper
// ============================================================
export async function scrapeLinkedInProfile(profileUrl: string) {
    console.log('[Apify] LinkedIn profil scraping başladı:', profileUrl)

    const run = await client.actor('2SyF0bVxmgGr8IVCZ').call({
        startUrls: [{ url: profileUrl }],
        count: 1,
        proxy: {
            useApifyProxy: true,
            apifyProxyGroups: ['RESIDENTIAL'],
        },
    })

    const { items } = await client.dataset(run.defaultDatasetId).listItems()

    if (!items || items.length === 0) {
        // Birincil actor başarısız → yedek actor dene
        return scrapeLinkedInProfileFallback(profileUrl)
    }

    console.log('[Apify] Profil verisi alındı')
    return items[0]
}

// Yedek scraper
async function scrapeLinkedInProfileFallback(profileUrl: string) {
    console.log('[Apify] Yedek profil scraper deneniyor...')
    const run = await client.actor('dev_fusion/linkedin-profile-scraper').call({
        profileUrls: [profileUrl],
        proxy: {
            useApifyProxy: true,
            apifyProxyGroups: ['RESIDENTIAL'],
        },
    })

    const { items } = await client.dataset(run.defaultDatasetId).listItems()
    if (!items || items.length === 0) {
        throw new Error('LinkedIn profili çekilemedi. Profil gizli veya URL hatalı olabilir.')
    }

    return items[0]
}

// ============================================================
// LinkedIn İŞ İLANI SCRAPER
// Actor: curious_coder/linkedin-jobs-scraper
// ============================================================
export async function scrapeLinkedInJob(jobUrl: string) {
    console.log('[Apify] İş ilanı scraping başladı:', jobUrl)

    const run = await client.actor('curious_coder/linkedin-jobs-scraper').call({
        urls: [jobUrl],
        maxItems: 1,
        proxy: {
            useApifyProxy: true,
            apifyProxyGroups: ['RESIDENTIAL'],
        },
    })

    const { items } = await client.dataset(run.defaultDatasetId).listItems()
    if (!items || items.length === 0) {
        throw new Error('İş ilanı çekilemedi. URL geçerli bir LinkedIn job ilanı olmalı.')
    }

    console.log('[Apify] İş ilanı verisi alındı')
    return items[0]
}

// ============================================================
// ASYNC RUN BAŞLAT (polling için)
// ============================================================
export async function startLinkedInProfileScrape(profileUrl: string) {
    return await client.actor('2SyF0bVxmgGr8IVCZ').start({
        startUrls: [{ url: profileUrl }],
        count: 1,
        proxy: {
            useApifyProxy: true,
            apifyProxyGroups: ['RESIDENTIAL'],
        },
    })
}

export async function startLinkedInJobScrape(jobUrl: string) {
    return await client.actor('curious_coder/linkedin-jobs-scraper').start({
        urls: [jobUrl],
        maxItems: 1,
        proxy: {
            useApifyProxy: true,
            apifyProxyGroups: ['RESIDENTIAL'],
        },
    })
}

// Run durumu ve dataset verisi
export async function getRunResult(runId: string) {
    const run = await client.run(runId).get()
    return run
}

export async function getDatasetItems(datasetId: string) {
    const { items } = await client.dataset(datasetId).listItems()
    return items
}

// ============================================================
// URL VALİDASYON
// ============================================================
export function validateLinkedInProfileUrl(url: string): boolean {
    try {
        const parsed = new URL(url)
        return (
            parsed.hostname.includes('linkedin.com') &&
            parsed.pathname.includes('/in/')
        )
    } catch {
        return false
    }
}

export function validateLinkedInJobUrl(url: string): boolean {
    try {
        const parsed = new URL(url)
        return (
            parsed.hostname.includes('linkedin.com') &&
            (parsed.pathname.includes('/jobs/') || parsed.pathname.includes('/job/'))
        )
    } catch {
        return false
    }
}

// ============================================================
// TEST FONKSİYONU — geliştirme ortamında mock veri döner
// ============================================================
export function getMockLinkedInProfile() {
    return {
        fullName: 'Test Kullanıcı',
        headline: 'Senior Software Engineer',
        location: 'İstanbul, Türkiye',
        email: 'test@example.com',
        phone: '+90 555 000 0000',
        summary: 'Deneyimli yazılım geliştirici',
        experience: [
            {
                title: 'Senior Software Engineer',
                companyName: 'Tech Company',
                startDate: '2022-01',
                endDate: null,
                description: 'React ve Node.js ile uygulama geliştirme',
            },
        ],
        education: [
            {
                schoolName: 'İstanbul Teknik Üniversitesi',
                degreeName: 'Lisans',
                fieldOfStudy: 'Bilgisayar Mühendisliği',
                endDate: '2019',
            },
        ],
        skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    }
}

export function getMockJobData() {
    return {
        title: 'Full Stack Developer',
        companyName: 'Startup Inc.',
        location: 'İstanbul, Türkiye',
        description: 'React, Node.js, PostgreSQL deneyimi olan developer arıyoruz.',
        requirements: ['React', 'TypeScript', 'PostgreSQL', 'REST API'],
    }
}
