import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApifyClient } from 'apify-client'

const apify = new ApifyClient({ token: process.env.APIFY_API_TOKEN! })

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const { jobId } = await params
        const searchParams = request.nextUrl.searchParams
        const type = searchParams.get('type') // 'profile' | 'job'
        const cvId = searchParams.get('cvId')
        const otherDatasetId = searchParams.get('otherDatasetId')
        const otherRunId = searchParams.get('otherRunId')

        // Actor run durumunu çek
        const run = await apify.run(jobId).get()
        if (!run) {
            return NextResponse.json({ error: 'Run bulunamadı' }, { status: 404 })
        }

        const status = run.status // READY, RUNNING, SUCCEEDED, FAILED, TIMED-OUT

        if (status === 'FAILED' || status === 'TIMED-OUT' || status === 'ABORTED') {
            // CV'yi hata durumuna al
            if (cvId) {
                await supabase
                    .from('cv_data')
                    .update({
                        status: 'error',
                        error_message: `${type === 'profile' ? 'LinkedIn profili' : 'İş ilanı'} çekilemedi. Lütfen URL'i kontrol edin.`,
                    })
                    .eq('id', cvId)
                    .eq('user_id', user.id)
            }
            return NextResponse.json({
                status: 'FAILED',
                message: 'Scraping başarısız oldu',
            })
        }

        if (status !== 'SUCCEEDED') {
            return NextResponse.json({
                status: 'RUNNING',
                message: 'Analiz devam ediyor...',
            })
        }

        // Actor başarıyla tamamlandı — dataset'ten veriyi al
        const { items } = await apify.dataset(run.defaultDatasetId).listItems()

        if (!items || items.length === 0) {
            if (cvId) {
                await supabase
                    .from('cv_data')
                    .update({
                        status: 'error',
                        error_message: 'Veri bulunamadı. Profil gizli olabilir.',
                    })
                    .eq('id', cvId)
                    .eq('user_id', user.id)
            }
            return NextResponse.json({
                status: 'FAILED',
                message: 'Veri bulunamadı',
            })
        }

        const data = items[0]

        // Eğer diğer run da tamamlandıysa, her ikisini de Supabase'e kaydet
        if (cvId && otherRunId) {
            try {
                const otherRun = await apify.run(otherRunId).get()

                if (otherRun?.status === 'SUCCEEDED') {
                    const { items: otherItems } = await apify.dataset(otherRun.defaultDatasetId).listItems()
                    const otherData = otherItems?.[0] ?? null

                    const updatePayload =
                        type === 'profile'
                            ? {
                                base_linkedin_json: data,
                                target_job_json: otherData,
                                status: 'generating',
                            }
                            : {
                                target_job_json: data,
                                base_linkedin_json: otherData,
                                status: 'generating',
                            }

                    await supabase
                        .from('cv_data')
                        .update(updatePayload)
                        .eq('id', cvId)
                        .eq('user_id', user.id)

                    return NextResponse.json({
                        status: 'BOTH_DONE',
                        message: 'Her iki veri de hazır! CV üretiliyor...',
                        cvId,
                    })
                }
            } catch {
                // Diğer run henüz bitmemiş, normal akışa devam et
            }
        }

        // Sadece bu run tamamlandı, diğerini bekliyoruz
        if (cvId) {
            const updateField =
                type === 'profile'
                    ? { base_linkedin_json: data }
                    : { target_job_json: data }

            await supabase
                .from('cv_data')
                .update(updateField)
                .eq('id', cvId)
                .eq('user_id', user.id)
        }

        return NextResponse.json({
            status: 'SUCCEEDED',
            message: `${type === 'profile' ? 'Profil' : 'İş ilanı'} analizi tamamlandı`,
            data,
        })
    } catch (error) {
        console.error('Status kontrol hatası:', error)
        return NextResponse.json({ error: 'Durum sorgulanamadı' }, { status: 500 })
    }
}
